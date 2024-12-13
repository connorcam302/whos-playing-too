import { getMatchData, getPlayers } from '$lib/server/db-functions';
import { STEAM_KEY } from '$env/static/private';

export const load = async ({ fetch, data, params }) => {
	const longestMatch = await getMatchData(7547028321);
	const worstMatch = await getMatchData(7752219016);
	const bestMatch = await getMatchData(7638983972);
	const hardestCarry = await getMatchData(7772055336);
	const highestKillGame = await getMatchData(7693810877);
	const lowestKillGame = await getMatchData(7536261025);
	const lowestDeathsGame = await getMatchData(7631021552);
	const highestDeathsGame = await getMatchData(7785024043);
	const highestFarmGame = await getMatchData(7826172738);

	const players = await getPlayers();
	const allAccounts: { id: number; accountId: number; username: string }[] = [];
	players.forEach((user) => {
		user.accounts.forEach((account) => {
			allAccounts.push({
				id: user.id,
				accountId: Number(account),
				username: user.username
			});
		});
	});
	const toSteam64 = (steam32: string) => {
		return (BigInt(steam32) + BigInt('76561197960265728')).toString();
	};

	const getSteamData = async (steamIds: number[]) => {
		const steamData = await fetch(
			`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_KEY}&steamids=${steamIds
				.map((id) => toSteam64(id.toString()))
				.join(',')
				.toString()}`
		);
		const steamDataJson = await steamData.json();
		return steamDataJson.response.players;
	};
	const allSteamData = await getSteamData(allAccounts.map((account) => account.accountId));
	const allPlayerSteamData = allAccounts
		.map((player) => {
			const accountData = allSteamData.find(
				(account) => account.steamid === toSteam64(player.accountId.toString())
			);
			return {
				...player,
				...accountData
			};
		})
		.sort((a, b) => b.lastlogoff - a.lastlogoff)
		.sort((a, b) => (b.gameextrainfo === 'Dota 2') - (a.gameextrainfo === 'Dota 2'));

	return {
		allPlayerSteamData,
		matches: {
			longestMatch,
			worstMatch,
			bestMatch,
			hardestCarry,
			highestKillGame,
			lowestKillGame,
			lowestDeathsGame,
			highestDeathsGame,
			highestFarmGame
		},
		stacks: {
			best: [
				allPlayerSteamData.find((player) => player.id === 3),
				allPlayerSteamData.find((player) => player.id === 4),
				allPlayerSteamData.find((player) => player.id === 7),
				allPlayerSteamData.find((player) => player.id === 19),
				allPlayerSteamData.find((player) => player.id === 20)
			],

			worst: [
				allPlayerSteamData.find((player) => player.id === 1),
				allPlayerSteamData.find((player) => player.id === 4),
				allPlayerSteamData.find((player) => player.id === 12),
				allPlayerSteamData.find((player) => player.id === 19),
				allPlayerSteamData.find((player) => player.id === 20)
			]
		},
		individualRecords: {
			highestImpact: {
				player: 3,
				statName: 'Impact',
				statValue: 448,
				match: await getMatchData(7772055336)
			},
			lowestImpact: {
				player: 16,
				statName: 'Impact',
				statValue: 10,
				match: await getMatchData(7700884601)
			},
			mostKills: {
				player: 3,
				statName: 'Kills',
				statValue: 36,
				match: await getMatchData(7772055336)
			},
			mostDeaths: {
				player: 19,
				statName: 'Deaths',
				statValue: 25,
				match: await getMatchData(7785024043)
			},
			mostAssists: {
				player: 1,
				statName: 'Assists',
				statValue: 56,
				match: await getMatchData(7620923371)
			},
			highestGPM: {
				player: 20,
				statName: 'GPM',
				statValue: 1008,
				match: await getMatchData(7792704299)
			},
			lowestGPM: {
				player: 20,
				statName: 'GPM',
				statValue: 171,
				match: await getMatchData(7536261025)
			},
			mostDamage: {
				player: 20,
				statName: 'Damage',
				statValue: 126364,
				match: await getMatchData(7695431571)
			},
			leastDamage: {
				player: 3,
				statName: 'Damage',
				statValue: 1197,
				match: await getMatchData(7536261025)
			},
			mostConsistent: {
				player: 9,
				...allPlayerSteamData.find((player) => player.id === 9),
				statName: 'Average Impact',
				description: 'The player with the highest average impact score.',
				statValue: 97
			},
			mostMatches: {
				...allPlayerSteamData.find((player) => player.id === 18),
				player: 18,
				statName: 'Matches Played',
				statValue: 926
			},
			mostTOTW: {
				...allPlayerSteamData.find((player) => player.id === 18),
				player: 18,
				statName: 'Awards',
				statValue: 28
			},
			mostMMRLost: {
				...allPlayerSteamData.find((player) => player.id === 18),
				player: 18,
				statName: 'Ranked Gain',
				statValue: -31,
				description: 'Estimated based on the main ranked net win/loss this year.'
			},
			mostMMRGained: {
				...allPlayerSteamData.find((player) => player.id === 19),
				player: 19,
				statName: 'Ranked Gain',
				statValue: 18,
				description: 'Estimated based on the main ranked net win/loss this year.'
			}
		},
		oty: {
			toty: {
				carry: {
					...allPlayerSteamData.find((player) => player.id === 3),
					matches: 218,
					winRate: '61%',
					avgImpact: 110,
					overall: 70
				},
				mid: {
					...allPlayerSteamData.find((player) => player.id === 19),
					matches: 93,
					winRate: '58%',
					avgImpact: 87,
					overall: 64
				},

				offlane: {
					...allPlayerSteamData.find((player) => player.id === 20),
					matches: 144,
					winRate: '60%',
					avgImpact: 96,
					overall: 68
				},
				soft: {
					...allPlayerSteamData.find((player) => player.id === 17),
					matches: 37,
					winRate: '64%',
					avgImpact: 83,
					overall: 69
				},
				hard: {
					...allPlayerSteamData.find((player) => player.id === 2),
					matches: 42,
					winRate: '59%',
					avgImpact: 103,
					overall: 68
				}
			},
			foty: {
				carry: {
					...allPlayerSteamData.find((player) => player.id === 6),
					matches: 45,
					winRate: '48%',
					avgImpact: 75,
					overall: 54
				},
				mid: {
					...allPlayerSteamData.find((player) => player.id === 3),
					matches: 54,
					winRate: '48%',
					avgImpact: 90,
					overall: 57
				},

				offlane: {
					...allPlayerSteamData.find((player) => player.id === 17),
					matches: 56,
					winRate: '48%',
					avgImpact: 81,
					overall: 54
				},
				soft: {
					...allPlayerSteamData.find((player) => player.id === 18),
					matches: 165,
					winRate: '43%',
					avgImpact: 72,
					overall: 49
				},
				hard: {
					...allPlayerSteamData.find((player) => player.id === 16),
					matches: 81,
					winRate: '43%',
					avgImpact: 63,
					overall: 47
				}
			}
		}
	};
};
