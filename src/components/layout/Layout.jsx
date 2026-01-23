/**
 * Layout Component
 * Main layout wrapper with sidebar, content area, and command palette
 */

import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useApp } from '../../context/AppContext';
import { useDensity } from '../../context/DensityContext';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { APP_SHORTCUTS } from '../../utils/shortcuts';
import { LoadingSpinner } from '../ui';
import { CommandPalette } from '../ui/command-palette';
import Sidebar from './Sidebar';
import Header from './Header';
import './Layout.css';

export default function Layout() {
    const { state } = useApp();
    const location = useLocation();
    const navigate = useNavigate();
    const { toggleDensity } = useDensity();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

    // Read collapsed state from localStorage for main content margin
    const [isCollapsed, setIsCollapsed] = useState(() => {
        const saved = localStorage.getItem('sidebar-collapsed');
        return saved ? JSON.parse(saved) : false;
    });

    // Register global keyboard shortcuts
    useKeyboardShortcuts([
        {
            ...APP_SHORTCUTS.COMMAND_PALETTE,
            handler: () => setIsCommandPaletteOpen(true),
        },
        {
            ...APP_SHORTCUTS.TOGGLE_SIDEBAR,
            handler: () => {
                const newState = !isCollapsed;
                setIsCollapsed(newState);
                localStorage.setItem('sidebar-collapsed', JSON.stringify(newState));
            },
        },
        {
            ...APP_SHORTCUTS.TOGGLE_DENSITY,
            handler: toggleDensity,
        },
        {
            ...APP_SHORTCUTS.GO_HOME,
            handler: () => navigate('/'),
        },
    ]);

    // Sync collapsed state when localStorage changes
    useEffect(() => {
        const handleStorageChange = () => {
            const saved = localStorage.getItem('sidebar-collapsed');
            setIsCollapsed(saved ? JSON.parse(saved) : false);
        };

        // Listen for storage changes and custom event
        window.addEventListener('storage', handleStorageChange);

        // Poll for changes (since localStorage events don't fire in same tab)
        const interval = setInterval(handleStorageChange, 100);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, []);

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location.pathname]);

    // Close sidebar on escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') setIsSidebarOpen(false);
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

    // Show loading spinner while data is being loaded
    if (!state.isLoaded) {
        return (
            <div className="layout layout--loading">
                <LoadingSpinner size="lg" text="Loading application data..." />
            </div>
        );
    }

    return (
        <div className="layout">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />}
            <div
                className={cn(
                    "layout-main transition-all duration-300 ease-in-out",
                    // Use proper margin classes for collapsed state
                    isCollapsed ? "md:ml-16" : "md:ml-64",
                    // Mobile: no margin (sidebar is hidden)
                    "ml-0",
                    // Dialog open effect
                    state.ui?.isDialogOpen && "scale-[0.98] saturate-[0.8] blur-[1px]"
                )}
                style={{
                    transformOrigin: 'center center',
                    willChange: 'transform, filter'
                }}
            >
                <Header onMenuClick={toggleSidebar} />
                <main className="layout-content">
                    <Outlet />
                </main>
            </div>

            {/* Command Palette */}
            <CommandPalette
                open={isCommandPaletteOpen}
                onOpenChange={setIsCommandPaletteOpen}
            />
        </div>
    );
}

