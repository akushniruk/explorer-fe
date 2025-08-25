import { z } from 'zod';
import type { RequestEvent } from '@sveltejs/kit';
import { dev } from '$app/environment';

export type ApiResult<T> = { data: T; etag?: string; notModified?: boolean };

function joinUrl(base: string | undefined, path: string) {
	const b = (base ?? '').replace(/\/+$/, ''); // trim trailing slash
	const p = path.startsWith('/') ? path : `/${path}`;
	
	// Handle empty base case
	if (!b) {
		console.error('API base URL is empty or undefined!');
		return path;
	}
	
	// Simple join without complex regex that might cause issues
	const joined = `${b}${p}`;
	console.log(`[joinUrl] base: "${base}" -> "${b}", path: "${path}" -> "${p}", joined: "${joined}"`);
	return joined;
}

export async function apiGet<T>(
	event: RequestEvent,
	path: string,
	schema: z.ZodType<T>,
	etag?: string,
	fallbackPaths: string[] = [] // e.g. ['/channels/list']
): Promise<ApiResult<T>> {
	try {
		const base = event.locals.apiBase;
		console.log(`[apiGet] START - event.locals.apiBase: "${base}"`);
		console.log(`[apiGet] typeof base: ${typeof base}`);
		console.log(`[apiGet] path: "${path}"`);
		
		const url = joinUrl(base, path);
		console.log(`[apiGet] final URL: "${url}"`);
		console.log(`[apiGet] About to call event.fetch...`);

		const res = await event.fetch(url, {
			headers: etag ? { 'If-None-Match': etag } : undefined
		});
		
		console.log(`[apiGet] Response status: ${res.status}`);
		console.log(`[apiGet] Response ok: ${res.ok}`);

		if (res.status === 304) return { data: undefined as unknown as T, etag, notModified: true };

		if (res.status === 404 && fallbackPaths.length) {
			console.log(`[apiGet] Trying fallback paths:`, fallbackPaths);
			for (const fp of fallbackPaths) {
				const fUrl = joinUrl(base, fp);
				console.log(`[apiGet] Trying fallback URL: ${fUrl}`);
				const fr = await event.fetch(fUrl, { headers: etag ? { 'If-None-Match': etag } : undefined });
				if (fr.ok || fr.status === 304) {
					console.log(`[apiGet] Fallback succeeded with status: ${fr.status}`);
					if (dev) console.warn(`[apiGet] 404 on ${url}, succeeded on fallback ${fUrl}`);
					if (fr.status === 304) return { data: undefined as unknown as T, etag, notModified: true };
					const newEtag = fr.headers.get('etag') ?? undefined;
					const json = await fr.json();
					return { data: schema.parse(json), etag: newEtag };
				}
			}
		}

		if (!res.ok) {
			const body = dev ? await res.text().catch(() => '') : '';
			const hint = dev ? ` [url=${res.url}] ${body?.slice(0, 300)}` : '';
			console.error(`[apiGet] API ERROR: ${res.status} for ${path}${hint}`);
			throw new Error(`API ${path} -> ${res.status}${hint}`);
		}

		console.log(`[apiGet] Success! Parsing JSON...`);
		const newEtag = res.headers.get('etag') ?? undefined;
		const json = await res.json();
		const parsed = schema.parse(json);
		console.log(`[apiGet] SUCCESS - parsed data type:`, typeof parsed);

		return { data: parsed, etag: newEtag };
	} catch (error) {
		console.error(`[apiGet] EXCEPTION for ${path}:`, error);
		throw error;
	}
}
