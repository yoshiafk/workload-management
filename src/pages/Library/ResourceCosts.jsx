/**
 * Resource Costs Page
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
                <button className="btn btn-primary">+ Add Cost Tier</button>
            </div>

            <div className="data-table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Resource</th>
                            <th>Monthly Cost</th>
                            <th>Per Day</th>
                            <th>Per Hour</th>
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
                                    <button className="btn-icon" title="Edit">✏️</button>
                                    <button className="btn-icon" title="Delete">🗑️</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
