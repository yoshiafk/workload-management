/**
 * Sidebar Component
 * Navigation menu with links to all pages
 */

import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const navItems = [
    {
        title: 'Dashboard',
        items: [
            { path: '/', label: 'Workload Summary', icon: '📊' },
        ],
    },
    {
        title: 'Management',
        items: [
            { path: '/allocation', label: 'Resource Allocation', icon: '📋' },
            { path: '/dates', label: 'Important Dates', icon: '📅' },
        ],
    },
    {
        title: 'Configuration',
        items: [
            { path: '/library/members', label: 'Team Members', icon: '👥' },
            { path: '/library/phases', label: 'Phases', icon: '🔄' },
            { path: '/library/tasks', label: 'Task Templates', icon: '📝' },
            { path: '/library/complexity', label: 'Complexity', icon: '⚡' },
            { path: '/library/costs', label: 'Resource Costs', icon: '💰' },
        ],
    },
];

export default function Sidebar() {
    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="logo">
                    <span className="logo-icon">⚙️</span>
                    <span className="logo-text">WRM</span>
                </div>
                <p className="logo-subtitle">Workload Resource Management</p>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((section) => (
                    <div key={section.title} className="nav-section">
                        <h3 className="nav-section-title">{section.title}</h3>
                        <ul className="nav-list">
                            {section.items.map((item) => (
                                <li key={item.path}>
                                    <NavLink
                                        to={item.path}
                                        className={({ isActive }) =>
                                            `nav-link ${isActive ? 'active' : ''}`
                                        }
                                    >
                                        <span className="nav-icon">{item.icon}</span>
                                        <span className="nav-label">{item.label}</span>
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </nav>

            <div className="sidebar-footer">
                <p className="version">v1.0.0</p>
            </div>
        </aside>
    );
}
