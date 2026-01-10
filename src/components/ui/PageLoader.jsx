/**
 * PageLoader Component
 * Displayed during lazy loading of page components
 */

import './PageLoader.css';

export default function PageLoader() {
    return (
        <div className="page-loader">
            <div className="loader-content">
                <div className="loader-spinner"></div>
                <span className="loader-text">Loading...</span>
            </div>
        </div>
    );
}
