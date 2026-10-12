import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Company, Campaign } from '../../types';
import { getCampaignLiveStatus } from '../../utils/discCalculator';
import { QRCodeModal } from './QRCodeModal';
import {
  ShieldAlert,
  Building2,
  FolderKanban,
  Plus,
  QrCode,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Users,
  Calendar,
  X,
  Shield,
  LogOut,
  Trash2
} from 'lucide-react';

export const SuperAdminPortal: React.FC = () => {
  const {
    adminEmail,
    logoutSuperAdmin,
    companies,
    campaigns,
    collaborators,
    addCompany,
    addCampaign,
    deleteCampaign,
    setSelectedCampaignCode,
    setActiveView,
    resetData,
    showToast,
    submitEvaluation
  } = useApp();

  const [activeTab, setActiveTab] = useState<'campaigns' | 'companies'>('campaigns');

  // Delete Campaign Confirmation Modal State
  const [campaignToDelete, setCampaignToDelete] = useState<Campaign | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Modals
  const [isNewCompanyModalOpen, setIsNewCompanyModalOpen] = useState(false);
  const [isNewCampaignModalOpen, setIsNewCampaignModalOpen] = useState(false);
  const [selectedCampaignForQR, setSelectedCampaignForQR] = useState<Campaign | null>(null);

  // New Company Form State
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanyRfc, setNewCompanyRfc] = useState('');
  const [newCompanyContact, setNewCompanyContact] = useState('');
  const [newCompanyEmail, setNewCompanyEmail] = useState('');
  const [newCompanyPhone, setNewCompanyPhone] = useState('');
  const [newCompanyIndustry, setNewCompanyIndustry] = useState('Tecnología & Servicios');

  // New Campaign Form State
  const [newCampCompanyId, setNewCampCompanyId] = useState(companies[0]?.id || '');
  const [newCampCode, setNewCampCode] = useState(`DISC-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [newCampTitle, setNewCampTitle] = useState('Evaluación Conductual Talento 2026');
  const [newCampDays, setNewCampDays] = useState(15);
  const [newCampTarget, setNewCampTarget] = useState(30);

  const handleOpenTest = (code: string) => {
    setSelectedCampaignCode(code);
    setActiveView('evaluator');
  };

  const handleCreateCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim() || !newCompanyRfc.trim()) {
      alert('Nombre y RFC son obligatorios');
      return;
    }

    addCompany({
      name: newCompanyName.trim(),
      rfc: newCompanyRfc.trim().toUpperCase(),
      contactPerson: newCompanyContact.trim() || 'Contacto Principal',
      email: newCompanyEmail.trim() || 'contacto@empresa.com',
      phone: newCompanyPhone.trim() || '+52 (55) 0000-0000',
      industry: newCompanyIndustry
    });

    setNewCompanyName('');
    setNewCompanyRfc('');
    setNewCompanyContact('');
    setNewCompanyEmail('');
    setNewCompanyPhone('');
    setIsNewCompanyModalOpen(false);
  };

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampCode.trim() || !newCampTitle.trim()) {
      alert('Código y Título son obligatorios');
      return;
    }

    addCampaign({
      companyId: newCampCompanyId || companies[0].id,
      accessCode: newCampCode.trim().toUpperCase(),
      title: newCampTitle.trim(),
      durationDays: Number(newCampDays) || 15,
      targetParticipants: Number(newCampTarget) || 25
    });

    setIsNewCampaignModalOpen(false);
    setNewCampCode(`DISC-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  const handleSimulateFirstTest = (campaign: Campaign) => {
    const mockAnswers: Record<number, { mostOptionId: string; leastOptionId: string }> = {};
    for (let i = 1; i <= 28; i++) {
      mockAnswers[i] = {
        mostOptionId: `${i}-1`,
        leastOptionId: `${i}-3`
      };
    }

    submitEvaluation({
      campaignCode: campaign.accessCode,
      fullName: 'Simulación Primer Evaluado',
      email: `primero.${Date.now()}@test.com`,
      department: 'Dirección General',
      role: 'Primer Evaluador',
      answers: mockAnswers
    });

    showToast(`¡Campaña ${campaign.accessCode} activada con éxito! El cronómetro de ${campaign.durationDays} días ha comenzado.`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            <Shield className="w-4 h-4 text-slate-700" />
            <span>Super Administrador · COMGICO</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Gestión Centralizada de Empresas & Campañas DISC
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Supervisa organizaciones cliente, vigencia dinámica de evaluaciones y enlaces directos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {adminEmail && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-slate-500 text-[11px]">Admin:</span>
              <span className="font-semibold text-slate-800 font-mono text-[11px] truncate max-w-[180px]">
                {adminEmail}
              </span>
            </div>
          )}

          <button
            onClick={resetData}
            className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
            title="Restablecer datos originales de prueba"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restablecer Demo</span>
          </button>
          
          <button
            onClick={() => setIsNewCampaignModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nueva Campaña</span>
          </button>

          <button
            onClick={logoutSuperAdmin}
            className="px-3 py-2 text-xs font-semibold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            title="Cerrar sesión de Super Administrador"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === 'campaigns'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FolderKanban className="w-4 h-4" />
          <span>Campañas ({campaigns.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('companies')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === 'companies'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Empresas Clientes ({companies.length})</span>
        </button>
      </div>

      {/* TAB 1: CAMPAIGNS */}
      {activeTab === 'campaigns' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Listado Maestro de Campañas DISC
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Vigencia dinámica: el cronómetro se inicia al momento del primer test completado.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-5">Código / Título</th>
                  <th className="py-3 px-5">Empresa Asignada</th>
                  <th className="py-3 px-5">Duración & Estado</th>
                  <th className="py-3 px-5">1ª Evaluación</th>
                  <th className="py-3 px-5">Fecha Vencimiento</th>
                  <th className="py-3 px-5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {campaigns.map(camp => {
                  const comp = companies.find(c => c.id === camp.companyId);
                  const statusInfo = getCampaignLiveStatus(camp);
                  const completedCount = collaborators.filter(c => c.campaignId === camp.id && c.status === 'completed').length;

                  return (
                    <tr key={camp.id} className="hover:bg-slate-50/80 transition-colors">
                      
                      <td className="py-3.5 px-5">
                        <div className="font-mono font-bold text-slate-900 text-sm">
                          {camp.accessCode}
                        </div>
                        <div className="text-slate-500 text-xs mt-0.5">
                          {camp.title}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {completedCount} de {camp.targetParticipants} participantes evaluados
                        </div>
                      </td>

                      <td className="py-3.5 px-5">
                        <div className="font-semibold text-slate-900">
                          {comp?.name || 'Empresa Desconocida'}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400">
                          RFC: {comp?.rfc}
                        </div>
                      </td>

                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                            statusInfo.status === 'expired'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : statusInfo.status === 'pending'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              statusInfo.status === 'expired'
                                ? 'bg-rose-500'
                                : statusInfo.status === 'pending'
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`} />
                            {statusInfo.statusLabel}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Periodo: {camp.durationDays} días
                        </div>
                      </td>

                      <td className="py-3.5 px-5">
                        {camp.firstCompletedAt ? (
                          <div>
                            <div className="font-medium text-slate-900">
                              {new Date(camp.firstCompletedAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </div>
                            <div className="text-[11px] text-emerald-600 font-semibold">Activada</div>
                          </div>
                        ) : (
                          <div className="text-amber-600 text-xs italic">
                            En espera (1er test)
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-5 font-medium text-slate-800">
                        {statusInfo.expiresAtFormatted}
                      </td>

                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedCampaignForQR(camp)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors"
                            title="Ver Código QR y Enlace Directo"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleOpenTest(camp.accessCode)}
                            className="p-1.5 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                            title="Abrir en Test Móvil"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>

                          {statusInfo.status === 'pending' && (
                            <button
                              onClick={() => handleSimulateFirstTest(camp)}
                              className="px-2 py-1 text-[11px] font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg transition-colors flex items-center gap-1"
                              title="Simular 1er test para arrancar vigencia"
                            >
                              <Play className="w-3 h-3 fill-amber-600 text-amber-600" />
                              <span>Activar</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setCampaignToDelete(camp)}
                            className="p-1.5 text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
                            title="Eliminar Campaña"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: COMPANIES */}
      {activeTab === 'companies' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Empresas Clientes
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Organizaciones registradas en la plataforma de evaluación psicométrica.
              </p>
            </div>

            <button
              onClick={() => setIsNewCompanyModalOpen(true)}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Registrar Empresa</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-5">Razón Social / RFC</th>
                  <th className="py-3 px-5">Industria</th>
                  <th className="py-3 px-5">Contacto Principal</th>
                  <th className="py-3 px-5">Campañas Asignadas</th>
                  <th className="py-3 px-5">Fecha Alta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {companies.map(comp => {
                  const compCamps = campaigns.filter(c => c.companyId === comp.id);

                  return (
                    <tr key={comp.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="font-semibold text-slate-900">{comp.name}</div>
                        <div className="font-mono text-[11px] text-slate-400">{comp.rfc}</div>
                      </td>

                      <td className="py-3.5 px-5 text-slate-600">
                        {comp.industry}
                      </td>

                      <td className="py-3.5 px-5">
                        <div className="text-slate-900 font-medium">{comp.contactPerson}</div>
                        <div className="text-[11px] text-slate-400">{comp.email} · {comp.phone}</div>
                      </td>

                      <td className="py-3.5 px-5 font-mono">
                        <span className="font-bold text-slate-900">{compCamps.length}</span> campañas
                      </td>

                      <td className="py-3.5 px-5 text-slate-400">
                        {new Date(comp.createdAt).toLocaleDateString('es-MX')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: NUEVA EMPRESA */}
      {isNewCompanyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 text-slate-900">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-base">Registrar Nueva Empresa Cliente</h3>
              <button onClick={() => setIsNewCompanyModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCompany} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Razón Social / Nombre</label>
                <input
                  type="text"
                  required
                  value={newCompanyName}
                  onChange={e => setNewCompanyName(e.target.value)}
                  placeholder="Ej. Corporativo Sigma S.A. de C.V."
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 outline-none focus:border-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">RFC / ID Fiscal</label>
                  <input
                    type="text"
                    required
                    value={newCompanyRfc}
                    onChange={e => setNewCompanyRfc(e.target.value.toUpperCase())}
                    placeholder="CSI1809204A1"
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">Industria</label>
                  <input
                    type="text"
                    value={newCompanyIndustry}
                    onChange={e => setNewCompanyIndustry(e.target.value)}
                    placeholder="Financiero / Retail / TI"
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Nombre de Contacto</label>
                <input
                  type="text"
                  value={newCompanyContact}
                  onChange={e => setNewCompanyContact(e.target.value)}
                  placeholder="Lic. Patricia Morales"
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 outline-none focus:border-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">Correo Electrónico</label>
                  <input
                    type="email"
                    value={newCompanyEmail}
                    onChange={e => setNewCompanyEmail(e.target.value)}
                    placeholder="contacto@empresa.com"
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">Teléfono</label>
                  <input
                    type="text"
                    value={newCompanyPhone}
                    onChange={e => setNewCompanyPhone(e.target.value)}
                    placeholder="+52 (55) 5555-5555"
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewCompanyModalOpen(false)}
                  className="px-4 py-2 text-slate-500 hover:text-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl shadow-sm"
                >
                  Guardar Empresa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NUEVA CAMPAÑA */}
      {isNewCampaignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 text-slate-900">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-base">Crear Nueva Campaña de Evaluación</h3>
              <button onClick={() => setIsNewCampaignModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Empresa Asignada</label>
                <select
                  value={newCampCompanyId}
                  onChange={e => setNewCampCompanyId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 outline-none focus:border-slate-900"
                >
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.rfc})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Título de la Campaña</label>
                <input
                  type="text"
                  required
                  value={newCampTitle}
                  onChange={e => setNewCampTitle(e.target.value)}
                  placeholder="Ej. Diagnóstico Comercial Q2 2026"
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 outline-none focus:border-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">Código Único de Acceso</label>
                  <input
                    type="text"
                    required
                    value={newCampCode}
                    onChange={e => setNewCampCode(e.target.value.toUpperCase())}
                    placeholder="DISC-2026-X"
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">Duración de Vigencia (Días)</label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    required
                    value={newCampDays}
                    onChange={e => setNewCampDays(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 leading-relaxed text-[11px]">
                <strong className="text-slate-900">Vigencia Dinámica:</strong> El contador de {newCampDays} días se activará automáticamente al registrarse la primera evaluación completada.
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewCampaignModalOpen(false)}
                  className="px-4 py-2 text-slate-500 hover:text-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl shadow-sm"
                >
                  Crear Campaña
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR MODAL */}
      {selectedCampaignForQR && (
        <QRCodeModal
          campaign={selectedCampaignForQR}
          company={companies.find(c => c.id === selectedCampaignForQR.companyId)}
          onClose={() => setSelectedCampaignForQR(null)}
          onOpenTest={handleOpenTest}
        />
      )}

      {/* MODAL DE CONFIRMACIÓN: ELIMINAR CAMPAÑA */}
      {campaignToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  ¿Eliminar campaña?
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  {campaignToDelete.accessCode} · {campaignToDelete.title}
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl text-xs text-rose-900 leading-relaxed">
              ¿Estás seguro de que deseas eliminar esta campaña? Esta acción no se puede deshacer y borrará permanentemente la campaña y sus evaluaciones registradas asociadas en Firestore.
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setCampaignToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={async () => {
                  setIsDeleting(true);
                  try {
                    await deleteCampaign(campaignToDelete.id);
                    setCampaignToDelete(null);
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {isDeleting ? (
                  <span>Eliminando...</span>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar Campaña Definitivamente</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
