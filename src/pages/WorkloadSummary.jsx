/**
 * Workload Summary Page
 * Dashboard showing top 5 tasks per member and task allocation matrix
 */

import { useApp } from '../context/AppContext';
import { getMemberWorkloads, formatPercentage } from '../utils/calculations';
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

    return (
        <div className="workload-summary">
            {/* Stats Overview */}
            <section className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">👥</div>
                    <div className="stat-content">
                        <h3 className="stat-value">{members.length}</h3>
                        <p className="stat-label">Team Members</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">📋</div>
                    <div className="stat-content">
                        <h3 className="stat-value">{allocations.length}</h3>
                        <p className="stat-label">Total Allocations</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">✅</div>
                    <div className="stat-content">
                        <h3 className="stat-value">
                            {allocations.filter(a => a.taskName === 'Completed').length}
                        </h3>
                        <p className="stat-label">Completed</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">🔄</div>
                    <div className="stat-content">
                        <h3 className="stat-value">
                            {allocations.filter(a => a.taskName !== 'Completed' && a.taskName !== 'Idle').length}
                        </h3>
                        <p className="stat-label">In Progress</p>
                    </div>
                </div>
            </section>

            {/* Top 5 Tasks per Member */}
            <section className="section">
                <h2 className="section-title">Top 5 Tasks per Team Member</h2>
                <div className="member-cards">
                    {members.map(member => {
                        const topTasks = getTopTasks(member.name);
                        const workload = memberWorkloads.find(w => w.name === member.name);

                        return (
                            <div key={member.id} className="member-card">
                                <div className="member-header">
                                    <span className="member-avatar">
                                        {member.name.charAt(0).toUpperCase()}
                                    </span>
                                    <div className="member-info">
                                        <h3 className="member-name">{member.name}</h3>
                                        <p className="member-type">{member.type}</p>
                                    </div>
                                    <div className="member-stats">
                                        <span className="workload-badge">
                                            {workload?.activeCount || 0} active
                                        </span>
                                    </div>
                                </div>

                                <div className="task-list">
                                    {topTasks.length > 0 ? (
                                        topTasks.map((task, index) => (
                                            <div key={task.id} className="task-item">
                                                <span className="task-rank">{index + 1}</span>
                                                <div className="task-details">
                                                    <span className="task-name">{task.activityName}</span>
                                                    <span className="task-date">
                                                        {task.plan?.taskEnd
                                                            ? new Date(task.plan.taskEnd).toLocaleDateString('id-ID')
                                                            : '-'
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="no-tasks">No active tasks</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Task Allocation Matrix */}
            <section className="section">
                <h2 className="section-title">Task Allocation Matrix</h2>
                <div className="matrix-container">
                    <table className="matrix-table">
                        <thead>
                            <tr>
                                <th className="matrix-header">Task</th>
                                {members.map(member => (
                                    <th key={member.id} className="matrix-header member-col">
                                        {member.name}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {tasks.map(task => (
                                <tr key={task.id}>
                                    <td className="matrix-cell task-name-cell">{task.name}</td>
                                    {members.map(member => {
                                        const count = getTaskCount(task.name, member.name);
                                        return (
                                            <td key={member.id} className="matrix-cell count-cell">
                                                <span className={`count-badge ${count > 0 ? 'has-count' : ''}`}>
                                                    {count}
                                                </span>
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
