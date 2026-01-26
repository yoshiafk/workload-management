/**
 * Main Application Component
 * Sets up routing and global providers with lazy-loaded pages
 */

import { lazy, Suspense, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AppProvider } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import { DensityProvider } from './context/DensityContext';
import { ErrorBoundary, PageLoader } from './components/ui';
import Layout from './components/layout/Layout';

// Direct import for troubleshooting
import ResourceCosts from './pages/Library/ResourceCosts';

// Lazy-loaded Pages
const WorkloadSummary = lazy(() => import('./pages/WorkloadSummary'));
const ResourceAllocation = lazy(() => import('./pages/ResourceAllocation'));
const ImportantDates = lazy(() => import('./pages/ImportantDates'));
const TimelineView = lazy(() => import('./pages/TimelineView'));
const TeamMembers = lazy(() => import('./pages/Library/TeamMembers'));
const Phases = lazy(() => import('./pages/Library/Phases'));
const TaskTemplates = lazy(() => import('./pages/Library/TaskTemplates'));
const Complexity = lazy(() => import('./pages/Library/Complexity'));
const CostCenters = lazy(() => import('./pages/Library/CostCenters'));
const ChartOfAccounts = lazy(() => import('./pages/Library/ChartOfAccounts'));
const CostCenterReports = lazy(() => import('./pages/Library/CostCenterReports'));
const MemberTaskHistory = lazy(() => import('./pages/MemberTaskHistory'));
const ProjectCostCalculator = lazy(() => import('./pages/ProjectCostCalculator'));
const Settings = lazy(() => import('./pages/Settings'));

import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { KeyboardShortcutsHelp } from './components/ui/KeyboardShortcutsHelp';

import './index.css';

function NotFound() {
  const location = useLocation();
  return (
    <div className="p-20 text-center">
      <h2 className="text-2xl font-bold mb-4 text-rose-600">404: Page Not Found</h2>
      <div className="inline-block text-left bg-slate-50 dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
        <p className="text-sm font-medium text-slate-600 mb-2">The router couldn't find a match for this path:</p>
        <code className="block p-4 bg-white dark:bg-black rounded-xl border text-indigo-500 font-bold text-lg mb-6">
          {location.pathname}
        </code>
        <div className="grid grid-cols-2 gap-4 text-[10px] uppercase font-black tracking-widest text-slate-400 opacity-60">
          <div>
            <p className="mb-1">Basename</p>
            <p className="text-slate-600 dark:text-slate-300">/workload-management</p>
          </div>
          <div>
            <p className="mb-1">Vite Base</p>
            <p className="text-slate-600 dark:text-slate-300">{import.meta.env.BASE_URL}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useKeyboardShortcuts([
    {
      key: '?',
      description: 'Show keyboard shortcuts',
      handler: () => setIsHelpOpen(true),
    },
  ]);

  return (
    <DensityProvider>
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
                    <Route path="library/cost-centers" element={<CostCenters />} />
                    <Route path="library/chart-of-accounts" element={<ChartOfAccounts />} />
                    <Route path="library/cost-center-reports" element={<CostCenterReports />} />

                    {/* Settings */}
                    <Route path="settings" element={<Settings />} />

                    {/* Catch-all */}
                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </BrowserRouter>

          <KeyboardShortcutsHelp open={isHelpOpen} onOpenChange={setIsHelpOpen} />
          <Toaster
            position="bottom-right"
            richColors
            closeButton
            toastOptions={{
              duration: 3000,
              className: 'rounded-xl',
            }}
          />
        </AppProvider>
      </ThemeProvider>
    </DensityProvider>
  );
}

export default App;

