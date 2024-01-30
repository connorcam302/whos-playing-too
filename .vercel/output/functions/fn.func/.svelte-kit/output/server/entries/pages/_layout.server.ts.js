import { g as getPlayers } from "../../chunks/db-functions.js";
const load = async ({ url }) => {
  const playerList = await getPlayers();
  return { playerList, url: url.pathname };
};
export {
  load
};
