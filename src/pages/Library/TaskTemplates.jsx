/**
 * Task Templates Page
 */

import { useApp } from '../../context/AppContext';
import { formatPercentage } from '../../utils/calculations';
import './LibraryPage.css';

export default function TaskTemplates() {
    const { state } = useApp();

    return (
        <div className="library-page">
            <div className="page-header">
                <h2>Task Templates</h2>
                <button className="btn btn-primary">+ Add Task</button>
            </div>

            <div className="data-table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Task Name</th>
                            <th colSpan="3" className="complexity-header">Low</th>
                            <th colSpan="3" className="complexity-header">Medium</th>
                            <th colSpan="3" className="complexity-header">High</th>
                        </tr>
                        <tr className="sub-header">
                            <th></th>
                            <th></th>
                            <th>Days</th>
                            <th>Hours</th>
                            <th>%</th>
                            <th>Days</th>
                            <th>Hours</th>
                            <th>%</th>
                            <th>Days</th>
                            <th>Hours</th>
                            <th>%</th>
                        </tr>
                    </thead>
                    <tbody>
                        {state.tasks.map(task => (
                            <tr key={task.id}>
                                <td className="cell-id">{task.id}</td>
                                <td className="cell-name">{task.name}</td>
                                <td>{task.estimates.low.days}</td>
                                <td>{task.estimates.low.hours}</td>
                                <td className="cell-pct">{formatPercentage(task.estimates.low.percentage)}</td>
                                <td>{task.estimates.medium.days}</td>
                                <td>{task.estimates.medium.hours}</td>
                                <td className="cell-pct">{formatPercentage(task.estimates.medium.percentage)}</td>
                                <td>{task.estimates.high.days}</td>
                                <td>{task.estimates.high.hours}</td>
                                <td className="cell-pct">{formatPercentage(task.estimates.high.percentage)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
