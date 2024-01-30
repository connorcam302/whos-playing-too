import { c as create_ssr_component, s as subscribe, b as each, a as add_attribute, e as escape, v as validate_component } from "../../chunks/ssr.js";
import { p as page, n as navigating } from "../../chunks/stores.js";
import { L as Loading } from "../../chunks/Loading.js";
const Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $page, $$unsubscribe_page;
  let $navigating, $$unsubscribe_navigating;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  $$unsubscribe_navigating = subscribe(navigating, (value) => $navigating = value);
  let { data } = $$props;
  const { playerList } = data;
  const links = [
    { link: "/matches", title: "Matches" },
    { link: "/records", title: "Records" },
    { link: "/stats", title: "Stats" },
    {
      link: "/leaderboard",
      title: "Leaderboard"
    },
    { link: "/about", title: "About" }
  ];
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  $$unsubscribe_page();
  $$unsubscribe_navigating();
  return `<div class="text-neutral-100 p-4 min-h-screen"><div class="max-w-screen-2xl mx-auto mb-8"><div><div class="w-full flex items-center justify-center gap-8"><a href="/" class="flex items-center justify-center text-lg rounded-full text-center font-display gap-1w-48" data-svelte-h="svelte-1g0kzi8"><div>whos-playing</div></a> <div class="flex items-center justify-center h-full"><div class="w-fit my-2 bg-neutral-800 flex justify-center items-center rounded-full h-full"><div class="flex gap-4 justify-center items-center">${each(links, (link) => {
    return `${link.link == $page.url.pathname ? `<a${add_attribute("href", link.link, 0)} class="bg-rose-500 py-1.5 px-2 rounded-full w-32 text-center">${escape(link.title)}</a>` : `<a${add_attribute("href", link.link, 0)} class="py-1.5 px-2 rounded-full w-32 text-center">${escape(link.title)}</a>`}`;
  })}</div></div></div> <div><select name="players" class="bg-neutral-800 w-48 py-[7px] accent-rose-500 rounded-xl border-x-8 border-transparent"><option${add_attribute("value", 0, 0)} selected disabled data-svelte-h="svelte-12yunwh">Search Players</option>${each(playerList, (player) => {
    return `<option${add_attribute("value", player.id, 0)}>${escape(player.username)}</option>`;
  })}</select></div></div></div></div> <div>${$navigating ? `<div class="flex items-center justify-center w-full h-64">${validate_component(Loading, "Loading").$$render($$result, {}, {}, {})}</div>` : `<div class="flex justify-center items-center mx-auto">${slots.default ? slots.default({}) : ``}</div>`}</div> </div>`;
});
export {
  Layout as default
};
