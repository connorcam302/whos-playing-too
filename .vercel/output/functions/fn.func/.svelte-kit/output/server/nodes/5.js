

export const index = 5;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/records/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/5.wEApKPW1.js","_app/immutable/chunks/scheduler.xVbf0__5.js","_app/immutable/chunks/index.YL0iXnvq.js"];
export const stylesheets = [];
export const fonts = [];
