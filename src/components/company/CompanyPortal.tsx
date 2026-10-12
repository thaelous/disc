import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Collaborator, DISCFactor } from '../../types';
import { getCampaignLiveStatus, downloadCSV } from '../../utils/discCalculator';
import { exportExecutiveExcelReport } from '../../utils/excelReportGenerator';
import { exportExecutiveGeneralPdfReport, exportIndividualPdfReport } from '../../utils/pdfReportGenerator';
import { BulkUploadModal } from './BulkUploadModal';
import { AddCollaboratorModal } from './AddCollaboratorModal';
import { IndividualReportModal } from '../common/IndividualReportModal';
import { QRCodeModal } from '../admin/QRCodeModal';
import { HistoricalComparisonView } from './HistoricalComparisonView';
import {
  Users,
  CheckCircle2,
  TrendingUp,
  Brain,
  Download,
  Upload,
  QrCode,
  FileText,
  UserPlus,
  Copy,
  Check,
  Search,
  Filter,
  Eye,
  ExternalLink,
  ChevronRight,
  Clock,
  AlertTriangle,
  Building2,
  BarChart3,
  Loader2,
  History
} from 'lucide-react';

export const CompanyPortal: React.FC = () => {
  const {
    isLoading,
    companies,
    campaigns,
    collaborators,
    selectedCompanyId,
    setSelectedCompanyId,
    selectedCampaignCode,
    setSelectedCampaignCode,
    setActiveView,
    showToast
  } = useApp();

  // Selected portal tab: 'dashboard' (Active campaign) | 'history' (Historical comparison)
  const [portalTab, setPortalTab] = useState<'dashboard' | 'history'>('dashboard');

  // Selected filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState(false);

  // Modals state
  const [isAddCollaboratorOpen, setIsAddCollaboratorOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [selectedCollaboratorForModal, setSelectedCollaboratorForModal] = useState<Collaborator | null>(null);

  // Current company
  const currentCompany = useMemo(() => {
    return companies.find(c => c.id === selectedCompanyId) || companies[0];
  }, [companies, selectedCompanyId]);

  // Campaigns for this company
  const companyCampaigns = useMemo(() => {
    if (!currentCompany) return [];
    return campaigns.filter(c => c.companyId === currentCompany.id);
  }, [campaigns, currentCompany]);

  // Current active campaign
  const activeCampaign = useMemo(() => {
    if (!companyCampaigns.length) return null;
    const match = companyCampaigns.find(c => c.accessCode === selectedCampaignCode);
    return match || companyCampaigns[0];
  }, [companyCampaigns, selectedCampaignCode]);

  // Dynamic campaign validity
  const campaignValidity = useMemo(() => {
    if (!activeCampaign) return null;
    return getCampaignLiveStatus(activeCampaign);
  }, [activeCampaign]);

  // Collaborators in this campaign
  const campaignCollaborators = useMemo(() => {
    if (!activeCampaign) return [];
    return collaborators.filter(c => c.campaignId === activeCampaign.id);
  }, [collaborators, activeCampaign]);

  // Departments list in this campaign
  const departmentsList = useMemo(() => {
    const set = new Set<string>();
    campaignCollaborators.forEach(c => {
      if (c.department) set.add(c.department);
    });
    return Array.from(set).sort();
  }, [campaignCollaborators]);

  // Metrics
  const totalEnrolled = campaignCollaborators.length;
  const completedCollaborators = campaignCollaborators.filter(c => c.status === 'completed');
  const completedCount = completedCollaborators.length;
  const pendingCount = totalEnrolled - completedCount;
  const participationRate = totalEnrolled > 0 ? Math.round((completedCount / totalEnrolled) * 100) : 0;

  // Calculate DISC distribution across completed collaborators
  const quadrantStats = useMemo(() => {
    const counts: Record<DISCFactor, number> = { D: 0, I: 0, S: 0, C: 0 };
    completedCollaborators.forEach(c => {
      if (c.scores?.dominantFactor) {
        counts[c.scores.dominantFactor]++;
      }
    });

    const total = completedCount || 1;
    return {
      D: { count: counts.D, percent: Math.round((counts.D / total) * 100) },
      I: { count: counts.I, percent: Math.round((counts.I / total) * 100) },
      S: { count: counts.S, percent: Math.round((counts.S / total) * 100) },
      C: { count: counts.C, percent: Math.round((counts.C / total) * 100) }
    };
  }, [completedCollaborators, completedCount]);

  // Filtered Collaborators
  const filteredCollaborators = useMemo(() => {
    return campaignCollaborators.filter(c => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (departmentFilter !== 'all' && c.department !== departmentFilter) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        return (
          c.fullName.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          (c.role && c.role.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [campaignCollaborators, statusFilter, departmentFilter, searchTerm]);

  // Copy code handler
  const handleCopyCode = () => {
    if (!activeCampaign) return;
    navigator.clipboard.writeText(activeCampaign.accessCode);
    setCopiedCode(true);
    showToast(`Código ${activeCampaign.accessCode} copiado al portapapeles`);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Handler: Export Excel Master Report (.xlsx con diseño ejecutivo)
  const handleExportExcel = () => {
    if (!activeCampaign || !currentCompany) return;
    try {
      exportExecutiveExcelReport({
        company: currentCompany,
        campaign: activeCampaign,
        collaborators: campaignCollaborators
      });
      showToast(`Libro Excel Maestro (.xlsx) descargado exitosamente`);
    } catch (err) {
      console.error(err);
      showToast('Error al exportar el reporte en Excel.');
    }
  };

  // Handler: Reporte General en PDF (Informe Ejecutivo Consolidado y Fichas Técnicas)
  const handleOpenPdfReport = async () => {
    if (!activeCampaign || !currentCompany) return;
    if (completedCollaborators.length === 0) {
      showToast('Aún no hay colaboradores con evaluación completada en esta campaña.');
      return;
    }
    try {
      showToast('Generando informe ejecutivo consolidado...');
      await exportExecutiveGeneralPdfReport({
        company: currentCompany,
        campaign: activeCampaign,
        collaborators: campaignCollaborators
      });
      showToast('Informe Consolidado en PDF descargado exitosamente');
    } catch (err) {
      console.error(err);
      showToast('Error al compilar el informe ejecutivo en PDF.');
    }
  };

  if (isLoading && campaigns.length === 0) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center py-20 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-slate-900 mb-3" />
        <p className="text-sm font-medium text-slate-700">Conectando con Firebase Firestore...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* 1. Cabecera de la Campaña */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-1">
              {/* Nombre de la empresa en tipografía grande */}
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {currentCompany?.name}
              </h1>

              {/* Insignia de estado de la campaña con verde esmeralda */}
              {campaignValidity && (
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                  campaignValidity.status === 'expired'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : campaignValidity.status === 'pending'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    campaignValidity.status === 'expired'
                      ? 'bg-rose-500'
                      : campaignValidity.status === 'pending'
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`} />
                  <span>{campaignValidity.statusLabel}</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              <p className="text-xs text-slate-500">
                {activeCampaign?.title} · RFC: {currentCompany?.rfc}
              </p>
              {companyCampaigns.length > 1 && (
                <div className="flex items-center gap-1.5 pl-2 sm:border-l sm:border-slate-200">
                  <span className="text-[11px] text-slate-400 font-medium">Cambiar:</span>
                  <select
                    value={activeCampaign?.accessCode || ''}
                    onChange={e => setSelectedCampaignCode(e.target.value)}
                    className="text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200/70 border border-slate-300 rounded-lg px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
                  >
                    {companyCampaigns.map(c => (
                      <option key={c.id} value={c.accessCode}>
                        {c.accessCode} · {c.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Código asignado con botón para copiarlo */}
          {activeCampaign && (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-2 rounded-xl shrink-0">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider pl-2">
                Código:
              </span>
              <span className="font-mono text-sm font-bold text-slate-900 px-1">
                {activeCampaign.accessCode}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
                title="Copiar código de campaña"
              >
                {copiedCode ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedCode ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
          )}

        </div>

        {/* 2. Barra de Acciones Organizada */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Grupo Izquierdo */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Botón primario: + Registrar Colaborador */}
            <button
              onClick={() => setIsAddCollaboratorOpen(true)}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Registrar Colaborador</span>
            </button>

            {/* Botón secundario: Carga Masiva Excel */}
            <button
              onClick={() => setIsBulkModalOpen(true)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-2xs transition-all flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Carga Masiva Excel</span>
            </button>

            {/* Botón: Código QR de Campaña */}
            <button
              onClick={() => setIsQRModalOpen(true)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-2xs transition-all flex items-center gap-1.5"
            >
              <QrCode className="w-3.5 h-3.5 text-slate-500" />
              <span>Código QR de Campaña</span>
            </button>

          </div>

          {/* Grupo Derecho */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Botón ejecutivo: Reporte PDF */}
            <button
              onClick={handleOpenPdfReport}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-600/10 transition-all flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Reporte PDF</span>
            </button>

            {/* Botón: Exportar Excel (.xlsx) */}
            <button
              onClick={handleExportExcel}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-2xs transition-all flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Exportar Excel (.xlsx)</span>
            </button>

          </div>

        </div>

      </div>

      {/* 2. Pestañas de Navegación del Portal: Tablero de Campaña vs Comparativa Histórica */}
      <div className="flex items-center gap-3 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setPortalTab('dashboard')}
          className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            portalTab === 'dashboard'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Tablero de Campaña</span>
          {activeCampaign && (
            <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
              {activeCampaign.accessCode}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setPortalTab('history')}
          className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            portalTab === 'history'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Comparativa Histórica DISC</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
            {companyCampaigns.length} campañas
          </span>
        </button>
      </div>

      {portalTab === 'dashboard' ? (
        <>
          {/* 3. Métricas Clave (KPI Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Colaboradores Registrados */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="uppercase font-semibold tracking-wider">Colaboradores Registrados</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-900 tabular-nums">
              {totalEnrolled}
            </span>
            <span className="text-xs text-slate-500">en plantilla</span>
          </div>
          <p className="text-xs text-slate-400">
            {pendingCount} pendientes de responder
          </p>
        </div>

        {/* KPI 2: Evaluaciones Completadas */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="uppercase font-semibold tracking-wider">Evaluaciones Completadas</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-900 tabular-nums">
              {completedCount}
            </span>
            <span className="text-xs text-slate-500">finalizadas</span>
          </div>
          <p className="text-xs text-slate-400">
            Con perfil DISC calculado
          </p>
        </div>

        {/* KPI 3: Tasa de Participación (%) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="uppercase font-semibold tracking-wider">Tasa de Participación</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-900 tabular-nums">
              {participationRate}%
            </span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all"
              style={{ width: `${participationRate}%` }}
            />
          </div>
        </div>

        {/* KPI 4: Distribución de Perfiles DISC */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="uppercase font-semibold tracking-wider">Distribución DISC</span>
            <Brain className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="flex items-center gap-1.5 pt-1 text-xs font-mono font-bold">
            <span className="text-rose-600" title="Dominancia">D:{quadrantStats.D.percent}%</span>
            <span className="text-slate-300">·</span>
            <span className="text-amber-600" title="Influencia">I:{quadrantStats.I.percent}%</span>
            <span className="text-slate-300">·</span>
            <span className="text-emerald-600" title="Estabilidad">S:{quadrantStats.S.percent}%</span>
            <span className="text-slate-300">·</span>
            <span className="text-blue-600" title="Cumplimiento">C:{quadrantStats.C.percent}%</span>
          </div>
          <p className="text-xs text-slate-400">
            {completedCount > 0 ? `Predominante: ${quadrantStats.D.count >= quadrantStats.I.count && quadrantStats.D.count >= quadrantStats.S.count ? 'Dominante (D)' : 'Influyente (I)'}` : 'Sin datos completados'}
          </p>
        </div>

      </div>

      {/* 4. Gráficas de Visualización DISC Corporativa */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Distribución por Cuadrante DISC */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Distribución de Perfiles Conductuales DISC
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Proporción de talento según su estilo predominante
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400 tabular-nums">N = {completedCount}</span>
          </div>

          <div className="space-y-3.5 pt-1">
            
            {/* D */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-rose-700">D · Dominancia</span>
                <span className="font-mono text-slate-700 font-semibold tabular-nums">
                  {quadrantStats.D.count} ({quadrantStats.D.percent}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${quadrantStats.D.percent}%` }}
                />
              </div>
            </div>

            {/* I */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-amber-700">I · Influencia</span>
                <span className="font-mono text-slate-700 font-semibold tabular-nums">
                  {quadrantStats.I.count} ({quadrantStats.I.percent}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${quadrantStats.I.percent}%` }}
                />
              </div>
            </div>

            {/* S */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-emerald-700">S · Estabilidad</span>
                <span className="font-mono text-slate-700 font-semibold tabular-nums">
                  {quadrantStats.S.count} ({quadrantStats.S.percent}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${quadrantStats.S.percent}%` }}
                />
              </div>
            </div>

            {/* C */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-blue-700">C · Cumplimiento</span>
                <span className="font-mono text-slate-700 font-semibold tabular-nums">
                  {quadrantStats.C.count} ({quadrantStats.C.percent}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${quadrantStats.C.percent}%` }}
                />
              </div>
            </div>

          </div>
        </div>

        {/* Desglose por Departamento */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Participación por Departamento
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Avance de evaluaciones en las distintas áreas corporativas
              </p>
            </div>
            <BarChart3 className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-3 pt-1">
            {departmentsList.map(dept => {
              const inDept = campaignCollaborators.filter(c => c.department === dept);
              const doneInDept = inDept.filter(c => c.status === 'completed').length;
              const rate = inDept.length > 0 ? Math.round((doneInDept / inDept.length) * 100) : 0;

              return (
                <div key={dept} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{dept}</span>
                    <span className="font-mono text-slate-500 tabular-nums">
                      {doneInDept}/{inDept.length} ({rate}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-slate-900 h-full rounded-full transition-all"
                      style={{ width: `${rate}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* 5. Tabla de Colaboradores Registrados */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        
        {/* Toolbar de la tabla */}
        <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Colaboradores de la Campaña ({filteredCollaborators.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Supervisión de estatus y consulta de reportes individuales.
            </p>
          </div>

          {/* Filtros rápidos */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Buscador */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Buscar colaborador..."
                className="bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl pl-8 pr-3 py-1.5 outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>

            {/* Filtro Estatus */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-1.5 outline-none"
            >
              <option value="all">Todos los estatus</option>
              <option value="completed">Completados ({completedCount})</option>
              <option value="pending">Pendientes ({pendingCount})</option>
            </select>

            {/* Filtro Departamento */}
            {departmentsList.length > 0 && (
              <select
                value={departmentFilter}
                onChange={e => setDepartmentFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-1.5 outline-none"
              >
                <option value="all">Todos los departamentos</option>
                {departmentsList.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            )}

          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-5">Colaborador</th>
                <th className="py-3 px-5">Departamento & Puesto</th>
                <th className="py-3 px-5">Estado</th>
                <th className="py-3 px-5">Arquetipo DISC</th>
                <th className="py-3 px-5 text-center font-mono">Puntajes Netos</th>
                <th className="py-3 px-5 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredCollaborators.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No se encontraron colaboradores registrados con estos filtros.
                  </td>
                </tr>
              ) : (
                filteredCollaborators.map(collab => {
                  const isDone = collab.status === 'completed';

                  return (
                    <tr key={collab.id} className="hover:bg-slate-50/80 transition-colors">
                      
                      <td className="py-3.5 px-5">
                        <div className="font-semibold text-slate-900">{collab.fullName}</div>
                        <div className="font-mono text-[11px] text-slate-400">{collab.email}</div>
                      </td>

                      <td className="py-3.5 px-5">
                        <div className="text-slate-800">{collab.department}</div>
                        <div className="text-slate-400 text-[11px]">{collab.role}</div>
                      </td>

                      <td className="py-3.5 px-5">
                        {isDone ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Completado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Pendiente
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-5">
                        {collab.archetype ? (
                          <div>
                            <div className="font-semibold text-slate-900">
                              {collab.archetype.title}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate max-w-xs">
                              {collab.archetype.subtitle}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-5 text-center font-mono text-xs tabular-nums">
                        {collab.scores ? (
                          <div className="space-x-1.5">
                            <span className="text-rose-600 font-bold">D:{collab.scores.D > 0 ? `+${collab.scores.D}` : collab.scores.D}</span>
                            <span className="text-amber-600 font-bold">I:{collab.scores.I > 0 ? `+${collab.scores.I}` : collab.scores.I}</span>
                            <span className="text-emerald-600 font-bold">S:{collab.scores.S > 0 ? `+${collab.scores.S}` : collab.scores.S}</span>
                            <span className="text-blue-600 font-bold">C:{collab.scores.C > 0 ? `+${collab.scores.C}` : collab.scores.C}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-5 text-right">
                        {isDone ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedCollaboratorForModal(collab)}
                              className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors inline-flex items-center gap-1"
                              title="Ver Ficha Psicométrica Completa"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Ver Ficha</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                exportIndividualPdfReport({
                                  collaborator: collab,
                                  company: currentCompany,
                                  campaign: activeCampaign || undefined
                                });
                                showToast(`Ficha individual PDF descargada: ${collab.fullName}`);
                              }}
                              className="px-2 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors inline-flex items-center gap-1 shadow-2xs"
                              title="Descargar Ficha Técnica en PDF"
                            >
                              <Download className="w-3 h-3 text-slate-600" />
                              <span>PDF</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCampaignCode(activeCampaign?.accessCode || '');
                              setActiveView('evaluator');
                            }}
                            className="text-[11px] text-slate-500 hover:text-slate-900 hover:underline"
                          >
                            Iniciar Test
                          </button>
                        )}
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>
        </>
      ) : (
        <HistoricalComparisonView
          company={currentCompany}
          campaigns={campaigns}
          collaborators={collaborators}
        />
      )}

      {/* Modales */}
      <AddCollaboratorModal
        isOpen={isAddCollaboratorOpen}
        campaign={activeCampaign!}
        company={currentCompany!}
        onClose={() => setIsAddCollaboratorOpen(false)}
      />

      {isBulkModalOpen && activeCampaign && currentCompany && (
        <BulkUploadModal
          campaign={activeCampaign}
          company={currentCompany}
          onClose={() => setIsBulkModalOpen(false)}
        />
      )}

      {isQRModalOpen && activeCampaign && (
        <QRCodeModal
          campaign={activeCampaign}
          company={currentCompany}
          onClose={() => setIsQRModalOpen(false)}
          onOpenTest={code => {
            setSelectedCampaignCode(code);
            setActiveView('evaluator');
          }}
        />
      )}

      {selectedCollaboratorForModal && (
        <IndividualReportModal
          collaborator={selectedCollaboratorForModal}
          company={currentCompany}
          campaign={activeCampaign || undefined}
          onClose={() => setSelectedCollaboratorForModal(null)}
        />
      )}

    </div>
  );
};
