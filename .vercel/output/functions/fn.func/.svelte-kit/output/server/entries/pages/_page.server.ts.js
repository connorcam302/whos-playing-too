import { c as getHeroStats, e as getAllPlayerStats, f as getTeamOfTheWeek, h as getFeatures } from "../../chunks/db-functions.js";
function measurePromise(fn) {
  let onPromiseDone = () => performance.now() - start;
  let start = performance.now();
  return fn().then(onPromiseDone, onPromiseDone);
}
const load = async ({ url, params }) => {
  const heroStats = await getHeroStats();
  const playerStats = await getAllPlayerStats();
  const totw = await getTeamOfTheWeek();
  const features = getFeatures();
  const timings = [
    { name: "getHeroStats", time: await measurePromise(() => getHeroStats()) },
    { name: "getAllPlayerStats", time: await measurePromise(() => getAllPlayerStats()) },
    { name: "getTeamOfTheWeek", time: await measurePromise(() => getTeamOfTheWeek()) },
    { name: "getFeatures", time: await measurePromise(() => getFeatures()) }
  ];
  return { heroStats, playerStats, totw, features, timings };
};
export {
  load
};
