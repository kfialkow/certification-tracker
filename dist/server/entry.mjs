import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_SSB4GsRc.mjs';
import { manifest } from './manifest_ko37zSZ8.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/admin.astro.mjs');
const _page2 = () => import('./pages/api/auth/login.astro.mjs');
const _page3 = () => import('./pages/api/auth/logout.astro.mjs');
const _page4 = () => import('./pages/api/auth/register.astro.mjs');
const _page5 = () => import('./pages/api/certification-types/_id_.astro.mjs');
const _page6 = () => import('./pages/api/certification-types.astro.mjs');
const _page7 = () => import('./pages/api/certifications/_id_.astro.mjs');
const _page8 = () => import('./pages/api/certifications.astro.mjs');
const _page9 = () => import('./pages/api/cron/monitor.astro.mjs');
const _page10 = () => import('./pages/dashboard.astro.mjs');
const _page11 = () => import('./pages/login.astro.mjs');
const _page12 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/node.js", _page0],
    ["src/pages/admin.astro", _page1],
    ["src/pages/api/auth/login.ts", _page2],
    ["src/pages/api/auth/logout.ts", _page3],
    ["src/pages/api/auth/register.ts", _page4],
    ["src/pages/api/certification-types/[id].ts", _page5],
    ["src/pages/api/certification-types/index.ts", _page6],
    ["src/pages/api/certifications/[id].ts", _page7],
    ["src/pages/api/certifications/index.ts", _page8],
    ["src/pages/api/cron/monitor.ts", _page9],
    ["src/pages/dashboard.astro", _page10],
    ["src/pages/login.astro", _page11],
    ["src/pages/index.astro", _page12]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_astro-internal_middleware.mjs')
});
const _args = {
    "mode": "standalone",
    "client": "file:///C:/Users/kfdro/Projects/CERTRACTKER/dist/client/",
    "server": "file:///C:/Users/kfdro/Projects/CERTRACTKER/dist/server/",
    "host": "127.0.0.1",
    "port": 4321,
    "assets": "_astro",
    "experimentalStaticHeaders": false
};
const _exports = createExports(_manifest, _args);
const handler = _exports['handler'];
const startServer = _exports['startServer'];
const options = _exports['options'];
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) {
	serverEntrypointModule[_start](_manifest, _args);
}

export { handler, options, pageMap, startServer };
