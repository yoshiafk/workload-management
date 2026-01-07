/**
 * Important Dates Page
 * Holidays and Leave management with full CRUD
 */

import { useState, useMemo } from 'react';
import { useApp, ACTIONS } from '../context/AppContext';
import { Modal, ModalFooter, FormInput, ConfirmDialog } from '../components/ui';
import { refreshHolidays } from '../utils/holidayService';
import { differenceInCalendarDays, parseISO } from 'date-fns';
import './ImportantDates.css';

// Generate unique IDs
const generateHolidayId = (year) => `hd_${year}_${Date.now().toString(36)}`;
const generateLeaveId = () => `LV-${Date.now().toString(36).toUpperCase()}`;

// Empty templates
const emptyHoliday = {
    id: '',
    date: '',
    name: '',
    type: 'national',
    year: new Date().getFullYear(),
};

const emptyLeave = {
    id: '',
    memberId: '',
    memberName: '',
    startDate: '',
    endDate: '',
    reason: '',
};

// Calculate number of days between two dates (inclusive)
function calculateDays(startDate, endDate) {
    if (!startDate || !endDate) return 0;
    return differenceInCalendarDays(parseISO(endDate), parseISO(startDate)) + 1;
}

export default function ImportantDates() {
    const { state, dispatch } = useApp();

    // Filters
    const [yearFilter, setYearFilter] = useState('all');
    const [memberFilter, setMemberFilter] = useState('all');

    // Holiday modal states
    const [isHolidayFormOpen, setIsHolidayFormOpen] = useState(false);
    const [isHolidayDeleteOpen, setIsHolidayDeleteOpen] = useState(false);
    const [editingHoliday, setEditingHoliday] = useState(null);
    const [holidayToDelete, setHolidayToDelete] = useState(null);
    const [holidayForm, setHolidayForm] = useState(emptyHoliday);
    const [holidayErrors, setHolidayErrors] = useState({});

    // Leave modal states
    const [isLeaveFormOpen, setIsLeaveFormOpen] = useState(false);
    const [isLeaveDeleteOpen, setIsLeaveDeleteOpen] = useState(false);
    const [editingLeave, setEditingLeave] = useState(null);
    const [leaveToDelete, setLeaveToDelete] = useState(null);
    const [leaveForm, setLeaveForm] = useState(emptyLeave);
    const [leaveErrors, setLeaveErrors] = useState({});

    // Refreshing state
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Get unique years from holidays
    const availableYears = useMemo(() => {
        const years = [...new Set(state.holidays.map(h => h.year))];
        return years.sort((a, b) => a - b);
    }, [state.holidays]);

    // Filter holidays
    const filteredHolidays = useMemo(() => {
        let filtered = [...state.holidays];
        if (yearFilter !== 'all') {
            filtered = filtered.filter(h => h.year === parseInt(yearFilter));
        }
        return filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [state.holidays, yearFilter]);

    // Filter leaves
    const filteredLeaves = useMemo(() => {
        let filtered = [...state.leaves];
        if (memberFilter !== 'all') {
            filtered = filtered.filter(l => l.memberId === memberFilter);
        }
        return filtered.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    }, [state.leaves, memberFilter]);

    // Holiday handlers
    const handleAddHoliday = () => {
        const currentYear = new Date().getFullYear();
        setHolidayForm({
            ...emptyHoliday,
            id: generateHolidayId(currentYear),
            year: currentYear,
        });
        setEditingHoliday(null);
        setHolidayErrors({});
        setIsHolidayFormOpen(true);
    };

    const handleEditHoliday = (holiday) => {
        setHolidayForm({ ...holiday });
        setEditingHoliday(holiday);
        setHolidayErrors({});
        setIsHolidayFormOpen(true);
    };

    const handleDeleteHolidayClick = (holiday) => {
        setHolidayToDelete(holiday);
        setIsHolidayDeleteOpen(true);
    };

    const handleHolidayChange = (name, value) => {
        setHolidayForm(prev => {
            const updated = { ...prev, [name]: value };
            // Auto-update year from date
            if (name === 'date' && value) {
                updated.year = new Date(value).getFullYear();
            }
            return updated;
        });
        if (holidayErrors[name]) {
            setHolidayErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateHoliday = () => {
        const errors = {};
        if (!holidayForm.date) errors.date = 'Date is required';
        if (!holidayForm.name.trim()) errors.name = 'Name is required';
        if (!holidayForm.type) errors.type = 'Type is required';
        setHolidayErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleHolidaySubmit = () => {
        if (!validateHoliday()) return;

        if (editingHoliday) {
            dispatch({ type: ACTIONS.UPDATE_HOLIDAY, payload: holidayForm });
        } else {
            dispatch({ type: ACTIONS.ADD_HOLIDAY, payload: holidayForm });
        }
        setIsHolidayFormOpen(false);
    };

    const handleHolidayDeleteConfirm = () => {
        if (holidayToDelete) {
            dispatch({ type: ACTIONS.DELETE_HOLIDAY, payload: holidayToDelete.id });
        }
        setHolidayToDelete(null);
    };

    // Leave handlers
    const handleAddLeave = () => {
        setLeaveForm({
            ...emptyLeave,
            id: generateLeaveId(),
        });
        setEditingLeave(null);
        setLeaveErrors({});
        setIsLeaveFormOpen(true);
    };

    const handleEditLeave = (leave) => {
        setLeaveForm({ ...leave });
        setEditingLeave(leave);
        setLeaveErrors({});
        setIsLeaveFormOpen(true);
    };

    const handleDeleteLeaveClick = (leave) => {
        setLeaveToDelete(leave);
        setIsLeaveDeleteOpen(true);
    };

    const handleLeaveChange = (name, value) => {
        setLeaveForm(prev => {
            const updated = { ...prev, [name]: value };
            // Auto-update member name from member ID
            if (name === 'memberId') {
                const member = state.members.find(m => m.id === value);
                updated.memberName = member ? member.name : '';
            }
            // Auto-set endDate if not set
            if (name === 'startDate' && !prev.endDate) {
                updated.endDate = value;
            }
            return updated;
        });
        if (leaveErrors[name]) {
            setLeaveErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateLeave = () => {
        const errors = {};
        if (!leaveForm.memberId) errors.memberId = 'Team member is required';
        if (!leaveForm.startDate) errors.startDate = 'Start date is required';
        if (!leaveForm.endDate) errors.endDate = 'End date is required';
        if (leaveForm.startDate && leaveForm.endDate && leaveForm.startDate > leaveForm.endDate) {
            errors.endDate = 'End date must be after start date';
        }
        setLeaveErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleLeaveSubmit = () => {
        if (!validateLeave()) return;

        if (editingLeave) {
            dispatch({ type: ACTIONS.UPDATE_LEAVE, payload: leaveForm });
        } else {
            dispatch({ type: ACTIONS.ADD_LEAVE, payload: leaveForm });
        }
        setIsLeaveFormOpen(false);
    };

    const handleLeaveDeleteConfirm = () => {
        if (leaveToDelete) {
            dispatch({ type: ACTIONS.DELETE_LEAVE, payload: leaveToDelete.id });
        }
        setLeaveToDelete(null);
    };

    // Refresh holidays from API
    const handleRefreshHolidays = async () => {
        setIsRefreshing(true);
        try {
            const freshHolidays = await refreshHolidays();
            dispatch({ type: ACTIONS.SET_HOLIDAYS, payload: freshHolidays });
        } catch (error) {
            console.error('Failed to refresh holidays:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    // Format date for display
    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    // Stats
    const nationalCount = state.holidays.filter(h => h.type === 'national').length;
    const massLeaveCount = state.holidays.filter(h => h.type === 'mass-leave').length;
    const totalLeaveDays = state.leaves.reduce((sum, l) =>
        sum + calculateDays(l.startDate, l.endDate), 0
    );

    return (
        <div className="important-dates-page">
            <div className="dates-grid-layout">
                {/* Holidays Section */}
                <section className="dates-section-card">
                    <div className="section-header">
                        <h2>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                            Public Holidays
                        </h2>
                        <div className="section-actions">
                            <button
                                className="btn-refresh"
                                onClick={handleRefreshHolidays}
                                disabled={isRefreshing}
                                title="Refresh from API"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="23 4 23 10 17 10" />
                                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                                </svg>
                                {isRefreshing ? 'Refreshing...' : 'Refresh'}
                            </button>
                            <select
                                className="filter-select"
                                value={yearFilter}
                                onChange={(e) => setYearFilter(e.target.value)}
                            >
                                <option value="all">All Years</option>
                                {availableYears.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                            <button className="btn btn-primary" onClick={handleAddHoliday}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="12" y1="5" x2="12" y2="19" />
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                                Add Holiday
                            </button>
                        </div>
                    </div>

                    <div className="stats-row">
                        <div className="stat-item">
                            <span>Total:</span>
                            <span className="stat-value">{filteredHolidays.length}</span>
                        </div>
                        <div className="stat-item">
                            <span>National:</span>
                            <span className="stat-value">{nationalCount}</span>
                        </div>
                        <div className="stat-item">
                            <span>Mass Leave:</span>
                            <span className="stat-value">{massLeaveCount}</span>
                        </div>
                    </div>

                    <div className="dates-table-container">
                        <table className="dates-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Name</th>
                                    <th>Type</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredHolidays.map(holiday => (
                                    <tr key={holiday.id}>
                                        <td className="cell-date">{formatDate(holiday.date)}</td>
                                        <td className="cell-name">{holiday.name}</td>
                                        <td>
                                            <span className={`holiday-type-badge ${holiday.type}`}>
                                                {holiday.type === 'national' ? 'National' : 'Mass Leave'}
                                            </span>
                                        </td>
                                        <td className="cell-actions">
                                            <button
                                                className="btn-icon"
                                                title="Edit"
                                                onClick={() => handleEditHoliday(holiday)}
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                </svg>
                                            </button>
                                            <button
                                                className="btn-icon btn-icon-danger"
                                                title="Delete"
                                                onClick={() => handleDeleteHolidayClick(holiday)}
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
                        {filteredHolidays.length === 0 && (
                            <div className="empty-state">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                    <line x1="16" y1="2" x2="16" y2="6" />
                                    <line x1="8" y1="2" x2="8" y2="6" />
                                    <line x1="3" y1="10" x2="21" y2="10" />
                                </svg>
                                <p>No holidays found for selected filter</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Leaves Section */}
                <section className="dates-section-card">
                    <div className="section-header">
                        <h2>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                            Team Leaves
                        </h2>
                        <div className="section-actions">
                            <select
                                className="filter-select"
                                value={memberFilter}
                                onChange={(e) => setMemberFilter(e.target.value)}
                            >
                                <option value="all">All Members</option>
                                {state.members.map(member => (
                                    <option key={member.id} value={member.id}>{member.name}</option>
                                ))}
                            </select>
                            <button className="btn btn-primary" onClick={handleAddLeave}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="12" y1="5" x2="12" y2="19" />
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                                Add Leave
                            </button>
                        </div>
                    </div>

                    <div className="stats-row">
                        <div className="stat-item">
                            <span>Records:</span>
                            <span className="stat-value">{filteredLeaves.length}</span>
                        </div>
                        <div className="stat-item">
                            <span>Total Days:</span>
                            <span className="stat-value">{totalLeaveDays}</span>
                        </div>
                    </div>

                    <div className="dates-table-container">
                        <table className="dates-table">
                            <thead>
                                <tr>
                                    <th>Member</th>
                                    <th>Start Date</th>
                                    <th>End Date</th>
                                    <th>Days</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLeaves.map(leave => (
                                    <tr key={leave.id}>
                                        <td className="cell-name">{leave.memberName}</td>
                                        <td className="cell-date">{formatDate(leave.startDate)}</td>
                                        <td className="cell-date">{formatDate(leave.endDate)}</td>
                                        <td>
                                            <span className="leave-days-badge">
                                                {calculateDays(leave.startDate, leave.endDate)} day{calculateDays(leave.startDate, leave.endDate) !== 1 ? 's' : ''}
                                            </span>
                                        </td>
                                        <td className="cell-actions">
                                            <button
                                                className="btn-icon"
                                                title="Edit"
                                                onClick={() => handleEditLeave(leave)}
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                </svg>
                                            </button>
                                            <button
                                                className="btn-icon btn-icon-danger"
                                                title="Delete"
                                                onClick={() => handleDeleteLeaveClick(leave)}
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
                        {filteredLeaves.length === 0 && (
                            <div className="empty-state">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                </svg>
                                <p>No leave records found</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {/* Holiday Add/Edit Modal */}
            <Modal
                isOpen={isHolidayFormOpen}
                onClose={() => setIsHolidayFormOpen(false)}
                title={editingHoliday ? 'Edit Holiday' : 'Add Holiday'}
                size="md"
            >
                <FormInput
                    label="Date"
                    name="date"
                    type="date"
                    value={holidayForm.date}
                    onChange={handleHolidayChange}
                    error={holidayErrors.date}
                    required
                />
                <FormInput
                    label="Holiday Name"
                    name="name"
                    value={holidayForm.name}
                    onChange={handleHolidayChange}
                    error={holidayErrors.name}
                    required
                    placeholder="e.g., Hari Raya Idul Fitri"
                />
                <FormInput
                    label="Type"
                    name="type"
                    type="select"
                    value={holidayForm.type}
                    onChange={handleHolidayChange}
                    error={holidayErrors.type}
                    required
                    options={[
                        { value: 'national', label: 'National Holiday' },
                        { value: 'mass-leave', label: 'Mass Leave (Cuti Bersama)' },
                    ]}
                />
                <ModalFooter>
                    <button className="btn btn-secondary" onClick={() => setIsHolidayFormOpen(false)}>
                        Cancel
                    </button>
                    <button className="btn btn-primary" onClick={handleHolidaySubmit}>
                        {editingHoliday ? 'Update' : 'Add'} Holiday
                    </button>
                </ModalFooter>
            </Modal>

            {/* Holiday Delete Confirmation */}
            <ConfirmDialog
                isOpen={isHolidayDeleteOpen}
                onClose={() => setIsHolidayDeleteOpen(false)}
                onConfirm={handleHolidayDeleteConfirm}
                title="Delete Holiday"
                message={`Are you sure you want to delete "${holidayToDelete?.name}"?`}
                confirmText="Delete"
                variant="danger"
            />

            {/* Leave Add/Edit Modal */}
            <Modal
                isOpen={isLeaveFormOpen}
                onClose={() => setIsLeaveFormOpen(false)}
                title={editingLeave ? 'Edit Leave' : 'Add Leave'}
                size="md"
            >
                <FormInput
                    label="Team Member"
                    name="memberId"
                    type="select"
                    value={leaveForm.memberId}
                    onChange={handleLeaveChange}
                    error={leaveErrors.memberId}
                    required
                    options={[
                        { value: '', label: 'Select member...' },
                        ...state.members.map(m => ({ value: m.id, label: m.name })),
                    ]}
                />
                <div className="form-row">
                    <FormInput
                        label="Start Date"
                        name="startDate"
                        type="date"
                        value={leaveForm.startDate}
                        onChange={handleLeaveChange}
                        error={leaveErrors.startDate}
                        required
                    />
                    <FormInput
                        label="End Date"
                        name="endDate"
                        type="date"
                        value={leaveForm.endDate}
                        onChange={handleLeaveChange}
                        error={leaveErrors.endDate}
                        required
                    />
                </div>
                <FormInput
                    label="Reason (optional)"
                    name="reason"
                    value={leaveForm.reason}
                    onChange={handleLeaveChange}
                    placeholder="e.g., Family vacation"
                />
                <ModalFooter>
                    <button className="btn btn-secondary" onClick={() => setIsLeaveFormOpen(false)}>
                        Cancel
                    </button>
                    <button className="btn btn-primary" onClick={handleLeaveSubmit}>
                        {editingLeave ? 'Update' : 'Add'} Leave
                    </button>
                </ModalFooter>
            </Modal>

            {/* Leave Delete Confirmation */}
            <ConfirmDialog
                isOpen={isLeaveDeleteOpen}
                onClose={() => setIsLeaveDeleteOpen(false)}
                onConfirm={handleLeaveDeleteConfirm}
                title="Delete Leave"
                message={`Are you sure you want to delete leave for "${leaveToDelete?.memberName}"?`}
                confirmText="Delete"
                variant="danger"
            />
        </div>
    );
}
