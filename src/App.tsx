/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GlobalUIProvider, useGlobalUI } from './contexts/GlobalUIContext';
import { ToastProvider } from './contexts/ToastContext';
import { ConfirmProvider } from './contexts/ConfirmContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { BrandsProvider } from './contexts/BrandsContext';
import { PersonasProvider } from './contexts/PersonasContext';
import { AccountsProvider } from './contexts/AccountsContext';
import { ExecutionProvider } from './contexts/ExecutionContext';
import { AppShell } from './components/layout/AppShell';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { GenerateWorkspace } from './pages/GenerateWorkspace';
import { AccountsCenter } from './pages/AccountsCenter';
import { PersonasWorkspace } from './pages/PersonasWorkspace';
import { BrandsWorkspace } from './pages/BrandsWorkspace';
import { Results } from './pages/Results';
import { AssetsWorkspace } from './pages/AssetsWorkspace';
import { HistoryWorkspace } from './pages/HistoryWorkspace';
import { WorkflowsWorkspace } from './pages/WorkflowsWorkspace';
import { Dashboard } from './pages/Dashboard';
import { AnalyticsWorkspace } from './pages/AnalyticsWorkspace';
import { SettingsWorkspace } from './pages/SettingsWorkspace';
import { LoginPage } from './pages/LoginPage';
import { Logo } from './components/ui/Logo';
import { TooltipProvider } from './components/ui/tooltip';

const GenerateRedirect = () => {
  const { currentMode } = useGlobalUI();
  return <Navigate to={`/generate/${currentMode}`} replace />;
};

const AppRoutes = () => (
  <AppShell>
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/accounts" element={<AccountsCenter />} />
      <Route path="/brands" element={<BrandsWorkspace />} />
      <Route path="/personas" element={<PersonasWorkspace />} />

      <Route path="/generate" element={<GenerateRedirect />} />
      <Route path="/generate/:mode" element={<GenerateWorkspace />} />

      <Route path="/results" element={<Results />} />
      <Route path="/assets" element={<AssetsWorkspace />} />
      <Route path="/history" element={<HistoryWorkspace />} />
      <Route path="/workflows" element={<WorkflowsWorkspace />} />
      <Route path="/analytics" element={<AnalyticsWorkspace />} />
      <Route path="/settings" element={<SettingsWorkspace />} />
      <Route
        path="/help"
        element={<PlaceholderPage title="Help & Documentation" description="Resources to master the SMASH platform." />}
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  </AppShell>
);

/** Everything behind this needs a signed-in user: every endpoint is protected. */
const AuthGate = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-smash-base">
        <div className="animate-pulse">
          <Logo size="lg" showText />
        </div>
      </div>
    );
  }

  if (!user) return <LoginPage />;

  return (
    <BrandsProvider>
      <AccountsProvider>
        <PersonasProvider>
          <GlobalUIProvider>
            <ExecutionProvider>
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </ExecutionProvider>
          </GlobalUIProvider>
        </PersonasProvider>
      </AccountsProvider>
    </BrandsProvider>
  );
};

export default function App() {
  return (
    <TooltipProvider delayDuration={200}>
      <ToastProvider>
        <ConfirmProvider>
          <AuthProvider>
            <AuthGate />
          </AuthProvider>
        </ConfirmProvider>
      </ToastProvider>
    </TooltipProvider>
  );
}
