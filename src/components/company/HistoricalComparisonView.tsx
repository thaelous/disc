import React, { useState, useMemo } from 'react';
import { Company, Campaign, Collaborator, DISCFactor, DISCScores } from '../../types';
import {
  History,
  TrendingUp,
  TrendingDown,
  GitCompare,
  Calendar,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Building2,
  Users,
  CheckCircle2,
  BarChart3,
  PieChart,
  Layers,
  ShieldCheck,
  AlertTriangle,
  Printer,
  Sparkles,
  Info
} from 'lucide-react';

interface HistoricalComparisonViewProps {
  company: Company;
  campaigns: Campaign[];
  collaborators: Collaborator[];
}

interface CampaignStats {
  campaign: Campaign;
  totalCollaborators: number;
  completedCollaborators: Collaborator[];
  completedCount: number;
  participationRate: number;
  avgScores: {
    D: number;
    I: number;
    S: number;
    C: number;
    dPercent: number;
    iPercent: number;
    sPercent: number;
    cPercent: number;
  };
  dominantFactor: DISCFactor;
  quadrantDistribution: Record<DISCFactor, number>;
  quadrantPercentages: Record<DISCFactor, number>;
  archetypeDistribution: Record<string, number>;
  departmentStats: Record<string, {
    count: number;
    avgScores: { D: number; I: number; S: number; C: number };
    dominantFactor: DISCFactor;
  }>;
}

