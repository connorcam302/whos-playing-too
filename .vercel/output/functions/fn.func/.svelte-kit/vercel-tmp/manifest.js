export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["dotabuff.png","dotabuff.png:Zone.Identifier","down-arrows.png","favicon.ico","favicon.ico:Zone.Identifier","favicon.png","hero-backdrop.png","hero-backdrop.png:Zone.Identifier","logo.png","logo.png:Zone.Identifier","mesh-gradient.svg","mesh-gradient.svg:Zone.Identifier","opendota.png","opendota.png:Zone.Identifier","roles/pos1.png","roles/pos1.png:Zone.Identifier","roles/pos1.svg","roles/pos1.svg:Zone.Identifier","roles/pos2.png","roles/pos2.png:Zone.Identifier","roles/pos2.svg","roles/pos2.svg:Zone.Identifier","roles/pos3.png","roles/pos3.png:Zone.Identifier","roles/pos3.svg","roles/pos3.svg:Zone.Identifier","roles/pos4.png","roles/pos4.png:Zone.Identifier","roles/pos4.svg","roles/pos4.svg:Zone.Identifier","roles/pos5.png","roles/pos5.png:Zone.Identifier","roles/pos5.svg","roles/pos5.svg:Zone.Identifier","scepter_0.png","scepter_1.png","shard_0.png","shard_1.png","steam-icon-512x512-ikdnzrl9.png","steam.png","steam.png:Zone.Identifier","stratz.png","stratz.png:Zone.Identifier","up-arrows.png"]),
	mimeTypes: {".png":"image/png",".svg":"image/svg+xml"},
	_: {
		client: {"start":"_app/immutable/entry/start.xFSp87kW.js","app":"_app/immutable/entry/app.5qZAH57q.js","imports":["_app/immutable/entry/start.xFSp87kW.js","_app/immutable/chunks/scheduler.xVbf0__5.js","_app/immutable/chunks/singletons.EzEmGe6U.js","_app/immutable/entry/app.5qZAH57q.js","_app/immutable/chunks/scheduler.xVbf0__5.js","_app/immutable/chunks/index.YL0iXnvq.js"],"stylesheets":[],"fonts":[],"uses_env_dynamic_public":false},
		nodes: [
			__memo(() => import('../output/server/nodes/0.js')),
			__memo(() => import('../output/server/nodes/1.js')),
			__memo(() => import('../output/server/nodes/2.js')),
			__memo(() => import('../output/server/nodes/3.js')),
			__memo(() => import('../output/server/nodes/4.js')),
			__memo(() => import('../output/server/nodes/5.js')),
			__memo(() => import('../output/server/nodes/6.js'))
		],
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/api/matches/all",
				pattern: /^\/api\/matches\/all\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/matches/all/_server.ts.js'))
			},
			{
				id: "/api/matches/[id]",
				pattern: /^\/api\/matches\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/matches/_id_/_server.ts.js'))
			},
			{
				id: "/matches",
				pattern: /^\/matches\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/player/[id]",
				pattern: /^\/player\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/records",
				pattern: /^\/records\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 5 },
				endpoint: null
			},
			{
				id: "/stats",
				pattern: /^\/stats\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 6 },
				endpoint: null
			}
		],
		matchers: async () => {
			
			return {  };
		}
	}
}
})();
