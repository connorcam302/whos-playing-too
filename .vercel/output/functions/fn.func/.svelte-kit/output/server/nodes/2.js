import * as server from '../entries/pages/_page.server.ts.js';

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/+page.server.ts";
export const imports = ["_app/immutable/nodes/2.PMx6JCKB.js","_app/immutable/chunks/scheduler.xVbf0__5.js","_app/immutable/chunks/index.YL0iXnvq.js","_app/immutable/chunks/arrow-forward-ios-rounded.g7BKN9E7.js","_app/immutable/chunks/Loading.DE4tMN2d.js","_app/immutable/chunks/singletons.EzEmGe6U.js","_app/immutable/chunks/HeroStatbox.svelte_svelte_type_style_lang.o16LXco2.js","_app/immutable/chunks/dayjs.min.8MX-qMPj.js"];
export const stylesheets = ["_app/immutable/assets/2.K2AQi-Dz.css","_app/immutable/assets/PlayerStatbox.DnCEUwNT.css","_app/immutable/assets/Loading.Yc8PtHj6.css","_app/immutable/assets/HeroStatbox.PQ58QTj1.css"];
export const fonts = [];
