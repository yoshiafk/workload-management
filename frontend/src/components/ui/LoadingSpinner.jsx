/**
 * Loading Spinner Component
 * Displays a loading indicator
 */

import './LoadingSpinner.css';

export default function LoadingSpinner({ size = 'md', text = 'Loading...' }) {
    return (
        <div className={`loading-spinner loading-spinner--${size}`}>
            <div className="spinner">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                    <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                </svg>
            </div>
            {text && <span className="loading-text">{text}</span>}
        </div>
    );
}
