/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GlobalUIProvider, useGlobalUI } from './contexts/GlobalUIContext';
import { ToastProvider } from './contexts/ToastContext';
import { AccountsProvider } from './contexts/AccountsContext';
import { ExecutionProvider } from './contexts/ExecutionContext';
import { AppShell } from './components/layout/AppShell';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { GenerateWorkspace } from './pages/GenerateWorkspace';
import { AccountsCenter } from './pages/AccountsCenter';
import { Results } from './pages/Results';
import { AssetsWorkspace } from './pages/AssetsWorkspace';
import { HistoryWorkspace } from './pages/HistoryWorkspace';
import { WorkflowsWorkspace } from './pages/WorkflowsWorkspace';
import { Dashboard } from './pages/Dashboard';
import { AnalyticsWorkspace } from './pages/AnalyticsWorkspace';
import { SettingsWorkspace } from './pages/SettingsWorkspace';

const GenerateRedirect = () => {
  const { currentMode } = useGlobalUI();
  return <Navigate to={`/generate/${currentMode}`} replace />;
};

export default function App() {
  return (
    <AccountsProvider>
      <ToastProvider>
        <GlobalUIProvider>
          <ExecutionProvider>
            <BrowserRouter>
              <AppShell>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/accounts" element={<AccountsCenter />} />
                  
                  <Route path="/generate" element={<GenerateRedirect />} />
                  <Route path="/generate/:mode" element={<GenerateWorkspace />} />
                  
                  <Route path="/results" element={<Results />} />
                  <Route path="/assets" element={<AssetsWorkspace />} />
                  <Route path="/history" element={<HistoryWorkspace />} />
                  <Route path="/workflows" element={<WorkflowsWorkspace />} />
                  <Route path="/analytics" element={<AnalyticsWorkspace />} />
                  <Route path="/settings" element={<SettingsWorkspace />} />
                  <Route path="/help" element={<PlaceholderPage title="Help & Documentation" description="Resources to master the SMASH platform." />} />
                </Routes>
              </AppShell>
            </BrowserRouter>
          </ExecutionProvider>
        </GlobalUIProvider>
      </ToastProvider>
    </AccountsProvider>
  );
}
