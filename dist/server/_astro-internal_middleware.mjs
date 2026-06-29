import { e as defineMiddleware, s as sequence } from './chunks/render-context_vvQVffVS.mjs';
import { g as getSessionUser } from './chunks/auth_IzzbUe5i.mjs';
import 'es-module-lexer';
import './chunks/astro-designed-error-pages_BlOi1jp9.mjs';
import 'piccolore';
import './chunks/astro/server_BdgZYsu1.mjs';
import 'clsx';

const onRequest$1 = defineMiddleware(async (context, next) => {
  context.locals.user = await getSessionUser(context.cookies);
  return next();
});

const onRequest = sequence(
	
	onRequest$1
	
);

export { onRequest };
