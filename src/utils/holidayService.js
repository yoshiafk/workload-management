/**
 * Holiday Service
 * Fetches Indonesian national holidays from public API
 * with localStorage caching and static data fallback
 */

import { defaultHolidays, getMergedHolidays } from '../data/indonesiaHolidays';

// API endpoint for Indonesian holidays
const HOLIDAY_API_BASE = 'https://api-harilibur.vercel.app/api';

// Cache key for localStorage
const HOLIDAY_CACHE_KEY = 'wrm_holiday_cache';
const CACHE_EXPIRY_DAYS = 30; // Refresh cache after 30 days

/**
 * Transform API response to app's holiday format
 * @param {Array} data - API response data
 * @param {number} year - Year for generating IDs
 * @returns {Array} Transformed holidays
 */
function transformApiResponse(data, year) {
    // Strictly filter only national holidays to avoid region-specific (e.g., Bali) religious days
    const nationalHolidays = data
        .filter(item => item.is_national_holiday === true)
        .map((item, index) => ({
            id: `hd_api_${year}_${String(index + 1).padStart(3, '0')}`,
            date: normalizeDate(item.holiday_date),
            name: item.holiday_name,
            type: 'national',
            year: year,
        }));

    // The current API source (kalenderbali.com) often lacks Cuti Bersama (Collective Leave).
    // We re-integrate our verified static Cuti Bersama here to ensure full compliance with SKB Tiga Menteri.
    const cutiBersama = getMergedHolidays([], undefined, true)
        .filter(h => h.year === year && h.type === 'collective');

    return [...nationalHolidays, ...cutiBersama].sort((a, b) => new Date(a.date) - new Date(b.date));
}

/**
 * Normalize date format from API (handles "2026-1-1" -> "2026-01-01")
 * @param {string} dateStr - Date string from API
 * @returns {string} Normalized ISO date string
 */
function normalizeDate(dateStr) {
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0];
}

/**
 * Fetch holidays for a specific year from API
 * @param {number} year - Year to fetch
 * @returns {Promise<Array>} Holidays for the year
 */
async function fetchHolidaysFromAPI(year) {
    const response = await fetch(`${HOLIDAY_API_BASE}?year=${year}`);

    if (!response.ok) {
        throw new Error(`Failed to fetch holidays for ${year}: ${response.status}`);
    }

    const data = await response.json();
    return transformApiResponse(data, year);
}

/**
 * Fetch holidays for multiple years in parallel
 * @param {Array<number>} years - Years to fetch
 * @returns {Promise<Array>} Combined holidays for all years
 */
async function fetchHolidaysForYears(years) {
    const promises = years.map(year => fetchHolidaysFromAPI(year));
    const results = await Promise.all(promises);
    return results.flat();
}

/**
 * Get cached holidays from localStorage
 * @returns {Object|null} Cached data with holidays and timestamp, or null if expired/missing
 */
function getCachedHolidays() {
    try {
        const cached = localStorage.getItem(HOLIDAY_CACHE_KEY);
        if (!cached) return null;

        const { holidays, timestamp, years } = JSON.parse(cached);
        const cacheAge = Date.now() - timestamp;
        const maxAge = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

        // Check if cache is expired
        if (cacheAge > maxAge) {
            return null;
        }

        // Check if cached years match what we need
        const currentYear = new Date().getFullYear();
        const neededYears = [currentYear, currentYear + 1];
        const hasAllYears = neededYears.every(y => years.includes(y));

        if (!hasAllYears) {
            return null;
        }

        return holidays;
    } catch {
        return null;
    }
}

/**
 * Save holidays to localStorage cache
 * @param {Array} holidays - Holidays to cache
 * @param {Array<number>} years - Years included in cache
 */
function setCachedHolidays(holidays, years) {
    try {
        const cacheData = {
            holidays,
            years,
            timestamp: Date.now(),
        };
        localStorage.setItem(HOLIDAY_CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
        console.warn('Failed to cache holidays:', error);
    }
}

/**
 * Main function: Get holidays with API fetch, caching, and fallback
 * @returns {Promise<Array>} Holidays array
 */
export async function getHolidaysWithFallback() {
    const currentYear = new Date().getFullYear();
    const years = [currentYear, currentYear + 1];

    // Try to get from cache first
    const cached = getCachedHolidays();
    if (cached) {
        console.log('📅 Using cached holidays');
        return cached;
    }

    // Try to fetch from API
    try {
        console.log('📅 Fetching holidays from API...');
        const holidays = await fetchHolidaysForYears(years);

        if (holidays.length > 0) {
            setCachedHolidays(holidays, years);
            console.log(`📅 Fetched ${holidays.length} holidays for ${years.join(', ')}`);
            return holidays;
        }
    } catch (error) {
        console.warn('📅 Failed to fetch holidays from API:', error.message);
    }

    // Fallback to static data
    console.log('📅 Using static fallback holidays');
    return getMergedHolidays();
}

/**
 * Force refresh holidays from API (bypass cache)
 * @returns {Promise<Array>} Fresh holidays array
 */
export async function refreshHolidays() {
    const currentYear = new Date().getFullYear();
    const years = [currentYear, currentYear + 1];

    try {
        const holidays = await fetchHolidaysForYears(years);
        if (holidays.length > 0) {
            setCachedHolidays(holidays, years);
            return holidays;
        }
    } catch (error) {
        console.warn('📅 Failed to refresh holidays:', error.message);
    }

    return getMergedHolidays();
}

export default {
    getHolidaysWithFallback,
    refreshHolidays,
};
