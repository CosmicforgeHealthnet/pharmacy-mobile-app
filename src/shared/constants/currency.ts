/**
 * Currency utilities for Cosmic Pharmacy Mobile App.
 * Currency is derived from the pharmacy's location during login.
 */

export const CURRENCY_SYMBOLS: Record<string, string> = {
    NGN: '₦',
    USD: '$',
    EUR: '€',
    GBP: '£',
    KES: 'KSh',
    ZAR: 'R',
    GHS: '₵',
    XOF: 'CFA',
    XAF: 'FCFA',
    EGP: 'E£',
    MAD: 'MAD',
    TZS: 'TSh',
    UGX: 'USh',
    RWF: 'FRw',
    ETB: 'Br',
    INR: '₹',
    AED: 'د.إ',
    SAR: '﷼',
    CAD: 'C$',
    AUD: 'A$',
};

/** Country to currency code mapping */
export const COUNTRY_CURRENCY_MAP: Record<string, string> = {
    // Africa
    Nigeria: 'NGN',
    Kenya: 'KES',
    'South Africa': 'ZAR',
    Ghana: 'GHS',
    Egypt: 'EGP',
    Morocco: 'MAD',
    Tanzania: 'TZS',
    Uganda: 'UGX',
    Rwanda: 'RWF',
    Ethiopia: 'ETB',
    Senegal: 'XOF',
    'Ivory Coast': 'XOF',
    "Côte d'Ivoire": 'XOF',
    Cameroon: 'XAF',
    Benin: 'XOF',
    Togo: 'XOF',
    Mali: 'XOF',
    'Burkina Faso': 'XOF',
    Niger: 'XOF',
    'Guinea-Bissau': 'XOF',
    // North America
    'United States': 'USD',
    USA: 'USD',
    Canada: 'CAD',
    // Europe
    'United Kingdom': 'GBP',
    UK: 'GBP',
    Germany: 'EUR',
    France: 'EUR',
    Italy: 'EUR',
    Spain: 'EUR',
    Netherlands: 'EUR',
    Belgium: 'EUR',
    Austria: 'EUR',
    Ireland: 'EUR',
    Portugal: 'EUR',
    Greece: 'EUR',
    Finland: 'EUR',
    // Middle East
    'United Arab Emirates': 'AED',
    UAE: 'AED',
    'Saudi Arabia': 'SAR',
    // Asia Pacific
    India: 'INR',
    Australia: 'AUD',
};

/** Get currency code for a country, defaults to USD if not found */
export function getCurrencyForCountry(country?: string | null): string {
    if (!country) return 'USD';
    return COUNTRY_CURRENCY_MAP[country] ?? 'USD';
}

/** Returns the symbol for a currency code, or the code itself as fallback */
export function getCurrencySymbol(code?: string | null): string {
    if (!code) return '';
    return CURRENCY_SYMBOLS[code] ?? code;
}

/** Currency locale settings for Intl formatting */
const CURRENCY_LOCALES: Record<string, string> = {
    NGN: 'en-NG',
    USD: 'en-US',
    EUR: 'en-EU',
    GBP: 'en-GB',
    KES: 'en-KE',
    ZAR: 'en-ZA',
    GHS: 'en-GH',
    INR: 'en-IN',
};

/** Returns the locale string for a currency code */
export function getCurrencyLocale(code?: string | null): string {
    if (!code) return 'en-NG';
    return CURRENCY_LOCALES[code] ?? 'en-US';
}

/**
 * Formats an amount with the given currency code.
 * Always use this function to format monetary amounts.
 * The currency should come from the API response.
 *
 * @param amount - The amount to format
 * @param currencyCode - The currency code from the API (e.g., 'NGN', 'USD')
 * @returns Formatted currency string (e.g., '₦1,234.56')
 */
/** Formats a number as a currency string. Returns "—" if no symbol provided. */
export function formatCurrencyAmount(
    amount: number,
    symbol: string,
    locale?: string,
): string {
    if (!symbol) return '—';
    return `${symbol}${amount.toLocaleString(locale ?? 'en-NG', { minimumFractionDigits: 2 })}`;
}

/**
 * Formats an amount with the given currency code.
 * Always use this function to format monetary amounts.
 * The currency should come from the API response.
 *
 * @param amount - The amount to format
 * @param currencyCode - The currency code from the API (e.g., 'NGN', 'USD')
 * @returns Formatted currency string (e.g., '₦1,234.56')
 */
export function formatCurrency(amount: number, currencyCode?: string | null): string {
    const code = currencyCode || 'NGN';
    const symbol = getCurrencySymbol(code);
    const locale = getCurrencyLocale(code);
    return `${symbol}${(amount || 0).toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Text shown when currency has not been configured yet */
export const NO_CURRENCY_SET = '—';
