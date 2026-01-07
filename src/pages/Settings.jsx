/**
 * Settings Page
 * Data management: Export, Import, Clear All Data
 */

import { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
    downloadAsJson,
    readJsonFile,
    importData,
    clearAllStorage,
} from '../utils/storage';
import './Settings.css';

// Validation function for imported data
function validateImportData(data) {
    const errors = [];

    if (!data || typeof data !== 'object') {
        errors.push('Invalid file format');
        return { valid: false, errors };
    }

    const requiredArrays = ['members', 'phases', 'tasks', 'costs'];
    for (const key of requiredArrays) {
        if (data[key] && !Array.isArray(data[key])) {
            errors.push(`${key} must be an array`);
        }
    }

    if (data.complexity && typeof data.complexity !== 'object') {
        errors.push('complexity must be an object');
    }

    return { valid: errors.length === 0, errors };
}

export default function Settings() {
    const { state } = useApp();
    const [importStatus, setImportStatus] = useState(null); // 'success' | 'error' | null
    const [importMessage, setImportMessage] = useState('');
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const fileInputRef = useRef(null);

    // Data statistics
    const stats = [
        { label: 'Team Members', count: state.members?.length || 0, icon: 'users' },
        { label: 'Allocations', count: state.allocations?.length || 0, icon: 'tasks' },
        { label: 'Phases', count: state.phases?.length || 0, icon: 'layers' },
        { label: 'Task Templates', count: state.tasks?.length || 0, icon: 'list' },
        { label: 'Holidays', count: state.holidays?.length || 0, icon: 'calendar' },
        { label: 'Leaves', count: state.leaves?.length || 0, icon: 'leave' },
        { label: 'Cost Tiers', count: state.costs?.length || 0, icon: 'money' },
    ];

    // Handle export
    const handleExport = () => {
        downloadAsJson('wrm-export');
        setImportStatus('success');
        setImportMessage('Data exported successfully!');
        setTimeout(() => setImportStatus(null), 3000);
    };

    // Handle file selection
    const handleFileSelect = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const data = await readJsonFile(file);
            const validation = validateImportData(data);

            if (!validation.valid) {
                setImportStatus('error');
                setImportMessage(`Invalid file: ${validation.errors.join(', ')}`);
                return;
            }

            const success = importData(data);
            if (success) {
                setImportStatus('success');
                setImportMessage('Data imported successfully! Reloading...');
                setTimeout(() => window.location.reload(), 1500);
            } else {
                setImportStatus('error');
                setImportMessage('Failed to import data');
            }
        } catch (error) {
            setImportStatus('error');
            setImportMessage(error.message || 'Failed to read file');
        }

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Handle clear all data
    const handleClearAll = () => {
        clearAllStorage();
        setShowClearConfirm(false);
        setImportStatus('success');
        setImportMessage('All data cleared! Reloading...');
        setTimeout(() => window.location.reload(), 1500);
    };

    return (
        <div className="settings-page">
            {/* Status Toast */}
            {importStatus && (
                <div className={`toast toast-${importStatus}`}>
                    <span className="toast-icon">
                        {importStatus === 'success' ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                        )}
                    </span>
                    <span className="toast-message">{importMessage}</span>
                </div>
            )}

            {/* Data Statistics */}
            <section className="settings-section">
                <div className="section-header">
                    <h2 className="section-title">Data Overview</h2>
                    <p className="section-subtitle">Current data stored in browser</p>
                </div>
                <div className="stats-grid">
                    {stats.map(stat => (
                        <div key={stat.label} className="stat-item">
                            <span className="stat-count">{stat.count}</span>
                            <span className="stat-label">{stat.label}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Export Data */}
            <section className="settings-section">
                <div className="section-header">
                    <h2 className="section-title">Export Data</h2>
                    <p className="section-subtitle">Download all data as a JSON file for backup</p>
                </div>
                <div className="settings-card">
                    <div className="card-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                    </div>
                    <div className="card-content">
                        <h3>Download Backup</h3>
                        <p>Export all your data including members, allocations, holidays, and settings.</p>
                    </div>
                    <button className="btn btn-primary" onClick={handleExport}>
                        Export JSON
                    </button>
                </div>
            </section>

            {/* Import Data */}
            <section className="settings-section">
                <div className="section-header">
                    <h2 className="section-title">Import Data</h2>
                    <p className="section-subtitle">Restore data from a previously exported JSON file</p>
                </div>
                <div className="settings-card">
                    <div className="card-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                    </div>
                    <div className="card-content">
                        <h3>Upload Backup</h3>
                        <p>Import data from a JSON file. This will merge with existing data.</p>
                    </div>
                    <label className="btn btn-secondary file-input-label">
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleFileSelect}
                            ref={fileInputRef}
                            className="file-input-hidden"
                        />
                        Select File
                    </label>
                </div>
            </section>

            {/* Danger Zone */}
            <section className="settings-section danger-zone">
                <div className="section-header">
                    <h2 className="section-title">Danger Zone</h2>
                    <p className="section-subtitle">Irreversible actions</p>
                </div>
                <div className="settings-card settings-card-danger">
                    <div className="card-icon card-icon-danger">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            <line x1="10" y1="11" x2="10" y2="17" />
                            <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                    </div>
                    <div className="card-content">
                        <h3>Clear All Data</h3>
                        <p>Delete all data and reset to defaults. This action cannot be undone.</p>
                    </div>
                    <button className="btn btn-danger" onClick={() => setShowClearConfirm(true)}>
                        Clear All Data
                    </button>
                </div>
            </section>

            {/* Clear Confirmation Modal */}
            {showClearConfirm && (
                <div className="modal-overlay" onClick={() => setShowClearConfirm(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Confirm Clear All Data</h2>
                            <button className="modal-close" onClick={() => setShowClearConfirm(false)}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="confirm-warning">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                    <line x1="12" y1="9" x2="12" y2="13" />
                                    <line x1="12" y1="17" x2="12.01" y2="17" />
                                </svg>
                            </div>
                            <p>Are you sure you want to delete all your data?</p>
                            <p className="text-muted">This will remove all team members, allocations, holidays, leaves, and other settings. The app will reload with default data.</p>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowClearConfirm(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-danger" onClick={handleClearAll}>
                                Yes, Clear All Data
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
