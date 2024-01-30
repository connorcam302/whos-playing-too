import * as server from '../entries/pages/player/_id_/_page.server.ts.js';

export const index = 4;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/player/_id_/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/player/[id]/+page.server.ts";
export const imports = ["_app/immutable/nodes/4.ttOVD0-q.js","_app/immutable/chunks/scheduler.xVbf0__5.js","_app/immutable/chunks/index.YL0iXnvq.js","_app/immutable/chunks/arrow-forward-ios-rounded.g7BKN9E7.js","_app/immutable/chunks/Loading.DE4tMN2d.js","_app/immutable/chunks/singletons.EzEmGe6U.js","_app/immutable/chunks/HeroStatbox.svelte_svelte_type_style_lang.o16LXco2.js","_app/immutable/chunks/dayjs.min.8MX-qMPj.js","_app/immutable/chunks/arrow-forward-rounded.5nUzalkX.js","_app/immutable/chunks/WinChart.eiiXoc26.js","_app/immutable/chunks/stores.SeQSodgb.js"];
export const stylesheets = ["_app/immutable/assets/Loading.Yc8PtHj6.css","_app/immutable/assets/HeroStatbox.PQ58QTj1.css"];
export const fonts = [];
