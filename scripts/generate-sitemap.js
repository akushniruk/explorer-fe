#!/usr/bin/env node

/**
 * Build-time sitemap generator
 * Fetches data from API and generates static sitemap files
 */

import { writeFileSync } from 'fs';
import { join } from 'path';

const API_BASE = process.env.PUBLIC_API_BASE || 'https://explorer-apps.up.railway.app';
const SITE_URL = 'https://yellowscan.io';
const OUTPUT_DIR = './static';

// Helper function to validate blockchain addresses
function isValidAddress(address) {
	return address && typeof address === 'string' && /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Fetch with timeout
async function fetchWithTimeout(url, timeout = 10000) {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), timeout);

	try {
		const response = await fetch(url, { signal: controller.signal });
		clearTimeout(timeoutId);
		return response;
	} catch (error) {
		clearTimeout(timeoutId);
		throw error;
	}
}

async function generateSitemap() {
	console.log('🚀 Generating sitemap...');
	console.log(`📡 API Base: ${API_BASE}`);

	const currentDate = new Date().toISOString().split('T')[0];

	// Static routes
	const staticRoutes = [
		{ url: '', priority: '1.0', changefreq: 'hourly' },
		{ url: '/search', priority: '0.9', changefreq: 'daily' },
		{ url: '/channels', priority: '0.8', changefreq: 'daily' },
		{ url: '/sessions', priority: '0.8', changefreq: 'daily' },
		{ url: '/assets', priority: '0.7', changefreq: 'daily' },
		{ url: '/nodes', priority: '0.7', changefreq: 'daily' }
	];

	const dynamicUrls = [];
	let totalFetched = 0;

	try {
		// Fetch dynamic data in parallel
		console.log('📥 Fetching dynamic data...');
		const [channelsRes, sessionsRes, assetsRes] = await Promise.allSettled([
			fetchWithTimeout(`${API_BASE}/api/v1/channel/list?limit=1000`),
			fetchWithTimeout(`${API_BASE}/api/v1/app-session/list?limit=1000`),
			fetchWithTimeout(`${API_BASE}/api/v1/asset/list?limit=500`)
		]);

		// Process channels
		if (channelsRes.status === 'fulfilled' && channelsRes.value.ok) {
			const data = await channelsRes.value.json();
			if (data.success && data.data) {
				const items = Array.isArray(data.data) ? data.data : data.data.items || [];
				items.forEach((channel) => {
					if (channel.channel_id) {
						dynamicUrls.push(`/channel/${channel.channel_id}`);
					}
					if (channel.wallet && isValidAddress(channel.wallet)) {
						dynamicUrls.push(`/address/${channel.wallet}`);
					}
					if (channel.participant && isValidAddress(channel.participant)) {
						dynamicUrls.push(`/address/${channel.participant}`);
					}
				});
				totalFetched += items.length;
				console.log(`✅ Channels: ${items.length} items`);
			}
		} else {
			console.log('⚠️  Channels: Failed to fetch');
		}

		// Process sessions
		if (sessionsRes.status === 'fulfilled' && sessionsRes.value.ok) {
			const data = await sessionsRes.value.json();
			if (data.success && data.data) {
				const items = Array.isArray(data.data) ? data.data : data.data.items || [];
				items.forEach((session) => {
					if (session.session_id) {
						dynamicUrls.push(`/session/${session.session_id}`);
					}
					if (session.participants && Array.isArray(session.participants)) {
						session.participants.forEach((participant) => {
							if (isValidAddress(participant)) {
								dynamicUrls.push(`/address/${participant}`);
							}
						});
					}
				});
				totalFetched += items.length;
				console.log(`✅ Sessions: ${items.length} items`);
			}
		} else {
			console.log('⚠️  Sessions: Failed to fetch');
		}

		// Process assets
		if (assetsRes.status === 'fulfilled' && assetsRes.value.ok) {
			const data = await assetsRes.value.json();
			if (data.success && data.data) {
				const items = Array.isArray(data.data) ? data.data : data.data.items || [];
				items.forEach((asset) => {
					if (asset.token && isValidAddress(asset.token)) {
						dynamicUrls.push(`/address/${asset.token}`);
					}
				});
				totalFetched += items.length;
				console.log(`✅ Assets: ${items.length} items`);
			}
		} else {
			console.log('⚠️  Assets: Failed to fetch');
		}
	} catch (error) {
		console.log(`⚠️  Error fetching dynamic data: ${error.message}`);
	}

	// Remove duplicates and sort
	const seenUrls = new Set();
	const uniqueDynamicUrls = dynamicUrls
		.filter((url) => {
			const normalized = url.toLowerCase();
			if (seenUrls.has(normalized)) return false;
			seenUrls.add(normalized);
			return true;
		})
		.sort()
		.slice(0, 10000); // Limit to 10k URLs

	console.log(
		`📊 Dynamic URLs: ${uniqueDynamicUrls.length} unique (from ${dynamicUrls.length} total)`
	);

	// Generate main sitemap XML
	const mainSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${staticRoutes
			.map(
				(route) => `
	<url>
		<loc>${SITE_URL}${route.url === '' ? '/' : route.url}</loc>
		<lastmod>${currentDate}</lastmod>
		<changefreq>${route.changefreq}</changefreq>
		<priority>${route.priority}</priority>
	</url>`
			)
			.join('')}${uniqueDynamicUrls
				.map((url) => {
					const priority = url.startsWith('/channel/') || url.startsWith('/session/') ? '0.6' : '0.5';
					const changefreq = url.startsWith('/address/') ? 'weekly' : 'daily';
					return `
	<url>
		<loc>${SITE_URL}${url}</loc>
		<lastmod>${currentDate}</lastmod>
		<changefreq>${changefreq}</changefreq>
		<priority>${priority}</priority>
	</url>`;
				})
				.join('')}
</urlset>`;

	// Generate sitemap index
	const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
	<sitemap>
		<loc>${SITE_URL}/sitemap.xml</loc>
		<lastmod>${currentDate}</lastmod>
	</sitemap>
</sitemapindex>`;

	// Write files
	writeFileSync(join(OUTPUT_DIR, 'sitemap.xml'), mainSitemap);
	writeFileSync(join(OUTPUT_DIR, 'sitemap_index.xml'), sitemapIndex);

	console.log(`✅ Generated sitemap with ${staticRoutes.length + uniqueDynamicUrls.length} URLs`);
	console.log(`📁 Files written to ${OUTPUT_DIR}/`);
	console.log('🎉 Sitemap generation complete!');
}

generateSitemap().catch((error) => {
	console.error('❌ Sitemap generation failed:', error);
	process.exit(1);
});
