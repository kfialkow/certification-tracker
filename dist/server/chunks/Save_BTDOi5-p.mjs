import { e as createComponent, k as renderComponent, m as maybeRenderHead, r as renderTemplate, h as createAstro } from './astro/server_BdgZYsu1.mjs';
import 'piccolore';
import { a as $$ } from './AppLayout_DMXZT9W5.mjs';

const $$Astro$1 = createAstro();
const $$Plus = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$Plus;
  return renderTemplate`${renderComponent($$result, "Layout", $$, { "iconName": "plus", ...Astro2.props }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<path d="M5 12h14"></path> <path d="M12 5v14"></path> ` })}`;
}, "C:/Users/kfdro/Projects/CERTRACTKER/node_modules/lucide-astro/dist/Plus.astro", void 0);

const $$Astro = createAstro();
const $$Save = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Save;
  return renderTemplate`${renderComponent($$result, "Layout", $$, { "iconName": "save", ...Astro2.props }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"></path> <path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"></path> <path d="M7 3v4a1 1 0 0 0 1 1h7"></path> ` })}`;
}, "C:/Users/kfdro/Projects/CERTRACTKER/node_modules/lucide-astro/dist/Save.astro", void 0);

export { $$Save as $, $$Plus as a };
