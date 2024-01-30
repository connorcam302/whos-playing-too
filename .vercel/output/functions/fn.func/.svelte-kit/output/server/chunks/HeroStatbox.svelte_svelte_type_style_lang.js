import { c as create_ssr_component, d as spread, f as escape_object, a as add_attribute, e as escape, v as validate_component, b as each } from "./ssr.js";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
const getGameMode = (id) => {
  switch (id) {
    case 0:
      return "Unknown";
    case 1:
      return "All Pick";
    case 2:
      return "Captains Mode";
    case 3:
      return "Random Draft";
    case 4:
      return "Single Draft";
    case 5:
      return "All Random";
    case 6:
      return "Intro";
    case 7:
      return "Diretide";
    case 8:
      return "Reverse Captains Mode";
    case 9:
      return "Greeviling";
    case 10:
      return "Tutorial";
    case 11:
      return "Mid Only";
    case 12:
      return "Least Played";
    case 13:
      return "Limited Heroes";
    case 14:
      return "Compendium Matchmaking";
    case 15:
      return "Custom";
    case 16:
      return "Captains Draft";
    case 17:
      return "Balanced Draft";
    case 18:
      return "Ability Draft";
    case 19:
      return "Event";
    case 20:
      return "All Random Deathmatch";
    case 21:
      return "1v1 Mid";
    case 22:
      return "All Pick";
    case 23:
      return "Turbo";
    case 24:
      return "Mutation";
    case 25:
      return "Coaches Challenge";
    case 26:
      return "Captain's Mode";
    case 27:
      return "Greeviling";
    case 28:
      return "Tutorial";
    case 29:
      return "Mid Only";
    case 30:
      return "Least Played";
    case 31:
      return "Limited Heroes";
    case 32:
      return "Compendium Matchmaking";
    case 33:
      return "Custom";
    case 34:
      return "Captain's Draft";
    case 35:
      return "Balanced Draft";
    case 36:
      return "Ability Draft";
    case 37:
      return "Event";
    case 38:
      return "All Random Deathmatch";
    case 39:
      return "1v1 Mid";
    case 40:
      return "All Draft";
    case 41:
      return "Turbo";
    case 42:
      return "Mutation";
    default:
      return "Unknown";
  }
};
const calcImpact = (impact) => {
  if (impact > 200) {
    return "S++";
  }
  if (impact > 140) {
    return "S+";
  }
  if (impact > 130) {
    return "S";
  }
  if (impact > 123) {
    return "S-";
  }
  if (impact > 116) {
    return "A+";
  }
  if (impact > 109) {
    return "A";
  }
  if (impact > 102) {
    return "A-";
  }
  if (impact > 95) {
    return "B+";
  }
  if (impact > 88) {
    return "B";
  }
  if (impact > 81) {
    return "B-";
  }
  if (impact > 74) {
    return "C+";
  }
  if (impact > 67) {
    return "C";
  }
  if (impact > 60) {
    return "C-";
  }
  if (impact > 53) {
    return "D+";
  }
  if (impact > 46) {
    return "D";
  }
  if (impact > 39) {
    return "D-";
  }
  if (impact > 32) {
    return "F+";
  }
  if (impact > 25) {
    return "F";
  }
  if (impact <= 25) {
    return "F-";
  } else {
    return "Error";
  }
};
const getRoleIcon = (role) => {
  if (role === 1) {
    return "/roles/pos1.png";
  }
  if (role === 2) {
    return "/roles/pos2.png";
  }
  if (role === 3) {
    return "/roles/pos3.png";
  }
  if (role === 4) {
    return "/roles/pos4.png";
  }
  if (role === 5) {
    return "/roles/pos5.png";
  }
};
const getStatColour = (stat) => {
  if (stat === "wins") {
    return "#22c55e";
  }
  if (stat === "losses") {
    return "#d0021b";
  }
  return "#000000";
};
const Exchange = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<svg${spread(
    [
      { viewBox: "0 0 24 24" },
      { width: "1.2em" },
      { height: "1.2em" },
      escape_object($$props)
    ],
    {}
  )}><!-- HTML_TAG_START -->${`<path fill="currentColor" d="M18 10a1 1 0 0 0-1-1H5.41l2.3-2.29a1 1 0 0 0-1.42-1.42l-4 4a1 1 0 0 0-.21 1.09A1 1 0 0 0 3 11h14a1 1 0 0 0 1-1m3.92 3.62A1 1 0 0 0 21 13H7a1 1 0 0 0 0 2h11.59l-2.3 2.29a1 1 0 0 0 0 1.42a1 1 0 0 0 1.42 0l4-4a1 1 0 0 0 .21-1.09"/>`}<!-- HTML_TAG_END --></svg>`;
});
const Dash_lg = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<svg${spread(
    [
      { viewBox: "0 0 16 16" },
      { width: "1.2em" },
      { height: "1.2em" },
      escape_object($$props)
    ],
    {}
  )}><!-- HTML_TAG_START -->${`<path fill="currentColor" fill-rule="evenodd" d="M2 8a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11A.5.5 0 0 1 2 8"/>`}<!-- HTML_TAG_END --></svg>`;
});
const Question = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<svg${spread(
    [
      { viewBox: "0 0 24 24" },
      { width: "1.2em" },
      { height: "1.2em" },
      escape_object($$props)
    ],
    {}
  )}><!-- HTML_TAG_START -->${`<path fill="currentColor" d="M15.333 9.5A3.5 3.5 0 0 0 8.8 7.75a1 1 0 0 0 1.733 1a1.503 1.503 0 0 1 1.3-.75a1.5 1.5 0 1 1 0 3h-.003a.95.95 0 0 0-.19.039a1.032 1.032 0 0 0-.198.04a.983.983 0 0 0-.155.105a1.008 1.008 0 0 0-.162.11a1.005 1.005 0 0 0-.117.174a.978.978 0 0 0-.097.144a1.023 1.023 0 0 0-.043.212a.948.948 0 0 0-.035.176v1l.002.011v.491a1 1 0 0 0 1 .998h.003a1 1 0 0 0 .998-1.002l-.002-.662A3.494 3.494 0 0 0 15.333 9.5m-4.203 6.79a1 1 0 0 0 .7 1.71a1.036 1.036 0 0 0 .71-.29a1.015 1.015 0 0 0 0-1.42a1.034 1.034 0 0 0-1.41 0"/>`}<!-- HTML_TAG_END --></svg>`;
});
const Poo = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<svg${spread(
    [
      { viewBox: "0 0 512 512" },
      { width: "1.2em" },
      { height: "1.2em" },
      escape_object($$props)
    ],
    {}
  )}><!-- HTML_TAG_START -->${`<path fill="#A57655" d="M431.6 269.1c10.7-19.6 12.4-38.3 12.4-48.5c0-41.7-30.7-76.2-70.7-82.2C358 33.1 270.9 1.8 269.9 1.4c-2-.7-4.3.1-5.4 1.9c-1.1 1.8-.9 4.2.7 5.7c8.6 8.6 12.2 16.5 11 24.2c-2.8 18.7-33.6 35-58.3 48c-5.8 3.1-11.4 6-16.4 8.9c-10.7 6.1-22.1 11.6-33.2 16.9c-38.2 18.4-77.4 37.3-89.3 83c-3.7 9.4-5.8 19.7-5.8 30.4c0 8.7 1.5 27 11.8 46.7c-38.1 13-65.6 49.2-65.6 91.8c0 28.5 10.6 98.4 108.6 132.7c45.3 15.8 94.6 19.1 127.9 19.1c174.4 0 236.5-78.4 236.5-151.8c.1-40.6-25.1-75.5-60.8-89.8"/><path fill="#2B3B47" d="M179 219.9c13.2 0 23.9 10.7 23.9 23.9v36.6c0 13.2-10.7 23.9-23.9 23.9s-23.9-10.7-23.9-23.9v-36.6c0-13.2 10.7-23.9 23.9-23.9m164.5 0c13.2 0 23.9 10.7 23.9 23.9v36.6c0 13.2-10.7 23.9-23.9 23.9s-23.9-10.7-23.9-23.9v-36.6c0-13.2 10.7-23.9 23.9-23.9m30.4 139.8c-3.2-5.6-9.2-9.1-15.7-9.1H162.7c-6.5 0-12.5 3.5-15.7 9.1c-3.2 5.6-3.2 12.5.1 18.1c12.3 21 29.9 37.5 50.6 48.5c16.8-13.7 38.6-13.2 62.7-13.2s45.9-.5 62.7 13.2c20.7-11 38.3-27.5 50.6-48.5c3.3-5.5 3.4-12.5.2-18.1"/><path fill="#FF473E" d="M197.7 426.4c18.8 10 40.2 15.4 62.7 15.4s43.9-5.5 62.7-15.4c-16.8-13.7-38.6-13.2-62.7-13.2c-24-.1-45.8-.5-62.7 13.2"/>`}<!-- HTML_TAG_END --></svg>`;
});
const css = {
  code: ":root{--splus-base:#fef3c7;--splus-accent1:#fcd34d;--splus-accent2:#fbbf24;--splusplus-base:#fdba74;--splusplus-accent1:#f97316;--splusplus-accent2:#ea580c;--f-base:#b45309;--f-accent1:#9a3412;--f-accent2:#7c2d12}#srating.svelte-ubn0pc{animation:svelte-ubn0pc-srating 1s ease-in-out infinite alternate;color:var(--splus-base)}@keyframes svelte-ubn0pc-srating{from{text-shadow:0 0 2px var(--splus-base),\n				0 0 4px var(--splus-base),\n				0 0 6px var(--splus-accent1),\n				0 0 8px var(--splus-accent1),\n				0 0 10px var(--splus-accent1),\n				0 0 12px var(--splus-accent1),\n				0 0 14px var(--splus-accent1)}to{text-shadow:0 0 4px var(--splus-base),\n				0 0 8px var(--splus-accent2),\n				0 0 12px var(--splus-accent2),\n				0 0 12px var(--splus-accent2),\n				0 0 15px var(--splus-accent2),\n				0 0 18px var(--splus-accent2),\n				0 0 21px var(--splus-accent2)}}#frating.svelte-ubn0pc{color:var(--f-base);animation:svelte-ubn0pc-frating 1s ease-in-out infinite alternate}@keyframes svelte-ubn0pc-frating{from{filter:drop-shadow(0 0 8px var(--f-accent1))}to{filter:drop-shadow(0 0 4px var(--f-accent2))}}#splusplusrating.svelte-ubn0pc{color:var(--splusplus-base);animation:svelte-ubn0pc-ssrating 1s ease-in-out infinite alternate}@keyframes svelte-ubn0pc-ssrating{from{text-shadow:0 0 2px var(--splusplus-base),\n				0 0 4px var(--splusplus-base),\n				0 0 6px var(--splusplus-accent1),\n				0 0 8px var(--splusplus-accent1),\n				0 0 10px var(--splusplus-accent1),\n				0 0 12px var(--splusplus-accent1),\n				0 0 14px var(--splusplus-accent1)}to{text-shadow:0 0 4px var(--splusplus-base),\n				0 0 8px var(--splusplus-accent2),\n				0 0 12px var(--splusplus-accent2),\n				0 0 16px var(--splusplus-accent2),\n				0 0 20px var(--splusplus-accent2),\n				0 0 24px var(--splusplus-accent2),\n				0 0 28px var(--splusplus-accent2)}}@keyframes svelte-ubn0pc-shine{0%{background-position:left}50%{background-position:right}100%{background-position:left}}",
  map: null
};
const PlayerData = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { player } = $$props;
  if ($$props.player === void 0 && $$bindings.player && player !== void 0)
    $$bindings.player(player);
  $$result.css.add(css);
  return `<div><div class="my-1 flex items-center gap-4"><div class="flex gap-2 items-center"><img${add_attribute("src", player.hero.img, 0)}${add_attribute("alt", player.hero.name, 0)} class="h-10"> <div class="text-xl min-w-28 text-left"><button class="hover:text-neutral-400 duration-300">${escape(player.username)}</button> <span class="italic text-indigo-400">${escape(player.smurf ? "S" : "")}</span></div></div> <div class="w-12 items-center text-center cursor-default">${player.impact > 200 ? `<div id="splusplusrating" class="text-xl font-display svelte-ubn0pc">${escape(calcImpact(player.impact))}</div>` : `${player.impact >= 140 ? `<div id="srating" class="text-xl font-display svelte-ubn0pc">${escape(calcImpact(player.impact))}</div>` : `${player.impact < 140 && player.impact > 25 ? `<div class="text-xl font-display">${escape(calcImpact(player.impact))}</div>` : `${player.impact <= 25 ? `<div id="frating" class="text-xl font-display flex justify-center svelte-ubn0pc">${validate_component(Poo, "FxemojiPoo").$$render($$result, {}, {}, {})}</div>` : ``}`}`}`}</div> <div class="flex w-8 items-center justify-center"><img${add_attribute("src", getRoleIcon(player.role), 0)}${add_attribute("alt", `${player.role} role`, 0)} class="h-7"></div> <div class="flex gap-1 w-24 items-center justify-center"><div class="text-green-300">${escape(player.kills)}</div> <div data-svelte-h="svelte-gdogij">/</div> <div class="text-red-400">${escape(player.deaths)}</div> <div data-svelte-h="svelte-gdogij">/</div> <div class="text-cyan-300">${escape(player.assists)}</div></div> <button class="flex">${`<img${add_attribute("src", player.item0.img, 0)}${add_attribute("alt", player.item0.name, 0)} class="w-[44px] h-8"> <img${add_attribute("src", player.item1.img, 0)}${add_attribute("alt", player.item1.name, 0)} class="w-[44px] h-8"> <img${add_attribute("src", player.item2.img, 0)}${add_attribute("alt", player.item2.name, 0)} class="w-[44px] h-8"> <img${add_attribute("src", player.item3.img, 0)}${add_attribute("alt", player.item3.name, 0)} class="w-[44px] h-8"> <img${add_attribute("src", player.item4.img, 0)}${add_attribute("alt", player.item4.name, 0)} class="w-[44px] h-8"> <img${add_attribute("src", player.item5.img, 0)}${add_attribute("alt", player.item5.name, 0)} class="w-[44px] h-8"> <div class="px-2"><img${add_attribute("src", player.itemNeutral.img, 0)}${add_attribute("alt", player.itemNeutral.name, 0)} class="h-8 w-8 rounded-full object-cover"></div>`}</button> <div class="flex flex-col"><img class="object-contain w-6 mr-2"${add_attribute("src", `/scepter_${player.aghanimsScepter}.png`, 0)}${add_attribute("alt", `/scepter_${player.aghanimsScepter}`, 0)}> <img class="object-contain w-6 mr-2"${add_attribute("src", `/shard_${player.aghanimsShard}.png`, 0)}${add_attribute("alt", `/shard_${player.aghanimsShard}`, 0)}></div></div> </div>`;
});
const MatchBlock = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  dayjs.extend(relativeTime);
  let { match } = $$props;
  const { matchData, radiant, dire } = match;
  if ($$props.match === void 0 && $$bindings.match && match !== void 0)
    $$bindings.match(match);
  return `<div class="w-fit"><div id="box" class="bg-neutral-800 bg-opacity-95 border-[1px] border-neutral-200 border-opacity-15 p-1 rounded-xl w-auto"><div class="w-full"><div class="flex flex-row items-center gap-4 my-1 mx-2"><div class="flex items-center grow justify-start"><div class="flex gap-2"><div class="flex items-center gap-2">${matchData.lobby === 7 ? `${validate_component(Exchange, "UilExchange").$$render($$result, {}, {}, {})}` : `${matchData.lobby === 0 ? `${validate_component(Dash_lg, "BiDashLg").$$render($$result, {}, {}, {})}` : `${validate_component(Question, "UilQuestion").$$render($$result, {}, {}, {})}`}`} ${escape(getGameMode(matchData.gameMode))}</div>
						|
						<div>${escape(matchData.duration / 60 | 0)}:${escape(matchData.duration % 60 < 10 ? 0 : "")}${escape(matchData.duration % 60)}</div></div></div> <div class="flex items-center grow gap-4 justify-end"><div>${escape(dayjs(matchData.startTime * 1e3 + matchData.duration * 1e3).from(dayjs()))}</div> <div class="flex gap-1"><a${add_attribute("href", `https://www.dotabuff.com/matches/${matchData.id}`, 0)} target="_blank"><img src="/dotabuff.png" alt="dotabuff" class="h-5"></a> <a${add_attribute("href", `https://www.opendota.com/matches/${matchData.id}`, 0)} target="_blank"><img src="/opendota.png" alt="opendota" class="h-5"></a> <a${add_attribute("href", `https://stratz.com/match/${matchData.id}`, 0)} target="_blank"><img src="/stratz.png" alt="stratz" class="h-5"></a></div></div></div></div> ${radiant.length > 0 ? `${matchData.winner == "radiant" ? `<div class="border-[2px] border-solid border-green-700 rounded-lg p-1 bg-green-700 bg-opacity-5 hover:bg-opacity-15 transition-all">${each(radiant, (player) => {
    return `${validate_component(PlayerData, "PlayerData").$$render($$result, { player }, {}, {})}`;
  })}</div>` : `<div class="border-[2px] border-solid border-red-700 rounded-lg p-1 bg-red-700 bg-opacity-5 hover:bg-opacity-15 transition-all">${each(radiant, (player) => {
    return `${validate_component(PlayerData, "PlayerData").$$render($$result, { player }, {}, {})}`;
  })}</div>`}` : ``} ${dire.length > 0 ? `${matchData.winner == "dire" ? `<div class="border-[2px] border-solid border-green-700 rounded-lg p-1 bg-green-700 bg-opacity-5 hover:bg-opacity-15 transition-all">${each(dire, (player) => {
    return `${validate_component(PlayerData, "PlayerData").$$render($$result, { player }, {}, {})}`;
  })}</div>` : `<div class="border-[2px] border-solid border-red-700 rounded-lg p-1 bg-red-700 bg-opacity-5 hover:bg-opacity-15 transition-all">${each(dire, (player) => {
    return `${validate_component(PlayerData, "PlayerData").$$render($$result, { player }, {}, {})}`;
  })}</div>`}` : ``}</div></div>`;
});
export {
  Dash_lg as D,
  Exchange as E,
  MatchBlock as M,
  calcImpact as c,
  getStatColour as g
};
