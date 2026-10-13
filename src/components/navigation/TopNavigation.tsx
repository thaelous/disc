import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CorporateLogo } from '../common/CorporateLogo';
import { SuperAdminModal } from '../auth/SuperAdminModal';
import { TourTriggerButton } from '../common/TourTriggerButton';
import { Shield, LogOut } from 'lucide-react';

export const TopNavigation: React.FC = () => {
  const { activeView, setActiveView, logoutSuperAdmin, adminEmail } = useApp();
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  return (
    <>
      <header className="no-print border-b border-slate-200 bg-white sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* A la izquierda: Logo /comgico.png junto al texto de submarca */}
          <div
            onClick={() => setActiveView('landing')}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
            title="Ir a inicio de acceso"
          >
            <CorporateLogo className="h-9 sm:h-10" />
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-semibold text-slate-800 tracking-tight group-hover:text-slate-900 transition-colors">
                Portal Empresa · Evaluación DISC
              </span>
            </div>
          </div>

          {/* A la derecha: Botón de Tutorial, Cambiar Código y Acceso Super Admin */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Botón de Tutorial en Cabecera si aplica */}
            {(activeView === 'company' || activeView === 'evaluator') && (
              <TourTriggerButton
                label="¿Cómo funciona? (Ver Tutorial)"
                variant="header"
              />
            )}

            {activeView === 'admin' ? (
              <div className="flex items-center gap-2">
                {adminEmail && (
                  <span className="hidden sm:inline font-mono text-[11px] text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg truncate max-w-[170px]">
                    {adminEmail}
                  </span>
                )}
                <button
                  onClick={logoutSuperAdmin}
                  className="px-3.5 py-1.5 text-xs font-semibold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            ) : (
              <>
                {activeView !== 'landing' && (
                  <button
                    onClick={() => setActiveView('landing')}
                    className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
                    title="Volver a la pantalla de acceso"
                  >
                    <LogOut className="w-3.5 h-3.5 text-slate-500" />
                    <span className="hidden sm:inline">Cambiar Código</span>
                  </button>
                )}

                <button
                  onClick={() => setIsAdminModalOpen(true)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5 text-slate-500" />
                  <span>Acceso Super Admin</span>
                </button>
              </>
            )}
          </div>

        </div>
      </header>

      {/* Super Admin Login Modal */}
      <SuperAdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
      />
    </>
  );
};
