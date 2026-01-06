/**
 * Phases Page
 */

import { useApp } from '../../context/AppContext';
import './LibraryPage.css';

export default function Phases() {
    const { state } = useApp();

    return (
        <div className="library-page">
            <div className="page-header">
                <h2>Task Phases</h2>
                <button className="btn btn-primary">+ Add Phase</button>
            </div>

            <div className="phases-list">
                {state.phases.map(phase => (
                    <div key={phase.id} className={`phase-card ${phase.isTerminal ? 'terminal' : ''}`}>
                        <div className="phase-number">{phase.id}</div>
                        <div className="phase-content">
                            <h3 className="phase-name">{phase.name}</h3>
                            <p className="phase-tasks">
                                {phase.tasks.length} task{phase.tasks.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                        {phase.isTerminal && (
                            <span className="terminal-badge">Terminal</span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
