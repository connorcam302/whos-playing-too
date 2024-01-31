import { STEAM_KEY } from '$env/static/private';
import { json, type RequestHandler } from '@sveltejs/kit';
import { laneRates } from '$lib/server/laneRates';
import { heroMap } from '$lib/data/heroMap';
import { itemMap } from '$lib/data/itemMap';
import { accounts, accounts, accounts, players } from '$lib/server/schema';
import { db } from '$lib/server/database';
import { eq, inArray } from 'drizzle-orm';

const getRoles = (team) => {
	const heroes = laneRates;
	const heroIds = team.map((hero) => hero.hero_id);
	const roles = ['1', '2', '3', '4', '5'];
	const heroRoles: any[] = [];

	roles.forEach((role) => {
		const eligibleHeroes = heroes
			.filter(
				(hero) =>
					heroIds.includes(hero.id) &&
					hero.data.length > 0 &&
					!heroRoles.some((entry) => entry.role === role)
			)
			.sort((a, b) => {
				const percentageA = parseFloat(a.data[roles.indexOf(role)].replace('%', ''));
				const percentageB = parseFloat(b.data[roles.indexOf(role)].replace('%', ''));
				const lastHitsA = team.find((hero: any) => hero.heroId === a.id)?.last_hits || 0;
				const lastHitsB = team.find((hero: any) => hero.heroId === b.id)?.last_hits || 0;

				// Weighted average calculation
				const weightedAverageA = percentageA * 0.8 + lastHitsA * 0.2;
				const weightedAverageB = percentageB * 0.8 + lastHitsB * 0.2;

				return weightedAverageB - weightedAverageA;
			});

		if (eligibleHeroes.length > 0) {
			// Assign the role based on the first eligible hero
			heroRoles.push({
				id: eligibleHeroes[0].id,
				name: eligibleHeroes[0].name,
				role: Number(role)
			});
			// Remove the assigned hero from the list to avoid duplicate assignments
			heroIds.splice(heroIds.indexOf(eligibleHeroes[0].id), 1);
		} else {
			// If no eligible hero for the role, assign 'Unknown'
			heroRoles.push({ id: 0, name: undefined, role: role });
		}
	});

	return heroRoles;
};

const getImpactScore = (match: any, role: any, duration: any) => {
	let impact = 0;
	let csMinRating: number;
	const csMin = match.last_hits / (duration / 60);
	const deathsPerMin = match.deaths / (duration / 60);

	// Carry
	if (role === 1) {
		// Heroes with lower returns for high CS/min
		// Anti-mage, Naga Siren, Medusa, Luna, Terrorblade
		if ([1, 89, 94, 48, 109].includes(match.hero_id)) {
			csMinRating = csMin ** 1.3 / 25;
		} else {
			csMinRating = csMin ** 1.3 / 20;
		}
		const deathRating = 3 / (20 * deathsPerMin + 1);
		const kapmRating = ((match.kills * 2 + match.assists * 0.75) / (duration / 60)) ** 2;
		impact = kapmRating * 0.4 + deathRating * 0.4 + csMinRating * 0.2;

		// Mid
	} else if (role === 2) {
		// Heroes with lower returns for high CS/min
		// Templar Assassin, Arc Warden, Shadow Fiend
		if ([46, 113, 11].includes(match.hero_id)) {
			csMinRating = csMin ** 1.3 / 23;
		} else {
			csMinRating = csMin ** 1.3 / 18;
		}
		const deathRating = 4 / (24 * deathsPerMin + 1);
		const kapmRating = ((match.kills * 1.7 + match.assists * 1.3) / (duration / 60)) ** 2;
		impact = kapmRating * 0.6 + deathRating * 0.2 + csMinRating * 0.1;

		// Offlane
	} else if (role === 3) {
		csMinRating = csMin ** 1.3 / 18;
		const deathRating = 4.5 / (23 * deathsPerMin + 1);
		let kapmRating: number;
		// Lower returns on kills for Axe
		kapmRating = ((match.kills * 1.5 + match.assists * 1.5) / (duration / 60)) ** 2;
		impact = kapmRating * 0.65 + deathRating * 0.3 + csMinRating * 0.05;

		// Support
	} else if (role === 4 || role === 5) {
		const deathRating = 5 / (24 * deathsPerMin + 1);
		const kapmRating = ((match.kills * 0.65 + match.assists * 1.35) / (duration / 60)) ** 2;
		if ([20, 105].includes(match.hero_id)) {
			impact = kapmRating * 0.7 + deathRating * 0.3;
		} else {
			impact = kapmRating * 0.55 + deathRating * 0.45;
		}
	} else {
		return 0;
	}

	return Math.floor(impact * 100);
};

