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

export default function Header() {
    const location = useLocation();
    const title = pageTitles[location.pathname] || 'Dashboard';
    const description = pageDescriptions[location.pathname] || '';

    return (
        <header className="header">
            <div className="header-content">
                <div className="header-title-group">
                    <h1 className="page-title">{title}</h1>
                    {description && <p className="page-description">{description}</p>}
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
