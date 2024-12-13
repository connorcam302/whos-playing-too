type HeroStats = {
	name?: string;
	matches?: string;
	winrate?: string;
	impact?: string;
	kills?: string;
	deaths?: string;
	assists?: string;
	gpm?: string;
	xpm?: string;
};

type PlayerData = {
	player_name?: string;
	role_combination?: string;
	character_and_game?: {
		character: string;
		game: string;
	};
	most_played_heroes?: HeroStats[];
	best_heroes?: HeroStats[];
	matches_played: string;
	win_rate_percentage: string;
	average_impact: string;
};

export const reportData: PlayerData[] = [
	{
		player_name: 'Bingham',
		role_combination: 'carry, nuker, escape',
		character_and_game: {
			character: 'Bayonetta',
			game: 'Bayonetta'
		},
		most_played_heroes: [
			{
				name: 'Pudge',
				matches: '42',
				winrate: '52.38'
			},
			{
				name: 'Rubick',
				matches: '36',
				winrate: '52.78'
			},
			{
				name: 'Tiny',
				matches: '22',
				winrate: '59.09'
			}
		],
		best_heroes: [
			{
				name: 'Pudge',
				matches: '42',
				winrate: '52.38',
				impact: '68.17',
				kills: '5.95',
				deaths: '9.24',
				assists: '16.62',
				gpm: '387.79',
				xpm: '536.62'
			},
			{
				name: 'Rubick',
				matches: '36',
				winrate: '52.78',
				impact: '80.58',
				kills: '5.22',
				deaths: '6.86',
				assists: '20.25',
				gpm: '390.64',
				xpm: '563.72'
			},
			{
				name: 'Tusk',
				matches: '5',
				winrate: '100',
				impact: '118.4',
				kills: '3.2',
				deaths: '4.6',
				assists: '24',
				gpm: '365.6',
				xpm: '537.2'
			}
		],
		matches_played: '807',
		win_rate_percentage: '54.52',
		average_impact: '85.78'
	},
	{
		player_name: 'Brock',
		role_combination: 'support, nuker, disabler',
		character_and_game: {
			character: 'Ellie',
			game: 'The Last of Us'
		},
		most_played_heroes: [
			{
				name: 'Venomancer',
				matches: '8',
				winrate: '62.5'
			},
			{
				name: 'Vengeful Spirit',
				matches: '6',
				winrate: '50'
			},
			{
				name: 'Mirana',
				matches: '4',
				winrate: '25'
			}
		],
		best_heroes: [
			{
				name: 'Venomancer',
				matches: '8',
				winrate: '62.5',
				impact: '93.88',
				kills: '3.75',
				deaths: '7.38',
				assists: '21.75',
				gpm: '343.75',
				xpm: '434'
			},
			{
				name: 'Vengeful Spirit',
				matches: '6',
				winrate: '50',
				impact: '132.83',
				kills: '3.33',
				deaths: '7',
				assists: '27',
				gpm: '348.33',
				xpm: '576.5'
			}
		],
		matches_played: '51',
		win_rate_percentage: '45.1',
		average_impact: '95.88'
	},
	{
		player_name: 'Callum',
		role_combination: 'carry, escape, nuker',
		character_and_game: {
			character: 'Bayonetta',
			game: 'Bayonetta'
		},
		most_played_heroes: [
			{
				name: 'Muerta',
				matches: '27',
				winrate: '59.26'
			},
			{
				name: 'Slark',
				matches: '10',
				winrate: '40'
			},
			{
				name: 'Ursa',
				matches: '10',
				winrate: '50'
			}
		],
		best_heroes: [
			{
				name: 'Tiny',
				matches: '6',
				winrate: '83.33',
				impact: '204.33',
				kills: '16.83',
				deaths: '5',
				assists: '15.17',
				gpm: '709.67',
				xpm: '923.17'
			},
			{
				name: 'Muerta',
				matches: '27',
				winrate: '59.26',
				impact: '110.19',
				kills: '12.07',
				deaths: '4.56',
				assists: '12.19',
				gpm: '683.63',
				xpm: '816.04'
			},
			{
				name: 'Juggernaut',
				matches: '9',
				winrate: '77.78',
				impact: '119.89',
				kills: '14.78',
				deaths: '4.89',
				assists: '12.11',
				gpm: '727.44',
				xpm: '933'
			}
		],
		matches_played: '336',
		win_rate_percentage: '55.36',
		average_impact: '94.78'
	},
	{
		player_name: 'Colfox',
		role_combination: 'nuker, escape, disabler',
		character_and_game: {
			character: 'James Sunderland',
			game: 'Silent Hill 2'
		},
		most_played_heroes: [
			{
				name: 'Invoker',
				matches: '52',
				winrate: '55.77'
			},
			{
				name: 'Puck',
				matches: '49',
				winrate: '44.9'
			},
			{
				name: 'Leshrac',
				matches: '31',
				winrate: '74.19'
			}
		],
		best_heroes: [
			{
				name: 'Invoker',
				matches: '52',
				winrate: '55.77',
				impact: '95.9',
				kills: '8.81',
				deaths: '5.12',
				assists: '13.46',
				gpm: '564.38',
				xpm: '703.62'
			},
			{
				name: 'Puck',
				matches: '49',
				winrate: '44.9',
				impact: '96.76',
				kills: '8.8',
				deaths: '4.86',
				assists: '12.16',
				gpm: '558.37',
				xpm: '712.65'
			},
			{
				name: 'Leshrac',
				matches: '31',
				winrate: '74.19',
				impact: '100.03',
				kills: '10.65',
				deaths: '6.19',
				assists: '15.52',
				gpm: '633.74',
				xpm: '777.71'
			}
		],
		matches_played: '473',
		win_rate_percentage: '51.16',
		average_impact: '89.49'
	},
	{
		player_name: 'Dan',
		role_combination: 'carry, disabler, nuker',
		character_and_game: {
			character: 'Ellie',
			game: 'The Last of Us'
		},
		most_played_heroes: [
			{
				name: 'Underlord',
				matches: '4',
				winrate: '50'
			},
			{
				name: 'Morphling',
				matches: '3',
				winrate: '33.33'
			},
			{
				name: 'Spectre',
				matches: '3',
				winrate: '33.33'
			}
		],
		best_heroes: [],
		matches_played: '19',
		win_rate_percentage: '42.11',
		average_impact: '62.58'
	},
	{
		player_name: 'Dom',
		role_combination: 'support, nuker, disabler',
		character_and_game: {
			character: 'Viktor',
			game: 'League of Legends'
		},
		most_played_heroes: [
			{
				name: 'Vengeful Spirit',
				matches: '16',
				winrate: '62.5'
			},
			{
				name: 'Necrophos',
				matches: '11',
				winrate: '45.45'
			},
			{
				name: 'Io',
				matches: '11',
				winrate: '54.55'
			}
		],
		best_heroes: [
			{
				name: 'Death Prophet',
				matches: '5',
				winrate: '100',
				impact: '103.6',
				kills: '8',
				deaths: '5.8',
				assists: '22',
				gpm: '610.4',
				xpm: '851'
			},
			{
				name: 'Terrorblade',
				matches: '5',
				winrate: '100',
				impact: '93.6',
				kills: '6.4',
				deaths: '5.2',
				assists: '19',
				gpm: '498.8',
				xpm: '664.2'
			},
			{
				name: 'Lifestealer',
				matches: '8',
				winrate: '87.5',
				impact: '111.38',
				kills: '9.75',
				deaths: '3.38',
				assists: '16.5',
				gpm: '685.75',
				xpm: '906.88'
			}
		],
		matches_played: '303',
		win_rate_percentage: '54.13',
		average_impact: '76.3'
	},
	{
		player_name: 'Evan',
		role_combination: 'support, disabler, initiator',
		character_and_game: {
			character: 'Kim Kitsuragi',
			game: 'Disco Elysium'
		},
		most_played_heroes: [
			{
				name: 'Chen',
				matches: '8',
				winrate: '37.5'
			},
			{
				name: 'Vengeful Spirit',
				matches: '7',
				winrate: '71.43'
			},
			{
				name: 'Hoodwink',
				matches: '6',
				winrate: '50'
			}
		],
		best_heroes: [
			{
				name: 'Vengeful Spirit',
				matches: '7',
				winrate: '71.43',
				impact: '67',
				kills: '2.86',
				deaths: '11.14',
				assists: '20.57',
				gpm: '296.71',
				xpm: '480.71'
			},
			{
				name: 'Hoodwink',
				matches: '6',
				winrate: '50',
				impact: '82.67',
				kills: '4.33',
				deaths: '8.33',
				assists: '16',
				gpm: '323.83',
				xpm: '464.5'
			},
			{
				name: 'Chen',
				matches: '8',
				winrate: '37.5',
				impact: '69.25',
				kills: '1.63',
				deaths: '8.25',
				assists: '19.88',
				gpm: '302.88',
				xpm: '382.88'
			}
		],
		matches_played: '66',
		win_rate_percentage: '53.03',
		average_impact: '71.27'
	},
	{
		player_name: 'Frenchy',
		role_combination: 'nuker, disabler, carry',
		character_and_game: {
			character: 'Kirby',
			game: 'Kirby'
		},
		most_played_heroes: [
			{
				name: 'Zeus',
				matches: '6',
				winrate: '66.67'
			},
			{
				name: 'Lion',
				matches: '2',
				winrate: '50'
			},
			{
				name: 'Primal Beast',
				matches: '2',
				winrate: '50'
			}
		],
		best_heroes: [
			{
				name: 'Zeus',
				matches: '6',
				winrate: '66.67',
				impact: '110',
				kills: '13.67',
				deaths: '7.5',
				assists: '19.5',
				gpm: '547.17',
				xpm: '805.33'
			}
		],
		matches_played: '21',
		win_rate_percentage: '47.62',
		average_impact: '70.9'
	},
	{
		player_name: 'Harry',
		role_combination: 'nuker, support, disabler',
		character_and_game: {
			character: 'Ellie',
			game: 'The Last of Us'
		},
		most_played_heroes: [
			{
				name: 'Shadow Shaman',
				matches: '15',
				winrate: '73.33'
			},
			{
				name: 'Bounty Hunter',
				matches: '12',
				winrate: '66.67'
			},
			{
				name: 'Crystal Maiden',
				matches: '11',
				winrate: '63.64'
			}
		],
		best_heroes: [
			{
				name: 'Shadow Shaman',
				matches: '15',
				winrate: '73.33',
				impact: '125.87',
				kills: '3.67',
				deaths: '6.87',
				assists: '24.4',
				gpm: '377.73',
				xpm: '530.07'
			},
			{
				name: 'Zeus',
				matches: '10',
				winrate: '70',
				impact: '141',
				kills: '12.7',
				deaths: '4.3',
				assists: '24.5',
				gpm: '625.3',
				xpm: '788.2'
			},
			{
				name: 'Bounty Hunter',
				matches: '12',
				winrate: '66.67',
				impact: '115.42',
				kills: '9.33',
				deaths: '6.08',
				assists: '18.92',
				gpm: '604.33',
				xpm: '668.25'
			}
		],
		matches_played: '222',
		win_rate_percentage: '55.41',
		average_impact: '97.09'
	},
	{
		player_name: 'Joe',
		role_combination: 'disabler, nuker, initiator',
		character_and_game: {
			character: 'Samus Aran',
			game: 'Metroid'
		},
		most_played_heroes: [
			{
				name: 'Night Stalker',
				matches: '58',
				winrate: '60.34'
			},
			{
				name: 'Vengeful Spirit',
				matches: '46',
				winrate: '69.57'
			},
			{
				name: 'Skywrath Mage',
				matches: '34',
				winrate: '61.76'
			}
		],
		best_heroes: [
			{
				name: 'Night Stalker',
				matches: '58',
				winrate: '60.34',
				impact: '92.29',
				kills: '8.34',
				deaths: '6.66',
				assists: '16.16',
				gpm: '453.36',
				xpm: '615.59'
			},
			{
				name: 'Vengeful Spirit',
				matches: '46',
				winrate: '69.57',
				impact: '83.76',
				kills: '4.59',
				deaths: '9.13',
				assists: '21.5',
				gpm: '335.65',
				xpm: '540.8'
			},
			{
				name: 'Skywrath Mage',
				matches: '34',
				winrate: '61.76',
				impact: '92.74',
				kills: '9.15',
				deaths: '6.68',
				assists: '18.06',
				gpm: '371.5',
				xpm: '592.65'
			}
		],
		matches_played: '362',
		win_rate_percentage: '51.66',
		average_impact: '80.98'
	},
	{
		player_name: 'Liam',
		role_combination: 'support, disabler, nuker',
		character_and_game: {
			character: 'Viktor',
			game: 'League of Legends'
		},
		most_played_heroes: [
			{
				name: 'Rubick',
				matches: '6',
				winrate: '66.67'
			},
			{
				name: 'Skywrath Mage',
				matches: '3',
				winrate: '0'
			},
			{
				name: 'Clockwerk',
				matches: '3',
				winrate: '66.67'
			}
		],
		best_heroes: [
			{
				name: 'Rubick',
				matches: '6',
				winrate: '66.67',
				impact: '80.5',
				kills: '5.33',
				deaths: '9.83',
				assists: '21.17',
				gpm: '353.33',
				xpm: '466.83'
			},
			{
				name: 'Windranger',
				matches: '33',
				winrate: '57.58',
				impact: '94.7',
				kills: '9.48',
				deaths: '5.36',
				assists: '13.21',
				gpm: '503.39',
				xpm: '680.21'
			},
			{
				name: 'Faceless Void',
				matches: '10',
				winrate: '90',
				impact: '143.7',
				kills: '13',
				deaths: '2.5',
				assists: '14.5',
				gpm: '703.9',
				xpm: '962.4'
			}
		],
		matches_played: '29',
		win_rate_percentage: '48.28',
		average_impact: '80.07'
	},
	{
		player_name: 'Matthew',
		role_combination: 'escape, nuker, disabler',
		character_and_game: {
			character: 'James Sunderland',
			game: 'Silent Hill 2'
		},
		most_played_heroes: [
			{
				name: 'Dark Willow',
				matches: '61',
				winrate: '59.02'
			},
			{
				name: 'Legion Commander',
				matches: '37',
				winrate: '67.57'
			},
			{
				name: 'Windranger',
				matches: '24',
				winrate: '58.33'
			}
		],
		best_heroes: [
			{
				name: 'Dark Willow',
				matches: '61',
				winrate: '59.02',
				impact: '84.11',
				kills: '9.59',
				deaths: '8.61',
				assists: '18.64',
				gpm: '462.75',
				xpm: '655.87'
			},
			{
				name: 'Legion Commander',
				matches: '37',
				winrate: '67.57',
				impact: '87.27',
				kills: '12.65',
				deaths: '9.84',
				assists: '16.51',
				gpm: '553.78',
				xpm: '706.86'
			},
			{
				name: 'Weaver',
				matches: '24',
				winrate: '62.5',
				impact: '134.5',
				kills: '15.29',
				deaths: '6.38',
				assists: '13.79',
				gpm: '700.83',
				xpm: '871.63'
			}
		],
		matches_played: '278',
		win_rate_percentage: '53.24',
		average_impact: '86.15'
	},
	{
		player_name: 'Phil',
		role_combination: 'nuker, support, carry',
		character_and_game: {
			character: 'Kratos',
			game: 'God of War'
		},
		most_played_heroes: [
			{
				name: 'Hoodwink',
				matches: '1',
				winrate: '100'
			},
			{
				name: 'Dazzle',
				matches: '1',
				winrate: '100'
			},
			{
				name: 'Phantom Lancer',
				matches: '1',
				winrate: '0'
			}
		],
		best_heroes: [],
		matches_played: '6',
		win_rate_percentage: '50',
		average_impact: '95'
	},
	{
		player_name: 'Pona',
		role_combination: 'carry, escape, nuker',
		character_and_game: {
			character: 'Bayonetta',
			game: 'Bayonetta'
		},
		most_played_heroes: [
			{
				name: 'Enchantress',
				matches: '3',
				winrate: '33.33'
			},
			{
				name: 'Bounty Hunter',
				matches: '2',
				winrate: '50'
			},
			{
				name: 'Anti-Mage',
				matches: '2',
				winrate: '100'
			}
		],
		best_heroes: [],
		matches_played: '12',
		win_rate_percentage: '58.33',
		average_impact: '77.58'
	},
	{
		player_name: 'Potto',
		role_combination: 'disabler, nuker, support',
		character_and_game: {
			character: 'Viktor',
			game: 'League of Legends'
		},
		most_played_heroes: [
			{
				name: 'Skywrath Mage',
				matches: '3',
				winrate: '66.67'
			},
			{
				name: 'Ringmaster',
				matches: '2',
				winrate: '50'
			},
			{
				name: 'Crystal Maiden',
				matches: '2',
				winrate: '100'
			}
		],
		best_heroes: [],
		matches_played: '23',
		win_rate_percentage: '52.17',
		average_impact: '58.57'
	},
	{
		player_name: 'Sam',
		role_combination: 'nuker, escape, carry',
		character_and_game: {
			character: 'Ada Wong',
			game: 'Resident Evil 2'
		},
		most_played_heroes: [
			{
				name: 'Tinker',
				matches: '38',
				winrate: '60.53'
			},
			{
				name: 'Phantom Lancer',
				matches: '27',
				winrate: '77.78'
			},
			{
				name: 'Pudge',
				matches: '23',
				winrate: '52.17'
			}
		],
		best_heroes: [
			{
				name: 'Tinker',
				matches: '38',
				winrate: '60.53',
				impact: '77.58',
				kills: '3.61',
				deaths: '7.66',
				assists: '16.82',
				gpm: '479.95',
				xpm: '616.45'
			},
			{
				name: 'Phantom Lancer',
				matches: '27',
				winrate: '77.78',
				impact: '93.48',
				kills: '10.19',
				deaths: '5.85',
				assists: '12.22',
				gpm: '674.19',
				xpm: '881.52'
			},
			{
				name: 'Visage',
				matches: '22',
				winrate: '72.73',
				impact: '92.05',
				kills: '8.64',
				deaths: '8.68',
				assists: '16.05',
				gpm: '538.27',
				xpm: '634.14'
			}
		],
		matches_played: '423',
		win_rate_percentage: '51.54',
		average_impact: '69.23'
	},
	{
		player_name: 'Sighboys',
		role_combination: 'nuker, escape, carry',
		character_and_game: {
			character: 'Ada Wong',
			game: 'Resident Evil 2'
		},
		most_played_heroes: [
			{
				name: 'Queen of Pain',
				matches: '37',
				winrate: '56.76'
			},
			{
				name: 'Windranger',
				matches: '33',
				winrate: '57.58'
			},
			{
				name: 'Invoker',
				matches: '32',
				winrate: '37.5'
			}
		],
		best_heroes: [
			{
				name: 'Queen of Pain',
				matches: '37',
				winrate: '56.76',
				impact: '126.35',
				kills: '16.51',
				deaths: '3.65',
				assists: '11.49',
				gpm: '718.59',
				xpm: '1011.46'
			},
			{
				name: 'Windranger',
				matches: '33',
				winrate: '57.58',
				impact: '94.7',
				kills: '9.48',
				deaths: '5',
				assists: '0',
				gpm: '0',
				xpm: '0'
			}
		],
		matches_played: '926',
		win_rate_percentage: '52.38',
		average_impact: '96.83'
	},
	{
		player_name: 'Steve',
		role_combination: 'nuker, disabler, initiator',
		character_and_game: {
			character: 'Samus Aran',
			game: 'Metroid'
		},
		most_played_heroes: [
			{
				name: 'Tiny',
				matches: '15',
				winrate: '66.67'
			},
			{
				name: 'Clockwerk',
				matches: '12',
				winrate: '58.33'
			},
			{
				name: 'Tusk',
				matches: '11',
				winrate: '45.45'
			}
		],
		best_heroes: [
			{
				name: 'Ember Spirit',
				matches: '5',
				winrate: '80',
				impact: '158.6',
				kills: '11',
				deaths: '1.8',
				assists: '14.8',
				gpm: '570',
				xpm: '715.6'
			},
			{
				name: 'Axe',
				matches: '5',
				winrate: '100',
				impact: '62.8',
				kills: '7',
				deaths: '9.4',
				assists: '13.8',
				gpm: '501.4',
				xpm: '644.4'
			},
			{
				name: 'Kunkka',
				matches: '8',
				winrate: '75',
				impact: '92.38',
				kills: '6.13',
				deaths: '6.63',
				assists: '19.25',
				gpm: '526.25',
				xpm: '640.13'
			}
		],
		matches_played: '353',
		win_rate_percentage: '56.37',
		average_impact: '78.87'
	},
	{
		player_name: 'Tom',
		role_combination: 'disabler, initiator, durable',
		character_and_game: {
			character: 'Ulfric Stormcloak',
			game: 'Skyrim'
		},
		most_played_heroes: [
			{
				name: 'Pudge',
				matches: '43',
				winrate: '58.14'
			},
			{
				name: 'Shadow Shaman',
				matches: '26',
				winrate: '73.08'
			},
			{
				name: 'Vengeful Spirit',
				matches: '14',
				winrate: '71.43'
			}
		],
		best_heroes: [
			{
				name: 'Pudge',
				matches: '43',
				winrate: '58.14',
				impact: '78.81',
				kills: '6.98',
				deaths: '7.74',
				assists: '16.4',
				gpm: '400.98',
				xpm: '550.12'
			},
			{
				name: 'Shadow Shaman',
				matches: '26',
				winrate: '73.08',
				impact: '85.54',
				kills: '5.19',
				deaths: '7',
				assists: '20.31',
				gpm: '389.23',
				xpm: '581.92'
			},
			{
				name: 'Night Stalker',
				matches: '6',
				winrate: '100',
				impact: '110.17',
				kills: '13.5',
				deaths: '4.33',
				assists: '17.33',
				gpm: '593.83',
				xpm: '855.83'
			}
		],
		matches_played: '436',
		win_rate_percentage: '57.34',
		average_impact: '94.19'
	},
	{
		player_name: 'Doherty',
		role_combination: 'initiator, disabler, carry',
		character_and_game: {
			character: 'Tomb Raider Lara Croft',
			game: 'Tomb Raider'
		},
		most_played_heroes: [
			{
				name: 'Silencer',
				matches: '1',
				winrate: '100'
			}
		],
		best_heroes: [],
		matches_played: '1',
		win_rate_percentage: '100',
		average_impact: '77'
	},
	{
		player_name: 'Lillie',
		role_combination: 'initiator, disabler, nuker',
		character_and_game: {
			character: 'Samus Aran',
			game: 'Metroid'
		},
		most_played_heroes: [
			{
				name: 'Earthshaker',
				matches: '24',
				winrate: '58.33'
			},
			{
				name: 'Rubick',
				matches: '15',
				winrate: '53.33'
			},
			{
				name: 'Vengeful Spirit',
				matches: '6',
				winrate: '50'
			}
		],
		best_heroes: [
			{
				name: 'Earthshaker',
				matches: '24',
				winrate: '58.33',
				impact: '82.25',
				kills: '11.5',
				deaths: '6.92',
				assists: '13.63',
				gpm: '500.42',
				xpm: '684.58'
			},
			{
				name: 'Rubick',
				matches: '15',
				winrate: '53.33',
				impact: '74.2',
				kills: '7.67',
				deaths: '8.53',
				assists: '19',
				gpm: '446.67',
				xpm: '632.73'
			},
			{
				name: 'Vengeful Spirit',
				matches: '6',
				winrate: '50',
				impact: '54.5',
				kills: '3.33',
				deaths: '9.33',
				assists: '15.67',
				gpm: '333.83',
				xpm: '523.5'
			}
		],
		matches_played: '151',
		win_rate_percentage: '50.99',
		average_impact: '74.79'
	}
];
