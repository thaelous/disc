import React from 'react';
import { Collaborator, Company, Campaign } from '../../types';
import { Printer, X, ShieldCheck, User, Building2, Calendar, Award, Download } from 'lucide-react';
import { exportIndividualPdfReport } from '../../utils/pdfReportGenerator';

interface IndividualReportModalProps {
  collaborator: Collaborator;
  company?: Company;
  campaign?: Campaign;
  onClose: () => void;
}

export const IndividualReportModal: React.FC<IndividualReportModalProps> = ({
  collaborator,
  company,
  campaign,
  onClose
}) => {
  const scores = collaborator.scores;
  const archetype = collaborator.archetype;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    exportIndividualPdfReport({
      collaborator,
      company,
      campaign
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-2xl shadow-2xl text-slate-900 overflow-hidden my-8 print:border-none print:shadow-none print:m-0 print:p-0">
        
        {/* Modal Action Bar (Hidden on print) */}
        <div className="no-print flex items-center justify-between px-6 py-4 bg-slate-50/80 border-b border-slate-200 sticky top-0 z-10 backdrop-blur">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span className="font-bold text-slate-900">Ficha Psicométrica Ejecutiva DISC</span>
            <span>·</span>
            <span>{collaborator.fullName}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar PDF</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Imprimir</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors ml-1"
              aria-label="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Report Document */}
        <div className="p-6 md:p-8 space-y-6 print:p-6 text-slate-900">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
                <span>Evaluación Conductual Empresarial DISC</span>
                <span>·</span>
                <span>Confidencial</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                {collaborator.fullName}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  {collaborator.role || 'Colaborador'}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  {collaborator.department} ({company?.name || 'Empresa Cliente'})
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {collaborator.completedAt ? new Date(collaborator.completedAt).toLocaleDateString('es-MX', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  }) : 'Evaluación Completada'}
                </span>
              </div>
            </div>

            {campaign && (
              <div className="text-left md:text-right bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Campaña</div>
                <div className="font-mono text-xs font-bold text-slate-900 mt-0.5">
                  {campaign.accessCode}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 truncate max-w-xs">
                  {campaign.title}
                </div>
              </div>
            )}
          </div>

          {/* Archetype Highlight Box */}
          {archetype && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-wider font-bold text-blue-600">
                    Arquetipo Conductual Predominante
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-900 mt-1">
                    {archetype.title}
                  </h2>
                  <p className="text-xs font-semibold text-slate-600 mt-0.5">
                    {archetype.subtitle}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-sm">
                  {archetype.dominant}
                </div>
              </div>
              <p className="text-sm text-slate-700 mt-3 leading-relaxed">
                {archetype.description}
              </p>
            </div>
          )}

          {/* DISC Dimension Breakdown */}
          {scores && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Perfil de Intensidad por Dimensión (D - I - S - C)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                
                {/* D Card */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-rose-700">D · Dominancia</span>
                    <span className="font-mono text-sm font-bold text-slate-900">
                      {scores.D > 0 ? `+${scores.D}` : scores.D}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Orientación a retos</div>
                  <div className="mt-3 bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-rose-500 h-full rounded-full transition-all"
                      style={{ width: `${scores.dPercent}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-right text-slate-500 font-mono mt-1 tabular-nums">
                    {scores.dPercent}% intensidad
                  </div>
                </div>

                {/* I Card */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-amber-700">I · Influencia</span>
                    <span className="font-mono text-sm font-bold text-slate-900">
                      {scores.I > 0 ? `+${scores.I}` : scores.I}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Persuasión social</div>
                  <div className="mt-3 bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all"
                      style={{ width: `${scores.iPercent}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-right text-slate-500 font-mono mt-1 tabular-nums">
                    {scores.iPercent}% intensidad
                  </div>
                </div>

                {/* S Card */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-emerald-700">S · Estabilidad</span>
                    <span className="font-mono text-sm font-bold text-slate-900">
                      {scores.S > 0 ? `+${scores.S}` : scores.S}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Consistencia y calma</div>
                  <div className="mt-3 bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all"
                      style={{ width: `${scores.sPercent}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-right text-slate-500 font-mono mt-1 tabular-nums">
                    {scores.sPercent}% intensidad
                  </div>
                </div>

                {/* C Card */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-blue-700">C · Cumplimiento</span>
                    <span className="font-mono text-sm font-bold text-slate-900">
                      {scores.C > 0 ? `+${scores.C}` : scores.C}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Rigor y precisión</div>
                  <div className="mt-3 bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all"
                      style={{ width: `${scores.cPercent}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-right text-slate-500 font-mono mt-1 tabular-nums">
                    {scores.cPercent}% intensidad
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Deep Behavioral Insights Sections */}
          {archetype && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              
              {/* Fortalezas Clave */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Fortalezas Conductuales Principales
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {archetype.strengths.map((str, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Estilo de Comunicación */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700">
                  Estilo de Comunicación & Interacción
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {archetype.communicationStyle}
                </p>
                <div className="pt-2 border-t border-slate-200 text-xs text-slate-500">
                  <span className="font-semibold text-slate-800">Bajo presión: </span>
                  {archetype.underPressure}
                </div>
              </div>

              {/* Entorno Laboral Ideal */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Entorno Laboral Óptimo
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {archetype.idealEnvironment}
                </p>
              </div>

              {/* Áreas de Oportunidad */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700">
                  Estrategias de Desarrollo
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {archetype.growthAreas.map((area, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-600 font-bold">•</span>
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          )}

          {/* Footer of the Report */}
          <div className="pt-4 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-slate-400">
            <div>
              Plataforma de Evaluación Psicométrica DISC · COMGICO
            </div>
            <div>
              ID: {collaborator.id}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
