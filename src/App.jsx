/**
 * Main Application Component
 * Sets up routing and global providers
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ErrorBoundary } from './components/ui';
import Layout from './components/layout/Layout';

// Pages
import WorkloadSummary from './pages/WorkloadSummary';
import ResourceAllocation from './pages/ResourceAllocation';
import ImportantDates from './pages/ImportantDates';
import TeamMembers from './pages/Library/TeamMembers';
import Phases from './pages/Library/Phases';
import TaskTemplates from './pages/Library/TaskTemplates';
import Complexity from './pages/Library/Complexity';
import ResourceCosts from './pages/Library/ResourceCosts';
import Settings from './pages/Settings';

import './index.css';

function App() {
  return (
    <AppProvider>
      <BrowserRouter basename="/workload-management">
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Layout />}>
              {/* Dashboard */}
              <Route index element={<WorkloadSummary />} />

              {/* Management */}
              <Route path="allocation" element={<ResourceAllocation />} />
              <Route path="dates" element={<ImportantDates />} />

              {/* Library (Config) */}
              <Route path="library/members" element={<TeamMembers />} />
              <Route path="library/phases" element={<Phases />} />
              <Route path="library/tasks" element={<TaskTemplates />} />
              <Route path="library/complexity" element={<Complexity />} />
              <Route path="library/costs" element={<ResourceCosts />} />

              {/* Settings */}
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </ErrorBoundary>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
