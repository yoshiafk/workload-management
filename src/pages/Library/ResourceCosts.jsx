/**
 * Resource Costs Page
 * Professional data table with currency formatting
 */

import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/calculations';
import './LibraryPage.css';

export default function ResourceCosts() {
    const { state } = useApp();

    return (
        <div className="library-page">
            <div className="page-header">
                <h2>Resource Costs</h2>
                <button className="btn btn-primary">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add Cost Tier
                </button>
            </div>

            <div className="data-table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Resource</th>
                            <th style={{ textAlign: 'right' }}>Monthly Cost</th>
                            <th style={{ textAlign: 'right' }}>Per Day</th>
                            <th style={{ textAlign: 'right' }}>Per Hour</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {state.costs.map(cost => (
                            <tr key={cost.id}>
                                <td className="cell-name">{cost.resourceName}</td>
                                <td className="cell-currency">{formatCurrency(cost.monthlyCost)}</td>
                                <td className="cell-currency">{formatCurrency(cost.perDayCost)}</td>
                                <td className="cell-currency">{formatCurrency(cost.perHourCost)}</td>
                                <td className="cell-actions">
                                    <button className="btn-icon" title="Edit">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                        </svg>
                                    </button>
                                    <button className="btn-icon" title="Delete">
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
        </div>
    );
}
