/**
 * Workload Summary Page
 * Professional dashboard with clean statistics and data visualization
 */

import { useApp } from '../context/AppContext';
import { getMemberWorkloads } from '../utils/calculations';
import './WorkloadSummary.css';

export default function WorkloadSummary() {
    const { state } = useApp();
    const { members, allocations, tasks } = state;

    const memberWorkloads = getMemberWorkloads(allocations, members);

    // Get top 5 tasks for each member (sorted by end date)
    const getTopTasks = (memberName) => {
        return allocations
            .filter(a => a.resource === memberName && a.taskName !== 'Completed' && a.taskName !== 'Idle')
            .sort((a, b) => new Date(a.plan?.taskEnd) - new Date(b.plan?.taskEnd))
            .slice(0, 5);
    };

    // Count tasks by member for matrix
    const getTaskCount = (taskName, memberName) => {
        return allocations.filter(a =>
            a.taskName === taskName && a.resource === memberName
        ).length;
    };

    // Calculate stats
    const activeCount = allocations.filter(a => a.taskName !== 'Completed' && a.taskName !== 'Idle').length;
    const completedCount = allocations.filter(a => a.taskName === 'Completed').length;

    return (
        <div className="workload-summary">
            {/* Stats Overview */}
            <section className="stats-section">
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-header">
                            <span className="stat-label">Team Members</span>
                            <span className="stat-icon stat-icon-blue">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                            </span>
                        </div>
                        <div className="stat-value">{members.length}</div>
                        <div className="stat-footer">Active resources</div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-header">
                            <span className="stat-label">Total Allocations</span>
                            <span className="stat-icon stat-icon-purple">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                                    <rect x="8" y="2" width="8" height="4" rx="1" />
                                </svg>
                            </span>
                        </div>
                        <div className="stat-value">{allocations.length}</div>
                        <div className="stat-footer">Task assignments</div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-header">
                            <span className="stat-label">In Progress</span>
                            <span className="stat-icon stat-icon-amber">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                </svg>
                            </span>
                        </div>
                        <div className="stat-value">{activeCount}</div>
                        <div className="stat-footer">Active tasks</div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-header">
                            <span className="stat-label">Completed</span>
                            <span className="stat-icon stat-icon-green">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                            </span>
                        </div>
                        <div className="stat-value">{completedCount}</div>
                        <div className="stat-footer">Finished tasks</div>
                    </div>
                </div>
            </section>

            {/* Top Tasks per Member */}
            <section className="section">
                <div className="section-header">
                    <h2 className="section-title">Team Overview</h2>
                    <p className="section-subtitle">Top upcoming tasks for each team member</p>
                </div>

                <div className="member-grid">
                    {members.map(member => {
                        const topTasks = getTopTasks(member.name);
                        const workload = memberWorkloads.find(w => w.name === member.name);

                        return (
                            <div key={member.id} className="member-card">
                                <div className="member-header">
                                    <div className="member-avatar">
                                        {member.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="member-info">
                                        <h3 className="member-name">{member.name}</h3>
                                        <span className="member-role">{member.type === 'BA' ? 'Business Analyst' : 'Project Manager'}</span>
                                    </div>
                                    <div className="member-badge">
                                        <span className={`status-indicator ${workload?.activeCount > 0 ? 'active' : 'idle'}`}></span>
                                        {workload?.activeCount || 0} tasks
                                    </div>
                                </div>

                                <div className="task-list">
                                    {topTasks.length > 0 ? (
                                        topTasks.map((task, index) => (
                                            <div key={task.id} className="task-item">
                                                <span className="task-number">{index + 1}</span>
                                                <div className="task-content">
                                                    <span className="task-name">{task.activityName}</span>
                                                    <span className="task-phase">{task.phase}</span>
                                                </div>
                                                <span className="task-date">
                                                    {task.plan?.taskEnd
                                                        ? new Date(task.plan.taskEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                                        : '—'
                                                    }
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="empty-state">
                                            <p>No active tasks</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Task Allocation Matrix */}
            <section className="section">
                <div className="section-header">
                    <h2 className="section-title">Task Distribution</h2>
                    <p className="section-subtitle">Allocation count by task type and team member</p>
                </div>

                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th className="th-task">Task Type</th>
                                {members.map(member => (
                                    <th key={member.id} className="th-member">{member.name}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {tasks.filter(t => t.name !== 'Idle' && t.name !== 'Completed').map(task => (
                                <tr key={task.id}>
                                    <td className="td-task">{task.name}</td>
                                    {members.map(member => {
                                        const count = getTaskCount(task.name, member.name);
                                        return (
                                            <td key={member.id} className="td-count">
                                                {count > 0 ? (
                                                    <span className="count-badge">{count}</span>
                                                ) : (
                                                    <span className="count-empty">—</span>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
