import * as server from '../entries/pages/stats/_page.server.ts.js';

export const index = 6;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/stats/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/stats/+page.server.ts";
export const imports = ["_app/immutable/nodes/6.29rq-ovH.js","_app/immutable/chunks/scheduler.xVbf0__5.js","_app/immutable/chunks/index.YL0iXnvq.js","_app/immutable/chunks/WinChart.eiiXoc26.js","_app/immutable/chunks/dayjs.min.8MX-qMPj.js"];
export const stylesheets = [];
export const fonts = [];
