export function shortHex(addr: string, left = 6, right = 4) {
	if (!addr) return '';
	return addr.length <= left + right ? addr : `${addr.slice(0, left)}…${addr.slice(-right)}`;
}

export function formatAmount(wei: string, decimals = 18, maxFrac = 4) {
	try {
		const n = BigInt(wei);
		const base = 10n ** BigInt(decimals);
		const whole = n / base;
		const frac = (n % base).toString().padStart(decimals, '0').slice(0, maxFrac);
		return `${whole.toString()}${maxFrac ? `.${frac}` : ''}`;
	} catch {
		return wei;
	}
}

export function timeAgo(iso: string) {
	const now = Date.now();
	const then = new Date(iso).getTime();
	const s = Math.max(1, Math.round((now - then) / 1000));
	if (s < 60) return `${s}s ago`;
	const m = Math.round(s / 60);
	if (m < 60) return `${m}m ago`;
	const h = Math.round(m / 60);
	if (h < 24) return `${h}h ago`;
	const d = Math.round(h / 24);
	return `${d}d ago`;
}
