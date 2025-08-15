// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';

const handleApi: Handle = ({ event, resolve }) => {
	event.locals.apiBase = env.PUBLIC_API_BASE ?? (dev ? 'http://localhost:3000/api/v1' : '');
	return resolve(event);
};

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;
		event.setHeaders({
			'Referrer-Policy': 'strict-origin-when-cross-origin',
			'X-Frame-Options': 'DENY',
			'X-Content-Type-Options': 'nosniff',
			'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
			// Add CSP after you enumerate domains (fonts, API, analytics, map tiles, etc.)
		});
		return resolve(event, {
			transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale)
		});
	});

export const handle: Handle = sequence(handleApi, handleParaglide);
