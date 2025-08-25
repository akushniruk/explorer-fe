// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { dev } from '$app/environment';
import { env } from '$env/dynamic/public';

const handleApi: Handle = ({ event, resolve }) => {
	// Always use localhost:3000 for API in both dev and preview modes
	// In production deployment, PUBLIC_API_BASE should be set to the actual API URL
	const apiBase = env.PUBLIC_API_BASE ?? 'http://localhost:3000';
	console.log('API Base URL:', apiBase); // Debug logging
	event.locals.apiBase = apiBase;
	return resolve(event);
};

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;
		return resolve(event, {
			transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale),
			setHeaders: {
				'Referrer-Policy': 'strict-origin-when-cross-origin',
				'X-Frame-Options': 'DENY',
				'X-Content-Type-Options': 'nosniff',
				'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
				// Add CSP after you enumerate domains (fonts, API, analytics, map tiles, etc.)
			}
		});
	});

export const handle: Handle = sequence(handleApi, handleParaglide);
