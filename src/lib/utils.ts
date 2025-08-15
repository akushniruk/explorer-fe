import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export type WithElementRef<
	T extends Record<PropertyKey, unknown>,
	K extends keyof T = never
> = Omit<T, K>;
export type WithoutChild<
	T extends Record<PropertyKey, unknown>,
	K extends keyof T = 'child'
> = Omit<T, K>;
export type WithoutChildrenOrChild<
	T extends Record<PropertyKey, unknown>,
	K extends keyof T = 'children' | 'child'
> = Omit<T, K>;
