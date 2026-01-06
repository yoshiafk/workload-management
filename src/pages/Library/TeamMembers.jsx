/**
 * Team Members Page
 */

import { useApp } from '../../context/AppContext';
import './LibraryPage.css';

export default function TeamMembers() {
    const { state } = useApp();

    return (
        <div className="library-page">
            <div className="page-header">
                <h2>Team Members</h2>
                <button className="btn btn-primary">+ Add Member</button>
            </div>

            <div className="data-table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Type</th>
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
                                        {member.type}
                                    </span>
                                </td>
                                <td>{member.maxHoursPerWeek}</td>
                                <td>
                                    <span className={`status-badge ${member.isActive ? 'active' : 'inactive'}`}>
                                        {member.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="cell-actions">
                                    <button className="btn-icon" title="Edit">✏️</button>
                                    <button className="btn-icon" title="Delete">🗑️</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