export const HistoricalComparisonView: React.FC<HistoricalComparisonViewProps> = ({
  company,
  campaigns,
  collaborators
}) => {
  // Filter campaigns belonging to this company
  const companyCampaigns = useMemo(() => {
    return campaigns.filter(c => c.companyId === company.id);
  }, [campaigns, company.id]);

  // Compute stats for all campaigns that belong to this company
  const campaignsStatsMap = useMemo(() => {
    const map = new Map<string, CampaignStats>();

    companyCampaigns.forEach(camp => {
      const campCollabs = collaborators.filter(c => c.campaignId === camp.id);
      const completed = campCollabs.filter(c => c.status === 'completed' && c.scores);
      const completedCount = completed.length;
      const total = campCollabs.length;
      const rate = total > 0 ? Math.round((completedCount / total) * 100) : 0;

      let sumD = 0, sumI = 0, sumS = 0, sumC = 0;
      let sumDP = 0, sumIP = 0, sumSP = 0, sumCP = 0;
      const quadCounts: Record<DISCFactor, number> = { D: 0, I: 0, S: 0, C: 0 };
      const archetypes: Record<string, number> = {};
      const deptMap: Record<string, {
        count: number;
        sumD: number; sumI: number; sumS: number; sumC: number;
      }> = {};

      completed.forEach(collab => {
        if (collab.scores) {
          sumD += collab.scores.D;
          sumI += collab.scores.I;
          sumS += collab.scores.S;
          sumC += collab.scores.C;
          sumDP += collab.scores.dPercent;
          sumIP += collab.scores.iPercent;
          sumSP += collab.scores.sPercent;
          sumCP += collab.scores.cPercent;

          quadCounts[collab.scores.dominantFactor] = (quadCounts[collab.scores.dominantFactor] || 0) + 1;

          const archTitle = collab.archetype?.title || 'Perfil Evaluado';
          archetypes[archTitle] = (archetypes[archTitle] || 0) + 1;

          const dept = collab.department || 'General';
          if (!deptMap[dept]) {
            deptMap[dept] = { count: 0, sumD: 0, sumI: 0, sumS: 0, sumC: 0 };
          }
          deptMap[dept].count++;
          deptMap[dept].sumD += collab.scores.D;
          deptMap[dept].sumI += collab.scores.I;
          deptMap[dept].sumS += collab.scores.S;
          deptMap[dept].sumC += collab.scores.C;
        }
      });

      const avgScores = {
        D: completedCount > 0 ? Math.round((sumD / completedCount) * 10) / 10 : 0,
        I: completedCount > 0 ? Math.round((sumI / completedCount) * 10) / 10 : 0,
        S: completedCount > 0 ? Math.round((sumS / completedCount) * 10) / 10 : 0,
        C: completedCount > 0 ? Math.round((sumC / completedCount) * 10) / 10 : 0,
        dPercent: completedCount > 0 ? Math.round(sumDP / completedCount) : 0,
        iPercent: completedCount > 0 ? Math.round(sumIP / completedCount) : 0,
        sPercent: completedCount > 0 ? Math.round(sumSP / completedCount) : 0,
        cPercent: completedCount > 0 ? Math.round(sumCP / completedCount) : 0
      };

      const dominantFactor: DISCFactor = (['D', 'I', 'S', 'C'] as DISCFactor[]).reduce((best, f) => 
        quadCounts[f] > quadCounts[best] ? f : best, 'D');

      const quadrantPercentages: Record<DISCFactor, number> = {
        D: completedCount > 0 ? Math.round((quadCounts.D / completedCount) * 100) : 0,
        I: completedCount > 0 ? Math.round((quadCounts.I / completedCount) * 100) : 0,
        S: completedCount > 0 ? Math.round((quadCounts.S / completedCount) * 100) : 0,
        C: completedCount > 0 ? Math.round((quadCounts.C / completedCount) * 100) : 0
      };

      const departmentStats: Record<string, {
        count: number;
        avgScores: { D: number; I: number; S: number; C: number };
        dominantFactor: DISCFactor;
      }> = {};

      Object.entries(deptMap).forEach(([dept, d]) => {
        const dAvg = {
          D: Math.round((d.sumD / d.count) * 10) / 10,
          I: Math.round((d.sumI / d.count) * 10) / 10,
          S: Math.round((d.sumS / d.count) * 10) / 10,
          C: Math.round((d.sumC / d.count) * 10) / 10
        };
        const dom: DISCFactor = (['D', 'I', 'S', 'C'] as DISCFactor[]).reduce((best, f) => 
          dAvg[f] > dAvg[best] ? f : best, 'D');
        departmentStats[dept] = {
          count: d.count,
          avgScores: dAvg,
          dominantFactor: dom
        };
      });

      map.set(camp.id, {
        campaign: camp,
        totalCollaborators: total,
        completedCollaborators: completed,
        completedCount,
        participationRate: rate,
        avgScores,
        dominantFactor,
        quadrantDistribution: quadCounts,
        quadrantPercentages,
        archetypeDistribution: archetypes,
        departmentStats
      });
    });

    return map;
  }, [companyCampaigns, collaborators]);

  // Campaigns that have at least 1 completed evaluation (comparable)
  const comparableCampaigns = useMemo(() => {
    return companyCampaigns
      .filter(c => {
        const stats = campaignsStatsMap.get(c.id);
        return stats && stats.completedCount > 0;
      })
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [companyCampaigns, campaignsStatsMap]);

  // Selected campaigns for head-to-head comparison
  const [baseCampaignId, setBaseCampaignId] = useState<string>(() => {
    if (comparableCampaigns.length >= 2) {
      return comparableCampaigns[0].id; // Earlier campaign as base
    }
    return comparableCampaigns[0]?.id || '';
  });

  const [targetCampaignId, setTargetCampaignId] = useState<string>(() => {
    if (comparableCampaigns.length >= 2) {
      return comparableCampaigns[comparableCampaigns.length - 1].id; // Most recent campaign as target
    }
    return comparableCampaigns[0]?.id || '';
  });

  // Selected comparison view mode: 'head-to-head' | 'timeline'
  const [viewMode, setViewMode] = useState<'head-to-head' | 'timeline'>('head-to-head');

  // Department filter for drilldown
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('all');

  // Stats for the chosen base & target campaigns
  const baseStats = campaignsStatsMap.get(baseCampaignId);
  const targetStats = campaignsStatsMap.get(targetCampaignId);

  // Common departments across base & target
  const sharedDepartments = useMemo(() => {
    if (!baseStats || !targetStats) return [];
    const baseDepts = Object.keys(baseStats.departmentStats);
    const targetDepts = Object.keys(targetStats.departmentStats);
    const set = new Set([...baseDepts, ...targetDepts]);
    return Array.from(set).sort();
  }, [baseStats, targetStats]);

  // Color constants for DISC
  const DISC_COLORS = {
    D: { bg: 'bg-rose-500', text: 'text-rose-700', border: 'border-rose-200', light: 'bg-rose-50', bar: '#E11D48', label: 'Dominancia' },
    I: { bg: 'bg-amber-500', text: 'text-amber-700', border: 'border-amber-200', light: 'bg-amber-50', bar: '#D97706', label: 'Influencia' },
    S: { bg: 'bg-emerald-500', text: 'text-emerald-700', border: 'border-emerald-200', light: 'bg-emerald-50', bar: '#059669', label: 'Estabilidad' },
    C: { bg: 'bg-blue-500', text: 'text-blue-700', border: 'border-blue-200', light: 'bg-blue-50', bar: '#2563EB', label: 'Cumplimiento' }
  };

  // Helper for rendering delta badges
  const renderDelta = (baseVal: number, targetVal: number, isPercent = false) => {
    const diff = Math.round((targetVal - baseVal) * 10) / 10;
    if (diff === 0) {
      return (
        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-600">
          <Minus className="w-3 h-3" />
          <span>0{isPercent ? '%' : ''}</span>
        </span>
      );
    }
    const isPositive = diff > 0;
    return (
      <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-xs font-semibold ${
        isPositive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
      }`}>
        {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        <span>{isPositive ? `+${diff}` : `${diff}`}{isPercent ? '%' : ''}</span>
      </span>
    );
  };

  // If there are less than 2 comparable campaigns, display helpful pedagogical banner
  if (comparableCampaigns.length < 2) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 text-center space-y-6 shadow-sm">
        <div className="w-16 h-16 bg-blue-50 border border-blue-200 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <History className="w-8 h-8" />
        </div>
        <div className="max-w-md mx-auto space-y-2">
          <h2 className="text-xl font-bold text-slate-900">
            Comparativa Histórica y Evolución DISC
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Esta vista permite contrastar la evolución conductual y la rotación de estilos del equipo entre múltiples periodos de evaluación.
          </p>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl max-w-lg mx-auto text-left text-xs text-slate-600 space-y-2">
          <div className="flex items-center gap-2 font-semibold text-slate-900">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Estado actual de campañas en {company.name}:</span>
          </div>
          <p>
            Actualmente se cuenta con <strong>{comparableCampaigns.length} campaña con evaluaciones concluidas</strong>. Para habilitar el análisis longitudinal, se requieren al menos dos periodos de evaluación con colaboradores finalizados.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-500 pt-1">
            <li>Crea una nueva campaña desde el Super Administrador o utiliza los códigos de campañas históricas.</li>
            <li>Cuando los colaboradores completen el test en dos campañas distintas, la comparativa de factores D, I, S, C y departamentos se activará automáticamente.</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* 1. Header & Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="p-2 bg-slate-900 text-white rounded-xl shadow-xs">
                <History className="w-4 h-4" />
              </span>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Evolución Histórica & Comparativa DISC
              </h2>
            </div>
            <p className="text-xs text-slate-500 max-w-2xl">
              Análisis longitudinal del comportamiento organizacional en <strong className="text-slate-700">{company.name}</strong>. Mide la variación de liderazgo, estabilidad y orientación a resultados a lo largo del tiempo.
            </p>
          </div>

          {/* Selector de Modo de Visualización & Imprimir */}
          <div className="flex items-center gap-2">
            <div className="inline-flex p-1 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setViewMode('head-to-head')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  viewMode === 'head-to-head'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GitCompare className="w-3.5 h-3.5" />
                <span>Periodo A vs B</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('timeline')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  viewMode === 'timeline'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Línea Temporal ({comparableCampaigns.length})</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="p-2 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors shadow-2xs"
              title="Imprimir o guardar reporte comparativo"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Selector de Campañas (Head-to-Head) */}
        {viewMode === 'head-to-head' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
            
            {/* Periodo A (Línea Base) */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                <span>Periodo A · Campaña Base (Referencia)</span>
              </label>
              <select
                value={baseCampaignId}
                onChange={e => setBaseCampaignId(e.target.value)}
                className="w-full text-xs font-medium text-slate-900 bg-white border border-slate-300 rounded-xl px-3 py-2.5 shadow-2xs focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                {comparableCampaigns.map(c => (
                  <option key={`base-${c.id}`} value={c.id}>
                    {c.title} ({c.accessCode}) · {campaignsStatsMap.get(c.id)?.completedCount} evaluados
                  </option>
                ))}
              </select>
              {baseStats && (
                <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>{new Date(baseStats.campaign.createdAt).toLocaleDateString()}</span>
                  <span>·</span>
                  <span>Estilo Dominante: <strong className="text-slate-700">{DISC_COLORS[baseStats.dominantFactor].label} ({baseStats.dominantFactor})</strong></span>
                </div>
              )}
            </div>

            {/* Periodo B (Campaña Comparada) */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                <span>Periodo B · Campaña Comparada (Reciente / Actual)</span>
              </label>
              <select
                value={targetCampaignId}
                onChange={e => setTargetCampaignId(e.target.value)}
                className="w-full text-xs font-medium text-slate-900 bg-white border border-slate-300 rounded-xl px-3 py-2.5 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {comparableCampaigns.map(c => (
                  <option key={`target-${c.id}`} value={c.id}>
                    {c.title} ({c.accessCode}) · {campaignsStatsMap.get(c.id)?.completedCount} evaluados
                  </option>
                ))}
              </select>
              {targetStats && (
                <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>{new Date(targetStats.campaign.createdAt).toLocaleDateString()}</span>
                  <span>·</span>
                  <span>Estilo Dominante: <strong className="text-slate-700">{DISC_COLORS[targetStats.dominantFactor].label} ({targetStats.dominantFactor})</strong></span>
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* 2. Tarjetas de Evolución por Dimensión DISC (Deltas & Métricas Clave) */}
      {viewMode === 'head-to-head' && baseStats && targetStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Factor D - Dominancia */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
                D · Dominancia
              </span>
              {renderDelta(baseStats.avgScores.dPercent, targetStats.avgScores.dPercent, true)}
            </div>

            <div className="space-y-1">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold font-mono text-slate-900">
                  {targetStats.avgScores.dPercent}%
                </span>
                <span className="text-xs text-slate-400">
                  anterior: {baseStats.avgScores.dPercent}%
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                Neto promedio: <span className="font-mono font-semibold text-slate-700">{targetStats.avgScores.D > 0 ? `+${targetStats.avgScores.D}` : targetStats.avgScores.D}</span>
                {' '}(antes {baseStats.avgScores.D > 0 ? `+${baseStats.avgScores.D}` : baseStats.avgScores.D})
              </div>
            </div>

            {/* Barras de comparación visual */}
            <div className="space-y-1 pt-1 border-t border-slate-100">
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>Base (A)</span>
                <span>{baseStats.avgScores.dPercent}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-400 rounded-full transition-all duration-500" style={{ width: `${baseStats.avgScores.dPercent}%` }} />
              </div>

              <div className="flex items-center justify-between text-[10px] text-rose-600 font-semibold pt-1">
                <span>Actual (B)</span>
                <span>{targetStats.avgScores.dPercent}%</span>
              </div>
              <div className="h-2 w-full bg-rose-100 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full transition-all duration-500" style={{ width: `${targetStats.avgScores.dPercent}%` }} />
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-snug">
              Orientación a metas, competitividad y velocidad en toma de decisiones.
            </p>
          </div>

          {/* Factor I - Influencia */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                I · Influencia
              </span>
              {renderDelta(baseStats.avgScores.iPercent, targetStats.avgScores.iPercent, true)}
            </div>

            <div className="space-y-1">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold font-mono text-slate-900">
                  {targetStats.avgScores.iPercent}%
                </span>
                <span className="text-xs text-slate-400">
                  anterior: {baseStats.avgScores.iPercent}%
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                Neto promedio: <span className="font-mono font-semibold text-slate-700">{targetStats.avgScores.I > 0 ? `+${targetStats.avgScores.I}` : targetStats.avgScores.I}</span>
                {' '}(antes {baseStats.avgScores.I > 0 ? `+${baseStats.avgScores.I}` : baseStats.avgScores.I})
              </div>
            </div>

            <div className="space-y-1 pt-1 border-t border-slate-100">
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>Base (A)</span>
                <span>{baseStats.avgScores.iPercent}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-400 rounded-full transition-all duration-500" style={{ width: `${baseStats.avgScores.iPercent}%` }} />
              </div>

              <div className="flex items-center justify-between text-[10px] text-amber-600 font-semibold pt-1">
                <span>Actual (B)</span>
                <span>{targetStats.avgScores.iPercent}%</span>
              </div>
              <div className="h-2 w-full bg-amber-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${targetStats.avgScores.iPercent}%` }} />
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-snug">
              Persuasión, comunicación abierta, venta de ideas y entusiasmo social.
            </p>
          </div>

          {/* Factor S - Estabilidad */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                S · Estabilidad
              </span>
              {renderDelta(baseStats.avgScores.sPercent, targetStats.avgScores.sPercent, true)}
            </div>

            <div className="space-y-1">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold font-mono text-slate-900">
                  {targetStats.avgScores.sPercent}%
                </span>
                <span className="text-xs text-slate-400">
                  anterior: {baseStats.avgScores.sPercent}%
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                Neto promedio: <span className="font-mono font-semibold text-slate-700">{targetStats.avgScores.S > 0 ? `+${targetStats.avgScores.S}` : targetStats.avgScores.S}</span>
                {' '}(antes {baseStats.avgScores.S > 0 ? `+${baseStats.avgScores.S}` : baseStats.avgScores.S})
              </div>
            </div>

            <div className="space-y-1 pt-1 border-t border-slate-100">
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>Base (A)</span>
                <span>{baseStats.avgScores.sPercent}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-400 rounded-full transition-all duration-500" style={{ width: `${baseStats.avgScores.sPercent}%` }} />
              </div>

              <div className="flex items-center justify-between text-[10px] text-emerald-600 font-semibold pt-1">
                <span>Actual (B)</span>
                <span>{targetStats.avgScores.sPercent}%</span>
              </div>
              <div className="h-2 w-full bg-emerald-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${targetStats.avgScores.sPercent}%` }} />
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-snug">
              Paciencia, trabajo en equipo armónico, lealtad y consistencia de ritmos.
            </p>
          </div>

          {/* Factor C - Cumplimiento */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                C · Cumplimiento
              </span>
              {renderDelta(baseStats.avgScores.cPercent, targetStats.avgScores.cPercent, true)}
            </div>

            <div className="space-y-1">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold font-mono text-slate-900">
                  {targetStats.avgScores.cPercent}%
                </span>
                <span className="text-xs text-slate-400">
                  anterior: {baseStats.avgScores.cPercent}%
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                Neto promedio: <span className="font-mono font-semibold text-slate-700">{targetStats.avgScores.C > 0 ? `+${targetStats.avgScores.C}` : targetStats.avgScores.C}</span>
                {' '}(antes {baseStats.avgScores.C > 0 ? `+${baseStats.avgScores.C}` : baseStats.avgScores.C})
              </div>
            </div>

            <div className="space-y-1 pt-1 border-t border-slate-100">
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>Base (A)</span>
                <span>{baseStats.avgScores.cPercent}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-400 rounded-full transition-all duration-500" style={{ width: `${baseStats.avgScores.cPercent}%` }} />
              </div>

              <div className="flex items-center justify-between text-[10px] text-blue-600 font-semibold pt-1">
                <span>Actual (B)</span>
                <span>{targetStats.avgScores.cPercent}%</span>
              </div>
              <div className="h-2 w-full bg-blue-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${targetStats.avgScores.cPercent}%` }} />
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-snug">
              Precisión analítica, apego a estándares de calidad y rigor metodológico.
            </p>
          </div>

        </div>
      )}

      {/* 3. Gráficas Comparativas DISC y Distribución de Cuadrantes */}
      {viewMode === 'head-to-head' && baseStats && targetStats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Gráfica 1: Barras Comparativas de Puntajes Medios (%) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Comparativa de Intensidad por Dimensión (%)
                </h3>
                <p className="text-xs text-slate-500">
                  Desviación de promedios conductuales normalizados (0 - 100%)
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-1.5 text-slate-500">
                  <span className="w-2.5 h-2.5 rounded-xs bg-slate-300" />
                  <span>Periodo A (Base)</span>
                </span>
                <span className="inline-flex items-center gap-1.5 text-slate-900 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-xs bg-blue-600" />
                  <span>Periodo B (Actual)</span>
                </span>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              {(['D', 'I', 'S', 'C'] as DISCFactor[]).map(factor => {
                const conf = DISC_COLORS[factor];
                const key = `${factor.toLowerCase()}Percent` as 'dPercent' | 'iPercent' | 'sPercent' | 'cPercent';
                const baseVal = baseStats.avgScores[key];
                const targetVal = targetStats.avgScores[key];

                return (
                  <div key={factor} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${conf.bg}`} />
                        <span>{conf.label} ({factor})</span>
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 font-mono">A: {baseVal}%</span>
                        <span className="font-bold text-slate-900 font-mono">B: {targetVal}%</span>
                        {renderDelta(baseVal, targetVal, true)}
                      </div>
                    </div>

                    {/* Barras paralelas */}
                    <div className="grid grid-cols-1 gap-1">
                      {/* Barra Periodo A */}
                      <div className="h-3 w-full bg-slate-100 rounded-sm overflow-hidden flex items-center">
                        <div
                          className="h-full bg-slate-300 rounded-sm transition-all duration-500"
                          style={{ width: `${Math.max(4, baseVal)}%` }}
                        />
                      </div>
                      {/* Barra Periodo B */}
                      <div className="h-4 w-full bg-slate-100 rounded-sm overflow-hidden flex items-center">
                        <div
                          className="h-full rounded-sm transition-all duration-500"
                          style={{ width: `${Math.max(4, targetVal)}%`, backgroundColor: conf.bar }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Muestra evaluada Periodo A: <strong>{baseStats.completedCount} colaboradores</strong></span>
              <span>Muestra evaluada Periodo B: <strong>{targetStats.completedCount} colaboradores</strong></span>
            </div>
          </div>

          {/* Gráfica 2: Desplazamiento de Cuadrantes (% de la plantilla en cada estilo) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Redistribución del Talento en Cuadrantes DISC
              </h3>
              <p className="text-xs text-slate-500">
                Porcentaje del equipo cuyo factor predominante se ubica en cada cuadrante
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              {(['D', 'I', 'S', 'C'] as DISCFactor[]).map(factor => {
                const conf = DISC_COLORS[factor];
                const basePct = baseStats.quadrantPercentages[factor] || 0;
                const targetPct = targetStats.quadrantPercentages[factor] || 0;
                const countDiff = (targetStats.quadrantDistribution[factor] || 0) - (baseStats.quadrantDistribution[factor] || 0);

                return (
                  <div key={factor} className={`p-4 rounded-xl border ${conf.border} ${conf.light} space-y-2`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold uppercase tracking-wider ${conf.text}`}>
                        {factor} · {conf.label}
                      </span>
                      {renderDelta(basePct, targetPct, true)}
                    </div>

                    <div className="flex items-baseline justify-between">
                      <div className="text-2xl font-bold font-mono text-slate-900">
                        {targetPct}%
                      </div>
                      <div className="text-xs text-slate-500">
                        {targetStats.quadrantDistribution[factor] || 0} personas
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/50">
                      <span>Antes: {basePct}% ({baseStats.quadrantDistribution[factor] || 0} personas)</span>
                      <span className="font-semibold text-slate-700">
                        {countDiff > 0 ? `+${countDiff}` : countDiff} colaboradores
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Estilo colectivo predominante:</span>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 font-semibold text-xs">
                  {DISC_COLORS[baseStats.dominantFactor].label} ({baseStats.dominantFactor})
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white font-semibold text-xs shadow-xs">
                  {DISC_COLORS[targetStats.dominantFactor].label} ({targetStats.dominantFactor})
                </span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* 4. Evolución por Departamentos */}
      {viewMode === 'head-to-head' && baseStats && targetStats && sharedDepartments.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Evolución Conductual por Departamentos
              </h3>
              <p className="text-xs text-slate-500">
                Comparativa de estilo y balance DISC en cada área entre el Periodo A y Periodo B
              </p>
            </div>

            {/* Filtro departamental */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Área:</span>
              <select
                value={selectedDeptFilter}
                onChange={e => setSelectedDeptFilter(e.target.value)}
                className="text-xs font-medium text-slate-900 bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-2xs"
              >
                <option value="all">Todas las áreas ({sharedDepartments.length})</option>
                {sharedDepartments.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Departamento</th>
                  <th className="py-3 px-4 text-center">Evaluados (A / B)</th>
                  <th className="py-3 px-4 text-center">Estilo Anterior</th>
                  <th className="py-3 px-4 text-center">Estilo Actual</th>
                  <th className="py-3 px-4 text-center font-mono">Δ Dominancia (D)</th>
                  <th className="py-3 px-4 text-center font-mono">Δ Influencia (I)</th>
                  <th className="py-3 px-4 text-center font-mono">Δ Estabilidad (S)</th>
                  <th className="py-3 px-4 text-center font-mono">Δ Cumplimiento (C)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {sharedDepartments
                  .filter(dept => selectedDeptFilter === 'all' || selectedDeptFilter === dept)
                  .map(dept => {
                    const deptBase = baseStats.departmentStats[dept];
                    const deptTarget = targetStats.departmentStats[dept];

                    const countA = deptBase?.count || 0;
                    const countB = deptTarget?.count || 0;

                    const domA = deptBase?.dominantFactor || '—';
                    const domB = deptTarget?.dominantFactor || '—';

                    return (
                      <tr key={dept} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {dept}
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-slate-500">
                          {countA} <span className="text-slate-300">/</span> <strong className="text-slate-900">{countB}</strong>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {deptBase ? (
                            <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                              {domA} · {DISC_COLORS[deptBase.dominantFactor].label}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {deptTarget ? (
                            <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${DISC_COLORS[deptTarget.dominantFactor].light} ${DISC_COLORS[deptTarget.dominantFactor].text} border ${DISC_COLORS[deptTarget.dominantFactor].border}`}>
                              {domB} · {DISC_COLORS[deptTarget.dominantFactor].label}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        
                        {/* Deltas de factores por área */}
                        <td className="py-3 px-4 text-center font-mono">
                          {deptBase && deptTarget ? renderDelta(deptBase.avgScores.D, deptTarget.avgScores.D) : '—'}
                        </td>
                        <td className="py-3 px-4 text-center font-mono">
                          {deptBase && deptTarget ? renderDelta(deptBase.avgScores.I, deptTarget.avgScores.I) : '—'}
                        </td>
                        <td className="py-3 px-4 text-center font-mono">
                          {deptBase && deptTarget ? renderDelta(deptBase.avgScores.S, deptTarget.avgScores.S) : '—'}
                        </td>
                        <td className="py-3 px-4 text-center font-mono">
                          {deptBase && deptTarget ? renderDelta(deptBase.avgScores.C, deptTarget.avgScores.C) : '—'}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Vista de Línea Temporal Multi-Campaña (Timeline) */}
      {viewMode === 'timeline' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">
              Línea de Tiempo y Evolución Secuencial ({comparableCampaigns.length} Periodos)
            </h3>
            <p className="text-xs text-slate-500">
              Traza cronológica de las métricas clave de cada campaña evaluada en la organización
            </p>
          </div>

          <div className="relative border-l-2 border-slate-200 ml-4 pl-6 space-y-8">
            {comparableCampaigns.map((camp, index) => {
              const stats = campaignsStatsMap.get(camp.id);
              if (!stats) return null;
              const isLatest = index === comparableCampaigns.length - 1;

              return (
                <div key={camp.id} className="relative space-y-3">
                  {/* Marcador en la línea de tiempo */}
                  <div className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-xs ${
                    isLatest ? 'bg-blue-600 ring-4 ring-blue-100' : 'bg-slate-400'
                  }`} />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                          {camp.accessCode}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">
                          {camp.title}
                        </h4>
                        {isLatest && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            Más reciente
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Iniciada: {new Date(camp.createdAt).toLocaleDateString()} · {stats.completedCount} colaboradores evaluados ({stats.participationRate}% participación)
                      </p>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-50 border border-slate-200">
                      <span className="text-slate-500">Estilo Dominante:</span>
                      <span className={DISC_COLORS[stats.dominantFactor].text}>
                        {DISC_COLORS[stats.dominantFactor].label} ({stats.dominantFactor})
                      </span>
                    </div>
                  </div>

                  {/* Barras de factores para esta campaña */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    {(['D', 'I', 'S', 'C'] as DISCFactor[]).map(factor => {
                      const key = `${factor.toLowerCase()}Percent` as 'dPercent' | 'iPercent' | 'sPercent' | 'cPercent';
                      const val = stats.avgScores[key];
                      const conf = DISC_COLORS[factor];

                      return (
                        <div key={factor} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-700">{factor} · {conf.label}</span>
                            <span className="font-mono font-bold text-slate-900">{val}%</span>
                          </div>
                          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${val}%`, backgroundColor: conf.bar }} />
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono text-right">
                            Neto: {stats.avgScores[factor] > 0 ? `+${stats.avgScores[factor]}` : stats.avgScores[factor]}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. Diagnóstico Cualitativo de Transformación Cultural */}
      {baseStats && targetStats && (
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md space-y-6">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-blue-600 rounded-xl text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Diagnóstico de Transformación Cultural & Guía para la Dirección
              </h3>
              <p className="text-xs text-slate-400">
                Síntesis analítica de la deriva psicométrica entre los periodos analizados
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            
            {/* 1. Vector de Cambio */}
            <div className="space-y-2 bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Vector de Cambio Colectivo</span>
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {targetStats.avgScores.dPercent > baseStats.avgScores.dPercent ? (
                  <>La organización ha incrementado significativamente su <strong>orientación al logro y asertividad (+D)</strong>, acelerando los tiempos de respuesta y la competitividad.</>
                ) : targetStats.avgScores.iPercent > baseStats.avgScores.iPercent ? (
                  <>Se observa una mayor <strong>apertura comunicativa y entusiasmo persuasivo (+I)</strong>, favoreciendo la colaboración interdepartamental y la relación con clientes.</>
                ) : targetStats.avgScores.sPercent > baseStats.avgScores.sPercent ? (
                  <>El equipo ha consolidado su <strong>resiliencia, lealtad y estabilidad (+S)</strong>, reduciendo fricciones internas y aumentando la predictibilidad operativa.</>
                ) : (
                  <>El colectivo ha elevado su <strong>rigor analítico y apego normativo (+C)</strong>, asegurando estándares elevados de calidad técnica y control de riesgos.</>
                )}
              </p>
            </div>

            {/* 2. Puntos Ciegos o de Fricción */}
            <div className="space-y-2 bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Riesgos de Transición</span>
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {targetStats.avgScores.sPercent < baseStats.avgScores.sPercent ? (
                  <>La disminución en el factor Estabilidad (S) sugiere que la aceleración operativa puede estar generando <strong>estrés o sobrecarga de cambios</strong> en mandos medios.</>
                ) : targetStats.avgScores.cPercent < baseStats.avgScores.cPercent ? (
                  <>La baja en Cumplimiento (C) amerita vigilar que la rapidez comercial no redunde en <strong>omisión de documentación o fallas en procesos de control</strong>.</>
                ) : (
                  <>El equipo mantiene un balance de transición controlado sin desgastes evidentes en los cuadrantes de soporte ni en cumplimiento normativo.</>
                )}
              </p>
            </div>

            {/* 3. Recomendación Estratégica */}
            <div className="space-y-2 bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Recomendación para RRHH</span>
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Alinear las evaluaciones de desempeño y los programas de liderazgo con el perfil <strong>{DISC_COLORS[targetStats.dominantFactor].label} ({targetStats.dominantFactor})</strong>, incentivando mentorías cruzadas entre áreas técnicas y comerciales.
              </p>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
