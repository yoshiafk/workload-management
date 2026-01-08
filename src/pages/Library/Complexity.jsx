/**
 * Complexity Settings Page
 * Edit functionality with modal
 */

import { useState } from 'react';
import { useApp, ACTIONS } from '../../context/AppContext';
import { Modal, ModalFooter, FormInput } from '../../components/ui';
import './LibraryPage.css';

export default function Complexity() {
    const { state, dispatch } = useApp();
    const { complexity } = state;

    // Modal state
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingLevel, setEditingLevel] = useState(null);
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});

    // Open edit modal
    const handleEdit = (level) => {
        setFormData({ ...level });
        setEditingLevel(level);
        setErrors({});
        setIsFormOpen(true);
    };

    // Handle form input change with auto-calculation
    const handleChange = (name, value) => {
        setFormData(prev => {
            const updated = { ...prev, [name]: value };

            // Auto-calculate hours when days changes (8 hours per day)
            if (name === 'days' && typeof value === 'number') {
                updated.hours = value * 8;
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
        if (!formData.days || formData.days < 1) {
            newErrors.days = 'Days must be at least 1';
        }
        if (!formData.workload || formData.workload <= 0) {
            newErrors.workload = 'Workload must be greater than 0';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Submit form
    const handleSubmit = () => {
        if (!validate()) return;

        dispatch({
            type: ACTIONS.UPDATE_COMPLEXITY,
            payload: { [formData.level]: formData }
        });
        setIsFormOpen(false);
    };

    return (
        <div className="library-page">
            <div className="page-header">
                <h2>Complexity Settings</h2>
            </div>

            <div className="complexity-cards">
                {Object.values(complexity).map(level => (
                    <div
                        key={level.level}
                        className="complexity-card"
                        style={{ '--level-color': level.color }}
                    >
                        <div
                            className="complexity-indicator"
                            style={{ backgroundColor: level.color }}
                        />
                        <h3 className="complexity-label">{level.label}</h3>

                        <div className="complexity-stats">
                            <div className="stat-row">
                                <span className="stat-label">Duration (Days)</span>
                                <span className="stat-value">{level.days}</span>
                            </div>
                            <div className="stat-row">
                                <span className="stat-label">Duration (Hours)</span>
                                <span className="stat-value">{level.hours}</span>
                            </div>
                            <div className="stat-row">
                                <span className="stat-label">Workload</span>
                                <span className="stat-value">{level.workload.toFixed(4)}</span>
                            </div>
                        </div>

                        <button
                            className="btn btn-secondary complexity-edit-btn"
                            onClick={() => handleEdit(level)}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            Edit
                        </button>
                    </div>
                ))}
            </div>

            {/* Edit Modal */}
            <Modal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                title={`Edit ${editingLevel?.label} Complexity`}
                size="sm"
            >
                <FormInput
                    label="Duration (Days)"
                    name="days"
                    type="number"
                    value={formData.days}
                    onChange={handleChange}
                    error={errors.days}
                    required
                    min={1}
                    helpText="Hours will be auto-calculated (8h/day)"
                />
                <FormInput
                    label="Duration (Hours)"
                    name="hours"
                    type="number"
                    value={formData.hours}
                    onChange={handleChange}
                    disabled
                />
                <FormInput
                    label="Workload"
                    name="workload"
                    type="number"
                    value={formData.workload}
                    onChange={handleChange}
                    error={errors.workload}
                    required
                    min={0.0001}
                    step={0.0001}
                    helpText="Used for cost calculations"
                />
                <ModalFooter>
                    <button className="btn btn-secondary" onClick={() => setIsFormOpen(false)}>
                        Cancel
                    </button>
                    <button className="btn btn-primary" onClick={handleSubmit}>
                        Update Settings
                    </button>
                </ModalFooter>
            </Modal>
        </div>
    );
}
