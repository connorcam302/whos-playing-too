import { c as create_ssr_component, d as spread, f as escape_object, s as subscribe, a as add_attribute, b as each, v as validate_component, e as escape } from "../../../chunks/ssr.js";
import { p as page } from "../../../chunks/stores.js";
import { M as MatchBlock } from "../../../chunks/HeroStatbox.svelte_svelte_type_style_lang.js";
/* empty css                                                          */
import { L as Loading } from "../../../chunks/Loading.js";
import { A as Arrow_back_rounded, a as Arrow_forward_rounded } from "../../../chunks/arrow-forward-rounded.js";
const Outline_check = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<svg${spread(
    [
      { viewBox: "0 0 24 24" },
      { width: "1.2em" },
      { height: "1.2em" },
      escape_object($$props)
    ],
    {}
  )}><!-- HTML_TAG_START -->${`<path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19L21 7l-1.41-1.41z"/>`}<!-- HTML_TAG_END --></svg>`;
});
const Menu_burger_horizontal_duotone = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<svg${spread(
    [
      { viewBox: "0 0 24 24" },
      { width: "1.2em" },
      { height: "1.2em" },
      escape_object($$props)
    ],
    {}
  )}><!-- HTML_TAG_START -->${`<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6.001h18m-18 6h18m-18 6h18"/>`}<!-- HTML_TAG_END --></svg>`;
});
const css = {
  code: "#scrollbox.svelte-1ci3puo::-webkit-scrollbar{width:4px;background-color:#404040}#scrollbox.svelte-1ci3puo::-webkit-scrollbar-thumb{background-color:#e7e5e4;border-radius:64px}",
  map: null
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let pageNumber;
  let $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => value);
  let { data } = $$props;
  const { playerList, heroList } = data;
  let matchBlocks = [];
  let gameModeCheckboxes = ["ranked-all-pick", "unranked-all-pick", "other"];
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  $$result.css.add(css);
  pageNumber = 1;
  $$unsubscribe_page();
  return `<div class="flex flex-col gap-4"><div class="flex flex-wrap gap-4"><div class="flex flex-col gap-4 bg-neutral-800 border-[1px] border-neutral-200 border-opacity-15 h-fit py-2 px-4 rounded-xl w-64"><div class=""><div class="text-md" data-svelte-h="svelte-f5lhbm">Search Hero</div> <select name="players" class="bg-neutral-700 w-full py-1 rounded-lg text-sm"><option selected${add_attribute("value", 0, 0)} data-svelte-h="svelte-1uoybyy">All Players</option>${each(playerList, (player) => {
    return `<option${add_attribute("value", player.id, 0)}>${escape(player.username)}</option>`;
  })}</select></div> <div class=""><div class="text-md" data-svelte-h="svelte-16o6r5q">Search Heroes</div> <select name="heroes" class="bg-neutral-700 w-full py-1 rounded-lg text-sm"><option selected${add_attribute("value", 0, 0)} data-svelte-h="svelte-sep6qq">All Heroes</option>${each(heroList, (hero) => {
    return `<option${add_attribute("value", hero.id, 0)}>${escape(hero.name)}</option>`;
  })}</select></div> <div><div class="text-md" data-svelte-h="svelte-zz5977">Game Mode</div> <div class="text-sm"><div><input type="checkbox"${add_attribute("value", "ranked-all-pick", 0)} id="ranked-all-pick" class="cursor-pointer accent-white"${~gameModeCheckboxes.indexOf("ranked-all-pick") ? add_attribute("checked", true, 1) : ""}> <label for="ranked-all-pick" class="cursor-pointer" data-svelte-h="svelte-10def7x">Ranked All Pick</label></div> <div><input type="checkbox"${add_attribute("value", "unranked-all-pick", 0)} id="unranked-all-pick" class="cursor-pointer accent-white"${~gameModeCheckboxes.indexOf("unranked-all-pick") ? add_attribute("checked", true, 1) : ""}> <label for="unranked-all-pick" class="cursor-pointer" data-svelte-h="svelte-17t6bsh">Unranked All Pick</label></div> <div><input type="checkbox"${add_attribute("value", "other", 0)} id="other" class="cursor-pointer accent-white"${~gameModeCheckboxes.indexOf("other") ? add_attribute("checked", true, 1) : ""}> <label for="other" class="cursor-pointer" data-svelte-h="svelte-18syf11">Other</label></div></div></div> <button class="flex text-lg items-center justify-center"><div data-svelte-h="svelte-fdxmrf">Advanced Filters</div> <div class="grow"></div> <div>${`${validate_component(Menu_burger_horizontal_duotone, "IconamoonMenuBurgerHorizontalDuotone").$$render($$result, {}, {}, {})}`}</div></button> ${``} <div class="flex justify-center mb-2"><button class="bg-rose-500 rounded-lg w-fit px-4 py-1 hover:bg-rose-700 transition-all duration-300"><div class="flex items-center gap-2">${validate_component(Outline_check, "IcOutlineCheck").$$render($$result, {}, {}, {})} <div data-svelte-h="svelte-hnlgd5">Apply Filters</div></div></button></div></div> <div class="w-[812px] min-h-64">${matchBlocks.length == 0 ? `<div class="flex justify-center items-center h-full"><div class="absolute">${validate_component(Loading, "Loading").$$render($$result, {}, {}, {})}</div></div>` : `<div>${each(matchBlocks.slice(0, 10), (match) => {
    return `<div class="mb-2">${validate_component(MatchBlock, "MatchBlock").$$render($$result, { match }, {}, {})} </div>`;
  })} <div class="flex items-center justify-center gap-4"><button class="bg-rose-500 rounded-lg w-fit p-2 hover:bg-rose-700 transition-all duration-300 disabled:bg-neutral-800" ${pageNumber == 1 ? "disabled" : ""}>${validate_component(Arrow_back_rounded, "MaterialSymbolsArrowBackRounded").$$render($$result, {}, {}, {})}</button> <div>${escape(pageNumber)}</div> <button class="bg-rose-500 rounded-lg w-fit p-2 hover:bg-rose-700 transition-all duration-300 disabled:bg-neutral-800" ${matchBlocks.length < 10 ? "disabled" : ""}>${validate_component(Arrow_forward_rounded, "MaterialSymbolsArrowForwardRounded").$$render($$result, {}, {}, {})}</button></div></div>`}</div></div> </div>`;
});
export {
  Page as default
};
