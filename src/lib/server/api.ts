import { z } from 'zod';
import type { RequestEvent } from '@sveltejs/kit';
import { dev } from '$app/environment';

export type ApiResult<T> = { data: T; etag?: string; notModified?: boolean };

function joinUrl(base: string | undefined, path: string) {
	const b = (base ?? '').replace(/\/+$/, ''); // trim trailing slash
	const p = path.startsWith('/') ? path : `/${path}`;
	// Deduplicate common prefixes like /api or /api/v1 when accidentally repeated
	const joined = `${b}${p}`.replace(/(\/api(?:\/v\d+)?)\1\//, '$1/');
	return joined;
}

export async function apiGet<T>(
	event: RequestEvent,
	path: string,
	schema: z.ZodType<T>,
	etag?: string,
	fallbackPaths: string[] = [] // e.g. ['/channels/list']
): Promise<ApiResult<T>> {
	const base = event.locals.apiBase;
	const url = joinUrl(base, path);

	const res = await event.fetch(url, {
		headers: etag ? { 'If-None-Match': etag } : undefined
	});

	if (res.status === 304) return { data: undefined as unknown as T, etag, notModified: true };

	if (res.status === 404 && fallbackPaths.length) {
		for (const fp of fallbackPaths) {
			const fUrl = joinUrl(base, fp);
			const fr = await event.fetch(fUrl, { headers: etag ? { 'If-None-Match': etag } : undefined });
			if (fr.ok || fr.status === 304) {
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
		throw new Error(`API ${path} -> ${res.status}${hint}`);
	}

	const newEtag = res.headers.get('etag') ?? undefined;
	const json = await res.json();

	return { data: schema.parse(json), etag: newEtag };
}
