import {
	pgTable,
	foreignKey,
	pgEnum,
	bigint,
	boolean,
	varchar,
	unique,
	text
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const keyStatus = pgEnum('key_status', ['expired', 'invalid', 'valid', 'default']);
export const keyType = pgEnum('key_type', [
	'stream_xchacha20',
	'secretstream',
	'secretbox',
	'kdf',
	'generichash',
	'shorthash',
	'auth',
	'hmacsha256',
	'hmacsha512',
	'aead-det',
	'aead-ietf'
]);
export const requestStatus = pgEnum('request_status', ['ERROR', 'SUCCESS', 'PENDING']);
export const factorType = pgEnum('factor_type', ['webauthn', 'totp']);
export const factorStatus = pgEnum('factor_status', ['verified', 'unverified']);
export const aalLevel = pgEnum('aal_level', ['aal3', 'aal2', 'aal1']);
export const codeChallengeMethod = pgEnum('code_challenge_method', ['plain', 's256']);

export const accounts = pgTable('accounts', {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	owner: bigint('owner', { mode: 'number' })
		.notNull()
		.references(() => players.id),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	accountId: bigint('account_id', { mode: 'number' }).primaryKey().notNull(),
	smurf: boolean('smurf').notNull()
});

export const heroes = pgTable('heroes', {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint('id', { mode: 'number' }).primaryKey().notNull(),
	name: varchar('name').notNull(),
	img: varchar('img').notNull()
});

export const items = pgTable('items', {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint('id', { mode: 'number' }).primaryKey().notNull(),
	name: varchar('name'),
	img: varchar('img')
});

export const matchData = pgTable(
	'match_data',
	{
		// You can use { mode: "bigint" } if numbers are exceeding js number limitations
		playerId: bigint('player_id', { mode: 'number' })
			.notNull()
			.references(() => accounts.accountId),
		// You can use { mode: "bigint" } if numbers are exceeding js number limitations
		matchId: bigint('match_id', { mode: 'number' })
			.notNull()
			.references(() => matches.id),
		// You can use { mode: "bigint" } if numbers are exceeding js number limitations
		heroId: bigint('hero_id', { mode: 'number' })
			.notNull()
			.references(() => heroes.id),
		team: varchar('team').notNull(),
		// You can use { mode: "bigint" } if numbers are exceeding js number limitations
		kills: bigint('kills', { mode: 'number' }).notNull(),
		// You can use { mode: "bigint" } if numbers are exceeding js number limitations
		deaths: bigint('deaths', { mode: 'number' }).notNull(),
		// You can use { mode: "bigint" } if numbers are exceeding js number limitations
		assists: bigint('assists', { mode: 'number' }).notNull(),
		// You can use { mode: "bigint" } if numbers are exceeding js number limitations
		item0: bigint('item_0', { mode: 'number' })
			.notNull()
			.references(() => items.id),
		// You can use { mode: "bigint" } if numbers are exceeding js number limitations
		item1: bigint('item_1', { mode: 'number' })
			.notNull()
			.references(() => items.id),
		// You can use { mode: "bigint" } if numbers are exceeding js number limitations
		item2: bigint('item_2', { mode: 'number' })
			.notNull()
			.references(() => items.id),
		// You can use { mode: "bigint" } if numbers are exceeding js number limitations
		item3: bigint('item_3', { mode: 'number' })
			.notNull()
			.references(() => items.id),
		// You can use { mode: "bigint" } if numbers are exceeding js number limitations
		item4: bigint('item_4', { mode: 'number' })
			.notNull()
			.references(() => items.id),
		// You can use { mode: "bigint" } if numbers are exceeding js number limitations
		item5: bigint('item_5', { mode: 'number' })
			.notNull()
			.references(() => items.id),
		// You can use { mode: "bigint" } if numbers are exceeding js number limitations
		aghanimsScepter: bigint('aghanims_scepter', { mode: 'number' }),
		// You can use { mode: "bigint" } if numbers are exceeding js number limitations
		aghanimsShard: bigint('aghanims_shard', { mode: 'number' }),
		// You can use { mode: "bigint" } if numbers are exceeding js number limitations
		goldPerMin: bigint('gold_per_min', { mode: 'number' }),
		// You can use { mode: "bigint" } if numbers are exceeding js number limitations
		lastHits: bigint('last_hits', { mode: 'number' }),
		// You can use { mode: "bigint" } if numbers are exceeding js number limitations
		xpPerMin: bigint('xp_per_min', { mode: 'number' }),
		// You can use { mode: "bigint" } if numbers are exceeding js number limitations
		itemNeutral: bigint('item_neutral', { mode: 'number' }).references(() => items.id),
		// You can use { mode: "bigint" } if numbers are exceeding js number limitations
		role: bigint('role', { mode: 'number' }).notNull(),
		// You can use { mode: "bigint" } if numbers are exceeding js number limitations
		impact: bigint('impact', { mode: 'number' }).notNull(),
		// You can use { mode: "bigint" } if numbers are exceeding js number limitations
		backpack0: bigint('backpack_0', { mode: 'number' }).references(() => items.id),
		// You can use { mode: "bigint" } if numbers are exceeding js number limitations
		backpack1: bigint('backpack_1', { mode: 'number' }).references(() => items.id),
		// You can use { mode: "bigint" } if numbers are exceeding js number limitations
		backpack2: bigint('backpack_2', { mode: 'number' }).references(() => items.id)
	},
	(table) => {
		return {
			matchDataPlayerIdMatchIdKey: unique('match_data_player_id_match_id_key').on(
				table.playerId,
				table.matchId
			)
		};
	}
);

export const matches = pgTable('matches', {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint('id', { mode: 'number' }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	gameMode: bigint('game_mode', { mode: 'number' }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	startTime: bigint('start_time', { mode: 'number' }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	duration: bigint('duration', { mode: 'number' }).notNull(),
	winner: text('winner').notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	lobby: bigint('lobby', { mode: 'number' }).notNull()
});

export const players = pgTable('players', {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint('id', { mode: 'number' }).primaryKey().notNull(),
	username: text('username').notNull()
});
