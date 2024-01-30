import * as server from '../entries/pages/matches/_page.server.ts.js';

export const index = 3;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/matches/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/matches/+page.server.ts";
export const imports = ["_app/immutable/nodes/3.Hnh13wk3.js","_app/immutable/chunks/scheduler.xVbf0__5.js","_app/immutable/chunks/index.YL0iXnvq.js","_app/immutable/chunks/Loading.DE4tMN2d.js","_app/immutable/chunks/singletons.EzEmGe6U.js","_app/immutable/chunks/stores.SeQSodgb.js","_app/immutable/chunks/HeroStatbox.svelte_svelte_type_style_lang.o16LXco2.js","_app/immutable/chunks/dayjs.min.8MX-qMPj.js","_app/immutable/chunks/arrow-forward-rounded.5nUzalkX.js"];
export const stylesheets = ["_app/immutable/assets/3.wlMqd7bX.css","_app/immutable/assets/PlayerStatbox.DnCEUwNT.css","_app/immutable/assets/Loading.Yc8PtHj6.css","_app/immutable/assets/HeroStatbox.PQ58QTj1.css"];
export const fonts = [];
