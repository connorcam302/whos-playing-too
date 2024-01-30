import { i as getPlayer, j as getAccounts, k as getPlayerStats, c as getHeroStats, l as getPlayerChart, S as STEAM_KEY } from "../../../../chunks/db-functions.js";
import dayjs from "dayjs";
const getSteamData = async (steamId) => {
  const steamData = await fetch(
    `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_KEY}&steamids=${(BigInt(steamId) + BigInt("76561197960265728")).toString()}`
  );
  const steamDataJson = await steamData.json();
  return steamDataJson.response.players[0];
};
function measurePromise(fn) {
  let onPromiseDone = () => performance.now() - start;
  let start = performance.now();
  return fn().then(onPromiseDone, onPromiseDone);
}
const load = async ({ url, params }) => {
  const player = await getPlayer(params.id);
  const accountIds = await getAccounts(params.id);
  const allSteamData = await Promise.all(
    accountIds.map(async (account) => {
      return { ...await getSteamData(account.accountId), smurf: account.smurf };
    })
  );
  const steamData = await getSteamData(player.accountId);
  const weeklyStats = await getPlayerStats(params.id);
  const allTimeStats = await getPlayerStats(params.id, 9999);
  const heroStats = getHeroStats(dayjs(0).add(2, "week").valueOf() / 1e3, params.id);
  const winGraph = await getPlayerChart(params.id, 31);
  const timings = [
    { name: "getPlayer", time: await measurePromise(() => getPlayer(params.id)) },
    { name: "getAccounts", time: await measurePromise(() => getAccounts(params.id)) },
    { name: "getSteamData", time: await measurePromise(() => getSteamData(player.accountId)) },
    {
      name: "allSteamData",
      time: await measurePromise(
        () => Promise.all(
          accountIds.map(async (account) => {
            return { ...await getSteamData(account.accountId), smurf: account.smurf };
          })
        )
      )
    },
    { name: "getPlayerStats", time: await measurePromise(() => getPlayerStats(params.id)) },
    {
      name: "getHeroStats",
      time: await measurePromise(
        () => getHeroStats(dayjs(0).add(2, "week").valueOf() / 1e3, params.id)
      )
    },
    {
      name: "getPlayerChart",
      time: await measurePromise(() => getPlayerChart(params.id, 31))
    }
  ];
  return {
    player,
    steamData,
    allSteamData,
    allTimeStats,
    weeklyStats,
    heroStats,
    winGraph,
    timings
  };
};
export {
  load
};
