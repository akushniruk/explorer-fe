import { writable } from 'svelte/store';
export type Theme = 'dark' | 'light';
const isServer = typeof document === 'undefined';

function initial(): Theme {
	if (isServer) return 'dark';
	return (localStorage.getItem('theme') as Theme) ?? 'dark';
}

export const theme = writable<Theme>(initial());
export function applyTheme(t: Theme) {
	if (isServer) return;
	const html = document.documentElement;
	html.classList.toggle('light', t === 'light'); // dark is default (no class)
	localStorage.setItem('theme', t);
}
