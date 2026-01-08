/**
 * Member Task History Page
 * Shows all task assignments for a specific team member with performance metrics
 */

import { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/calculations';
import './MemberTaskHistory.css';

export default function MemberTaskHistory() {
    const { memberId } = useParams();
    const navigate = useNavigate();
    const { state } = useApp();
    const { members, allocations, phases, tasks } = state;

    // Find the member
    const member = members.find(m => m.id === memberId);

    // Get all allocations for this member
    const memberAllocations = useMemo(() => {
        if (!member) return [];
        return allocations
            .filter(a => a.resource === member.name)
            .sort((a, b) => new Date(b.plan?.taskStart) - new Date(a.plan?.taskStart));
    }, [allocations, member]);

    // Calculate stats
    const stats = useMemo(() => {
        const active = memberAllocations.filter(a => a.taskName !== 'Completed' && a.taskName !== 'Idle');
        const completed = memberAllocations.filter(a => a.taskName === 'Completed');
        const totalCost = memberAllocations.reduce((sum, a) => sum + (a.plan?.costProject || 0), 0);

        return {
            total: memberAllocations.length,
            active: active.length,
            completed: completed.length,
            totalCost,
        };
    }, [memberAllocations]);

    // Format date helper
    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    if (!member) {
        return (
            <div className="member-history-page">
                <div className="error-state">
                    <h2>Member Not Found</h2>
                    <p>The team member you're looking for doesn't exist.</p>
                    <button className="btn btn-primary" onClick={() => navigate('/')}>
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="member-history-page">
            {/* Header with back button inline */}
            <div className="page-header">
                <Link to="/" className="back-button" title="Back to Dashboard">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </Link>
                <div className="member-profile">
                    <div className="member-avatar large">
                        {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="member-details">
                        <h1>{member.name}</h1>
                        <span className="member-role">
                            {member.type === 'BA' ? 'Business Analyst' : 'Project Manager'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="stats-row">
                <div className="stat-item">
                    <span className="stat-value">{stats.total}</span>
                    <span className="stat-label">Total Tasks</span>
                </div>
                <div className="stat-item active">
                    <span className="stat-value">{stats.active}</span>
                    <span className="stat-label">Active</span>
                </div>
                <div className="stat-item completed">
                    <span className="stat-value">{stats.completed}</span>
                    <span className="stat-label">Completed</span>
                </div>
                <div className="stat-item">
                    <span className="stat-value">{formatCurrency(stats.totalCost)}</span>
                    <span className="stat-label">Total Cost</span>
                </div>
            </div>

            {/* Task History Table */}
            <section className="history-section">
                <h2>Task History</h2>
                <div className="table-container">
                    <table className="history-table">
                        <thead>
                            <tr>
                                <th>Demand #</th>
                                <th>Activity</th>
                                <th>Phase</th>
                                <th>Task Type</th>
                                <th>Category</th>
                                <th>Start Date</th>
                                <th>End Date</th>
                                <th>Cost</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {memberAllocations.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="empty-row">
                                        No tasks assigned to this member yet.
                                    </td>
                                </tr>
                            ) : (
                                memberAllocations.map(allocation => {
                                    const isActive = allocation.taskName !== 'Completed' && allocation.taskName !== 'Idle';
                                    const isCompleted = allocation.taskName === 'Completed';

                                    return (
                                        <tr key={allocation.id} className={isCompleted ? 'completed' : ''}>
                                            <td className="cell-demand">{allocation.demandNumber || '—'}</td>
                                            <td className="cell-activity">{allocation.activityName}</td>
                                            <td>{allocation.phase || '—'}</td>
                                            <td>{allocation.taskName}</td>
                                            <td>
                                                <span className={`category-badge category-${allocation.category}`}>
                                                    {allocation.category}
                                                </span>
                                            </td>
                                            <td>{formatDate(allocation.plan?.taskStart)}</td>
                                            <td>{formatDate(allocation.plan?.taskEnd)}</td>
                                            <td className="cell-cost">{formatCurrency(allocation.plan?.costProject || 0)}</td>
                                            <td>
                                                <span className={`status-badge ${isCompleted ? 'completed' : isActive ? 'active' : 'idle'}`}>
                                                    {isCompleted ? 'Completed' : isActive ? 'Active' : 'Idle'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
