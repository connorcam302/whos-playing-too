import { c as create_ssr_component, e as escape, b as each, a as add_attribute, v as validate_component, d as spread, f as escape_object } from "./ssr.js";
import { c as calcImpact } from "./HeroStatbox.svelte_svelte_type_style_lang.js";
const Bar = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { colour = "", percentage } = $$props;
  const getColour = (value) => {
    if (value > 52) {
      if (value > 56) {
        return "#16a34a";
      }
      return "#84cc16";
    } else if (value < 48) {
      if (value < 44) {
        return "#dc2626";
      }
      return "#f97316";
    } else {
      return "#eab308";
    }
  };
  if (!colour) {
    colour = getColour(percentage);
  }
  if ($$props.colour === void 0 && $$bindings.colour && colour !== void 0)
    $$bindings.colour(colour);
  if ($$props.percentage === void 0 && $$bindings.percentage && percentage !== void 0)
    $$bindings.percentage(percentage);
  return `<div class="w-full flex"><div class="text-xs leading-none h-1" style="${"width: " + escape(percentage, true) + "%; background-color: " + escape(colour, true)}"></div> <div class="text-xs leading-none h-1 bg-neutral-700" style="${"width: " + escape(100 - percentage, true) + "%;"}"></div></div>`;
});
const css = {
  code: "#scrollbox.svelte-1ci3puo::-webkit-scrollbar{width:4px;background-color:#404040}#scrollbox.svelte-1ci3puo::-webkit-scrollbar-thumb{background-color:#e7e5e4;border-radius:64px}",
  map: null
};
const HeroStatbox = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let sortedStats;
  let { heroStats } = $$props;
  const heroStatsOriginal = heroStats;
  let order = { col: "matches", direction: "desc" };
  const sortStats = (order2) => {
    if (order2.col == "hero") {
      if (order2.direction == "desc") {
        return heroStats.slice().sort((a, b) => {
          if (a.hero.name < b.hero.name) {
            return -1;
          }
          if (a.hero.name > b.hero.name) {
            return 1;
          }
          return 0;
        });
      } else {
        return heroStats.slice().sort((a, b) => {
          if (a.hero.name > b.hero.name) {
            return -1;
          }
          if (a.hero.name < b.hero.name) {
            return 1;
          }
          return 0;
        });
      }
    } else if (order2.col == "matches") {
      if (order2.direction == "desc") {
        return heroStats.slice().sort((a, b) => {
          if (a.matches > b.matches) {
            return -1;
          }
          if (a.matches < b.matches) {
            return 1;
          }
          return 0;
        });
      } else {
        return heroStats.slice().sort((a, b) => {
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
        return heroStats.slice().sort((a, b) => {
          if ((a.radiantWins + a.direWins) / a.matches > (b.radiantWins + b.direWins) / b.matches) {
            return -1;
          }
          if ((a.radiantWins + a.direWins) / a.matches < (b.radiantWins + b.direWins) / b.matches) {
            return 1;
          }
          return 0;
        });
      } else {
        return heroStats.slice().sort((a, b) => {
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
        return heroStats.slice().sort((a, b) => {
          if (a.avgImpact > b.avgImpact) {
            return -1;
          }
          if (a.avgImpact < b.avgImpact) {
            return 1;
          }
          return 0;
        });
      } else {
        return heroStats.slice().sort((a, b) => {
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
      return heroStats;
    }
  };
  order = { col: "matches", direction: "desc" };
  if ($$props.heroStats === void 0 && $$bindings.heroStats && heroStats !== void 0)
    $$bindings.heroStats(heroStats);
  $$result.css.add(css);
  sortedStats = sortStats(order);
  return `<div class="bg-neutral-800 bg-opacity-95 border-[1px] border-neutral-200 border-opacity-15 py-2 px-4 rounded-xl"><div class="flex gap-2 my-1 pr-2 pb-1 border-white border-b-[1px] border-opacity-30"><div class="flex w-16 justify-center items-center"><button data-svelte-h="svelte-17dunpn">HERO</button> <div class="grow"></div> <div class="w-6">${`${``}`}</div></div> <div class="flex grow gap-2"><div class="flex basis-1/3 justify-center items-center"><button data-svelte-h="svelte-mx1esd">MATCHES</button> <div class="grow"></div> <div class="w-6">${`${``}`}</div></div> <div class="flex basis-1/3 justify-center items-center"><button data-svelte-h="svelte-1h7lutn">WINRATE</button> <div class="grow"></div> <div class="w-6">${`${``}`}</div></div> <div class="flex basis-1/3 justify-center items-center"><button data-svelte-h="svelte-lse4kr">IMPACT</button> <div class="grow"></div> <div class="w-6">${`${``}`}</div></div></div></div> <div id="scrollbox" class="overflow-y-auto max-h-96 svelte-1ci3puo">${each(sortedStats, (hero) => {
    return `<div class="flex gap-2 py-1 pr-2 hover:bg-neutral-700 hover:bg-opacity-20 transition-all"><div class="w-16"><img${add_attribute("src", hero.hero.img, 0)}${add_attribute("alt", `${hero.hero.id}-${hero.hero.name}`, 0)} class="w-14"></div> <div class="flex grow gap-4 items-center"><div class="basis-1/3"><div class="text-sm opacity-85 pb-1">${escape(hero.matches)}</div> ${validate_component(Bar, "Bar").$$render(
      $$result,
      {
        colour: "#f43f5e",
        percentage: hero.matches / heroStatsOriginal[0].matches * 100
      },
      {},
      {}
    )}</div> <div class="basis-1/3"><div class="text-sm opacity-85 pb-1">${escape(Math.round((hero.radiantWins + hero.direWins) / hero.matches * 1e3) / 10)}%</div> ${validate_component(Bar, "Bar").$$render(
      $$result,
      {
        percentage: (hero.radiantWins + hero.direWins) / hero.matches * 100
      },
      {},
      {}
    )}</div> <div class="basis-1/3"><div class="text-sm opacity-85 pb-1">${escape(calcImpact(hero.avgImpact))}</div> ${validate_component(Bar, "Bar").$$render(
      $$result,
      {
        percentage: hero.avgImpact / 140 * 100,
        colour: "#9333ea"
      },
      {},
      {}
    )}</div> </div> </div>`;
  })}</div> </div>`;
});
const Arrow_forward_ios_rounded = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<svg${spread(
    [
      { viewBox: "0 0 24 24" },
      { width: "1.2em" },
      { height: "1.2em" },
      escape_object($$props)
    ],
    {}
  )}><!-- HTML_TAG_START -->${`<path fill="currentColor" d="m14.475 12l-7.35-7.35q-.375-.375-.363-.888t.388-.887q.375-.375.888-.375t.887.375l7.675 7.7q.3.3.45.675t.15.75q0 .375-.15.75t-.45.675l-7.7 7.7q-.375.375-.875.363T7.15 21.1q-.375-.375-.375-.888t.375-.887z"/>`}<!-- HTML_TAG_END --></svg>`;
});
export {
  Arrow_forward_ios_rounded as A,
  Bar as B,
  HeroStatbox as H
};
