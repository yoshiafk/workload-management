/**
 * Important Dates Page (Placeholder)
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
                    <h2 className="section-title">🗓️ Indonesia Public Holidays</h2>
                    <p className="section-subtitle">{state.holidays.length} holidays loaded</p>

                    <div className="holidays-list">
                        {state.holidays.slice(0, 10).map(holiday => (
                            <div key={holiday.id} className="holiday-item">
                                <span className="holiday-date">
                                    {new Date(holiday.date).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                    })}
                                </span>
                                <span className="holiday-name">{holiday.name}</span>
                            </div>
                        ))}
                        {state.holidays.length > 10 && (
                            <p className="more-items">+{state.holidays.length - 10} more holidays...</p>
                        )}
                    </div>
                </section>

                {/* Leaves Section */}
                <section className="dates-section">
                    <h2 className="section-title">🏖️ Leave Plans</h2>
                    <p className="section-subtitle">{state.leaves.length} leave records</p>

                    {state.leaves.length === 0 ? (
                        <p className="no-data">No leave records yet.</p>
                    ) : (
                        <div className="leaves-list">
                            {state.leaves.map(leave => (
                                <div key={leave.id} className="leave-item">
                                    <span className="leave-member">{leave.memberName}</span>
                                    <span className="leave-date">
                                        {new Date(leave.date).toLocaleDateString('id-ID')}
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
