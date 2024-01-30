import { g as getPlayers } from "../../../chunks/db-functions.js";
const load = async ({ url, params }) => {
  const playerList = await getPlayers();
  const heroJson = await fetch(
    `https://raw.githubusercontent.com/connorcam302/whos-playing-constants/main/HEROES.json`
  );
  const heroList = await heroJson.json();
  heroList.sort((a, b) => a.name.localeCompare(b.name));
  return { playerList, heroList };
};
export {
  load
};
