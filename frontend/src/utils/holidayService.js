import { lookupsApi } from '../services/api';

/**
 * Get holidays from the backend database (Single Source of Truth)
 * Falls back to minimal static defaults if backend is unavailable.
 */
export async function getHolidaysWithFallback() {
    try {
        console.log('📅 Fetching holidays from backend...');
        const response = await lookupsApi.getHolidays();
        const holidays = response.data.items || [];

        if (holidays.length > 0) {
            console.log(`📅 Loaded ${holidays.length} holidays from database.`);
            return holidays;
        }
    } catch (error) {
        console.warn('📅 Failed to fetch holidays from backend:', error.message);
    }

    // Minimal fallback if backend is empty or unreachable
    console.log('📅 Using minimal fallback holidays');
    return [
        { id: 'hd_2025_01_01', date: '2025-01-01', name: 'Tahun Baru 2025 Masehi', type: 'national', year: 2025 },
        { id: 'hd_2026_01_01', date: '2026-01-01', name: 'Tahun Baru 2026 Masehi', type: 'national', year: 2026 }
    ];
}

/**
 * Force refresh - triggers backend to sync from external API and then re-fetches
 */
export async function refreshHolidays(year) {
    try {
        console.log(`📅 Triggering backend sync for ${year || 'current year'}...`);
        await lookupsApi.syncHolidays(year);
        return getHolidaysWithFallback();
    } catch (error) {
        console.warn('📅 Sync failed, falling back to cached backend data:', error.message);
        return getHolidaysWithFallback();
    }
}

export default {
    getHolidaysWithFallback,
    refreshHolidays,
};


