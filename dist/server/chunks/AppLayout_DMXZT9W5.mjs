import { e as createComponent, m as maybeRenderHead, s as spreadAttributes, g as addAttribute, l as renderSlot, r as renderTemplate, h as createAstro, k as renderComponent, n as renderHead } from './astro/server_BdgZYsu1.mjs';
import 'piccolore';
/* empty css                         */
import 'clsx';

const $$Astro$5 = createAstro();
const $$ = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$5, $$props, $$slots);
  Astro2.self = $$;
  const size = Astro2.props.size;
  const cls = Astro2.props.class;
  const name = Astro2.props.iconName;
  delete Astro2.props.size;
  delete Astro2.props.class;
  delete Astro2.props.iconName;
  const props = Object.assign({
    "xmlns": "http://www.w3.org/2000/svg",
    "stroke-width": 2,
    "width": size ?? 24,
    "height": size ?? 24,
    "stroke": "currentColor",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    "fill": "none",
    "viewBox": "0 0 24 24"
  }, Astro2.props);
  return renderTemplate`${maybeRenderHead()}<svg${spreadAttributes(props)}${addAttribute(["lucide", { [`lucide-${name}`]: name }, cls], "class:list")}> ${renderSlot($$result, $$slots["default"])} </svg>`;
}, "C:/Users/kfdro/Projects/CERTRACTKER/node_modules/lucide-astro/dist/.Layout.astro", void 0);

const $$Astro$4 = createAstro();
const $$BadgeCheck = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$4, $$props, $$slots);
  Astro2.self = $$BadgeCheck;
  return renderTemplate`${renderComponent($$result, "Layout", $$, { "iconName": "badge-check", ...Astro2.props }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"></path> <path d="m9 12 2 2 4-4"></path> ` })}`;
}, "C:/Users/kfdro/Projects/CERTRACTKER/node_modules/lucide-astro/dist/BadgeCheck.astro", void 0);

const $$Astro$3 = createAstro();
const $$LogOut = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$3, $$props, $$slots);
  Astro2.self = $$LogOut;
  return renderTemplate`${renderComponent($$result, "Layout", $$, { "iconName": "log-out", ...Astro2.props }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path> <polyline points="16 17 21 12 16 7"></polyline> <line x1="21" x2="9" y1="12" y2="12"></line> ` })}`;
}, "C:/Users/kfdro/Projects/CERTRACTKER/node_modules/lucide-astro/dist/LogOut.astro", void 0);

const $$Astro$2 = createAstro();
const $$Settings = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$Settings;
  return renderTemplate`${renderComponent($$result, "Layout", $$, { "iconName": "settings", ...Astro2.props }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path> <circle cx="12" cy="12" r="3"></circle> ` })}`;
}, "C:/Users/kfdro/Projects/CERTRACTKER/node_modules/lucide-astro/dist/Settings.astro", void 0);

const $$Astro$1 = createAstro();
const $$TableProperties = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$TableProperties;
  return renderTemplate`${renderComponent($$result, "Layout", $$, { "iconName": "table-properties", ...Astro2.props }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<path d="M15 3v18"></path> <rect width="18" height="18" x="3" y="3" rx="2"></rect> <path d="M21 9H3"></path> <path d="M21 15H3"></path> ` })}`;
}, "C:/Users/kfdro/Projects/CERTRACTKER/node_modules/lucide-astro/dist/TableProperties.astro", void 0);

const $$Astro = createAstro();
const $$AppLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$AppLayout;
  const { title, user = null } = Astro2.props;
  return renderTemplate`<html lang="en"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title}</title>${renderHead()}</head> <body> <div class="min-h-screen"> <header class="border-b border-line bg-white"> <div class="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"> <a${addAttribute(user ? "/dashboard" : "/login", "href")} class="flex min-w-0 items-center gap-3 font-semibold text-ink"> <span class="inline-flex h-9 w-9 items-center justify-center rounded-md bg-action text-white"> ${renderComponent($$result, "BadgeCheck", $$BadgeCheck, { "size": 20, "aria-hidden": "true" })} </span> <span class="truncate">Certification Tracker</span> </a> ${user && renderTemplate`<nav class="flex items-center gap-2"> <a class="btn btn-ghost" href="/dashboard"> ${renderComponent($$result, "TableProperties", $$TableProperties, { "size": 18, "aria-hidden": "true" })}
Grid
</a> ${user.role === "admin" && renderTemplate`<a class="btn btn-ghost" href="/admin"> ${renderComponent($$result, "Settings", $$Settings, { "size": 18, "aria-hidden": "true" })}
Admin
</a>`} <form method="post" action="/api/auth/logout"> <button class="icon-btn" type="submit" title="Log out" aria-label="Log out"> ${renderComponent($$result, "LogOut", $$LogOut, { "size": 18, "aria-hidden": "true" })} </button> </form> </nav>`} </div> </header> <main> ${renderSlot($$result, $$slots["default"])} </main> </div> </body></html>`;
}, "C:/Users/kfdro/Projects/CERTRACTKER/src/layouts/AppLayout.astro", void 0);

export { $$AppLayout as $, $$ as a };
