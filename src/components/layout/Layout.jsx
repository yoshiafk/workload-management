/**
 * Layout Component
 * Main layout wrapper with sidebar and content area
 */

import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { LoadingSpinner } from '../ui';
import Sidebar from './Sidebar';
import Header from './Header';
import './Layout.css';

export default function Layout() {
    const { state } = useApp();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
            <div className="layout-main">
                <Header onMenuClick={toggleSidebar} />
                <main className="layout-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
