/**
 * Command Palette Component
 * Global command palette accessible via ⌘K (Mac) or Ctrl+K (Windows)
 * Built with cmdk for keyboard-first navigation
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command } from 'cmdk';
import {
    LayoutDashboard,
    ClipboardList,
    Clock,
    Calendar,
    Calculator,
    Users,
    Layers,
    ListTodo,
    Gauge,
    DollarSign,
    Settings,
    Plus,
    Search,
    Moon,
    Sun,
    Maximize2,
    Minimize2,
    HelpCircle,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useDensity } from '@/context/DensityContext';
import { cn } from '@/lib/utils';
import './CommandPalette.css';

// Storage key for recent commands
const RECENT_KEY = 'command-palette-recent';
const MAX_RECENT = 5;

export function CommandPalette({ open, onOpenChange }) {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const { isDense, toggleDensity } = useDensity();
    const [search, setSearch] = useState('');
    const [recentIds, setRecentIds] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
        } catch {
            return [];
        }
    });

    // Track command execution for recent items
    const trackRecent = useCallback((id) => {
        setRecentIds(prev => {
            const updated = [id, ...prev.filter(i => i !== id)].slice(0, MAX_RECENT);
            localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
            return updated;
        });
    }, []);

    // Execute command and close palette
    const runCommand = useCallback((callback, id) => {
        if (id) trackRecent(id);
        onOpenChange(false);
        callback();
    }, [onOpenChange, trackRecent]);

    // Reset search when closing
    useEffect(() => {
        if (!open) {
            setSearch('');
        }
    }, [open]);

    // Navigation commands
    const navigationCommands = [
        { id: 'nav-dashboard', label: 'Go to Dashboard', icon: LayoutDashboard, path: '/' },
        { id: 'nav-allocation', label: 'Go to Resource Allocation', icon: ClipboardList, path: '/allocation' },
        { id: 'nav-timeline', label: 'Go to Timeline', icon: Clock, path: '/timeline' },
        { id: 'nav-dates', label: 'Go to Important Dates', icon: Calendar, path: '/dates' },
        { id: 'nav-cost', label: 'Go to Cost Calculator', icon: Calculator, path: '/cost-calculator' },
        { id: 'nav-members', label: 'Go to Team Members', icon: Users, path: '/library/members' },
        { id: 'nav-phases', label: 'Go to Phases', icon: Layers, path: '/library/phases' },
        { id: 'nav-tasks', label: 'Go to Task Templates', icon: ListTodo, path: '/library/tasks' },
        { id: 'nav-complexity', label: 'Go to Complexity', icon: Gauge, path: '/library/complexity' },
        { id: 'nav-costs', label: 'Go to Resource Costs', icon: DollarSign, path: '/library/costs' },
        { id: 'nav-settings', label: 'Go to Settings', icon: Settings, path: '/settings' },
    ];

    // Action commands
    const actionCommands = [
        {
            id: 'action-new-allocation',
            label: 'Add New Allocation',
            icon: Plus,
            shortcut: 'N',
            action: () => {
                navigate('/allocation');
                // Dispatch custom event to open add modal
                setTimeout(() => {
                    window.dispatchEvent(new CustomEvent('open-add-allocation'));
                }, 100);
            }
        },
        {
            id: 'action-toggle-theme',
            label: theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode',
            icon: theme === 'dark' ? Sun : Moon,
            action: toggleTheme
        },
        {
            id: 'action-toggle-density',
            label: isDense ? 'Switch to Comfortable Mode' : 'Switch to Dense Mode',
            icon: isDense ? Maximize2 : Minimize2,
            shortcut: '⌘⇧D',
            action: toggleDensity
        },
    ];

    // Help commands
    const helpCommands = [
        {
            id: 'help-shortcuts',
            label: 'Keyboard Shortcuts',
            icon: HelpCircle,
            shortcut: '?',
            action: () => {
                // TODO: Open shortcuts help modal
                console.log('Open shortcuts help');
            }
        },
    ];

    // Get recent commands
    const recentCommands = recentIds
        .map(id => [...navigationCommands, ...actionCommands].find(c => c.id === id))
        .filter(Boolean);

    return (
        <Command.Dialog
            open={open}
            onOpenChange={onOpenChange}
            label="Command Palette"
            className="command-palette"
        >
            {/* Screen reader accessible title and description */}
            <div className="sr-only">
                <h2>Command Palette</h2>
                <p>Search for navigation, actions, and help commands.</p>
            </div>

            <div className="command-palette-header">
                <Search className="command-palette-search-icon" />
                <Command.Input
                    value={search}
                    onValueChange={setSearch}
                    placeholder="Type a command or search..."
                    className="command-palette-input"
                />
            </div>

            <Command.List className="command-palette-list">
                <Command.Empty className="command-palette-empty">
                    No results found.
                </Command.Empty>

                {/* Recent */}
                {recentCommands.length > 0 && !search && (
                    <Command.Group heading="Recent" className="command-palette-group">
                        {recentCommands.map((cmd) => (
                            <Command.Item
                                key={cmd.id}
                                value={cmd.label}
                                onSelect={() => runCommand(
                                    cmd.action || (() => navigate(cmd.path)),
                                    cmd.id
                                )}
                                className="command-palette-item"
                            >
                                <cmd.icon className="command-palette-item-icon" />
                                <span>{cmd.label}</span>
                            </Command.Item>
                        ))}
                    </Command.Group>
                )}

                {/* Navigation */}
                <Command.Group heading="Navigation" className="command-palette-group">
                    {navigationCommands.map((cmd) => (
                        <Command.Item
                            key={cmd.id}
                            value={cmd.label}
                            onSelect={() => runCommand(() => navigate(cmd.path), cmd.id)}
                            className="command-palette-item"
                        >
                            <cmd.icon className="command-palette-item-icon" />
                            <span>{cmd.label}</span>
                        </Command.Item>
                    ))}
                </Command.Group>

                {/* Actions */}
                <Command.Group heading="Actions" className="command-palette-group">
                    {actionCommands.map((cmd) => (
                        <Command.Item
                            key={cmd.id}
                            value={cmd.label}
                            onSelect={() => runCommand(cmd.action, cmd.id)}
                            className="command-palette-item"
                        >
                            <cmd.icon className="command-palette-item-icon" />
                            <span>{cmd.label}</span>
                            {cmd.shortcut && (
                                <kbd className="command-palette-shortcut">{cmd.shortcut}</kbd>
                            )}
                        </Command.Item>
                    ))}
                </Command.Group>

                {/* Help */}
                <Command.Group heading="Help" className="command-palette-group">
                    {helpCommands.map((cmd) => (
                        <Command.Item
                            key={cmd.id}
                            value={cmd.label}
                            onSelect={() => runCommand(cmd.action, cmd.id)}
                            className="command-palette-item"
                        >
                            <cmd.icon className="command-palette-item-icon" />
                            <span>{cmd.label}</span>
                            {cmd.shortcut && (
                                <kbd className="command-palette-shortcut">{cmd.shortcut}</kbd>
                            )}
                        </Command.Item>
                    ))}
                </Command.Group>
            </Command.List>

            <div className="command-palette-footer">
                <span>↑↓ Navigate</span>
                <span>↵ Select</span>
                <span>Esc Close</span>
            </div>
        </Command.Dialog>
    );
}

export default CommandPalette;
