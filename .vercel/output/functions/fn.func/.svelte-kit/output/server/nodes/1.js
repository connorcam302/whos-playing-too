

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1._Ow80i6b.js","_app/immutable/chunks/scheduler.xVbf0__5.js","_app/immutable/chunks/index.YL0iXnvq.js","_app/immutable/chunks/stores.SeQSodgb.js","_app/immutable/chunks/singletons.EzEmGe6U.js"];
export const stylesheets = [];
export const fonts = [];
