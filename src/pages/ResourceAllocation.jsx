/**
 * Resource Allocation Page
 * Full table with CRUD and auto-calculations
 */

import { useState, useMemo } from 'react';
import { useApp, ACTIONS } from '../context/AppContext';
import { Modal, ModalFooter, FormInput, ConfirmDialog } from '../components/ui';
import {
    formatCurrency,
    formatPercentage,
    calculatePlanEndDate,
    calculateProjectCost,
    calculateMonthlyCost,
    calculateWorkloadPercentage,
} from '../utils/calculations';
import './ResourceAllocation.css';

// Generate unique ID
const generateId = () => `ALLOC-${Date.now().toString(36).toUpperCase()}`;

// Empty allocation template
const emptyAllocation = {
    id: '',
    activityName: '',
    resource: '',
    category: 'medium',
    phase: '',
    taskName: '',
    plan: {
        taskStart: '',
        taskEnd: '',
        costProject: 0,
        costMonthly: 0,
    },
    actual: {
        taskStart: '',
        taskEnd: '',
    },
    workload: 0,
    remarks: '',
};

export default function ResourceAllocation() {
    const { state, dispatch } = useApp();
    const { members, phases, tasks, allocations, holidays, leaves, complexity, costs } = state;

    // Modal states
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
    const [editingAllocation, setEditingAllocation] = useState(null);
    const [allocationToDelete, setAllocationToDelete] = useState(null);
    const [selectedIds, setSelectedIds] = useState(new Set());

    // Form state
    const [formData, setFormData] = useState(emptyAllocation);
    const [errors, setErrors] = useState({});

    // Dropdown options
    const memberOptions = members.map(m => ({ value: m.name, label: m.name }));
    const phaseOptions = phases.map(p => ({ value: p.name, label: p.name }));

    // Dynamically filter tasks based on selected phase
    const taskOptions = useMemo(() => {
        const selectedPhase = phases.find(p => p.name === formData.phase);
        return tasks
            .filter(t => !formData.phase || t.phaseId === selectedPhase?.id)
            .map(t => ({ value: t.name, label: t.name }));
    }, [tasks, formData.phase, phases]);

    const categoryOptions = Object.values(complexity).map(level => ({
        value: level.level.toLowerCase(),
        label: level.label
    }));

    // Calculate plan values when relevant form data changes
    const calculatedPlan = useMemo(() => {
        if (!formData.plan?.taskStart || !formData.resource || !formData.category) {
            return { taskEnd: '', costProject: 0, costMonthly: 0 };
        }

        // Find the member to get their costTierId
        const member = state.members.find(m => m.name === formData.resource);
        const costTierId = member?.costTierId;

        const taskEnd = calculatePlanEndDate(
            formData.plan.taskStart,
            formData.category,
            formData.resource,
            holidays,
            leaves,
            complexity
        );

        const costProject = calculateProjectCost(
            formData.category,
            costTierId || formData.resource, // Use ID if found, fallback to name
            complexity,
            costs
        );

        const costMonthly = calculateMonthlyCost(
            costProject,
            formData.plan.taskStart,
            taskEnd
        );

        return {
            taskEnd: taskEnd.toISOString().split('T')[0],
            costProject,
            costMonthly,
        };
    }, [formData.plan?.taskStart, formData.resource, formData.category, holidays, leaves, complexity, costs, state.members]);

    // Open add modal
    const handleAdd = () => {
        setFormData({ ...emptyAllocation, id: generateId() });
        setEditingAllocation(null);
        setErrors({});
        setIsFormOpen(true);
    };

    // Open edit modal
    const handleEdit = (allocation) => {
        setFormData({ ...allocation });
        setEditingAllocation(allocation);
        setErrors({});
        setIsFormOpen(true);
    };

    // Open delete confirmation
    const handleDeleteClick = (allocation) => {
        setAllocationToDelete(allocation);
        setIsDeleteOpen(true);
    };

    // Handle form input change
    const handleChange = (name, value) => {
        setFormData(prev => {
            let next = { ...prev };

            // Handle nested properties (plan.taskStart, actual.taskEnd, etc.)
            if (name.includes('.')) {
                const [parent, child] = name.split('.');
                next[parent] = {
                    ...prev[parent],
                    [child]: value,
                };
            } else {
                next[name] = value;
            }

            // Task-Phase Mapping Logic
            if (name === 'phase') {
                const selectedPhase = phases.find(p => p.name === value);
                const currentTask = tasks.find(t => t.name === prev.taskName);
                // If a phase is selected and the current task doesn't belong to it, clear task
                if (value && currentTask && currentTask.phaseId !== selectedPhase?.id) {
                    next.taskName = '';
                }
            } else if (name === 'taskName') {
                const selectedTask = tasks.find(t => t.name === value);
                // If a task is selected, auto-select its phase
                if (value && selectedTask) {
                    const taskPhase = phases.find(p => p.id === selectedTask.phaseId);
                    if (taskPhase && prev.phase !== taskPhase.name) {
                        next.phase = taskPhase.name;
                    }
                }
            }

            return next;
        });

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    // Validate form
    const validate = () => {
        const newErrors = {};
        if (!formData.activityName.trim()) {
            newErrors.activityName = 'Activity name is required';
        }
        if (!formData.resource) {
            newErrors.resource = 'Resource is required';
        }
        if (!formData.taskName) {
            newErrors.taskName = 'Task is required';
        }
        if (!formData.plan?.taskStart) {
            newErrors['plan.taskStart'] = 'Start date is required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Submit form
    const handleSubmit = () => {
        if (!validate()) return;

        // Calculate workload
        const workload = calculateWorkloadPercentage(
            formData.taskName,
            formData.category,
            tasks
        );

        const allocationData = {
            ...formData,
            plan: {
                ...formData.plan,
                taskEnd: calculatedPlan.taskEnd,
                costProject: calculatedPlan.costProject,
                costMonthly: calculatedPlan.costMonthly,
            },
            workload,
        };

        if (editingAllocation) {
            dispatch({ type: ACTIONS.UPDATE_ALLOCATION, payload: allocationData });
        } else {
            dispatch({ type: ACTIONS.ADD_ALLOCATION, payload: allocationData });
        }
        setIsFormOpen(false);
    };

    // Confirm delete
    const handleDeleteConfirm = () => {
        if (allocationToDelete) {
            dispatch({ type: ACTIONS.DELETE_ALLOCATION, payload: allocationToDelete.id });
        }
        setAllocationToDelete(null);
    };

    // Selection handlers
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(new Set(allocations.map(a => a.id)));
        } else {
            setSelectedIds(new Set());
        }
    };

    const handleSelectRow = (id) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    // Bulk delete handlers
    const handleBulkDeleteClick = () => {
        if (selectedIds.size > 0) {
            setIsBulkDeleteOpen(true);
        }
    };

    const handleBulkDeleteConfirm = () => {
        selectedIds.forEach(id => {
            dispatch({ type: ACTIONS.DELETE_ALLOCATION, payload: id });
        });
        setSelectedIds(new Set());
        setIsBulkDeleteOpen(false);
    };

    // Format date for display
    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <div className="allocation-page">
            <div className="page-header">
                <div>
                    <h2>Resource Allocation</h2>
                    <p className="page-subtitle">{allocations.length} allocations total</p>
                </div>
                <div className="header-actions">
                    {selectedIds.size > 0 && (
                        <button className="btn btn-danger" onClick={handleBulkDeleteClick}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                            Delete ({selectedIds.size})
                        </button>
                    )}
                    <button className="btn btn-primary" onClick={handleAdd}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Add Allocation
                    </button>
                </div>
            </div>

            <div className="allocation-table-container">
                <table className="allocation-table">
                    <thead>
                        <tr>
                            <th className="cell-checkbox">
                                <input
                                    type="checkbox"
                                    checked={allocations.length > 0 && selectedIds.size === allocations.length}
                                    onChange={handleSelectAll}
                                    title="Select all"
                                />
                            </th>
                            <th>Activity</th>
                            <th>Resource</th>
                            <th>Category</th>
                            <th>Phase</th>
                            <th>Task</th>
                            <th>Plan Start</th>
                            <th>Plan End</th>
                            <th>Cost</th>
                            <th>Workload</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allocations.length === 0 ? (
                            <tr>
                                <td colSpan="11" className="empty-row">
                                    <div className="empty-state">
                                        <p>No allocations yet</p>
                                        <p className="empty-hint">Click "Add Allocation" to create your first task allocation</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            allocations.map(allocation => (
                                <tr key={allocation.id} className={selectedIds.has(allocation.id) ? 'selected' : ''}>
                                    <td className="cell-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.has(allocation.id)}
                                            onChange={() => handleSelectRow(allocation.id)}
                                        />
                                    </td>
                                    <td className="cell-name">{allocation.activityName}</td>
                                    <td>{allocation.resource}</td>
                                    <td>
                                        <span className={`category-badge category-${allocation.category}`}>
                                            {allocation.category}
                                        </span>
                                    </td>
                                    <td>{allocation.phase || '—'}</td>
                                    <td>{allocation.taskName}</td>
                                    <td className="cell-date">{formatDate(allocation.plan?.taskStart)}</td>
                                    <td className="cell-date">{formatDate(allocation.plan?.taskEnd)}</td>
                                    <td className="cell-currency">{formatCurrency(allocation.plan?.costProject || 0)}</td>
                                    <td className="cell-workload">
                                        <span className="workload-badge">
                                            {formatPercentage(allocation.workload || 0)}
                                        </span>
                                    </td>
                                    <td className="cell-actions">
                                        <button
                                            className="btn-icon"
                                            title="Edit"
                                            onClick={() => handleEdit(allocation)}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                            </svg>
                                        </button>
                                        <button
                                            className="btn-icon btn-icon-danger"
                                            title="Delete"
                                            onClick={() => handleDeleteClick(allocation)}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="3 6 5 6 21 6" />
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                title={editingAllocation ? 'Edit Allocation' : 'Add Allocation'}
                size="lg"
            >
                <div className="form-row">
                    <FormInput
                        label="Activity Name"
                        name="activityName"
                        value={formData.activityName}
                        onChange={handleChange}
                        error={errors.activityName}
                        required
                        autoFocus
                        placeholder="e.g., Project X - Requirements"
                    />
                    <FormInput
                        label="Resource"
                        name="resource"
                        type="select"
                        value={formData.resource}
                        onChange={handleChange}
                        error={errors.resource}
                        required
                        options={memberOptions}
                    />
                </div>

                <div className="form-row">
                    <FormInput
                        label="Category (Complexity)"
                        name="category"
                        type="select"
                        value={formData.category}
                        onChange={handleChange}
                        options={categoryOptions}
                    />
                    <FormInput
                        label="Phase"
                        name="phase"
                        type="select"
                        value={formData.phase}
                        onChange={handleChange}
                        options={phaseOptions}
                    />
                </div>

                <div className="form-row">
                    <FormInput
                        label="Task"
                        name="taskName"
                        type="select"
                        value={formData.taskName}
                        onChange={handleChange}
                        error={errors.taskName}
                        required
                        options={taskOptions}
                    />
                    <FormInput
                        label="Plan Start Date"
                        name="plan.taskStart"
                        type="date"
                        value={formData.plan?.taskStart || ''}
                        onChange={handleChange}
                        error={errors['plan.taskStart']}
                        required
                    />
                </div>

                <div className="calculated-fields">
                    <h4>Auto-Calculated Values</h4>
                    <div className="calculated-row">
                        <div className="calculated-item">
                            <span className="calculated-label">Plan End Date</span>
                            <span className="calculated-value">
                                {calculatedPlan.taskEnd ? formatDate(calculatedPlan.taskEnd) : '—'}
                            </span>
                        </div>
                        <div className="calculated-item">
                            <span className="calculated-label">Project Cost</span>
                            <span className="calculated-value">{formatCurrency(calculatedPlan.costProject)}</span>
                        </div>
                        <div className="calculated-item">
                            <span className="calculated-label">Monthly Cost</span>
                            <span className="calculated-value">{formatCurrency(calculatedPlan.costMonthly)}</span>
                        </div>
                    </div>
                </div>

                <FormInput
                    label="Remarks"
                    name="remarks"
                    type="textarea"
                    value={formData.remarks}
                    onChange={handleChange}
                    placeholder="Optional notes or comments"
                    rows={2}
                />

                <ModalFooter>
                    <button className="btn btn-secondary" onClick={() => setIsFormOpen(false)}>
                        Cancel
                    </button>
                    <button className="btn btn-primary" onClick={handleSubmit}>
                        {editingAllocation ? 'Update' : 'Add'} Allocation
                    </button>
                </ModalFooter>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Delete Allocation"
                message={`Are you sure you want to delete "${allocationToDelete?.activityName}"? This action cannot be undone.`}
                confirmText="Delete"
                variant="danger"
            />

            {/* Bulk Delete Confirmation */}
            <ConfirmDialog
                isOpen={isBulkDeleteOpen}
                onClose={() => setIsBulkDeleteOpen(false)}
                onConfirm={handleBulkDeleteConfirm}
                title="Delete Selected Allocations"
                message={`Are you sure you want to delete ${selectedIds.size} selected allocation(s)? This action cannot be undone.`}
                confirmText={`Delete ${selectedIds.size} Items`}
                variant="danger"
            />
        </div>
    );
}
