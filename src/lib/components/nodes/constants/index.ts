export type TCoordinates = {
	lat: number;
	long: number;
};

export type TPin = TCoordinates & { index: number; region: string };

export const PINS_DATA = [];

export const LINE_DATA = [
	{ start: 'Thailand', end: 'Poland' },
	{ start: 'France', end: 'Thailand' },
	{ start: 'NY', end: 'France' },
	{ start: 'Canada', end: 'NY' }
];
