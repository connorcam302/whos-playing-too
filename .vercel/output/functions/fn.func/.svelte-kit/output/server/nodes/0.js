import * as universal from '../entries/pages/_layout.ts.js';
import * as server from '../entries/pages/_layout.server.ts.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/+layout.ts";
export { server };
export const server_id = "src/routes/+layout.server.ts";
export const imports = ["_app/immutable/nodes/0.1mbFwmu-.js","_app/immutable/chunks/scheduler.xVbf0__5.js","_app/immutable/chunks/index.YL0iXnvq.js","_app/immutable/chunks/Loading.DE4tMN2d.js","_app/immutable/chunks/singletons.EzEmGe6U.js","_app/immutable/chunks/stores.SeQSodgb.js"];
export const stylesheets = ["_app/immutable/assets/0.90sbs0c0.css","_app/immutable/assets/Loading.Yc8PtHj6.css"];
export const fonts = [];
