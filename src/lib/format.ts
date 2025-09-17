export function shortHex(addr: string, left = 6, right = 4) {
	if (!addr) return '';
	return addr.length <= left + right ? addr : `${addr.slice(0, left)}…${addr.slice(-right)}`;
}

export function formatAmount(wei: string, decimals = 18, maxFrac = 4) {
	try {
		const n = BigInt(wei);
		const base = 10n ** BigInt(decimals);
		const whole = n / base;
		const frac = n % base;

		// Convert to decimal string
		const decimalValue = whole.toString() + '.' + frac.toString().padStart(decimals, '0');

		// Use the new significant digits formatting
		return formatSignificantWithSeparators(decimalValue);
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

/**
 * Removes scientific notation and returns a decimal string
 */
const handleRemoveExponent = (value: string | number | undefined) => {
	if (typeof value === 'undefined') return '0';

	const data = String(value).split(/[eE]/);

	if (data.length === 1) {
		return data[0];
	}

	const sign = Number(value) < 0 ? '-' : '';
	const str = data[0].replace('.', '');
	let result = '';
	let power = Number(data[1]) + 1;

	if (power < 0) {
		result = `${sign}0.`;

		while (power++) {
			result += '0';
		}

		return result + str.replace(/^\-/, '');
	}

	power -= str.length;

	while (power--) {
		result += '0';
	}

	return `${str}${result}`;
};

/**
 * Format a number with thousand and decimal separators
 */
export const formatWithSeparators = (value: string, thousSep?: string, floatSep?: string) => {
	let fmtNum = value;

	if (thousSep !== floatSep) {
		if (floatSep) {
			fmtNum = fmtNum.replace('.', floatSep);
		}

		if ((thousSep && floatSep) || (thousSep && !floatSep && thousSep !== '.')) {
			const fmtNumParts = fmtNum.toString().split(floatSep ?? '.');

			fmtNumParts[0] = fmtNumParts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousSep);
			fmtNum = fmtNumParts.join(floatSep ?? '.');
		}
	}

	return fmtNum;
};

/**
 * Helper function to process characters and count significant digits
 */
const processSignificantDigits = (input: string, sigDigits: number) => {
	let output = '';
	let outputSig = 0;
	let dotFound = false;

	for (const char of input) {
		if (outputSig === sigDigits) break;

		if (char === '0' && outputSig === 0) {
			if (output.length === 0 || dotFound) {
				output += char;
			}
			continue;
		} else if (char === '.') {
			output += char;
			dotFound = true;
			continue;
		}

		if (char !== '0' || outputSig > 0) {
			outputSig++;
		}
		output += char;
	}

	return output;
};

/**
 * Format number to a fixed number of significant digits
 */
export const toSignificant = (input: string, sigDigits = 5): string => {
	if (!input || isNaN(Number(input))) {
		return '0';
	}

	// Convert scientific notation to decimal
	const processedInput = handleRemoveExponent(input);
	let output = processSignificantDigits(processedInput, sigDigits);

	// Remove trailing zeros after decimal point
	if (output.includes('.')) {
		output = output.replace(/\.?0+$/, '');
	}

	return output || '0';
};

/**
 * Helper function to append zeros as needed to maintain the correct representation
 */
function appendZeros(input: string, output: string): string {
	const dotIndex = input?.indexOf('.');

	if (dotIndex !== -1 && output.length < dotIndex) {
		const zerosToAppend = dotIndex - output.length;
		output += '0'.repeat(zerosToAppend);
	} else if (dotIndex === -1) {
		const zerosToAppend = input.length - output.length;
		output += '0'.repeat(zerosToAppend);
	}

	// Always remove trailing zeros and decimal point if they exist
	output = output.replace(/\.?0+$/, '');

	// If we removed everything after decimal, make sure we don't have a trailing dot
	output = output.replace(/\.$/, '');

	return output;
}

/**
 * Validate numeric input
 */
export const validateNumericInput = (input: string, maxPrecision: number): void => {
	if (input.startsWith('-')) {
		throw new Error('[VALIDATION] Input must not be negative');
	}

	const dotIndex = input?.indexOf('.');
	const decimalPlaces = dotIndex !== -1 ? input.length - dotIndex - 1 : 0;

	if (decimalPlaces > maxPrecision) {
		throw new Error(
			`[VALIDATION] Input must not exceed max precision (allowed: ${maxPrecision}, actual: ${decimalPlaces})`
		);
	}
};

/**
 * Format number with significant digits and separators
 */
export const SIGNIFICANT_DIGITS = 5;

export const formatSignificantWithSeparators = (
	value: string,
	thousSep = ',',
	floatSep?: string
) => {
	const fmtNum = toSignificant(String(value), SIGNIFICANT_DIGITS);
	return formatWithSeparators(fmtNum, thousSep, floatSep);
};

/**
 * Helper function to determine if value is negative and extract absolute value
 */
const processSign = (value: string | number): { fmtVal: string | number; isPositive: boolean } => {
	if (typeof value === 'string' && parseFloat(value) < 0) {
		return { fmtVal: value.slice(1), isPositive: false };
	} else if (typeof value === 'number' && value < 0) {
		return { fmtVal: value * -1, isPositive: false };
	}
	return { fmtVal: value, isPositive: true };
};

/**
 * Helper function to calculate formatted result with precision
 */
const calculatePrecisionResult = (fmtVal: string | number, precision: number): string => {
	if (fmtVal === '' || fmtVal === 0) {
		return '0';
	}

	return handleRemoveExponent(
		parseFloat(
			`${Math.floor(Number(`${handleRemoveExponent(fmtVal)}e${precision}`))}e-${precision}`
		)
	);
};

/**
 * Helper function to add decimal point and padding zeros
 */
const padWithZeros = (result: string, precision: number): string => {
	if (result.indexOf('.') === -1 && precision > 0) {
		result += '.';
	}

	while (result.slice(result.indexOf('.')).length <= precision) {
		result += '0';
	}

	return result;
};

/**
 * Format number to a specific precision (number of decimal places)
 */
export const formatNumber = (
	value: string | number | undefined,
	precision = 0,
	thousSep?: string,
	floatSep?: string
) => {
	if (typeof value === 'undefined') {
		return '0';
	}

	const { fmtVal, isPositive } = processSign(value);
	let result = calculatePrecisionResult(fmtVal, precision);

	result = padWithZeros(result, precision);
	result = formatWithSeparators(result, thousSep, floatSep);

	return isPositive ? result : `-${result}`;
};

/**
 * Extract number part before decimal separator
 */
export const getNumberBeforeDot = (
	value: string | number | undefined,
	thousSep?: string,
	floatSep?: string
) => {
	return formatNumber(value, 0, thousSep, floatSep);
};

/**
 * Extract number part after decimal separator
 */
export const getNumberAfterDot = (
	value: string | number | undefined,
	fixed: number,
	thousSep?: string,
	floatSep?: string
) => {
	if (fixed === 0) {
		return;
	}

	const str = formatNumber(value, fixed);
	let floatNum = str.slice(str.indexOf('.'));

	if (floatSep) {
		floatNum = floatNum.replace('.', floatSep);
	}

	return floatNum;
};

/**
 * Component for displaying formatted decimal numbers with optional highlighting
 */
export interface DecimalProps {
	/**
	 * Number of digits after dot
	 */
	fixed: number;
	/**
	 * thousands separator
	 */
	thousSep?: string;
	/**
	 * float separator
	 */
	floatSep?: string;
	/**
	 * Number to format
	 */
	children?: string | number;
	/**
	 * Children's previous value.
	 * If undefined, only integer part of the number is highlighted
	 */
	prevValue?: string | number;
	/**
	 * Color of text
	 */
	color?: string;
	/**
	 * If true, the number is highlighted partially
	 */
	highlightedPartialyEnabled?: boolean;
	/**
	 * Color for partial part
	 */
	secondColor?: string;
}

// eslint-disable-next-line complexity
export const convertNumberToLiteral = (value: number, literals = ['K', 'M', 'B', 'T']) => {
	// output: less than thousand - 143.00, thousands - 1.43K, millions - 1.43M, billions - 1.43B, trillions - 1.43T
	if (value >= 1e12 && literals[3]) return formatNumber(value / 1e12, 2, ',') + literals[3];
	if (
		(value >= 1e9 && value < 1e12 && literals[2]) ||
		(value >= 1e12 && literals[2] && !literals[3])
	)
		return formatNumber(value / 1e9, 2, ',') + literals[2];
	if (
		(value >= 1e6 && value < 1e9 && literals[1]) ||
		(value >= 1e9 && literals[1] && !literals[2] && !literals[3])
	)
		return formatNumber(value / 1e6, 2, ',') + literals[1];
	if (
		(value >= 1e3 && value < 1e6 && literals[0]) ||
		(value >= 1e6 && Boolean(literals[0]) && !literals[1] && !literals[2] && !literals[3])
	)
		return formatNumber(value / 1e3, 2, ',') + literals[0];
	return formatNumber(value, 2, ',');
};

export const formatPercentage = (value: number): string =>
	`${value >= 0 ? '+' : ''}${formatNumber(value, 2, ',')}%`;
