import { writable } from 'svelte/store';
export type Theme = 'light' | 'dark';
const isServer = typeof document === 'undefined';

function initial(): Theme {
	if (isServer) return 'light';
	return (localStorage.getItem('theme') as Theme) ?? 'light';
}

export const theme = writable<Theme>(initial());
export function applyTheme(t: Theme) {
	if (isServer) return;
	const html = document.documentElement;
	html.classList.remove('light', 'dark');
	html.classList.add(t);
	localStorage.setItem('theme', t);
}
