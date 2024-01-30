import { c as create_ssr_component, b as each, e as escape, v as validate_component, j as null_to_empty, a as add_attribute, i as is_promise, n as noop } from "../../chunks/ssr.js";
import { c as calcImpact, g as getStatColour, M as MatchBlock } from "../../chunks/HeroStatbox.svelte_svelte_type_style_lang.js";
import { B as Bar, A as Arrow_forward_ios_rounded, H as HeroStatbox } from "../../chunks/arrow-forward-ios-rounded.js";
/* empty css                                                       */
import { L as Loading } from "../../chunks/Loading.js";
const css$1 = {
  code: "#scrollbox.svelte-10y4l7f::-webkit-scrollbar{width:4px;background-color:#404040;margin-left:4px}#scrollbox.svelte-10y4l7f::-webkit-scrollbar-thumb{background-color:#e7e5e4;border-radius:64px}",
  map: null
};
const PlayerStatbox = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let sortedStats;
  let { playerStats } = $$props;
  let order = { col: "matches", direction: "desc" };
  const sortStats = (order2) => {
    if (order2.col == "player") {
      if (order2.direction == "desc") {
        return playerStats.slice().sort((a, b) => {
          if (a.username < b.username) {
            return -1;
          }
          if (a.username > b.username) {
            return 1;
          }
          return 0;
        });
      } else {
        return playerStats.slice().sort((a, b) => {
          if (a.username > b.username) {
            return -1;
          }
          if (a.username < b.username) {
            return 1;
          }
          return 0;
        });
      }
    } else if (order2.col == "matches") {
      if (order2.direction == "desc") {
        return playerStats.slice().sort((a, b) => {
          if (a.matches > b.matches) {
            return -1;
          }
          if (a.matches < b.matches) {
            return 1;
          }
          return 0;
        });
      } else {
        return playerStats.slice().sort((a, b) => {
          if (a.matches < b.matches) {
            return -1;
          }
          if (a.matches > b.matches) {
            return 1;
          }
          return 0;
        });
      }
    } else if (order2.col == "winrate") {
      if (order2.direction == "desc") {
        return playerStats.slice().sort((a, b) => {
          if ((a.radiantWins + a.direWins) / a.matches > (b.radiantWins + b.direWins) / b.matches) {
            return -1;
          }
          if ((a.radiantWins + a.direWins) / a.matches < (b.radiantWins + b.direWins) / b.matches) {
            return 1;
          }
          return 0;
        });
      } else {
        return playerStats.slice().sort((a, b) => {
          if ((a.radiantWins + a.direWins) / a.matches < (b.radiantWins + b.direWins) / b.matches) {
            return -1;
          }
          if ((a.radiantWins + a.direWins) / a.matches > (b.radiantWins + b.direWins) / b.matches) {
            return 1;
          }
          return 0;
        });
      }
    } else if (order2.col == "impact") {
      if (order2.direction == "desc") {
        return playerStats.slice().sort((a, b) => {
          if (a.avgImpact > b.avgImpact) {
            return -1;
          }
          if (a.avgImpact < b.avgImpact) {
            return 1;
          }
          return 0;
        });
      } else {
        return playerStats.slice().sort((a, b) => {
          if (a.avgImpact < b.avgImpact) {
            return -1;
          }
          if (a.avgImpact > b.avgImpact) {
            return 1;
          }
          return 0;
        });
      }
    } else {
      return playerStats;
    }
  };
  order = { col: "matches", direction: "desc" };
  if ($$props.playerStats === void 0 && $$bindings.playerStats && playerStats !== void 0)
    $$bindings.playerStats(playerStats);
  $$result.css.add(css$1);
  sortedStats = sortStats(order);
  return `<div id="box" class="bg-neutral-800 bg-opacity-95 py-2 border-[1px] border-neutral-200 border-opacity-15 px-4 rounded-xl"><div class="flex gap-2 my-1 pr-2 pb-1 border-white border-b-[1px] border-opacity-30"><div class="flex w-20 justify-center items-center"><button data-svelte-h="svelte-5qj20z">PLAYER</button> <div class="grow"></div> <div class="w-6">${`${``}`}</div></div> <div class="flex grow gap-2"><div class="flex basis-1/3 justify-center items-center"><button data-svelte-h="svelte-mx1esd">MATCHES</button> <div class="grow"></div> <div class="w-6">${`${``}`}</div></div> <div class="flex basis-1/3 justify-center items-center"><button data-svelte-h="svelte-1h7lutn">WINRATE</button> <div class="grow"></div> <div class="w-6">${`${``}`}</div></div> <div class="flex basis-1/3 justify-center items-center"><button data-svelte-h="svelte-lse4kr">IMPACT</button> <div class="grow"></div> <div class="w-6">${`${``}`}</div></div></div></div> <div id="scrollbox" class="overflow-y-auto h-96 svelte-10y4l7f">${each(sortedStats, (player) => {
    return `<div class="flex gap-2 py-1 pr-2 hover:bg-neutral-700 hover:bg-opacity-20 transition-all"><div class="w-20">${escape(player.username)}</div> <div class="flex grow gap-4 items-center"><div class="basis-1/3"><div class="text-sm opacity-85 pb-1">${escape(player.matches)}</div> ${validate_component(Bar, "Bar").$$render(
      $$result,
      {
        colour: "#f43f5e",
        percentage: player.matches / playerStats[0].matches * 100
      },
      {},
      {}
    )}</div> <div class="basis-1/3"><div class="text-sm opacity-85 pb-1">${escape(Math.round((player.radiantWins + player.direWins) / player.matches * 1e3) / 10)}%</div> ${validate_component(Bar, "Bar").$$render(
      $$result,
      {
        percentage: (player.radiantWins + player.direWins) / player.matches * 100
      },
      {},
      {}
    )}</div> <div class="basis-1/3"><div class="text-sm opacity-85 pb-1">${escape(calcImpact(player.avgImpact))}</div> ${validate_component(Bar, "Bar").$$render(
      $$result,
      {
        percentage: player.avgImpact / 140 * 100,
        colour: "#9333ea"
      },
      {},
      {}
    )}</div> </div> </div>`;
  })}</div> </div>`;
});
const css = {
  code: "@keyframes svelte-g9c3y9-downScroll{0%{background-position:0px -24000px}100%{background-position:0px 0px}}#down-arrows.svelte-g9c3y9{background-image:url('/down-arrows.png');animation:svelte-g9c3y9-downScroll 600s linear infinite}@keyframes svelte-g9c3y9-upScroll{0%{background-position:0px 0px}100%{background-position:0px -24000px}}#up-arrows.svelte-g9c3y9{background-image:url('/up-arrows.png');animation:svelte-g9c3y9-upScroll 600s linear infinite}",
  map: null
};
const FeatureBox = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { data = [
    { id: -1, username: "PLAYER 1", kills: 999 },
    { id: -1, username: "PLAYER 1", kills: 999 },
    { id: -1, username: "PLAYER 1", kills: 999 }
  ], title = "RECORD TITLE", type = "kills" } = $$props;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  if ($$props.title === void 0 && $$bindings.title && title !== void 0)
    $$bindings.title(title);
  if ($$props.type === void 0 && $$bindings.type && type !== void 0)
    $$bindings.type(type);
  $$result.css.add(css);
  return `${type == "winLoss" ? `<div class="bg-neutral-800 bg-opacity-100 border-[1px] border-neutral-200 border-opacity-15 rounded-xl w-72"><div class="rounded-xl border-white border-b-[1px] border-opacity-15 max-h-28"><div class="rounded-xl border-white border-b-[1px] border-opacity-15"><div class="${escape(null_to_empty(`bg-cover bg-center rounded-xl max-h-28 max-w-auto`), true) + " svelte-g9c3y9"}"${add_attribute("id", title == "Most MMR Lost" ? `down-arrows` : `up-arrows`, 0)}><div class="flex bg-black bg-opacity-70 py-2 px-4 rounded-xl h-28"><div class="grow flex flex-col"><div class="text-2xl font-bold text-center font-display">${escape(title)}</div> <div class="flex-1 grow"></div> <div class="flex flex-row justify-between text-3xl"><div>${escape(data[0].username)}</div> <div class="font-bold text-4xl"${add_attribute("style", `color: ${getStatColour(title == "Most MMR Gained" ? "wins" : "losses")};`, 0)}>${escape(data[0][type])}</div></div></div></div></div></div></div> <div class="flex flex-row items-center px-4 py-0.5 rounded-xl border-white border-b-[1px] border-opacity-15"><div class="h-7">${escape(data[1].username)}</div> <div class="grow"></div> <div>${escape(data[1][type])}</div></div> <div class="flex flex-row items-center px-4 py-0.5 h-7"><div class="flex h-7 items-center">${escape(data[2].username)}</div> <div class="grow"></div> <div>${escape(data[2][type])}</div></div></div>` : `<div class="bg-neutral-800 bg-opacity-100 border-[1px] border-neutral-200 border-opacity-15 rounded-xl w-72"><div class="rounded-xl border-white border-b-[1px] border-opacity-15"><div${add_attribute("class", `bg-cover bg-center bg-no-repeat rounded-xl min-h-28 `, 0)}${add_attribute("style", `background-image: url('${data[0].hero.img}')`, 0)}><div class="flex bg-black bg-opacity-70 py-2 px-4 rounded-xl min-h-28"><div class="grow flex flex-col"><div class="text-2xl font-bold text-center font-display">${escape(title)}</div> <div class="flex-1 grow"></div> <div class="flex flex-row justify-between text-3xl"><div>${escape(data[0].username)}</div> <div>${escape(data[0][type])}</div></div></div></div></div></div> <div class="flex flex-row items-center px-4 py-0.5 rounded-xl border-white border-b-[1px] border-opacity-15"><div><img${add_attribute("src", data[1].hero.img, 0)} class="h-7 mr-2"></div> <div>${escape(data[1].username)}</div> <div class="grow"></div> <div>${escape(data[1][type])}</div></div> <div class="flex flex-row items-center px-4 py-0.5"><div><img${add_attribute("src", data[2].hero.img, 0)} class="h-7 mr-2"></div> <div>${escape(data[2].username)}</div> <div class="grow"></div> <div>${escape(data[2][type])}</div></div></div>`}`;
});
const Features = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { features } = $$props;
  if ($$props.features === void 0 && $$bindings.features && features !== void 0)
    $$bindings.features(features);
  return `<div><div class="flex flex-wrap items-center justify-center gap-2">${validate_component(FeatureBox, "FeatureBox").$$render(
    $$result,
    {
      data: features.mostKills,
      title: "Most Kills",
      type: "kills"
    },
    {},
    {}
  )} ${validate_component(FeatureBox, "FeatureBox").$$render(
    $$result,
    {
      data: features.mostDeaths,
      title: "Most Deaths",
      type: "deaths"
    },
    {},
    {}
  )} ${validate_component(FeatureBox, "FeatureBox").$$render(
    $$result,
    {
      data: features.mostAssists,
      title: "Most Assists",
      type: "assists"
    },
    {},
    {}
  )} ${validate_component(FeatureBox, "FeatureBox").$$render(
    $$result,
    {
      data: features.mostGPM,
      title: "Most GPM",
      type: "gpm"
    },
    {},
    {}
  )} ${validate_component(FeatureBox, "FeatureBox").$$render(
    $$result,
    {
      data: features.mostXPM,
      title: "Most XPM",
      type: "xpm"
    },
    {},
    {}
  )} ${validate_component(FeatureBox, "FeatureBox").$$render(
    $$result,
    {
      data: features.mostImpact,
      title: "Most Impact",
      type: "impact"
    },
    {},
    {}
  )} ${validate_component(FeatureBox, "FeatureBox").$$render(
    $$result,
    {
      data: features.leastImpact,
      title: "Least Impact",
      type: "impact"
    },
    {},
    {}
  )} ${validate_component(FeatureBox, "FeatureBox").$$render(
    $$result,
    {
      data: features.mostLastHits,
      title: "Most Last Hits",
      type: "lastHits"
    },
    {},
    {}
  )} ${validate_component(FeatureBox, "FeatureBox").$$render(
    $$result,
    {
      data: features.mostHeroDamage,
      title: "Most Hero Damage",
      type: "heroDamage"
    },
    {},
    {}
  )} ${validate_component(FeatureBox, "FeatureBox").$$render(
    $$result,
    {
      data: features.leastHeroDamage,
      title: "Least Hero Damage",
      type: "heroDamage"
    },
    {},
    {}
  )} ${validate_component(FeatureBox, "FeatureBox").$$render(
    $$result,
    {
      data: features.mostGained,
      title: "Most MMR Gained",
      type: "winLoss"
    },
    {},
    {}
  )} ${validate_component(FeatureBox, "FeatureBox").$$render(
    $$result,
    {
      data: features.mostLost,
      title: "Most MMR Lost",
      type: "winLoss"
    },
    {},
    {}
  )}</div></div>`;
});
const FeaturePlayer = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { data } = $$props;
  const { hero, role } = data;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  return `<div class="bg-[url('/hero-backdrop.png')] bg-cover bg-center bg-no-repeat w-full h-full"><div${add_attribute("class", `bg-opacity-10 w-full h-full`, 0)}${add_attribute("style", `background-image: url('/roles/pos${role}.svg')`, 0)}><video autoplay muted loop playsinline class="h-full w-full object-cover opacity-100"><source type="video/webm"${add_attribute("src", `https://cdn.cloudflare.steamstatic.com/apps/dota2/videos/dota_react/heroes/renders/${hero}.webm`, 0)} class="w-full h-full"><img${add_attribute("src", `https://cdn.cloudflare.steamstatic.com/apps/dota2/videos/dota_react/heroes/renders/${hero}.png`, 0)} alt="necrolytbg-[url('/hero-backdrop.png')] e" class="w-full h-full"></video></div></div>`;
});
const TeamOfTheWeek = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { totw } = $$props;
  if ($$props.totw === void 0 && $$bindings.totw && totw !== void 0)
    $$bindings.totw(totw);
  return `<div id="box" class="bg-neutral-800 border-[1px] border-neutral-200 border-opacity-15 bg-opacity-95 rounded-2xl px-2 py-2"><div id="title" class="font-display text-center text-4xl my-4" data-svelte-h="svelte-1vttmgc">TEAM OF THE WEEK</div> <div class="flex gap-2"><div class="border-2 border-indigo-800 bg-indigo-900 bg-opacity-20 hover:bg-opacity-40 transition-all px-1 pt-3 rounded-xl"><div class="w-48 h-48">${validate_component(FeaturePlayer, "FeaturePlayer").$$render($$result, { data: { hero: totw.oneHeroId, role: 1 } }, {}, {})}</div> <div class="flex my-2 h-8 justify-center items-center"><img${add_attribute("src", `/roles/pos1.svg`, 0)} class="h-8" alt="pos1"> <div class="font-display text-2xl">${escape(totw.onePlayerName)}</div></div></div> <div class="border-2 border-sky-700 bg-sky-800 bg-opacity-20 hover:bg-opacity-40 transition-all px-1 pt-3 rounded-xl"><div class="w-48 h-48">${validate_component(FeaturePlayer, "FeaturePlayer").$$render($$result, { data: { hero: totw.twoHeroId, role: 2 } }, {}, {})}</div> <div class="flex my-2 h-8 justify-center items-center"><img${add_attribute("src", `/roles/pos1.svg`, 0)} class="h-8" alt="pos2"> <div class="font-display text-2xl">${escape(totw.twoPlayerName)}</div></div></div> <div class="border-2 border-orange-600 bg-orange-700 bg-opacity-20 hover:bg-opacity-40 transition-all px-1 pt-3 rounded-xl"><div class="w-48 h-48">${validate_component(FeaturePlayer, "FeaturePlayer").$$render(
    $$result,
    {
      data: { hero: totw.threeHeroId, role: 3 }
    },
    {},
    {}
  )}</div> <div class="flex my-2 h-8 justify-center items-center"><img${add_attribute("src", `/roles/pos3.svg`, 0)} class="h-8" alt="pos3"> <div class="font-display text-2xl">${escape(totw.threePlayerName)}</div></div></div> <div class="border-2 border-red-600 bg-red-700 bg-opacity-20 hover:bg-opacity-40 transition-all px-1 pt-3 rounded-xl"><div class="w-48 h-48">${validate_component(FeaturePlayer, "FeaturePlayer").$$render($$result, { data: { hero: totw.fourHeroId, role: 4 } }, {}, {})}</div> <div class="flex my-2 h-8 justify-center items-center"><img${add_attribute("src", `/roles/pos4.svg`, 0)} class="h-8" alt="pos4"> <div class="font-display text-2xl">${escape(totw.fourPlayerName)}</div></div></div> <div class="border-2 border-emerald-600 bg-emerald-700 bg-opacity-20 hover:bg-opacity-40 transition-all px-1 pt-3 rounded-xl"><div class="w-48 h-48">${validate_component(FeaturePlayer, "FeaturePlayer").$$render($$result, { data: { hero: totw.fiveHeroId, role: 5 } }, {}, {})}</div> <div class="flex my-2 h-8 justify-center items-center"><img${add_attribute("src", `/roles/pos5.svg`, 0)} class="h-8" alt="pos5"> <div class="font-display text-2xl">${escape(totw.fivePlayerName)}</div></div></div></div></div>`;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { data } = $$props;
  const { heroStats, playerStats, totw, features, timings } = data;
  console.log(timings);
  let matchBlocks = [];
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  return `<div class="flex flex-col items-center gap-4"><div>${validate_component(TeamOfTheWeek, "TeamOfTheWeek").$$render($$result, { totw }, {}, {})}</div> <div class="flex flex-col gap-2 mt-2 max-w-screen-xl"><div class="flex"><button class="flex items-center gap-2"><div class="text-lg" data-svelte-h="svelte-w5t7kg">Records</div> <div>${validate_component(Arrow_forward_ios_rounded, "MaterialSymbolsArrowForwardIosRounded").$$render($$result, {}, {}, {})}</div></button> <div class="grow"></div> <div data-svelte-h="svelte-1o2ky4e">Last 7 Days</div></div> ${function(__value) {
    if (is_promise(__value)) {
      __value.then(null, noop);
      return ``;
    }
    return function(features2) {
      return ` ${validate_component(Features, "Features").$$render($$result, { features: features2 }, {}, {})} `;
    }(__value);
  }(features)}</div> <div class="flex flex-row gap-4"><div class="flex flex-col gap-2 mt-2"><div class="flex"><button class="flex items-center gap-2"><div class="text-lg" data-svelte-h="svelte-122dhn">Matches</div> <div>${validate_component(Arrow_forward_ios_rounded, "MaterialSymbolsArrowForwardIosRounded").$$render($$result, {}, {}, {})}</div></button></div> <div class="flex flex-wrap gap-4 justify-center"><div class="w-[812px] min-h-64">${matchBlocks.length == 0 ? `<div class="flex justify-center items-center h-full"><div class="absolute">${validate_component(Loading, "Loading").$$render($$result, {}, {}, {})}</div></div>` : `<div>${each(matchBlocks.slice(0, 10), (match) => {
    return `<div class="mb-2">${validate_component(MatchBlock, "MatchBlock").$$render($$result, { match }, {}, {})} </div>`;
  })}</div>`}</div></div></div> <div class="flex flex-col gap-2 w-full mt-2"><div class="flex"><button class="flex items-center gap-2"><div class="text-lg" data-svelte-h="svelte-140e3xt">Stats</div> <div>${validate_component(Arrow_forward_ios_rounded, "MaterialSymbolsArrowForwardIosRounded").$$render($$result, {}, {}, {})}</div></button> <div class="grow"></div> <div data-svelte-h="svelte-17k7n94">Last 14 Days</div></div> <div class="flex flex-col gap-4 items-center justify-center"><div class="w-full">${validate_component(HeroStatbox, "HeroStatbox").$$render($$result, { heroStats }, {}, {})}</div> <div class="w-full">${validate_component(PlayerStatbox, "PlayerStatbox").$$render($$result, { playerStats }, {}, {})}</div></div></div></div></div>`;
});
export {
  Page as default
};
