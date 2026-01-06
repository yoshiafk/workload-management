/**
 * Important Dates Page
 * Holidays and Leave management
 */

import { useApp } from '../context/AppContext';
import './PagePlaceholder.css';

export default function ImportantDates() {
    const { state } = useApp();

    return (
        <div className="page-content">
            <div className="dates-grid">
                {/* Holidays Section */}
                <section className="dates-section">
                    <h2 className="section-title">Indonesia Public Holidays</h2>
                    <p className="section-subtitle">{state.holidays.length} holidays loaded for 2025-2026</p>

                    <div className="holidays-list">
                        {state.holidays.slice(0, 12).map(holiday => (
                            <div key={holiday.id} className="holiday-item">
                                <span className="holiday-date">
                                    {new Date(holiday.date).toLocaleDateString('en-US', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                    })}
                                </span>
                                <span className="holiday-name">{holiday.name}</span>
                            </div>
                        ))}
                        {state.holidays.length > 12 && (
                            <p className="more-items">+{state.holidays.length - 12} more holidays...</p>
                        )}
                    </div>
                </section>

                {/* Leaves Section */}
                <section className="dates-section">
                    <h2 className="section-title">Team Leave Plans</h2>
                    <p className="section-subtitle">{state.leaves.length} leave records</p>

                    {state.leaves.length === 0 ? (
                        <div className="empty-state-box">
                            <p className="no-data">No leave records yet</p>
                            <p className="no-data-hint">Leave entries will appear here when added</p>
                        </div>
                    ) : (
                        <div className="leaves-list">
                            {state.leaves.map(leave => (
                                <div key={leave.id} className="leave-item">
                                    <span className="leave-member">{leave.memberName}</span>
                                    <span className="leave-date">
                                        {new Date(leave.date).toLocaleDateString('en-US', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                        })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
