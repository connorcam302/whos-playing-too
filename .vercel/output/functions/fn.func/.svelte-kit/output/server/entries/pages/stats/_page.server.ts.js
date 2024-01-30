import { g as getPlayers, l as getPlayerChart } from "../../../chunks/db-functions.js";
const load = async ({ url, params }) => {
  const players = await getPlayers();
  const promises = players.map(async (player) => {
    return {
      data: await getPlayerChart(player.id, 31),
      player
    };
  });
  const chartData = await Promise.all(promises).then((data) => {
    return data;
  });
  const graph = chartData.map((data) => {
    if (data.data.matchCount > 5) {
      return {
        player: data.player,
        data: data.data.daysArray
      };
    }
  }).filter((data) => data !== void 0);
  return { graph };
};
export {
  load
};
