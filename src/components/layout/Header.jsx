/**
 * Header Component
 * Top navigation bar with page title and actions
 */

import { useLocation } from 'react-router-dom';
import './Header.css';

const pageTitles = {
    '/': 'Workload Summary',
    '/allocation': 'Resource Allocation',
    '/dates': 'Important Dates',
    '/library/members': 'Team Members',
    '/library/phases': 'Phases',
    '/library/tasks': 'Task Templates',
    '/library/complexity': 'Complexity Settings',
    '/library/costs': 'Resource Costs',
};

export default function Header() {
    const location = useLocation();
    const title = pageTitles[location.pathname] || 'Dashboard';

    return (
        <header className="header">
            <div className="header-left">
                <h1 className="page-title">{title}</h1>
            </div>

            <div className="header-right">
                <div className="header-date">
                    {new Date().toLocaleDateString('id-ID', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    })}
                </div>
            </div>
        </header>
    );
}
