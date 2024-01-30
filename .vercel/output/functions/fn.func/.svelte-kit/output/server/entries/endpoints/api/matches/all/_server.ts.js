import { g as getPlayers, d as db, m as matches, a as matchData, b as accounts, p as players } from "../../../../../chunks/db-functions.js";
import { eq, and, inArray, desc } from "drizzle-orm";
import { j as json } from "../../../../../chunks/index.js";
const GET = async ({ url, params }) => {
  const itemJson = await fetch(
    `https://raw.githubusercontent.com/connorcam302/whos-playing-constants/main/ITEMS.json`
  );
  const items = await itemJson.json();
  const heroJson = await fetch(
    `https://raw.githubusercontent.com/connorcam302/whos-playing-constants/main/HEROES.json`
  );
  const heroes = await heroJson.json();
  const allPlayers = await getPlayers();
  const allPlayerIds = allPlayers.map((player) => player.id);
  let playerFilter = allPlayerIds;
  if (url.searchParams.has("players")) {
    playerFilter = JSON.parse(url.searchParams.get("players"));
  }
  const allHeroIds = heroes.map((hero) => hero.id);
  let heroFilter = allHeroIds;
  if (url.searchParams.has("heroes")) {
    heroFilter = JSON.parse(url.searchParams.get("heroes"));
  }
  let pageNumber = 0;
  if (url.searchParams.has("page")) {
    pageNumber = parseInt(url.searchParams.get("page"));
  }
  const allGameModes = [0, 1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 20, 21, 22];
  const allLobbies = [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8];
  let gameModeFilter = allGameModes;
  let lobbyFilter = allLobbies;
  if (url.searchParams.has("gameMode")) {
    gameModeFilter = [];
    lobbyFilter = [];
    let gameModeSet = /* @__PURE__ */ new Set();
    let lobbySet = /* @__PURE__ */ new Set();
    const modes = JSON.parse(url.searchParams.get("gameMode"));
    if (modes.includes("ranked-all-pick")) {
      gameModeSet.add(22);
      lobbySet.add(7);
    }
    if (modes.includes("unranked-all-pick")) {
      gameModeSet.add(22);
      lobbySet.add(0);
    }
    if (modes.includes("other")) {
      [0, 1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 20, 21].forEach(
        (mode) => gameModeSet.add(mode)
      );
      [-1, 0, 1, 2, 3, 4, 5, 6, 8].forEach((lobby) => lobbySet.add(lobby));
    }
    gameModeFilter = Array.from(gameModeSet);
    lobbyFilter = Array.from(lobbySet);
  }
  const matchArray = await db.select({
    id: matches.id,
    winner: matches.winner,
    duration: matches.duration,
    startTime: matches.startTime,
    gameMode: matches.gameMode,
    lobby: matches.lobby
  }).from(matches).leftJoin(matchData, eq(matches.id, matchData.matchId)).leftJoin(accounts, eq(matchData.playerId, accounts.accountId)).leftJoin(players, eq(accounts.owner, players.id)).where(
    and(
      inArray(players.id, playerFilter),
      inArray(matchData.heroId, heroFilter),
      inArray(matches.gameMode, gameModeFilter),
      inArray(matches.lobby, lobbyFilter)
    )
  ).limit((pageNumber + 1) * 10 + 1).groupBy(matches.id).orderBy(desc(matches.id));
  const matchBlockPromises = matchArray.map(async (match) => {
    const data = await db.select().from(matchData).innerJoin(accounts, eq(accounts.accountId, matchData.playerId)).innerJoin(players, eq(accounts.owner, players.id)).where(eq(matchData.matchId, match.id));
    const block = data.map((player) => {
      return {
        ...player.players,
        ...player.accounts,
        ...player.match_data,
        item0: items.find((item) => item.id === player.match_data.item0),
        item1: items.find((item) => item.id === player.match_data.item1),
        item2: items.find((item) => item.id === player.match_data.item2),
        item3: items.find((item) => item.id === player.match_data.item3),
        item4: items.find((item) => item.id === player.match_data.item4),
        item5: items.find((item) => item.id === player.match_data.item5),
        backpack0: items.find((item) => item.id === player.match_data.backpack0),
        backpack1: items.find((item) => item.id === player.match_data.backpack1),
        backpack2: items.find((item) => item.id === player.match_data.backpack2),
        itemNeutral: items.find((item) => item.id === player.match_data.itemNeutral),
        hero: heroes.find((hero) => hero.id === player.match_data.heroId)
      };
    });
    return block;
  });
  const matchBlocksCombined = await Promise.all(matchBlockPromises);
  const splitByTeam = (players2) => {
    const radiant = [];
    const dire = [];
    players2.forEach((player) => {
      if (player.team === "radiant") {
        radiant.push(player);
      } else {
        dire.push(player);
      }
    });
    return { radiant, dire };
  };
  const matchBlocks = matchBlocksCombined.map((match) => {
    const { radiant, dire } = splitByTeam(match);
    const matchData2 = matchArray.find(
      (data) => data.id === radiant[0]?.matchId || data.id === dire[0]?.matchId
    );
    return { radiant, dire, matchData: matchData2 };
  });
  const matchBlocksSorted = matchBlocks.sort(
    (a, b) => b.matchData.startTime + b.matchData.duration - (a.matchData.startTime + a.matchData.duration)
  );
  return json(matchBlocksSorted.slice(-11));
};
export {
  GET
};
