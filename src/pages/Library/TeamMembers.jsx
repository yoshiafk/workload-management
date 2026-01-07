/**
 * Team Members Page
 * Full CRUD functionality with modal forms
 */

import { useState } from 'react';
import { useApp, ACTIONS } from '../../context/AppContext';
import { Modal, ModalFooter, FormInput, ConfirmDialog } from '../../components/ui';
import './LibraryPage.css';

// Generate unique ID
const generateId = () => `MEM-${Date.now().toString(36).toUpperCase()}`;

// Empty member template
const emptyMember = {
    id: '',
    name: '',
    type: 'BA',
    maxHoursPerWeek: 40,
    isActive: true,
};

export default function TeamMembers() {
    const { state, dispatch } = useApp();

    // Modal states
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const [memberToDelete, setMemberToDelete] = useState(null);

    // Form state
    const [formData, setFormData] = useState(emptyMember);
    const [errors, setErrors] = useState({});

    // Open add modal
    const handleAdd = () => {
        setFormData({ ...emptyMember, id: generateId() });
        setEditingMember(null);
        setErrors({});
        setIsFormOpen(true);
    };

    // Open edit modal
    const handleEdit = (member) => {
        setFormData({ ...member });
        setEditingMember(member);
        setErrors({});
        setIsFormOpen(true);
    };

    // Open delete confirmation
    const handleDeleteClick = (member) => {
        setMemberToDelete(member);
        setIsDeleteOpen(true);
    };

    // Handle form input change
    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error on change
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    // Validate form
    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }
        if (!formData.type) {
            newErrors.type = 'Role type is required';
        }
        if (!formData.maxHoursPerWeek || formData.maxHoursPerWeek < 1) {
            newErrors.maxHoursPerWeek = 'Max hours must be at least 1';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Submit form
    const handleSubmit = () => {
        if (!validate()) return;

        if (editingMember) {
            dispatch({ type: ACTIONS.UPDATE_MEMBER, payload: formData });
        } else {
            dispatch({ type: ACTIONS.ADD_MEMBER, payload: formData });
        }
        setIsFormOpen(false);
    };

    // Confirm delete
    const handleDeleteConfirm = () => {
        if (memberToDelete) {
            dispatch({ type: ACTIONS.DELETE_MEMBER, payload: memberToDelete.id });
        }
        setMemberToDelete(null);
    };

    return (
        <div className="library-page">
            <div className="page-header">
                <h2>Team Members</h2>
                <button className="btn btn-primary" onClick={handleAdd}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add Member
                </button>
            </div>

            <div className="data-table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Role</th>
                            <th>Max Hours/Week</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {state.members.map(member => (
                            <tr key={member.id}>
                                <td className="cell-id">{member.id}</td>
                                <td className="cell-name">{member.name}</td>
                                <td>
                                    <span className={`type-badge ${member.type.toLowerCase()}`}>
                                        {member.type === 'BA' ? 'Business Analyst' : 'Project Manager'}
                                    </span>
                                </td>
                                <td>{member.maxHoursPerWeek}h</td>
                                <td>
                                    <span className={`status-badge ${member.isActive ? 'active' : 'inactive'}`}>
                                        {member.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="cell-actions">
                                    <button
                                        className="btn-icon"
                                        title="Edit"
                                        onClick={() => handleEdit(member)}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                        </svg>
                                    </button>
                                    <button
                                        className="btn-icon btn-icon-danger"
                                        title="Delete"
                                        onClick={() => handleDeleteClick(member)}
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
                title={editingMember ? 'Edit Team Member' : 'Add Team Member'}
                size="md"
            >
                <FormInput
                    label="Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    error={errors.name}
                    required
                    autoFocus
                    placeholder="Enter member name"
                />
                <FormInput
                    label="Role Type"
                    name="type"
                    type="select"
                    value={formData.type}
                    onChange={handleChange}
                    error={errors.type}
                    required
                    options={[
                        { value: 'BA', label: 'Business Analyst' },
                        { value: 'PM', label: 'Project Manager' },
                    ]}
                />
                <FormInput
                    label="Max Hours per Week"
                    name="maxHoursPerWeek"
                    type="number"
                    value={formData.maxHoursPerWeek}
                    onChange={handleChange}
                    error={errors.maxHoursPerWeek}
                    required
                    min={1}
                    max={168}
                />
                <FormInput
                    label="Active"
                    name="isActive"
                    type="checkbox"
                    value={formData.isActive}
                    onChange={handleChange}
                />
                <ModalFooter>
                    <button className="btn btn-secondary" onClick={() => setIsFormOpen(false)}>
                        Cancel
                    </button>
                    <button className="btn btn-primary" onClick={handleSubmit}>
                        {editingMember ? 'Update' : 'Add'} Member
                    </button>
                </ModalFooter>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Delete Team Member"
                message={`Are you sure you want to delete "${memberToDelete?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                variant="danger"
            />
        </div>
    );
}
