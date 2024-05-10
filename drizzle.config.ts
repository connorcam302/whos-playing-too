import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';
dotenv.config();

export default {
	schema: './src/lib/server/schema.ts',
	out: './drizzle',
	dialect: 'postgresql',
	driver: 'pg',
	url: process.env.DATABASE_URL ?? '',
	dbCredentials: {
		connectionString: process.env.DATABASE_URL ?? ''
	}
} satisfies Config;
