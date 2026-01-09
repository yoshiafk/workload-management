/**
 * Resource Costs Page
 * Full CRUD functionality with modal forms
 * Now includes role-based tiering with min/max cost ranges
 */

import { useState } from 'react';
import { useApp, ACTIONS } from '../../context/AppContext';
import { Modal, ModalFooter, FormInput, ConfirmDialog } from '../../components/ui';
import { formatCurrency } from '../../utils/calculations';
import { defaultRoleTiers, getTierByRoleAndLevel, getRoleOptions } from '../../data';
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
    roleType: 'FULLSTACK',
    tierLevel: 1,
    minMonthlyCost: 8000000,
    maxMonthlyCost: 12000000,
    monthlyCost: 10000000,
    perDayCost: 0,
    perHourCost: 0,
};

// Get tier name for display
const getTierName = (roleType, level) => {
    const tier = getTierByRoleAndLevel(roleType, level);
    return tier ? tier.name : `Tier ${level}`;
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
        const tier = getTierByRoleAndLevel('FULLSTACK', 1);
        setFormData({
            ...emptyCost,
            id: generateId(),
            resourceName: tier?.name || 'Junior Fullstack',
            minMonthlyCost: tier?.minCost || 8000000,
            maxMonthlyCost: tier?.maxCost || 12000000,
            monthlyCost: tier?.midCost || 10000000,
            perDayCost: Math.round((tier?.midCost || 10000000) / WORKING_DAYS_PER_MONTH),
            perHourCost: Math.round((tier?.midCost || 10000000) / WORKING_DAYS_PER_MONTH / WORKING_HOURS_PER_DAY),
        });
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

            // When role type or tier level changes, update min/max and auto-set monthly cost
            if (name === 'roleType' || name === 'tierLevel') {
                const newRoleType = name === 'roleType' ? value : prev.roleType;
                const newTierLevel = name === 'tierLevel' ? value : prev.tierLevel;
                const tier = getTierByRoleAndLevel(newRoleType, newTierLevel);

                if (tier) {
                    updated.minMonthlyCost = tier.minCost;
                    updated.maxMonthlyCost = tier.maxCost;
                    updated.monthlyCost = tier.midCost;
                    updated.resourceName = tier.name;
                    // Auto-calculate rates
                    updated.perDayCost = Math.round(tier.midCost / WORKING_DAYS_PER_MONTH);
                    updated.perHourCost = Math.round(tier.midCost / WORKING_DAYS_PER_MONTH / WORKING_HOURS_PER_DAY);
                }
            }

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
        // Validate monthly cost within tier range
        if (formData.monthlyCost < formData.minMonthlyCost) {
            newErrors.monthlyCost = `Monthly cost must be at least ${formatCurrency(formData.minMonthlyCost)}`;
        }
        if (formData.monthlyCost > formData.maxMonthlyCost) {
            newErrors.monthlyCost = `Monthly cost must not exceed ${formatCurrency(formData.maxMonthlyCost)}`;
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

    // Generate tier level options based on role type
    const getTierLevelOptions = (roleType) => {
        const role = defaultRoleTiers[roleType];
        if (!role) return [];
        return role.tiers.map(tier => ({
            value: tier.level,
            label: `Tier ${tier.level}: ${tier.name}`
        }));
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
                            <th>Role</th>
                            <th>Tier</th>
                            <th style={{ textAlign: 'right' }}>Min Cost</th>
                            <th style={{ textAlign: 'right' }}>Monthly Cost</th>
                            <th style={{ textAlign: 'right' }}>Max Cost</th>
                            <th style={{ textAlign: 'right' }}>Per Hour</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {state.costs.map(cost => (
                            <tr key={cost.id}>
                                <td className="cell-name">{cost.resourceName}</td>
                                <td>
                                    <span className={`type-badge ${(cost.roleType || 'FULLSTACK').toLowerCase()}`}>
                                        {defaultRoleTiers[cost.roleType]?.name || cost.roleType}
                                    </span>
                                </td>
                                <td>
                                    <span className="tier-badge">
                                        Tier {cost.tierLevel || 1}
                                    </span>
                                </td>
                                <td className="cell-currency cell-muted">{formatCurrency(cost.minMonthlyCost || 0)}</td>
                                <td className="cell-currency">{formatCurrency(cost.monthlyCost)}</td>
                                <td className="cell-currency cell-muted">{formatCurrency(cost.maxMonthlyCost || 0)}</td>
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
                <div className="form-row">
                    <FormInput
                        label="Role Type"
                        name="roleType"
                        type="select"
                        value={formData.roleType}
                        onChange={handleChange}
                        required
                        options={getRoleOptions()}
                    />
                    <FormInput
                        label="Tier Level"
                        name="tierLevel"
                        type="select"
                        value={formData.tierLevel}
                        onChange={handleChange}
                        required
                        options={getTierLevelOptions(formData.roleType)}
                    />
                </div>
                <FormInput
                    label="Resource Name"
                    name="resourceName"
                    value={formData.resourceName}
                    onChange={handleChange}
                    error={errors.resourceName}
                    required
                    placeholder="e.g., Senior BA, Junior PM"
                    helpText="Auto-populated from tier selection, can be customized"
                />
                <div className="form-row">
                    <FormInput
                        label="Min Cost (IDR)"
                        name="minMonthlyCost"
                        type="number"
                        value={formData.minMonthlyCost}
                        onChange={handleChange}
                        disabled
                    />
                    <FormInput
                        label="Max Cost (IDR)"
                        name="maxMonthlyCost"
                        type="number"
                        value={formData.maxMonthlyCost}
                        onChange={handleChange}
                        disabled
                    />
                </div>
                <FormInput
                    label="Monthly Cost (IDR)"
                    name="monthlyCost"
                    type="number"
                    value={formData.monthlyCost}
                    onChange={handleChange}
                    error={errors.monthlyCost}
                    required
                    min={formData.minMonthlyCost}
                    max={formData.maxMonthlyCost}
                    step={100000}
                    helpText={`Must be between ${formatCurrency(formData.minMonthlyCost)} and ${formatCurrency(formData.maxMonthlyCost)}`}
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
