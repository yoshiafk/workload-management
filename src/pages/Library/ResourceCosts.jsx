/**
 * Resource Costs Page
 * Full CRUD functionality with modal forms
 */

import { useState } from 'react';
import { useApp, ACTIONS } from '../../context/AppContext';
import { Modal, ModalFooter, FormInput, ConfirmDialog } from '../../components/ui';
import { formatCurrency } from '../../utils/calculations';
import './LibraryPage.css';

// Generate unique ID
const generateId = () => `COST-${Date.now().toString(36).toUpperCase()}`;

// Working days per month and hours per day constants
const WORKING_DAYS_PER_MONTH = 20;
const WORKING_HOURS_PER_DAY = 8;

// Empty cost template
const emptyCost = {
    id: '',
    resourceName: '',
    monthlyCost: 0,
    perDayCost: 0,
    perHourCost: 0,
};

export default function ResourceCosts() {
    const { state, dispatch } = useApp();

    // Modal states
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [editingCost, setEditingCost] = useState(null);
    const [costToDelete, setCostToDelete] = useState(null);

    // Form state
    const [formData, setFormData] = useState(emptyCost);
    const [errors, setErrors] = useState({});

    // Open add modal
    const handleAdd = () => {
        setFormData({ ...emptyCost, id: generateId() });
        setEditingCost(null);
        setErrors({});
        setIsFormOpen(true);
    };

    // Open edit modal
    const handleEdit = (cost) => {
        setFormData({ ...cost });
        setEditingCost(cost);
        setErrors({});
        setIsFormOpen(true);
    };

    // Open delete confirmation
    const handleDeleteClick = (cost) => {
        setCostToDelete(cost);
        setIsDeleteOpen(true);
    };

    // Handle form input change with auto-calculation
    const handleChange = (name, value) => {
        setFormData(prev => {
            const updated = { ...prev, [name]: value };

            // Auto-calculate per day and per hour when monthly cost changes
            if (name === 'monthlyCost' && typeof value === 'number') {
                updated.perDayCost = Math.round(value / WORKING_DAYS_PER_MONTH);
                updated.perHourCost = Math.round(value / WORKING_DAYS_PER_MONTH / WORKING_HOURS_PER_DAY);
            }

            return updated;
        });

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    // Validate form
    const validate = () => {
        const newErrors = {};
        if (!formData.resourceName.trim()) {
            newErrors.resourceName = 'Resource name is required';
        }
        if (!formData.monthlyCost || formData.monthlyCost < 0) {
            newErrors.monthlyCost = 'Monthly cost must be a positive number';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Submit form
    const handleSubmit = () => {
        if (!validate()) return;

        if (editingCost) {
            dispatch({ type: ACTIONS.UPDATE_COST, payload: formData });
        } else {
            dispatch({ type: ACTIONS.ADD_COST, payload: formData });
        }
        setIsFormOpen(false);
    };

    // Confirm delete
    const handleDeleteConfirm = () => {
        if (costToDelete) {
            dispatch({ type: ACTIONS.DELETE_COST, payload: costToDelete.id });
        }
        setCostToDelete(null);
    };

    return (
        <div className="library-page">
            <div className="page-header">
                <h2>Resource Costs</h2>
                <button className="btn btn-primary" onClick={handleAdd}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add Cost Tier
                </button>
            </div>

            <div className="data-table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Resource</th>
                            <th style={{ textAlign: 'right' }}>Monthly Cost</th>
                            <th style={{ textAlign: 'right' }}>Per Day</th>
                            <th style={{ textAlign: 'right' }}>Per Hour</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {state.costs.map(cost => (
                            <tr key={cost.id}>
                                <td className="cell-name">{cost.resourceName}</td>
                                <td className="cell-currency">{formatCurrency(cost.monthlyCost)}</td>
                                <td className="cell-currency">{formatCurrency(cost.perDayCost)}</td>
                                <td className="cell-currency">{formatCurrency(cost.perHourCost)}</td>
                                <td className="cell-actions">
                                    <button
                                        className="btn-icon"
                                        title="Edit"
                                        onClick={() => handleEdit(cost)}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                        </svg>
                                    </button>
                                    <button
                                        className="btn-icon btn-icon-danger"
                                        title="Delete"
                                        onClick={() => handleDeleteClick(cost)}
                                    >
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
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                title={editingCost ? 'Edit Cost Tier' : 'Add Cost Tier'}
                size="md"
            >
                <FormInput
                    label="Resource Name"
                    name="resourceName"
                    value={formData.resourceName}
                    onChange={handleChange}
                    error={errors.resourceName}
                    required
                    autoFocus
                    placeholder="e.g., Senior BA, Junior PM"
                />
                <FormInput
                    label="Monthly Cost (IDR)"
                    name="monthlyCost"
                    type="number"
                    value={formData.monthlyCost}
                    onChange={handleChange}
                    error={errors.monthlyCost}
                    required
                    min={0}
                    step={100000}
                    helpText="Per Day and Per Hour will be auto-calculated"
                />
                <div className="form-row">
                    <FormInput
                        label="Per Day (Auto)"
                        name="perDayCost"
                        type="number"
                        value={formData.perDayCost}
                        onChange={handleChange}
                        disabled
                    />
                    <FormInput
                        label="Per Hour (Auto)"
                        name="perHourCost"
                        type="number"
                        value={formData.perHourCost}
                        onChange={handleChange}
                        disabled
                    />
                </div>
                <ModalFooter>
                    <button className="btn btn-secondary" onClick={() => setIsFormOpen(false)}>
                        Cancel
                    </button>
                    <button className="btn btn-primary" onClick={handleSubmit}>
                        {editingCost ? 'Update' : 'Add'} Cost Tier
                    </button>
                </ModalFooter>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Delete Cost Tier"
                message={`Are you sure you want to delete "${costToDelete?.resourceName}"? Team members using this cost tier may be affected.`}
                confirmText="Delete"
                variant="danger"
            />
        </div>
    );
}
