/**
 * Header Component
 * Clean professional top bar with avatar dropdown
 */

import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../ui/ThemeToggle';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, ChevronDown } from 'lucide-react';
import './Header.css';

const pageTitles = {
    '/': 'Dashboard',
    '/allocation': 'Resource Allocation',
    '/dates': 'Important Dates',
    '/library/members': 'Team Members',
    '/library/phases': 'Phases',
    '/library/tasks': 'Task Templates',
    '/library/complexity': 'Complexity Settings',
    '/library/costs': 'Resource Costs',
    '/settings': 'Settings',
};

const pageDescriptions = {
    '/': 'Overview of team workload and resource utilization',
    '/allocation': 'Manage task allocations and track progress',
    '/dates': 'Holidays and team leave management',
    '/library/members': 'Manage team members and their profiles',
    '/library/phases': 'Configure project phases and workflow',
    '/library/tasks': 'Define task templates with effort estimates',
    '/library/complexity': 'Configure complexity levels and durations',
    '/library/costs': 'Set resource cost rates and billing',
    '/settings': 'Data management and application settings',
};

/**
 * Get initials from a name or email
 */
function getInitials(user) {
    if (user?.member?.name) {
        const parts = user.member.name.split(' ');
        return parts.length > 1
            ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
            : parts[0].substring(0, 2).toUpperCase();
    }
    if (user?.email) {
        return user.email.substring(0, 2).toUpperCase();
    }
    return 'U';
}

/**
 * Get display name from user
 */
function getDisplayName(user) {
    return user?.member?.name || user?.email?.split('@')[0] || 'User';
}

export default function Header({ onMenuClick }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout, isAdmin } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const title = pageTitles[location.pathname] || 'Dashboard';
    const description = pageDescriptions[location.pathname] || '';

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <header className="header bg-background border-b border-border">
            <div className="header-content">
                <div className="header-left">
                    <button className="menu-toggle" onClick={onMenuClick} aria-label="Toggle menu">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <line x1="3" y1="12" x2="21" y2="12" />
                            <line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                    </button>
                    <div className="header-title-group">
                        <h1 className="page-title">{title}</h1>
                        {description && <p className="page-description">{description}</p>}
                    </div>
                </div>

                <div className="header-actions">
                    <ThemeToggle />

                    <div className="header-date">
                        <span className="date-label">Today</span>
                        <span className="date-value">
                            {new Date().toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                            })}
                        </span>
                    </div>

                    {/* User Avatar Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            aria-label="User menu"
                        >
                            {/* Avatar */}
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                                {getInitials(user)}
                            </div>
                            <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl z-50 overflow-hidden">
                                {/* User Info */}
                                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                                            {getInitials(user)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                                {getDisplayName(user)}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                                {user?.email}
                                            </p>
                                        </div>
                                    </div>
                                    {isAdmin && (
                                        <span className="inline-flex items-center mt-2 px-2 py-0.5 rounded-md text-xs font-medium bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
                                            Administrator
                                        </span>
                                    )}
                                </div>

                                {/* Menu Items */}
                                <div className="py-1">
                                    <button
                                        onClick={() => {
                                            setIsDropdownOpen(false);
                                            // Future: navigate to profile page
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        <User className="w-4 h-4" />
                                        <span>Profile</span>
                                    </button>

                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span>Sign out</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
