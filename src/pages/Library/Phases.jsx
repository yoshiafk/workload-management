/**
 * Phases Page
 * Full CRUD functionality with modal forms
 */

import { useState } from 'react';
import { useApp, ACTIONS } from '../../context/AppContext';
import { Modal, ModalFooter, FormInput, ConfirmDialog } from '../../components/ui';
import './LibraryPage.css';

// Empty phase template
const emptyPhase = {
    id: 0,
    name: '',
    tasks: [],
    isTerminal: false,
};

export default function Phases() {
    const { state, dispatch } = useApp();

    // Modal states
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [editingPhase, setEditingPhase] = useState(null);
    const [phaseToDelete, setPhaseToDelete] = useState(null);

    // Form state
    const [formData, setFormData] = useState(emptyPhase);
    const [errors, setErrors] = useState({});

    // Get next available ID
    const getNextId = () => {
        const maxId = state.phases.reduce((max, p) => Math.max(max, p.id), 0);
        return maxId + 1;
    };

    // Open add modal
    const handleAdd = () => {
        setFormData({ ...emptyPhase, id: getNextId() });
        setEditingPhase(null);
        setErrors({});
        setIsFormOpen(true);
    };

    // Open edit modal
    const handleEdit = (phase) => {
        setFormData({ ...phase });
        setEditingPhase(phase);
        setErrors({});
        setIsFormOpen(true);
    };

    // Open delete confirmation
    const handleDeleteClick = (phase) => {
        setPhaseToDelete(phase);
        setIsDeleteOpen(true);
    };

    // Handle form input change
    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    // Validate form
    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) {
            newErrors.name = 'Phase name is required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Submit form
    const handleSubmit = () => {
        if (!validate()) return;

        if (editingPhase) {
            dispatch({ type: ACTIONS.UPDATE_PHASE, payload: formData });
        } else {
            dispatch({ type: ACTIONS.ADD_PHASE, payload: formData });
        }
        setIsFormOpen(false);
    };

    // Confirm delete
    const handleDeleteConfirm = () => {
        if (phaseToDelete) {
            dispatch({ type: ACTIONS.DELETE_PHASE, payload: phaseToDelete.id });
        }
        setPhaseToDelete(null);
    };

    // Move phase up
    const handleMoveUp = (index) => {
        if (index === 0) return;
        const newPhases = [...state.phases];
        [newPhases[index - 1], newPhases[index]] = [newPhases[index], newPhases[index - 1]];
        // Update IDs to reflect new order
        const reorderedPhases = newPhases.map((p, i) => ({ ...p, id: i + 1 }));
        dispatch({ type: ACTIONS.SET_PHASES, payload: reorderedPhases });
    };

    // Move phase down
    const handleMoveDown = (index) => {
        if (index === state.phases.length - 1) return;
        const newPhases = [...state.phases];
        [newPhases[index], newPhases[index + 1]] = [newPhases[index + 1], newPhases[index]];
        // Update IDs to reflect new order
        const reorderedPhases = newPhases.map((p, i) => ({ ...p, id: i + 1 }));
        dispatch({ type: ACTIONS.SET_PHASES, payload: reorderedPhases });
    };

    return (
        <div className="library-page">
            <div className="page-header">
                <h2>Task Phases</h2>
                <button className="btn btn-primary" onClick={handleAdd}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add Phase
                </button>
            </div>

            <div className="phases-list">
                {state.phases.map((phase, index) => (
                    <div key={phase.id} className={`phase-card ${phase.isTerminal ? 'terminal' : ''}`}>
                        <div className="reorder-buttons">
                            <button
                                className="btn-icon btn-reorder"
                                title="Move Up"
                                onClick={() => handleMoveUp(index)}
                                disabled={index === 0}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="18 15 12 9 6 15" />
                                </svg>
                            </button>
                            <button
                                className="btn-icon btn-reorder"
                                title="Move Down"
                                onClick={() => handleMoveDown(index)}
                                disabled={index === state.phases.length - 1}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </button>
                        </div>
                        <div className="phase-number">{index + 1}</div>
                        <div className="phase-content">
                            <h3 className="phase-name">{phase.name}</h3>
                            <p className="phase-tasks">
                                {phase.tasks.length} task{phase.tasks.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                        {phase.isTerminal && (
                            <span className="terminal-badge">Terminal</span>
                        )}
                        <div className="phase-actions">
                            <button
                                className="btn-icon"
                                title="Edit"
                                onClick={() => handleEdit(phase)}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                            </button>
                            <button
                                className="btn-icon btn-icon-danger"
                                title="Delete"
                                onClick={() => handleDeleteClick(phase)}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                </svg>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                title={editingPhase ? 'Edit Phase' : 'Add Phase'}
                size="sm"
            >
                <FormInput
                    label="Phase Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    error={errors.name}
                    required
                    autoFocus
                    placeholder="e.g., Planning, Development"
                />
                <FormInput
                    label="Terminal Phase"
                    name="isTerminal"
                    type="checkbox"
                    value={formData.isTerminal}
                    onChange={handleChange}
                    helpText="Terminal phases mark the end of work (e.g., Completed, Idle)"
                />
                <ModalFooter>
                    <button className="btn btn-secondary" onClick={() => setIsFormOpen(false)}>
                        Cancel
                    </button>
                    <button className="btn btn-primary" onClick={handleSubmit}>
                        {editingPhase ? 'Update' : 'Add'} Phase
                    </button>
                </ModalFooter>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Delete Phase"
                message={`Are you sure you want to delete "${phaseToDelete?.name}"? Tasks in this phase may be affected.`}
                confirmText="Delete"
                variant="danger"
            />
        </div>
    );
}
