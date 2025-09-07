// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { dev } from '$app/environment';
import { env } from '$env/dynamic/public';

const handleApi: Handle = async ({ event, resolve }) => {
	// Use localhost in development, Railway in production
	const apiBase = dev ? 'http://localhost:3000' : 'https://explorer-apps.up.railway.app';
	console.log('=== API HANDLER DEBUG ===');
	console.log('Request URL:', event.url.toString());
	console.log('Request pathname:', event.url.pathname);
	console.log('Request search:', event.url.search);
	console.log('Request method:', event.request.method);
	console.log('API Base URL (hardcoded):', apiBase);
	
	// Fix double slash issue
	if (event.url.pathname === '//') {
		console.log('FIXING DOUBLE SLASH - redirecting // to /');
		const fixedUrl = new URL('/', event.url.origin);
		fixedUrl.search = event.url.search;
		
		// Create a new request with the fixed URL
		const newRequest = new Request(fixedUrl, {
			method: event.request.method,
			headers: event.request.headers,
			body: event.request.body
		});
		
		// Update the event with the fixed URL and request
		event.url = fixedUrl;
		event.request = newRequest;
		console.log('Fixed URL:', event.url.toString());
	}
	
	console.log('All env vars:', Object.keys(env).filter(k => k.startsWith('PUBLIC_')));
	console.log('Setting event.locals.apiBase to:', apiBase);
	console.log('Event locals before:', Object.keys(event.locals || {}));
	event.locals.apiBase = apiBase;
	console.log('Event locals after:', Object.keys(event.locals || {}));
	console.log('=== END DEBUG ===');
	
	try {
		const response = await resolve(event);
		console.log('Response status:', response.status);
		return response;
	} catch (error) {
		console.error('Error in handleApi:', error);
		throw error;
	}
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
