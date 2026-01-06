/**
 * Team Members Page
 * Professional data table with clean design
 */

import { useApp } from '../../context/AppContext';
import './LibraryPage.css';

export default function TeamMembers() {
    const { state } = useApp();

    return (
        <div className="library-page">
            <div className="page-header">
                <h2>Team Members</h2>
                <button className="btn btn-primary">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add Member
                </button>
            </div>

            <div className="data-table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Role</th>
                            <th>Max Hours/Week</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {state.members.map(member => (
                            <tr key={member.id}>
                                <td className="cell-id">{member.id}</td>
                                <td className="cell-name">{member.name}</td>
                                <td>
                                    <span className={`type-badge ${member.type.toLowerCase()}`}>
                                        {member.type === 'BA' ? 'Business Analyst' : 'Project Manager'}
                                    </span>
                                </td>
                                <td>{member.maxHoursPerWeek}h</td>
                                <td>
                                    <span className={`status-badge ${member.isActive ? 'active' : 'inactive'}`}>
                                        {member.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="cell-actions">
                                    <button className="btn-icon" title="Edit">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                        </svg>
                                    </button>
                                    <button className="btn-icon" title="Delete">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="3 6 5 6 21 6" />
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                        </svg>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
