/**
 * Task Templates Page
 * Full CRUD for task templates with complexity estimates
 */

import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatPercentage } from '../../utils/calculations';
import Modal, { ModalFooter } from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import './LibraryPage.css';

const initialFormState = {
    id: '',
    name: '',
    phaseId: '',
    estimates: {
        low: { days: 2, hours: 1, percentage: 0.125 },
        medium: { days: 5, hours: 2, percentage: 0.25 },
        high: { days: 10, hours: 4, percentage: 0.5 },
        sophisticated: { days: 20, hours: 6, percentage: 0.75 },
    },
};

export default function TaskTemplates() {
    const { state, dispatch, ACTIONS } = useApp();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [currentTask, setCurrentTask] = useState(null);
    const [formData, setFormData] = useState(initialFormState);

    const handleAdd = () => {
        const nextId = `T${String(state.tasks.length + 1).padStart(3, '0')}`;
        setFormData({ ...initialFormState, id: nextId });
        setCurrentTask(null);
        setIsModalOpen(true);
    };

    const handleEdit = (task) => {
        // Merge with initial form state to ensure estimates structure exists
        const mergedFormData = {
            ...initialFormState,
            ...task,
            estimates: {
                ...initialFormState.estimates,
                ...task.estimates,
                low: { ...initialFormState.estimates.low, ...task.estimates?.low },
                medium: { ...initialFormState.estimates.medium, ...task.estimates?.medium },
                high: { ...initialFormState.estimates.high, ...task.estimates?.high },
                sophisticated: { ...initialFormState.estimates.sophisticated, ...task.estimates?.sophisticated },
            },
        };
        setFormData(mergedFormData);
        setCurrentTask(task);
        setIsModalOpen(true);
    };

    const handleDelete = (task) => {
        setCurrentTask(task);
        setIsDeleteOpen(true);
    };

    const confirmDelete = () => {
        if (currentTask) {
            dispatch({ type: ACTIONS.DELETE_TASK, payload: currentTask.id });
        }
        setIsDeleteOpen(false);
        setCurrentTask(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (currentTask) {
            dispatch({ type: ACTIONS.UPDATE_TASK, payload: formData });
        } else {
            dispatch({ type: ACTIONS.ADD_TASK, payload: formData });
        }
        setIsModalOpen(false);
        setFormData(initialFormState);
    };

    const updateEstimate = (level, field, value) => {
        const numValue = parseInt(value, 10) || 0;
        const updatedEstimate = {
            ...formData.estimates[level],
            [field]: numValue,
        };

        // Auto-calculate workload percentage: hours / (days * 8)
        if (field === 'hours' || field === 'days') {
            const hours = field === 'hours' ? numValue : formData.estimates[level].hours;
            const days = field === 'days' ? numValue : formData.estimates[level].days;

            if (days > 0) {
                updatedEstimate.percentage = hours / (days * 8);
            } else {
                updatedEstimate.percentage = 0;
            }
        }

        setFormData({
            ...formData,
            estimates: {
                ...formData.estimates,
                [level]: updatedEstimate,
            },
        });
    };

    return (
        <div className="library-page">
            <div className="page-header">
                <h2>Task Templates</h2>
                <button className="btn btn-primary" onClick={handleAdd}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add Task
                </button>
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
                            <th colSpan="3" className="complexity-header">Sophisticated</th>
                            <th>Actions</th>
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
                            <th>Days</th>
                            <th>Hours</th>
                            <th>%</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {state.tasks.map(task => (
                            <tr key={task.id}>
                                <td className="cell-id">{task.id}</td>
                                <td className="cell-name">{task.name}</td>
                                <td>{task.estimates?.low?.days ?? 0}</td>
                                <td>{task.estimates?.low?.hours ?? 0}</td>
                                <td className="cell-pct">{formatPercentage(task.estimates?.low?.percentage ?? 0)}</td>
                                <td>{task.estimates?.medium?.days ?? 0}</td>
                                <td>{task.estimates?.medium?.hours ?? 0}</td>
                                <td className="cell-pct">{formatPercentage(task.estimates?.medium?.percentage ?? 0)}</td>
                                <td>{task.estimates?.high?.days ?? 0}</td>
                                <td>{task.estimates?.high?.hours ?? 0}</td>
                                <td className="cell-pct">{formatPercentage(task.estimates?.high?.percentage ?? 0)}</td>
                                <td>{task.estimates?.sophisticated?.days ?? 0}</td>
                                <td>{task.estimates?.sophisticated?.hours ?? 0}</td>
                                <td className="cell-pct">{formatPercentage(task.estimates?.sophisticated?.percentage ?? 0)}</td>
                                <td className="cell-actions">
                                    <button className="btn-icon" onClick={() => handleEdit(task)} title="Edit">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                        </svg>
                                    </button>
                                    <button className="btn-icon btn-danger" onClick={() => handleDelete(task)} title="Delete">
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

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={currentTask ? 'Edit Task Template' : 'Add Task Template'}
                size="lg"
            >
                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Task ID</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.id}
                                readOnly
                            />
                        </div>
                        <div className="form-group">
                            <label>Task Name</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Stakeholder Interviews"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Phase</label>
                            <select
                                className="form-select"
                                value={formData.phaseId || ''}
                                onChange={(e) => setFormData({ ...formData, phaseId: e.target.value })}
                            >
                                <option value="">Select Phase...</option>
                                {state.phases.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <h4 className="section-title">Complexity Estimates</h4>
                    <div className="complexity-grid">
                        {['low', 'medium', 'high', 'sophisticated'].map(level => (
                            <div key={level} className="complexity-card">
                                <h5 className="complexity-label">{level.charAt(0).toUpperCase() + level.slice(1)}</h5>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Days</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={formData.estimates[level].days}
                                            onChange={(e) => updateEstimate(level, 'days', e.target.value)}
                                            min="0"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Hours</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={formData.estimates[level].hours}
                                            onChange={(e) => updateEstimate(level, 'hours', e.target.value)}
                                            min="0"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Workload</label>
                                        <input
                                            type="text"
                                            className="form-input form-input-calc"
                                            value={`${(formData.estimates[level].percentage * 100).toFixed(1)}%`}
                                            readOnly
                                            title="Auto-calculated: Hours / 8"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <ModalFooter>
                        <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {currentTask ? 'Update' : 'Create'}
                        </button>
                    </ModalFooter>
                </form>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Task Template"
                message={`Are you sure you want to delete "${currentTask?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                variant="danger"
            />
        </div>
    );
}
