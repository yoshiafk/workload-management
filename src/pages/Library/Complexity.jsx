/**
 * Complexity Settings Page
 */

import { useApp } from '../../context/AppContext';
import './LibraryPage.css';

export default function Complexity() {
    const { state } = useApp();
    const { complexity } = state;

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
                                <span className="stat-label">Cycle Activity</span>
                                <span className="stat-value">{level.cycleActivity.toFixed(4)}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
