import type { RequestHandler } from './$types';

const siteUrl = 'https://ynscan.xyz';

export const GET: RequestHandler = async () => {
	const currentDate = new Date().toISOString().split('T')[0]; // Use YYYY-MM-DD format only

	const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
	<sitemap>
		<loc>${siteUrl}/sitemap.xml</loc>
		<lastmod>${currentDate}</lastmod>
	</sitemap>
</sitemapindex>`;

	return new Response(sitemapIndex, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
		}
	});
};