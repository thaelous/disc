import React from 'react';
import { HelpCircle, RotateCcw } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface TourTriggerButtonProps {
  tourType?: 'company' | 'candidate' | 'auto';
  label?: string;
  variant?: 'header' | 'action' | 'footer' | 'pill';
  className?: string;
  onTrigger?: () => void;
}

export const TourTriggerButton: React.FC<TourTriggerButtonProps> = ({
  tourType = 'auto',
  label = '¿Cómo funciona? (Ver Tutorial)',
  variant = 'header',
  className = '',
  onTrigger
}) => {
  const { activeView } = useApp();

  const handleLaunch = () => {
    if (onTrigger) {
      onTrigger();
      return;
    }

    const targetType =
      tourType === 'auto'
        ? activeView === 'evaluator'
          ? 'candidate'
          : 'company'
        : tourType;

    if (targetType === 'company') {
      window.dispatchEvent(new CustomEvent('open-company-tour'));
    } else if (targetType === 'candidate') {
      window.dispatchEvent(new CustomEvent('open-evaluator-tour'));
    }
  };

  if (variant === 'footer') {
    return (
      <button
        type="button"
        onClick={() => {
          localStorage.removeItem('disc_tour_company_viewed_v1');
          localStorage.removeItem('disc_tour_candidate_viewed_v1');
          handleLaunch();
        }}
        className={`inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors font-medium cursor-pointer ${className}`}
        title="Reiniciar recorridos interactivos de bienvenida"
      >
        <RotateCcw className="w-3.5 h-3.5 text-blue-500" />
        <span>Reiniciar Tutorial Interactivo</span>
      </button>
    );
  }

  if (variant === 'pill') {
    return (
      <button
        type="button"
        onClick={handleLaunch}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-all shadow-2xs cursor-pointer ${className}`}
        title="Ver Tutorial Interactivo Paso a Paso"
      >
        <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
        <span>{label}</span>
      </button>
    );
  }

  if (variant === 'action') {
    return (
      <button
        type="button"
        onClick={handleLaunch}
        className={`px-3.5 py-2 text-xs font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer ${className}`}
        title="Iniciar recorrido guiado interactivo"
      >
        <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
        <span>{label}</span>
      </button>
    );
  }

  // Default header variant
  return (
    <button
      type="button"
      onClick={handleLaunch}
      className={`px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs ${className}`}
      title="Ver Tutorial interactivo paso a paso"
    >
      <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden">Guía</span>
    </button>
  );
};
