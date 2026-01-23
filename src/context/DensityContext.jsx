/**
 * DensityContext
 * Provides app-wide density preference (dense/comfortable) for UI components
 * Persists to localStorage for user preference retention
 */

import { createContext, useContext, useState, useEffect, useMemo } from 'react';

const STORAGE_KEY = 'ui-density';
const DEFAULT_DENSITY = 'comfortable';

const DensityContext = createContext(undefined);

export function DensityProvider({ children }) {
    const [density, setDensityState] = useState(() => {
        // Initialize from localStorage
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored === 'dense' || stored === 'comfortable') {
                return stored;
            }
        }
        return DEFAULT_DENSITY;
    });

    // Persist to localStorage when density changes
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, density);

        // Update root element class for CSS selectors
        const root = document.documentElement;
        root.classList.remove('density-dense', 'density-comfortable');
        root.classList.add(`density-${density}`);
    }, [density]);

    const setDensity = (newDensity) => {
        if (newDensity === 'dense' || newDensity === 'comfortable') {
            setDensityState(newDensity);
        }
    };

    const toggleDensity = () => {
        setDensityState(prev => prev === 'dense' ? 'comfortable' : 'dense');
    };

    const value = useMemo(() => ({
        density,
        setDensity,
        toggleDensity,
        isDense: density === 'dense',
    }), [density]);

    return (
        <DensityContext.Provider value={value}>
            {children}
        </DensityContext.Provider>
    );
}

export function useDensity() {
    const context = useContext(DensityContext);
    if (context === undefined) {
        throw new Error('useDensity must be used within a DensityProvider');
    }
    return context;
}

export { DensityContext };
