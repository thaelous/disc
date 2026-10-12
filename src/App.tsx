import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { TopNavigation } from './components/navigation/TopNavigation';
import { LandingAccessView } from './components/landing/LandingAccessView';
import { CompanyPortal } from './components/company/CompanyPortal';
import { EvaluatorView } from './components/evaluator/EvaluatorView';
import { SuperAdminPortal } from './components/admin/SuperAdminPortal';

const AppContent: React.FC = () => {
  const { activeView } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-slate-900 selection:text-white">
      
      {/* Top Bar Fixed Navigation */}
      <TopNavigation />

      {/* Main View Port */}
      <main className="flex-1">
        {activeView === 'landing' && <LandingAccessView />}
        {activeView === 'company' && <CompanyPortal />}
        {activeView === 'evaluator' && <EvaluatorView />}
        {activeView === 'admin' && <SuperAdminPortal />}
      </main>

      {/* Footer */}
      <footer className="no-print border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">COMGICO</span>
            <span>·</span>
            <span>Portal Empresa · Evaluación Psicométrica DISC © {new Date().getFullYear()}</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Metodología Psicométrica Validada · 28 Tétradas Conductuales de Elección Forzada
          </div>
        </div>
      </footer>

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
