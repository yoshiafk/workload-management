/**
 * Header Component
 * Clean professional top bar
 */

import { useLocation } from 'react-router-dom';
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

export default function Header({ onMenuClick }) {
    const location = useLocation();
    const title = pageTitles[location.pathname] || 'Dashboard';
    const description = pageDescriptions[location.pathname] || '';

    return (
        <header className="header glass-header">
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
                </div>
            </div>
        </header>
    );
}
