import { c as create_ssr_component, d as spread, f as escape_object, s as subscribe, a as add_attribute, e as escape, v as validate_component, b as each, i as is_promise, n as noop } from "../../../../chunks/ssr.js";
import { E as Exchange, D as Dash_lg, M as MatchBlock } from "../../../../chunks/HeroStatbox.svelte_svelte_type_style_lang.js";
import { A as Arrow_back_rounded, a as Arrow_forward_rounded } from "../../../../chunks/arrow-forward-rounded.js";
import { H as HeroStatbox, A as Arrow_forward_ios_rounded } from "../../../../chunks/arrow-forward-ios-rounded.js";
import { L as Loading } from "../../../../chunks/Loading.js";
import { W as WinChart } from "../../../../chunks/WinChart.js";
import { p as page } from "../../../../chunks/stores.js";
const Calendar_month = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<svg${spread(
    [
      { viewBox: "0 0 24 24" },
      { width: "1.2em" },
      { height: "1.2em" },
      escape_object($$props)
    ],
    {}
  )}><!-- HTML_TAG_START -->${`<path fill="currentColor" d="M12 14q-.425 0-.712-.288T11 13q0-.425.288-.712T12 12q.425 0 .713.288T13 13q0 .425-.288.713T12 14m-4 0q-.425 0-.712-.288T7 13q0-.425.288-.712T8 12q.425 0 .713.288T9 13q0 .425-.288.713T8 14m8 0q-.425 0-.712-.288T15 13q0-.425.288-.712T16 12q.425 0 .713.288T17 13q0 .425-.288.713T16 14m-4 4q-.425 0-.712-.288T11 17q0-.425.288-.712T12 16q.425 0 .713.288T13 17q0 .425-.288.713T12 18m-4 0q-.425 0-.712-.288T7 17q0-.425.288-.712T8 16q.425 0 .713.288T9 17q0 .425-.288.713T8 18m8 0q-.425 0-.712-.288T15 17q0-.425.288-.712T16 16q.425 0 .713.288T17 17q0 .425-.288.713T16 18M5 22q-.825 0-1.412-.587T3 20V6q0-.825.588-1.412T5 4h1V2h2v2h8V2h2v2h1q.825 0 1.413.588T21 6v14q0 .825-.587 1.413T19 22zm0-2h14V10H5z"/>`}<!-- HTML_TAG_END --></svg>`;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let pageNumber;
  let matchBlocks;
  let player;
  let steamData;
  let allSteamData;
  let allTimeStats;
  let weeklyStats;
  let heroStats;
  let winGraph;
  let timings;
  let $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => value);
  let { data } = $$props;
  console.log(data.timings);
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  pageNumber = 1;
  matchBlocks = [];
  ({ player, steamData, allSteamData, allTimeStats, weeklyStats, heroStats, winGraph, timings } = data);
  $$unsubscribe_page();
  return `<div class="flex flex-col gap-4"><div class="flex gap-2"><img${add_attribute("src", steamData.avatarfull, 0)} alt="profilepicture" class="h-40"> <div class="flex flex-col justify-center"><div class="text-4xl">${escape(player.username)}</div> <div class="text-lg opacity-50">${escape(steamData.personaname)}</div></div> <div class="grow"></div> <div class="flex flex-col justify-end"><div class="flex flex-col w-48 px-2 bg-neutral-800 bg-opacity-95 border-[1px] border-neutral-200 border-opacity-15 rounded-xl h-fit py-2"><div class="flex"><div class="flex flex-col"><div class="text-xl h-7 flex items-center">${validate_component(Exchange, "UilExchange").$$render($$result, {}, {}, {})}</div> <div class="text-xl h-7 flex items-center">${validate_component(Dash_lg, "BiDashLg").$$render($$result, {}, {}, {})}</div></div> <div class="grow flex flex-col items-center"><div class="w-full flex gap-1 items-center justify-center"><div class="text-xl text-green-400">${escape(allTimeStats.rankedWins)}</div> <div class="text-xl" data-svelte-h="svelte-18xuuga">-</div> <div class="text-xl text-red-500">${escape(allTimeStats.rankedLosses)}</div></div> <div class="w-full flex gap-1 items-center justify-center"><div class="text-xl text-green-400">${escape(allTimeStats.wins)}</div> <div class="text-xl" data-svelte-h="svelte-18xuuga">-</div> <div class="text-xl text-red-500">${escape(allTimeStats.losses)}</div></div></div></div> <div class="text-sm text-center mt-2" data-svelte-h="svelte-ic9qpc">Last 7 Days</div> <div class="flex w-full"><div class="flex flex-col"><div class="text-xl h-7 flex items-center">${validate_component(Exchange, "UilExchange").$$render($$result, {}, {}, {})}</div> <div class="text-xl h-7 flex items-center">${validate_component(Dash_lg, "BiDashLg").$$render($$result, {}, {}, {})}</div></div> <div class="grow flex flex-col items-center"><div class="w-full flex gap-1 items-center justify-center"><div class="text-xl text-green-400">${escape(weeklyStats.rankedWins)}</div> <div class="text-xl" data-svelte-h="svelte-18xuuga">-</div> <div class="text-xl text-red-500">${escape(weeklyStats.rankedLosses)}</div></div> <div class="w-full flex gap-1 items-center justify-center"><div class="text-xl text-green-400">${escape(weeklyStats.wins)}</div> <div class="text-xl" data-svelte-h="svelte-18xuuga">-</div> <div class="text-xl text-red-500">${escape(weeklyStats.losses)}</div></div></div></div></div> <div class="flex flex-col w-64 px-2 bg-neutral-800 bg-opacity-95 border-[1px] border-neutral-200 border-opacity-15 rounded-xl h-fit py-2 gap-2">${each(allSteamData, (profile) => {
    return `<div class="flex items-center gap-2"><div class="text-xs">${escape(profile.personaname.length > 16 ? profile.personaname.substring(0, 16) + "..." : profile.personaname)}</div> <div class="grow"></div> <a${add_attribute("href", profile.profileurl, 0)} target="_blank" rel="noopener noreferrer"><img${add_attribute("src", "/steam.png", 0)} alt="profilepicture" class="h-5"></a> <a${add_attribute("href", `https://dotabuff.com/players/${(BigInt(profile.steamid) - BigInt("76561197960265728")).toString()}`, 0)} target="_blank" rel="noopener noreferrer"><img${add_attribute("src", "/dotabuff.png", 0)} alt="profilepicture" class="h-5"></a> <a${add_attribute("href", `https://www.opendota.com/players/${(BigInt(profile.steamid) - BigInt("76561197960265728")).toString()}`, 0)} target="_blank" rel="noopener noreferrer"><img${add_attribute("src", "/opendota.png", 0)} alt="profilepicture" class="h-5"></a> <a${add_attribute("href", `https://stratz.com/en-us/player/${(BigInt(profile.steamid) - BigInt("76561197960265728")).toString()}`, 0)} target="_blank" rel="noopener noreferrer"><img${add_attribute("src", "/stratz.png", 0)} alt="profilepicture" class="h-5"></a> </div>`;
  })}</div></div></div> <div class="flex flex-col px-2 bg-neutral-800 bg-opacity-95 border-[1px] border-neutral-200 border-opacity-15 rounded-xl py-2"><div class="flex flex-col">${`<div class="flex w-full px-4 text-xl"><div class="basis-1/3"></div> <div class="basis-1/3 text-center" data-svelte-h="svelte-1ho4co6">Wins by Day</div> <button class="basis-1/3 flex justify-end items-center">${validate_component(Calendar_month, "MaterialSymbolsCalendarMonth").$$render($$result, {}, {}, {})}</button></div> <div>${validate_component(WinChart, "WinChart").$$render(
    $$result,
    {
      data: [
        {
          data: winGraph.resultsArray,
          player: {
            username: player.username,
            id: player.id,
            accounts: [player.accountId]
          }
        }
      ],
      type: "results"
    },
    {},
    {}
  )}</div>`}</div></div> <div>${function(__value) {
    if (is_promise(__value)) {
      __value.then(null, noop);
      return ``;
    }
    return function(heroStats2) {
      return ` ${validate_component(HeroStatbox, "HeroStatbox").$$render($$result, { heroStats: heroStats2 }, {}, {})} `;
    }(__value);
  }(heroStats)}</div> <div class="w-[812px] min-h-64"><div class="flex"><button class="flex items-center gap-2"><div class="text-lg" data-svelte-h="svelte-122dhn">Matches</div> <div>${validate_component(Arrow_forward_ios_rounded, "MaterialSymbolsArrowForwardIosRounded").$$render($$result, {}, {}, {})}</div></button></div> ${matchBlocks.length == 0 ? `<div class="flex justify-center items-center h-full"><div class="absolute">${validate_component(Loading, "Loading").$$render($$result, {}, {}, {})}</div></div>` : `<div>${each(matchBlocks.slice(0, 10), (match) => {
    return `<div class="mb-2">${validate_component(MatchBlock, "MatchBlock").$$render($$result, { match }, {}, {})} </div>`;
  })} <div class="flex items-center justify-center gap-4"><button class="bg-rose-500 rounded-lg w-fit p-2 hover:bg-rose-700 transition-all duration-300 disabled:bg-neutral-800" ${pageNumber == 1 ? "disabled" : ""}>${validate_component(Arrow_back_rounded, "MaterialSymbolsArrowBackRounded").$$render($$result, {}, {}, {})}</button> <div>${escape(pageNumber)}</div> <button class="bg-rose-500 rounded-lg w-fit p-2 hover:bg-rose-700 transition-all duration-300 disabled:bg-neutral-800" ${matchBlocks.length < 10 ? "disabled" : ""}>${validate_component(Arrow_forward_rounded, "MaterialSymbolsArrowForwardRounded").$$render($$result, {}, {}, {})}</button></div></div>`}</div></div>`;
});
export {
  Page as default
};
