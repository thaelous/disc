import React, { useState, useMemo } from 'react';
import { Collaborator, DISCFactor, TeamSynergyDyad } from '../../types';
import { calculateTeamSynergy, generateTeamSynergySummary } from '../../data/stressAndSynergy';
import {
  Users,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  HelpCircle,
  Shuffle,
  Lightbulb,
  Building
} from 'lucide-react';

interface TeamSynergyViewProps {
  collaborators: Collaborator[];
}

export const TeamSynergyView: React.FC<TeamSynergyViewProps> = ({ collaborators }) => {
  const completedCollabs = useMemo(() => {
    return collaborators.filter(c => c.status === 'completed' && c.scores);
  }, [collaborators]);

  // Selected dyad for deep inspection
  const [selectedCollabAId, setSelectedCollabAId] = useState<string>(
    completedCollabs[0]?.id || ''
  );
  const [selectedCollabBId, setSelectedCollabBId] = useState<string>(
    completedCollabs[1]?.id || ''
  );

  // Selected matrix cell
  const [matrixSelectedDyad, setMatrixSelectedDyad] = useState<TeamSynergyDyad | null>(null);

  const synergySummary = useMemo(() => {
    return generateTeamSynergySummary(collaborators);
  }, [collaborators]);

  // Compute active dyad from selection or fallback
  const activeDyad = useMemo(() => {
    if (matrixSelectedDyad) return matrixSelectedDyad;
    const a = completedCollabs.find(c => c.id === selectedCollabAId);
    const b = completedCollabs.find(c => c.id === selectedCollabBId);
    if (a && b && a.id !== b.id) {
      return calculateTeamSynergy(a, b);
    }
    return null;
  }, [matrixSelectedDyad, completedCollabs, selectedCollabAId, selectedCollabBId]);

  const factorColors: Record<DISCFactor, { bg: string; text: string; label: string }> = {
    D: { bg: 'bg-rose-100 text-rose-800 border-rose-200', text: 'text-rose-700', label: 'Dominancia' },
    I: { bg: 'bg-amber-100 text-amber-800 border-amber-200', text: 'text-amber-700', label: 'Influencia' },
    S: { bg: 'bg-emerald-100 text-emerald-800 border-emerald-200', text: 'text-emerald-700', label: 'Estabilidad' },
    C: { bg: 'bg-blue-100 text-blue-800 border-blue-200', text: 'text-blue-700', label: 'Cumplimiento' }
  };

  if (completedCollabs.length < 2) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
          <Users className="w-8 h-8" />
        </div>
        <div className="max-w-md mx-auto space-y-1">
          <h3 className="text-base font-bold text-slate-900">
            Se requieren al menos 2 evaluaciones completadas
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            El Mapa de Sinergia y Dinámica Grupal calcula de manera cruzada las interacciones conductuales, alianzas naturales y puntos de fricción entre los evaluados. Actualmente hay {completedCollabs.length} colaborador(es) con test completado.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. Header & Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* KPI 1: Promedio de Sinergia */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider">Índice Global de Sinergia</span>
            <Sparkles className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-900 tabular-nums">
              {synergySummary.averageSynergy}%
            </span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Alta compatibilidad
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Calculado a partir de {synergySummary.totalPairs} combinaciones potenciales en el equipo.
          </p>
        </div>

        {/* KPI 2: Alianzas Naturales Detectadas */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider">Alianzas Estratégicas</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-emerald-700 tabular-nums">
              {synergySummary.topAlliances.length}
            </span>
            <span className="text-xs text-slate-500">duplas de alto impacto</span>
          </div>
          <p className="text-xs text-slate-500">
            Complementariedad natural (D+C ejecutor/analista, I+S promotor/lealtad).
          </p>
        </div>

        {/* KPI 3: Alertas de Fricción */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider">Alertas de Fricción Potencial</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-amber-700 tabular-nums">
              {synergySummary.criticalFrictions.length}
            </span>
            <span className="text-xs text-slate-500">combinaciones con riesgo</span>
          </div>
          <p className="text-xs text-slate-500">
            Choque de ritmos (D vs S) o brecha de enfoque (I vs C) requieren acuerdos previos.
          </p>
        </div>

      </div>

      {/* 2. Interactive Heatmap Matrix Grid */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Matriz y Mapa de Calor de Compatibilidad (Equipo Completo)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Haz clic en cualquier celda para analizar a profundidad la sinergia, alianzas y riesgos entre ambas personas.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500 shrink-0">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              <span>Alta (≥85%)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
              <span>Media (70-84%)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
              <span>Alerta Fricción (&lt;70%)</span>
            </span>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto pb-2">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr>
                <th className="p-2 border border-slate-200 bg-slate-50 text-slate-500 font-bold sticky left-0 z-10 w-44 min-w-44">
                  Colaborador
                </th>
                {completedCollabs.map((collab, idx) => (
                  <th
                    key={collab.id}
                    className="p-2 border border-slate-200 bg-slate-50 text-slate-700 font-bold text-center min-w-[70px] max-w-[80px]"
                    title={`${collab.fullName} (${collab.scores?.dominantFactor})`}
                  >
                    <div className="truncate text-[11px]">{collab.fullName.split(' ')[0]}</div>
                    <span className="inline-block px-1.5 py-0.2 text-[9px] font-mono font-bold rounded bg-slate-200 text-slate-800 mt-0.5">
                      {collab.scores?.dominantFactor}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {completedCollabs.map((rowCollab, rIdx) => (
                <tr key={rowCollab.id}>
                  {/* Sticky Row Header */}
                  <td className="p-2 border border-slate-200 bg-slate-50 text-slate-800 font-bold sticky left-0 z-10 w-44 min-w-44 truncate">
                    <div className="flex items-center justify-between gap-1">
                      <span className="truncate">{rowCollab.fullName}</span>
                      <span className="font-mono text-[10px] px-1 py-0.2 rounded bg-slate-200 text-slate-800 shrink-0">
                        {rowCollab.scores?.dominantFactor}
                      </span>
                    </div>
                  </td>

                  {/* Matrix Cells */}
                  {completedCollabs.map((colCollab, cIdx) => {
                    if (rIdx === cIdx) {
                      // Same person diagonal
                      return (
                        <td
                          key={colCollab.id}
                          className="p-2 border border-slate-200 bg-slate-100 text-slate-400 text-center font-mono text-[11px]"
                        >
                          —
                        </td>
                      );
                    }

                    const dyad = calculateTeamSynergy(rowCollab, colCollab);
                    const isSelected =
                      activeDyad &&
                      ((activeDyad.collabAId === rowCollab.id && activeDyad.collabBId === colCollab.id) ||
                        (activeDyad.collabAId === colCollab.id && activeDyad.collabBId === rowCollab.id));

                    let bgClass = 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border-emerald-200';
                    if (dyad.frictionRisk === 'Alto') {
                      bgClass = 'bg-amber-50 text-amber-800 hover:bg-amber-100 border-amber-200';
                    } else if (dyad.synergyScore < 85) {
                      bgClass = 'bg-blue-50 text-blue-800 hover:bg-blue-100 border-blue-200';
                    }

                    return (
                      <td
                        key={colCollab.id}
                        onClick={() => {
                          setMatrixSelectedDyad(dyad);
                          setSelectedCollabAId(rowCollab.id);
                          setSelectedCollabBId(colCollab.id);
                        }}
                        className={`p-2 border border-slate-200 text-center cursor-pointer transition-all ${bgClass} ${
                          isSelected ? 'ring-2 ring-slate-900 font-bold' : ''
                        }`}
                        title={`${rowCollab.fullName} + ${colCollab.fullName}: ${dyad.synergyScore}% (${dyad.allianceType})`}
                      >
                        <div className="font-mono font-bold text-xs">{dyad.synergyScore}%</div>
                        <div className="text-[9px] uppercase tracking-tighter opacity-80 truncate">
                          {dyad.frictionRisk === 'Alto' ? 'Fricción' : 'Alianza'}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Deep-Dive Inspector Panel for Selected Dyad */}
      {activeDyad && (
        <div className="bg-slate-900 text-white rounded-2xl p-6 md:p-8 shadow-xl space-y-6 border border-slate-800">
          
          {/* Dyad Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Análisis Profundo de Interacción y Sinergia</span>
              </div>
              <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white flex flex-wrap items-center gap-2">
                <span>{activeDyad.collabAName}</span>
                <span className="text-slate-500 font-normal">y</span>
                <span>{activeDyad.collabBName}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {activeDyad.allianceType}
              </p>
            </div>

            {/* Score & Risk Badge */}
            <div className="flex items-center gap-3">
              <div className="bg-slate-800/80 border border-slate-700 px-4 py-2.5 rounded-xl text-center">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Sinergia</div>
                <div className="text-2xl font-bold font-mono text-emerald-400 mt-0.5">
                  {activeDyad.synergyScore}%
                </div>
              </div>

              <div className="bg-slate-800/80 border border-slate-700 px-4 py-2.5 rounded-xl text-center">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Riesgo Fricción</div>
                <div
                  className={`text-xs font-bold mt-1.5 px-2 py-0.5 rounded-full ${
                    activeDyad.frictionRisk === 'Alto'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : activeDyad.frictionRisk === 'Moderado'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {activeDyad.frictionRisk}
                </div>
              </div>
            </div>
          </div>

          {/* Description & Detailed Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Column 1: Complementariedad & Alianza */}
            <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                <span>Alianza y Complementariedad</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeDyad.allianceDescription}
              </p>
            </div>

            {/* Column 2: Alertas de Fricción */}
            <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                <span>Alertas Tempranas de Fricción</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                {activeDyad.frictionPoints.map((pt, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold shrink-0">•</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Recomendaciones para el Líder Directo */}
            <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
                <Lightbulb className="w-4 h-4" />
                <span>Directrices de Coordinación</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                {activeDyad.collaborationTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-blue-400 font-bold shrink-0">✓</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>
      )}

      {/* 4. Strategic Guidelines for Cross-Functional Committees */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-blue-600" />
          <span>Directrices Estratégicas para Comités y Equipos Multidisciplinarios</span>
        </h3>
        <p className="text-xs text-slate-500">
          Recomendaciones basadas en la configuración psicométrica actual del equipo para maximizar la velocidad sin comprometer el clima ni la calidad:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {synergySummary.leadershipRecommendations.map((rec, idx) => (
            <div
              key={idx}
              className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3"
            >
              <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                {idx + 1}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {rec}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
