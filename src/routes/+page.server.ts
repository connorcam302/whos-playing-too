import { db } from '$lib/server/database'
import { matchData } from '$lib/server/schema'
import { desc } from 'drizzle-orm'

export const load = async ({ fetch, data, params }) => {
    const matches = await db.select().from(matchData).limit(20).orderBy(desc(matchData.matchId))

    return { matches }
}
