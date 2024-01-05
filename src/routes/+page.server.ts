import { db } from '$lib/server/database'
import { accounts, matchData, matches, players } from '$lib/server/schema'
import { desc, eq, type InferSelectModel } from 'drizzle-orm'

type DotaAsset = { id: number; name: string; img: string };

type MatchDataInfer = InferSelectModel<typeof matchData>;
type MatchInfer = InferSelectModel<typeof matches>;
type AccountInfer = InferSelectModel<typeof accounts>;
type PlayerInfer = InferSelectModel<typeof players>;

type MatchData = {
    [K in keyof MatchDataInfer]:
    K extends 'item0' | 'item1' | 'item2' | 'item3' | 'item4' | 'item5' | 'itemNeutral' | 'hero'
    ? DotaAsset
    : MatchDataInfer[K];
};

type PlayerMatchData = MatchData & AccountInfer & PlayerInfer;

export const load = async () => {
    const matchArray = await db.select().from(matches).limit(20).orderBy(desc(matches.id))

    const itemJson = await fetch(`https://raw.githubusercontent.com/connorcam302/whos-playing-constants/main/ITEMS.json`)
    const items: DotaAsset[] = await itemJson.json()
    const heroJson = await fetch(`https://raw.githubusercontent.com/connorcam302/whos-playing-constants/main/HEROES.json`)
    const heroes: DotaAsset[] = await heroJson.json()

    const matchBlockPromises = matchArray.map(async (match) => {
        const data = await db
            .select()
            .from(matchData)
            .innerJoin(accounts, eq(accounts.accountId, matchData.playerId))
            .innerJoin(players, eq(accounts.owner, players.id))
            .where(eq(matchData.matchId, match.id))
        const block: PlayerMatchData[] = data.map((player) => {
            return {
                ...player.players,
                ...player.accounts,
                ...player.match_data,
                item0: items.find((item) => item.id === player.match_data.item0)!,
                item1: items.find((item) => item.id === player.match_data.item1)!,
                item2: items.find((item) => item.id === player.match_data.item2)!,
                item3: items.find((item) => item.id === player.match_data.item3)!,
                item4: items.find((item) => item.id === player.match_data.item4)!,
                item5: items.find((item) => item.id === player.match_data.item5)!,
                itemNeutral: items.find((item) => item.id === player.match_data.itemNeutral)!,
                hero: heroes.find((hero) => hero.id === player.match_data.heroId)!
            }
        })

        console.log(block)

        return block
    })

    const matchBlocksCombined = await Promise.all(matchBlockPromises)
    const splitByTeam = (players: PlayerMatchData[]) => {
        const radiant: PlayerMatchData[] = []
        const dire: PlayerMatchData[] = []
        players.forEach((player: PlayerMatchData) => {
            if (player.team === 'radiant') {
                radiant.push(player)
            } else {
                dire.push(player)
            }
        })
        return { radiant, dire }
    }

    const matchBlocks = matchBlocksCombined.map((match) => {
        const { radiant, dire } = splitByTeam(match)
        const matchData: MatchInfer = matchArray.find((data) => data.id === radiant[0]?.matchId || data.id === dire[0]?.matchId)!
        return { radiant, dire, matchData }
    })

    return { matchBlocks }
}

