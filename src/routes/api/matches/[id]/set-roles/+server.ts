import { STEAM_KEY } from '$env/static/private';
import { db } from '$lib/server/database';
import { matchData } from '$lib/server/schema';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';

const getRoles = (
	team: { hero_id: number; last_hits: number }[],
	roles = ['1', '2', '3', '4', '5']
) => {
	const heroes = laneRates;
	const heroIds = team.map((hero) => hero.hero_id);
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
		const kapmRating = ((match.kills * 2.4 + match.assists * 1.2) / (duration / 60)) ** 2;
		impact = kapmRating * 0.45 + deathRating * 0.4 + csMinRating * 0.1;

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
		const kapmRating = ((match.kills * 1.6 + match.assists * 1.4) / (duration / 60)) ** 2;
		impact = kapmRating * 0.65 + deathRating * 0.3 + csMinRating * 0.05;

		// Offlane
	} else if (role === 3) {
		csMinRating = csMin ** 1.3 / 18;
		const deathRating = 4.5 / (23 * deathsPerMin + 1);
		let kapmRating: number;
		// Lower returns on kills for Axe
		kapmRating = ((match.kills * 1.35 + match.assists * 1.35) / (duration / 60)) ** 2;
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

export const POST: RequestHandler = async ({ url, params, request }) => {
	console.log(url);
	const reqBody = await request.json();
	console.log(reqBody);
	const changedRoles = Object.values(reqBody.roleData);
	const sequenceNum = reqBody.sequenceNum;

	let steamMatchData = await fetch(
		`https://api.steampowered.com/IDOTA2Match_570/getMatchDetails/v1?key=${STEAM_KEY}&match_id=${params.id}`
	)
		.then((res) => res.json())
		.then((data) => data.result);
	if (!steamMatchData) {
		steamMatchData = await fetch(
			`https://api.steampowered.com/IDOTA2Match_570/GetMatchHistoryBySequenceNum/v1?key=${STEAM_KEY}&start_at_match_seq_num=${sequenceNum}&matches_requested=1`
		)
			.then((res) => res.json())
			.then((data) => data.result.matches[0]);
		if (steamMatchData.match_id !== Number(params.id)) {
			return error(500, { message: 'Steam API Down.' });
		}
	}

	changedRoles.forEach(async (change) => {
		const playerData = steamMatchData.players.find((entry) => entry.hero_id === change.heroId);
		const impact = getImpactScore(playerData, change.role, steamMatchData.duration);
		const response = await db
			.update(matchData)
			.set({ role: change.role, impact })
			.where(and(eq(matchData.matchId, Number(params.id)), eq(matchData.heroId, change.heroId)))
			.returning();
	});

	return json('Done');
};
