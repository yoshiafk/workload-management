/**
 * Sidebar Component - Redesigned with Design Tokens
 * Professional navigation with lucide-react icons and collapsible mode
 */

import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    LayoutGrid,
    ClipboardList,
    CalendarDays,
    CalendarClock,
    Calculator,
    Users,
    Layers,
    ListTodo,
    SlidersHorizontal,
    Coins,
    Building2,
    Receipt,
    BarChart3,
    Settings,
    X,
    PanelLeftClose,
    PanelLeft
} from 'lucide-react';
import logo from '../../assets/logo.svg';
import './Sidebar.css';

const navItems = [
    {
        title: 'Overview',
        items: [
            { path: '/', label: 'Dashboard', icon: LayoutGrid },
        ],
    },
    {
        title: 'Management',
        items: [
            { path: '/allocation', label: 'Resource Allocation', icon: ClipboardList },
            { path: '/timeline', label: 'Timeline', icon: CalendarDays },
            { path: '/dates', label: 'Important Dates', icon: CalendarClock },
            { path: '/cost-calculator', label: 'Cost Calculator', icon: Calculator },
        ],
    },
    {
        title: 'Configuration',
        items: [
            { path: '/library/members', label: 'Team Members', icon: Users },
            { path: '/library/phases', label: 'Phases', icon: Layers },
            { path: '/library/tasks', label: 'Task Templates', icon: ListTodo },
            { path: '/library/complexity', label: 'Complexity', icon: SlidersHorizontal },
            { path: '/library/costs', label: 'Resource Costs', icon: Coins },
            { path: '/library/cost-centers', label: 'Cost Centers', icon: Building2 },
            { path: '/library/chart-of-accounts', label: 'Chart of Accounts', icon: Receipt },
            { path: '/library/cost-center-reports', label: 'Cost Center Reports', icon: BarChart3 },
        ],
    },
    {
        title: 'System',
        items: [
            { path: '/settings', label: 'Settings', icon: Settings },
        ],
    },
];

// Keyboard shortcut hook
function useKeyboardShortcut(key, callback, modifiers = ['metaKey']) {
    useEffect(() => {
        function handleKeyDown(event) {
            const allModifiersPressed = modifiers.every(mod => event[mod]);
            if (allModifiersPressed && event.key.toLowerCase() === key.toLowerCase()) {
                event.preventDefault();
                callback();
            }
        }
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [key, callback, modifiers]);
}

// Nav item with tooltip for collapsed mode
function NavItem({ item, isActive, isCollapsed, onClick }) {
    const Icon = item.icon;

    const linkContent = (
        <NavLink
            to={item.path}
            onClick={onClick}
            className={cn(
                "sidebar-nav-link",
                isActive && "sidebar-nav-link--active",
                isCollapsed && "sidebar-nav-link--collapsed"
            )}
        >
            <Icon className={cn(
                "sidebar-nav-icon",
                isCollapsed && "sidebar-nav-icon--collapsed"
            )} />
            {!isCollapsed && (
                <span className="sidebar-nav-label">{item.label}</span>
            )}
        </NavLink>
    );

    if (isCollapsed) {
        return (
            <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                    {linkContent}
                </TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                    {item.label}
                </TooltipContent>
            </Tooltip>
        );
    }

    return linkContent;
}

export default function Sidebar({ isOpen, onClose }) {
    const location = useLocation();

    // Collapsible state - persisted to localStorage
    const [isCollapsed, setIsCollapsed] = useState(() => {
        const saved = localStorage.getItem('sidebar-collapsed');
        return saved ? JSON.parse(saved) : false;
    });

    // Persist collapsed state
    useEffect(() => {
        localStorage.setItem('sidebar-collapsed', JSON.stringify(isCollapsed));
    }, [isCollapsed]);

    // Keyboard shortcut: Cmd+B to toggle
    useKeyboardShortcut('b', () => setIsCollapsed(prev => !prev));

    const toggleCollapse = () => setIsCollapsed(prev => !prev);

    return (
        <TooltipProvider>
            <aside
                className={cn(
                    "sidebar",
                    isCollapsed && "sidebar--collapsed",
                    isOpen && "sidebar--mobile-open"
                )}
            >
                {/* Header - Always show logo and branding */}
                <div className={cn(
                    "sidebar-header",
                    isCollapsed && "sidebar-header--collapsed"
                )}>
                    <div className="sidebar-logo-container">
                        {isCollapsed ? (
                            /* Show just the W icon when collapsed */
                            <div className="sidebar-logo-icon">
                                <span className="sidebar-logo-letter">W</span>
                            </div>
                        ) : (
                            /* Show full logo when expanded - logo uses currentColor */
                            <img
                                src={logo}
                                alt="Workload"
                                className="sidebar-logo-full"
                            />
                        )}
                    </div>

                    {/* Desktop collapse button */}
                    {!isCollapsed && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleCollapse}
                            className="sidebar-collapse-btn hidden md:flex"
                            title="Collapse sidebar (⌘B)"
                        >
                            <PanelLeftClose className="h-4 w-4" />
                        </Button>
                    )}

                    {/* Mobile close button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="sidebar-close-btn md:hidden"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Expand button when collapsed */}
                {isCollapsed && (
                    <div className="sidebar-expand-container hidden md:flex">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleCollapse}
                            className="sidebar-expand-btn"
                            title="Expand sidebar (⌘B)"
                        >
                            <PanelLeft className="h-4 w-4" />
                        </Button>
                    </div>
                )}

                {/* Navigation */}
                <nav className="sidebar-nav">
                    {navItems.map((section) => (
                        <div key={section.title} className="sidebar-section">
                            {!isCollapsed && (
                                <h3 className="sidebar-section-title">
                                    {section.title}
                                </h3>
                            )}
                            <ul className="sidebar-nav-list">
                                {section.items.map((item) => {
                                    const isActive = location.pathname === item.path ||
                                        (item.path !== '/' && location.pathname.startsWith(item.path));

                                    return (
                                        <li key={item.path}>
                                            <NavItem
                                                item={item}
                                                isActive={isActive}
                                                isCollapsed={isCollapsed}
                                                onClick={() => onClose?.()}
                                            />
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </nav>

                {/* Footer */}
                <div className={cn(
                    "sidebar-footer",
                    isCollapsed && "sidebar-footer--collapsed"
                )}>
                    {!isCollapsed ? (
                        <div className="sidebar-version">
                            <span>Version</span>
                            <span className="sidebar-version-number">1.1.0</span>
                        </div>
                    ) : (
                        <div className="sidebar-version-collapsed">
                            1.1
                        </div>
                    )}
                </div>
            </aside>
        </TooltipProvider>
    );
}
