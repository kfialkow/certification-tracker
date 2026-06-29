import { e as createComponent, k as renderComponent, r as renderTemplate, h as createAstro, m as maybeRenderHead } from '../chunks/astro/server_BdgZYsu1.mjs';
import 'piccolore';
import { $ as $$AppLayout } from '../chunks/AppLayout_DMXZT9W5.mjs';
export { renderers } from '../renderers.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro();
const $$Login = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Login;
  if (Astro2.locals.user) {
    return Astro2.redirect("/dashboard");
  }
  return renderTemplate`${renderComponent($$result, "AppLayout", $$AppLayout, { "title": "Login | Certification Tracker" }, { "default": async ($$result2) => renderTemplate(_a || (_a = __template([" ", `<section class="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8"> <div class="flex flex-col justify-center"> <h1 class="text-3xl font-semibold text-ink sm:text-4xl">Certification Tracker</h1> <p class="mt-4 max-w-md text-base text-slate-600">
Track education certifications, renewal dates, document links, and reminder status.
</p> <div class="mt-8 grid max-w-md grid-cols-3 gap-3 text-sm"> <div class="rounded-md border border-line bg-white p-3 shadow-panel"> <div class="font-semibold text-ink">90</div> <div class="text-slate-600">days</div> </div> <div class="rounded-md border border-line bg-white p-3 shadow-panel"> <div class="font-semibold text-ink">30</div> <div class="text-slate-600">days</div> </div> <div class="rounded-md border border-line bg-white p-3 shadow-panel"> <div class="font-semibold text-ink">daily</div> <div class="text-slate-600">expired</div> </div> </div> </div> <div class="grid content-center gap-4"> <div data-auth-message class="hidden rounded-md border px-4 py-3 text-sm"></div> <div class="grid gap-4 md:grid-cols-2"> <form data-auth-form data-api="/api/auth/login" class="rounded-md border border-line bg-white p-5 shadow-panel"> <h2 class="text-lg font-semibold text-ink">Log in</h2> <div class="mt-5 grid gap-4"> <label class="field"> <span class="label">Email</span> <input class="control" name="email" type="email" autocomplete="email" required> </label> <label class="field"> <span class="label">Password</span> <input class="control" name="password" type="password" autocomplete="current-password" minlength="8" required> </label> <button class="btn btn-primary" type="submit">Log in</button> </div> </form> <form data-auth-form data-api="/api/auth/register" class="rounded-md border border-line bg-white p-5 shadow-panel"> <h2 class="text-lg font-semibold text-ink">Create account</h2> <div class="mt-5 grid gap-4"> <label class="field"> <span class="label">Full name</span> <input class="control" name="fullName" autocomplete="name" required> </label> <label class="field"> <span class="label">Email</span> <input class="control" name="email" type="email" autocomplete="email" required> </label> <label class="field"> <span class="label">Phone</span> <input class="control" name="phone" autocomplete="tel"> </label> <label class="field"> <span class="label">Password</span> <input class="control" name="password" type="password" autocomplete="new-password" minlength="8" required> </label> <button class="btn btn-primary" type="submit">Create account</button> </div> </form> </div> </div> </section> <script>
    const message = document.querySelector("[data-auth-message]");

    function showMessage(text, ok) {
      if (!message) return;
      message.textContent = text;
      message.className = ok
        ? "rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-success"
        : "rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-danger";
    }

    document.querySelectorAll("[data-auth-form]").forEach((form) => {
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const button = form.querySelector("button[type='submit']");
        button.disabled = true;

        try {
          const payload = Object.fromEntries(new FormData(form).entries());
          const response = await fetch(form.dataset.api, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
          const data = await response.json();

          if (!response.ok) {
            showMessage(data.error ?? "Unable to continue.", false);
            return;
          }

          showMessage("Signed in.", true);
          window.location.href = "/dashboard";
        } catch (error) {
          showMessage("Network error. Try again.", false);
        } finally {
          button.disabled = false;
        }
      });
    });
  <\/script> `])), maybeRenderHead()) })}`;
}, "C:/Users/kfdro/Projects/CERTRACTKER/src/pages/login.astro", void 0);

const $$file = "C:/Users/kfdro/Projects/CERTRACTKER/src/pages/login.astro";
const $$url = "/login";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Login,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