export const GET: RequestHandler = async ({ url, params }) => {
	const matchData = await fetch(
		`https://api.steampowered.com/IDOTA2Match_570/getMatchDetails/v1?key=${STEAM_KEY}&match_id=${params.id}`
	)
		.then((res) => res.json())
		.then((data) => data.result);
	if (!matchData) {
		return json({ error: 'Steam API Down.' });
	}
	const accountIds = matchData.players.map((player) => player.account_id);

	const allAccounts = await db
		.select({
			id: players.id,
			username: players.username,
			steamId: accounts.accountId,
			smurf: accounts.smurf
		})
		.from(accounts)
		.innerJoin(players, eq(accounts.owner, players.id))
		.where(inArray(accounts.accountId, accountIds));

	const radiant = matchData.players.filter((player) => player.player_slot <= 127);
	const dire = matchData.players.filter((player) => player.player_slot >= 128);

	const radiantRoles = getRoles(radiant);
	const direRoles = getRoles(dire);
	const radiantData = radiant.map((player) => {
		const role = radiantRoles.find((entry) => entry.id === player.hero_id)?.role;
		const impactScore = getImpactScore(player, role, matchData.duration);
		return {
			...player,
			role,
			impactScore
		};
	});
	const direData = dire.map((player) => {
		const role = direRoles.find((entry) => entry.id === player.hero_id)?.role;
		const impactScore = getImpactScore(player, role, matchData.duration);
		return {
			...player,
			role,
			impactScore
		};
	});

	direData.map((player: any) => (player.hero = heroMap.get(player.hero_id)));
	radiantData.map((player: any) => (player.hero = heroMap.get(player.hero_id)));

	direData.map(
		(player: any) => (
			(player.user = allAccounts.find((account) => account.steamId === player.account_id)),
			(player.items = [
				itemMap.get(player.item_0),
				itemMap.get(player.item_1),
				itemMap.get(player.item_2),
				itemMap.get(player.item_3),
				itemMap.get(player.item_4),
				itemMap.get(player.item_5)
			]),
			(player.neutralItem = itemMap.get(player.item_neutral)),
			(player.backpack = [
				itemMap.get(player.backpack_0),
				itemMap.get(player.backpack_1),
				itemMap.get(player.backpack_2)
			])
		)
	);
	radiantData.map(
		(player: any) => (
			(player.user = allAccounts.find((account) => account.steamId === player.account_id)),
			(player.items = [
				itemMap.get(player.item_0),
				itemMap.get(player.item_1),
				itemMap.get(player.item_2),
				itemMap.get(player.item_3),
				itemMap.get(player.item_4),
				itemMap.get(player.item_5)
			]),
			(player.neutralItem = itemMap.get(player.item_neutral)),
			(player.backpack = [
				itemMap.get(player.backpack_0),
				itemMap.get(player.backpack_1),
				itemMap.get(player.backpack_2)
			])
		)
	);
	matchData.picks = [];
	matchData.bans = [];

	matchData.picks_bans.map((entry: { is_pick: boolean; hero_id: number; order: number }) => {
		if (entry.is_pick) {
			matchData.picks.push(heroMap.get(entry.hero_id));
		} else {
			matchData.bans.push(heroMap.get(entry.hero_id));
		}
	});

	delete matchData.players;

	return json({ radiantData, direData, matchData });
};
