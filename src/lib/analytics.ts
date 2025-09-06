import posthog from 'posthog-js';
import { browser } from '$app/environment';
import { PUBLIC_ENABLE_ANALYTICS } from '$env/static/public';

let initialized = false;

// Check if analytics should be enabled
const analyticsEnabled = PUBLIC_ENABLE_ANALYTICS === 'true';

export function initPostHog() {
	if (browser && !initialized && analyticsEnabled) {
		posthog.init('phc_p29Y4aKMD3TsFW0lSjGCT09yAnZ2NinScLHJvdTBqJq', {
			api_host: 'https://us.i.posthog.com',
			person_profiles: 'identified_only',
			capture_pageview: false // We'll handle this manually
		});
		initialized = true;
	}
}

export function trackPageView(url: string) {
	if (browser && initialized && analyticsEnabled) {
		posthog.capture('$pageview', {
			$current_url: url
		});
	}
}

export function trackSearch(query: string, results_count?: number) {
	if (browser && initialized && analyticsEnabled) {
		posthog.capture('search_performed', {
			search_query: query,
			results_count
		});
	}
}

export function trackChannelView(channelId: string) {
	if (browser && initialized && analyticsEnabled) {
		posthog.capture('channel_viewed', {
			channel_id: channelId
		});
	}
}

export function trackSessionView(sessionId: string) {
	if (browser && initialized && analyticsEnabled) {
		posthog.capture('session_viewed', {
			session_id: sessionId
		});
	}
}

export function trackNavigation(from: string, to: string) {
	if (browser && initialized && analyticsEnabled) {
		posthog.capture('navigation', {
			from_page: from,
			to_page: to
		});
	}
}

export function trackThemeToggle(theme: string) {
	if (browser && initialized && analyticsEnabled) {
		posthog.capture('theme_changed', {
			theme
		});
	}
}

export function trackLanguageChange(language: string) {
	if (browser && initialized && analyticsEnabled) {
		posthog.capture('language_changed', {
			language
		});
	}
}

export function trackDataRefresh(page_type: string) {
	if (browser && initialized && analyticsEnabled) {
		posthog.capture('data_refreshed', {
			page_type
		});
	}
}

export function trackError(error: string, context?: string) {
	if (browser && initialized && analyticsEnabled) {
		posthog.capture('error_encountered', {
			error,
			context
		});
	}
}