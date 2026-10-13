import React, { useState, useMemo } from 'react';
import { Collaborator, Company, Campaign, DISCFactor } from '../../types';
import {
  Printer,
  X,
  ShieldCheck,
  User,
  Building2,
  Calendar,
  Download,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Briefcase,
  Activity,
  Layers,
  Sparkles,
  Compass
} from 'lucide-react';
import { exportIndividualPdfReport } from '../../utils/pdfReportGenerator';
import { calculateNaturalVsAdapted } from '../../data/stressAndSynergy';
import { JOB_BENCHMARKS, calculateJobFit, detectBenchmarkFromRole } from '../../data/jobFitBenchmarks';
import { getLeadershipGuide } from '../../data/managerLeadershipGuides';

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

  // Selected benchmark (default auto-detected from role/department)
  const initialBenchmarkId = useMemo(() => {
    return collaborator.benchmarkId || detectBenchmarkFromRole(collaborator.role, collaborator.department);
  }, [collaborator]);

  const [selectedBenchmarkId, setSelectedBenchmarkId] = useState<string>(initialBenchmarkId);

  // Psychometric calculations
  const naturalAdapted = useMemo(() => {
    if (!scores) return null;
    return calculateNaturalVsAdapted(scores);
  }, [scores]);

  const jobFit = useMemo(() => {
    if (!scores) return null;
    return calculateJobFit(scores, selectedBenchmarkId, collaborator.department);
  }, [scores, selectedBenchmarkId, collaborator.department]);

  const leadershipGuide = useMemo(() => {
    if (!scores) return null;
    return getLeadershipGuide(scores.dominantFactor, scores.secondaryFactor);
  }, [scores]);

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

  const factorColors: Record<DISCFactor, { title: string; barNat: string; barAdap: string }> = {
    D: { title: 'D · Dominancia', barNat: 'bg-slate-900', barAdap: 'bg-indigo-500' },
    I: { title: 'I · Influencia', barNat: 'bg-slate-900', barAdap: 'bg-indigo-500' },
    S: { title: 'S · Estabilidad', barNat: 'bg-slate-900', barAdap: 'bg-indigo-500' },
    C: { title: 'C · Cumplimiento', barNat: 'bg-slate-900', barAdap: 'bg-indigo-500' }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-2xl shadow-2xl text-slate-900 overflow-hidden my-8 print:border-none print:shadow-none print:m-0 print:p-0">
        
        {/* Modal Action Bar (Hidden on print) */}
        <div className="no-print flex items-center justify-between px-6 py-4 bg-slate-50/90 border-b border-slate-200 sticky top-0 z-20 backdrop-blur">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span className="font-bold text-slate-900">Ficha Psicométrica Ejecutiva Integral DISC</span>
            <span>·</span>
            <span>{collaborator.fullName}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar PDF</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Imprimir</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors ml-1 cursor-pointer"
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
                <span>Evaluación Conductual Directiva DISC</span>
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

          {/* 1. SECCIÓN: CONTRASTE PERFIL NATURAL VS. PERFIL ADAPTADO (ÍNDICE DE DESGASTE) */}
          {naturalAdapted && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-indigo-600" />
                    <span>Contraste Conductual: Estilo Natural vs. Estilo Adaptado</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Compara el estilo instintivo y espontáneo frente a la adaptación exigida en el entorno laboral.
                  </p>
                </div>

                {/* Badge Índice de Desgaste */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">Índice de Tensión:</span>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                      naturalAdapted.stressLevel === 'Normal'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : naturalAdapted.stressLevel === 'Moderado'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    {naturalAdapted.stressIndex}% · {naturalAdapted.stressLevel}
                  </span>
                </div>
              </div>

              {/* Leyenda Gráfica */}
              <div className="flex items-center gap-5 text-xs text-slate-600 pt-1">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-slate-900 inline-block" />
                  <span className="font-semibold text-slate-900">Estilo Natural</span> (Conducta instintiva / bajo presión)
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-indigo-500 inline-block" />
                  <span className="font-semibold text-indigo-700">Estilo Adaptado</span> (Máscara laboral / rol actual)
                </span>
              </div>

              {/* Gráfica Comparativa de Barras Dobles */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
                {(['D', 'I', 'S', 'C'] as DISCFactor[]).map(factor => {
                  const keyNat = `${factor.toLowerCase()}Percent` as keyof typeof naturalAdapted.natural;
                  const keyAdap = `${factor.toLowerCase()}Percent` as keyof typeof naturalAdapted.adapted;
                  const valNat = naturalAdapted.natural[keyNat] as number;
                  const valAdap = naturalAdapted.adapted[keyAdap] as number;
                  const gap = Math.abs(valNat - valAdap);

                  return (
                    <div key={factor} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800">{factorColors[factor].title}</span>
                        <span className="font-mono text-[11px] text-slate-400">Δ {gap}%</span>
                      </div>

                      {/* Barra Natural */}
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-slate-600 mb-1">
                          <span>Natural:</span>
                          <span className="font-mono font-bold text-slate-900">{valNat}%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-slate-900 h-full rounded-full transition-all"
                            style={{ width: `${valNat}%` }}
                          />
                        </div>
                      </div>

                      {/* Barra Adaptada */}
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-indigo-700 mb-1">
                          <span>Adaptado:</span>
                          <span className="font-mono font-bold text-indigo-600">{valAdap}%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-indigo-500 h-full rounded-full transition-all"
                            style={{ width: `${valAdap}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Diagnóstico Directivo del Índice de Desgaste */}
              <div
                className={`p-4 rounded-xl border text-xs leading-relaxed ${
                  naturalAdapted.stressLevel === 'Normal'
                    ? 'bg-emerald-50/60 border-emerald-200 text-slate-700'
                    : naturalAdapted.stressLevel === 'Moderado'
                    ? 'bg-amber-50/60 border-amber-200 text-slate-700'
                    : 'bg-rose-50/60 border-rose-200 text-slate-800'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {naturalAdapted.stressLevel === 'Alto Riesgo' ? (
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  ) : (
                    <Compass className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-900">
                      Diagnóstico Directivo: {naturalAdapted.levelLabel}
                    </p>
                    <p>{naturalAdapted.executiveDiagnosis}</p>
                    <p className="font-medium text-slate-800 pt-1">
                      <span className="font-bold">Recomendación para la jefatura: </span>
                      {naturalAdapted.recommendation}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. SECCIÓN: COMPATIBILIDAD CON EL PUESTO (JOB-FIT / BENCHMARK CONDUCTUAL) */}
          {jobFit && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-blue-600" />
                    <span>Compatibilidad con el Puesto (Job-Fit Score %)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Alineación del perfil conductual frente al benchmark ideal de la posición.
                  </p>
                </div>

                {/* Benchmark Selector & Badge */}
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={selectedBenchmarkId}
                    onChange={e => setSelectedBenchmarkId(e.target.value)}
                    className="no-print text-xs font-semibold text-slate-800 bg-slate-100 border border-slate-300 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
                  >
                    {JOB_BENCHMARKS.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.title}
                      </option>
                    ))}
                  </select>

                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full border ${
                      jobFit.fitLevel === 'Alto'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : jobFit.fitLevel === 'Medio'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    {jobFit.fitPercentage}% · Ajuste {jobFit.fitLevel}
                  </span>
                </div>
              </div>

              {/* Resumen del Job-Fit */}
              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                {jobFit.summary}
              </p>

              {/* Matriz de Brechas por Factor vs Benchmark */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
                {jobFit.gaps.map(gap => (
                  <div key={gap.factor} className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{gap.factor}</span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          gap.status === 'Alineado'
                            ? 'bg-emerald-100 text-emerald-800'
                            : gap.status === 'Superior'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {gap.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex justify-between font-mono">
                      <span>Evaluado: {gap.actualPercent}%</span>
                      <span>Ideal: {gap.benchmarkPercent}%</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug pt-1 border-t border-slate-200">
                      {gap.comment}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. SECCIÓN: MANUAL DE GESTIÓN Y LIDERAZGO PARA EL JEFE DIRECTO (DOs & DON'Ts) */}
          {leadershipGuide && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="border-b border-slate-100 pb-3">
                <div className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>Manual de Gestión y Liderazgo para el Jefe Directo</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                  Guía Ejecutiva de Bolsillo: Pautas Prácticas para Supervisar a {collaborator.fullName}
                </h3>
              </div>

              {/* Columnas DOs y DONTs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* DOs (Qué SÍ hacer) */}
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-5 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>QUÉ SÍ HACER (DOs) · Maximiza su Rendimiento</span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-slate-700">
                    {leadershipGuide.dos.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 leading-relaxed">
                        <span className="text-emerald-600 font-bold shrink-0 mt-0.5">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* DONTs (Qué NUNCA hacer) */}
                <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-5 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-800">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span>QUÉ NUNCA HACER (DON'Ts) · Desmotiva o Paraliza</span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-slate-700">
                    {leadershipGuide.donts.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 leading-relaxed">
                        <span className="text-rose-600 font-bold shrink-0 mt-0.5">✕</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* Claves Rápidas de Comunicación y Motivación */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                  <span className="font-bold text-slate-900 block mb-1">Clave de Comunicación Óptima:</span>
                  <ul className="space-y-1 text-slate-600">
                    {leadershipGuide.communicationTips.map((tip, i) => (
                      <li key={i}>• {tip}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                  <span className="font-bold text-slate-900 block mb-1">Palancas Principales de Motivación:</span>
                  <ul className="space-y-1 text-slate-600">
                    {leadershipGuide.motivationKeys.map((mot, i) => (
                      <li key={i}>• {mot}</li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>
          )}

          {/* Deep Behavioral Insights Sections */}
          {archetype && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              
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
