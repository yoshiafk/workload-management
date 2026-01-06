/**
 * Resource Allocation Page
 * Professional placeholder
 */

import './PagePlaceholder.css';

export default function ResourceAllocation() {
    return (
        <div className="page-placeholder">
            <div className="placeholder-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                    <rect x="8" y="2" width="8" height="4" rx="1" />
                    <line x1="9" y1="12" x2="15" y2="12" />
                    <line x1="9" y1="16" x2="15" y2="16" />
                </svg>
            </div>
            <h2>Resource Allocation</h2>
            <p>Manage task allocations with Plan/Actual dates and auto-calculated costs.</p>
            <p className="coming-soon">Full implementation in progress</p>
        </div>
    );
}
