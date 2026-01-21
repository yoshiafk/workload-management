/**
 * Main Application Component
 * Sets up routing and global providers with lazy-loaded pages
 */

import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import { ErrorBoundary, PageLoader } from './components/ui';
import Layout from './components/layout/Layout';

// Lazy-loaded Pages - reduces initial bundle size
const WorkloadSummary = lazy(() => import('./pages/WorkloadSummary'));
const ResourceAllocation = lazy(() => import('./pages/ResourceAllocation'));
const ImportantDates = lazy(() => import('./pages/ImportantDates'));
const TimelineView = lazy(() => import('./pages/TimelineView'));
const TeamMembers = lazy(() => import('./pages/Library/TeamMembers'));
const Phases = lazy(() => import('./pages/Library/Phases'));
const TaskTemplates = lazy(() => import('./pages/Library/TaskTemplates'));
const Complexity = lazy(() => import('./pages/Library/Complexity'));
const ResourceCosts = lazy(() => import('./pages/Library/ResourceCosts'));
const MemberTaskHistory = lazy(() => import('./pages/MemberTaskHistory'));
const ProjectCostCalculator = lazy(() => import('./pages/ProjectCostCalculator'));
const Settings = lazy(() => import('./pages/Settings'));

import './index.css';

function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <BrowserRouter basename="/workload-management">
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Layout />}>
                  {/* Dashboard */}
                  <Route index element={<WorkloadSummary />} />

                  {/* Management */}
                  <Route path="allocation" element={<ResourceAllocation />} />
                  <Route path="timeline" element={<TimelineView />} />
                  <Route path="dates" element={<ImportantDates />} />
                  <Route path="member/:memberId" element={<MemberTaskHistory />} />
                  <Route path="cost-calculator" element={<ProjectCostCalculator />} />

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
            </Suspense>
          </ErrorBoundary>
        </BrowserRouter>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
