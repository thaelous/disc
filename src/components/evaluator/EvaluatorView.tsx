import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { DISC_BLOCKS } from '../../data/discQuestions';
import { getCampaignLiveStatus, AnswerMap } from '../../utils/discCalculator';
import { IndividualReportModal } from '../common/IndividualReportModal';
import { Collaborator, DISCScores, DISCArchetype } from '../../types';
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  User,
  Building2,
  Mail,
  Briefcase,
  Clock,
  Sparkles,
  FileText,
  Check,
  Minus,
  Plus,
  HelpCircle,
  Smartphone,
  Maximize2
} from 'lucide-react';
import { GuidedTour, TourStep } from '../common/GuidedTour';

export const EvaluatorView: React.FC = () => {
  const {
    campaigns,
    companies,
    collaborators,
    selectedCampaignCode,
    setSelectedCampaignCode,
    verifyCodeInFirestore,
    submitEvaluation,
    setActiveView
  } = useApp();

  // Test session state
  const [stage, setStage] = useState<'onboarding' | 'test' | 'completed'>('onboarding');
  const [campaignCodeInput, setCampaignCodeInput] = useState<string>(selectedCampaignCode);
  const [isEditingCode, setIsEditingCode] = useState<boolean>(!selectedCampaignCode);
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [department, setDepartment] = useState<string>('Ventas y Comercial');
  const [role, setRole] = useState<string>('Colaborador');
  const [selectedPendingId, setSelectedPendingId] = useState<string>('');

  // Synchronize campaign code whenever selectedCampaignCode changes
  React.useEffect(() => {
    if (selectedCampaignCode) {
      setCampaignCodeInput(selectedCampaignCode.toUpperCase());
    }
  }, [selectedCampaignCode]);

  // If campaign not in local list, automatically verify against Firestore
  React.useEffect(() => {
    const code = campaignCodeInput.trim().toUpperCase();
    if (code) {
      const match = campaigns.find(c => c.accessCode.toUpperCase() === code);
      if (!match) {
        verifyCodeInFirestore(code);
      }
    }
  }, [campaignCodeInput, campaigns, verifyCodeInFirestore]);

  // 28-question answers state
  const [currentBlockIndex, setCurrentBlockIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<AnswerMap>({});

  // Result state
  const [evaluationResult, setEvaluationResult] = useState<{
    scores: DISCScores;
    archetype: DISCArchetype;
    collaborator: Collaborator;
  } | null>(null);

  const [showFullReportModal, setShowFullReportModal] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);
  const [simulatorMode, setSimulatorMode] = useState<'mobile' | 'full'>('mobile');

  // Auto-launch Guided Tour for first-time evaluators
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const tourSeen = localStorage.getItem('disc_tour_candidate_viewed_v1');
      if (!tourSeen) {
        const timer = setTimeout(() => {
          setIsTourOpen(true);
        }, 700);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  // Global listener to trigger tour from TopNavigation or anywhere
  React.useEffect(() => {
    const handleOpenTour = () => setIsTourOpen(true);
    window.addEventListener('open-evaluator-tour', handleOpenTour);
    return () => window.removeEventListener('open-evaluator-tour', handleOpenTour);
  }, []);

  // Guided Tour Steps Configuration for Evaluator / Candidate View
  const evaluatorTourSteps: TourStep[] = useMemo(() => [
    {
      id: 'welcome',
      title: 'Bienvenida e Instrucciones Clave',
      description: 'Bienvenido a tu Evaluación Conductual DISC. Esta prueba no califica conocimientos ni respuestas buenas o malas; describe tus preferencias naturales de trabajo.',
      targetSelector: '#tour-candidate-welcome',
      placement: 'bottom',
      icon: <Sparkles className="w-4 h-4 text-blue-600" />
    },
    {
      id: 'forced-choice',
      title: 'Formato de Elección Forzada',
      description: 'En cada bloque verás 4 adjetivos o frases. Tu tarea es elegir obligatoriamente 1 opción que MÁS te describa (+) y 1 opción que MENOS te describa (-).',
      targetSelector: '#tour-candidate-block',
      placement: 'bottom',
      icon: <Plus className="w-4 h-4 text-emerald-600" />
    },
    {
      id: 'exclusivity-rule',
      title: 'Regla de Exclusividad',
      description: "No puedes seleccionar 'MÁS' y 'MENOS' en la misma frase. Responde con espontaneidad y pensando en cómo actúas en tu día a día.",
      targetSelector: '#tour-candidate-exclusivity',
      placement: 'top',
      icon: <Check className="w-4 h-4 text-indigo-600" />
    },
    {
      id: 'progress',
      title: 'Barra de Progreso y Envío',
      description: 'Sigue el avance en la barra superior hasta completar los reactivos. Al finalizar, tu reporte psicométrico se procesará de forma inmediata.',
      targetSelector: '#tour-candidate-progress',
      placement: 'top',
      icon: <Clock className="w-4 h-4 text-purple-600" />
    }
  ], []);

  // Active campaign detection
  const currentCampaign = useMemo(() => {
    return campaigns.find(c => c.accessCode.toUpperCase() === campaignCodeInput.trim().toUpperCase());
  }, [campaigns, campaignCodeInput]);

  const campaignCompany = useMemo(() => {
    if (!currentCampaign) return undefined;
    return companies.find(c => c.id === currentCampaign.companyId);
  }, [currentCampaign, companies]);

  const campaignStatusInfo = useMemo(() => {
    if (!currentCampaign) return null;
    return getCampaignLiveStatus(currentCampaign);
  }, [currentCampaign]);

  // Pending collaborators for this campaign
  const pendingCollaborators = useMemo(() => {
    if (!currentCampaign) return [];
    return collaborators.filter(c => c.campaignId === currentCampaign.id && c.status === 'pending');
  }, [currentCampaign, collaborators]);

  const handleSelectPendingCollaborator = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const colId = e.target.value;
    setSelectedPendingId(colId);
    if (!colId) return;
    const found = collaborators.find(c => c.id === colId);
    if (found) {
      setFullName(found.fullName);
      setEmail(found.email);
      setDepartment(found.department);
      setRole(found.role || 'Colaborador');
    }
  };

  const startTest = () => {
    setValidationError(null);
    if (!currentCampaign) {
      setValidationError('Ingresa un código de campaña válido para iniciar.');
      return;
    }
    if (campaignStatusInfo?.status === 'expired') {
      setValidationError('El periodo de vigencia de esta campaña ha vencido. No es posible iniciar el cuestionario.');
      return;
    }
    if (!fullName.trim() || !email.trim()) {
      setValidationError('Por favor ingresa tu nombre completo y correo electrónico.');
      return;
    }
    setCurrentBlockIndex(0);
    setAnswers({});
    setStage('test');
  };

  const currentBlock = DISC_BLOCKS[currentBlockIndex];
  const currentAnswer = answers[currentBlock?.id] || {};

  const handleSelectOption = (optionId: string, type: 'most' | 'least') => {
    const blockId = currentBlock.id;
    const current = answers[blockId] || {};

    let newMost = current.mostOptionId;
    let newLeast = current.leastOptionId;

    if (type === 'most') {
      if (newMost === optionId) {
        newMost = undefined;
      } else {
        newMost = optionId;
        if (newLeast === optionId) {
          newLeast = undefined;
        }
      }
    } else {
      if (newLeast === optionId) {
        newLeast = undefined;
      } else {
        newLeast = optionId;
        if (newMost === optionId) {
          newMost = undefined;
        }
      }
    }

    setAnswers(prev => ({
      ...prev,
      [blockId]: {
        mostOptionId: newMost,
        leastOptionId: newLeast
      }
    }));
  };

  const isCurrentBlockComplete = !!(currentAnswer.mostOptionId && currentAnswer.leastOptionId);

  const handleNextBlock = () => {
    if (!isCurrentBlockComplete) return;

    if (currentBlockIndex < DISC_BLOCKS.length - 1) {
      setCurrentBlockIndex(prev => prev + 1);
    } else {
      handleFinishTest();
    }
  };

  const handlePrevBlock = () => {
    if (currentBlockIndex > 0) {
      setCurrentBlockIndex(prev => prev - 1);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleFinishTest = async () => {
    if (!currentCampaign) return;
    setIsSubmitting(true);

    try {
      const res = await submitEvaluation({
        campaignCode: currentCampaign.accessCode,
        fullName,
        email,
        department,
        role,
        answers
      });

      if (res.success && res.scores && res.archetype) {
        const finishedCollab: Collaborator = {
          id: `eval-${Date.now()}`,
          campaignId: currentCampaign.id,
          companyId: currentCampaign.companyId,
          fullName,
          email,
          department,
          role,
          status: 'completed',
          completedAt: new Date().toISOString(),
          scores: res.scores,
          archetype: res.archetype
        };

        setEvaluationResult({
          scores: res.scores,
          archetype: res.archetype,
          collaborator: finishedCollab
        });
        setStage('completed');
      } else {
        alert(res.error || 'Ocurrió un error al procesar el test.');
      }
    } catch (err) {
      console.error('Error al guardar en Firestore:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const answeredCount = Object.values(answers).filter(a => a.mostOptionId && a.leastOptionId).length;
  const progressPercent = Math.round(((currentBlockIndex + 1) / DISC_BLOCKS.length) * 100);

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      
      {/* STAGE 1: ONBOARDING */}
      {stage === 'onboarding' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-md overflow-hidden">
          
          {/* Header */}
          <div id="tour-candidate-welcome" className="p-6 sm:p-8 bg-slate-50/70 border-b border-slate-100">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-blue-600">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Evaluación Psicométrica DISC</span>
              </div>
              <button
                type="button"
                onClick={() => setIsTourOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-blue-700 hover:text-blue-900 bg-white hover:bg-blue-50 border border-blue-200 rounded-xl shadow-2xs transition-all cursor-pointer"
                title="Ver tutorial e instrucciones paso a paso"
              >
                <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                <span>¿Cómo funciona? (Ver Tutorial)</span>
              </button>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Test Conductual Organizacional
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Descubre tu perfil natural en 28 bloques de selección forzada. Duración estimada: 8 - 10 minutos.
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-5">
            
            {/* Campaign Selection & Preloaded Verification */}
            <div>
              {currentCampaign && !isEditingCode ? (
                <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                          <span>Campaña Validada y Conectada</span>
                          <span className="text-[10px] bg-emerald-200/80 text-emerald-900 font-semibold px-2 py-0.5 rounded-full">
                            Autocargada
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-800">
                          {currentCampaign.title} {campaignCompany ? `· ${campaignCompany.name}` : ''}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsEditingCode(true)}
                      className="text-[11px] text-emerald-700 hover:text-emerald-900 underline font-medium cursor-pointer"
                    >
                      Cambiar
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-emerald-200/60 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-emerald-700 font-medium">Código:</span>
                      <span className="font-mono font-bold text-emerald-950 bg-white/80 px-2 py-0.5 rounded-md border border-emerald-200">
                        {currentCampaign.accessCode}
                      </span>
                    </div>
                    {campaignStatusInfo && (
                      <div className="text-[11px] text-emerald-800">
                        {campaignStatusInfo.status === 'expired' ? (
                          <span className="text-rose-600 font-semibold">Campaña Vencida</span>
                        ) : campaignStatusInfo.status === 'pending' ? (
                          <span>Vigencia: {campaignStatusInfo.totalDays} días (inicia al primer test)</span>
                        ) : (
                          <span>Vigente: {campaignStatusInfo.daysRemaining} días restantes</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Código de Campaña
                    </label>
                    {currentCampaign && (
                      <button
                        type="button"
                        onClick={() => setIsEditingCode(false)}
                        className="text-[11px] text-blue-600 hover:underline cursor-pointer"
                      >
                        Usar campaña validada
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={campaignCodeInput}
                    onChange={e => {
                      setCampaignCodeInput(e.target.value.toUpperCase());
                      setSelectedCampaignCode(e.target.value.toUpperCase());
                    }}
                    placeholder="Ej. DISC-2026-INNOVA"
                    className="w-full bg-white border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-slate-900 placeholder:font-normal placeholder-slate-400 outline-none transition-all"
                  />

                  {/* Status Info Box */}
                  {currentCampaign && campaignStatusInfo && (
                    <div className={`mt-3 p-3.5 rounded-xl border text-xs ${
                      campaignStatusInfo.status === 'expired'
                        ? 'bg-rose-50 border-rose-200 text-rose-800'
                        : campaignStatusInfo.status === 'pending'
                        ? 'bg-amber-50 border-amber-200 text-amber-800'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    }`}>
                      <div className="flex items-start gap-2.5">
                        {campaignStatusInfo.status === 'expired' ? (
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        ) : (
                          <Clock className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <div className="font-bold text-slate-900">
                            {currentCampaign.title} · {campaignCompany?.name}
                          </div>
                          <div className="mt-0.5 text-xs">
                            {campaignStatusInfo.status === 'expired' ? (
                              <span className="font-semibold text-rose-700">
                                Aviso: Periodo concluido el {campaignStatusInfo.expiresAtFormatted}.
                              </span>
                            ) : campaignStatusInfo.status === 'pending' ? (
                              <span>
                                Vigencia de <strong>{campaignStatusInfo.totalDays} días</strong> lista. Se activará en la 1ª evaluación.
                              </span>
                            ) : (
                              <span>
                                Campaña activa: <strong>{campaignStatusInfo.daysRemaining} días restantes</strong> (vence el {campaignStatusInfo.expiresAtFormatted}).
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Pick Pending Collaborators if available */}
            {pendingCollaborators.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Seleccionar de la lista de colaboradores (Opcional)
                </label>
                <select
                  value={selectedPendingId}
                  onChange={handleSelectPendingCollaborator}
                  className="w-full bg-white border border-slate-200 focus:border-slate-900 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none"
                >
                  <option value="">-- Elige tu nombre si ya fuiste pre-registrado --</option>
                  {pendingCollaborators.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} - {c.department}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Candidate Details */}
            <div className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nombre Completo
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Ej. Sofía Morales Garza"
                    className="w-full bg-white border border-slate-200 focus:border-slate-900 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="ejemplo@empresa.com"
                    className="w-full bg-white border border-slate-200 focus:border-slate-900 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Departamento
                  </label>
                  <select
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-slate-900 rounded-xl px-3 py-2.5 text-xs text-slate-800 outline-none"
                  >
                    <option value="Ventas y Comercial">Ventas y Comercial</option>
                    <option value="TI & Desarrollo">TI & Desarrollo</option>
                    <option value="Operaciones">Operaciones y Calidad</option>
                    <option value="Recursos Humanos">Recursos Humanos</option>
                    <option value="Finanzas">Finanzas y Contabilidad</option>
                    <option value="Dirección General">Dirección General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Puesto / Rol
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    placeholder="Ej. Ejecutivo de Cuentas"
                    className="w-full bg-white border border-slate-200 focus:border-slate-900 rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Test Instructions Box */}
            <div id="tour-candidate-block" className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 space-y-2">
              <div className="font-bold text-slate-900 flex items-center justify-between">
                <span>Instrucciones del Cuestionario:</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md">
                  Elección Forzada
                </span>
              </div>
              <p>• En cada uno de los 28 bloques selecciona la opción que <strong>MÁS</strong> te describe (+) y la que <strong>MENOS</strong> te describe (-).</p>
              
              <div id="tour-candidate-exclusivity" className="p-2.5 bg-white border border-slate-200 rounded-lg space-y-1">
                <div className="font-semibold text-slate-800">Regla de Exclusividad:</div>
                <p className="text-slate-600">No puedes seleccionar &quot;MÁS&quot; y &quot;MENOS&quot; en el mismo reactivo ni dejar reactivos sin responder. No hay respuestas buenas ni malas: responde con tu comportamiento laboral habitual.</p>
              </div>
            </div>

            {validationError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Start Button & Confidentiality */}
            <div id="tour-candidate-progress" className="space-y-2">
              <button
                onClick={startTest}
                disabled={!currentCampaign || campaignStatusInfo?.status === 'expired'}
                className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <span>Comenzar Evaluación DISC</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-[11px] text-center text-slate-400 flex items-center justify-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Resultados confidenciales procesados con rigor psicométrico inmediato</span>
              </p>
            </div>

          </div>
        </div>
      )}

      {/* STAGE 2: 28-QUESTION QUESTIONNAIRE */}
      {stage === 'test' && currentBlock && (
        <div className={`space-y-4 transition-all duration-300 ${simulatorMode === 'mobile' ? 'max-w-md mx-auto' : 'max-w-2xl mx-auto'}`}>
          
          {/* Top Simulator Mode Control & Tutorial Action */}
          <div id="tour-candidate-welcome" className="flex items-center justify-between px-1 py-1">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold border border-slate-200/80">
              <button
                type="button"
                onClick={() => setSimulatorMode('mobile')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  simulatorMode === 'mobile'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Alternar a vista simulador móvil"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Modo Móvil</span>
              </button>
              <button
                type="button"
                onClick={() => setSimulatorMode('full')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  simulatorMode === 'full'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Alternar a vista pantalla completa"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Pantalla Completa</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsTourOpen(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
              title="Ver tutorial guiado interactivo"
            >
              <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
              <span>¿Cómo funciona? (Ver Tutorial)</span>
            </button>
          </div>

          {/* Progress Header */}
          <div id="tour-candidate-progress" className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">Bloque {currentBlockIndex + 1} de 28</span>
                <span>·</span>
                <span className="font-mono tabular-nums text-slate-600">{progressPercent}%</span>
              </div>
              <div className="flex items-center gap-2">
                <div>{answeredCount} de 28 completadas</div>
              </div>
            </div>
            
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-slate-900 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <div id="tour-candidate-block" className="bg-white border border-slate-200 rounded-2xl shadow-md p-6 space-y-5">
            
            <div>
              <div className="text-xs uppercase tracking-wider font-bold text-slate-500">
                Selección Forzada · 1 MÁS (+) y 1 MENOS (-)
              </div>
              <p className="text-sm text-slate-800 font-medium mt-1">
                ¿Qué afirmación te describe <strong>MÁS</strong> y cuál te describe <strong>MENOS</strong> en el trabajo?
              </p>
            </div>

            {/* Options List with Exclusivity Selectors */}
            <div id="tour-candidate-exclusivity" className="space-y-2.5">
              {currentBlock.options.map(option => {
                const isMost = currentAnswer.mostOptionId === option.id;
                const isLeast = currentAnswer.leastOptionId === option.id;

                return (
                  <div
                    key={option.id}
                    className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                      isMost
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-medium'
                        : isLeast
                        ? 'bg-rose-50 border-rose-400 text-rose-950 font-medium'
                        : 'bg-slate-50/70 border-slate-200 text-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-sm pr-2 flex-1">
                      {option.text}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      
                      <button
                        type="button"
                        onClick={() => handleSelectOption(option.id, 'most')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                          isMost
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-white text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-200'
                        }`}
                        title="Marca como la que MÁS te describe"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>MÁS</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectOption(option.id, 'least')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                          isLeast
                            ? 'bg-rose-600 text-white shadow-sm'
                            : 'bg-white text-slate-600 hover:text-rose-700 hover:bg-rose-50 border border-slate-200'
                        }`}
                        title="Marca como la que MENOS te describe"
                      >
                        <Minus className="w-3.5 h-3.5" />
                        <span>MENOS</span>
                      </button>

                    </div>
                  </div>
                );
              })}
            </div>

            {/* Hint message & Rules Validation */}
            <div className="text-xs text-center py-2 px-3 bg-slate-50 border border-slate-200/80 rounded-xl">
              {!currentAnswer.mostOptionId && !currentAnswer.leastOptionId && (
                <span className="text-slate-500 font-medium">Selecciona una opción MÁS (+) y una MENOS (-).</span>
              )}
              {currentAnswer.mostOptionId && !currentAnswer.leastOptionId && (
                <span className="text-amber-600 font-medium">Falta marcar la opción MENOS (-).</span>
              )}
              {!currentAnswer.mostOptionId && currentAnswer.leastOptionId && (
                <span className="text-emerald-600 font-medium">Falta marcar la opción MÁS (+).</span>
              )}
              {isCurrentBlockComplete && (
                <span className="text-emerald-700 font-semibold flex items-center justify-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Bloque listo. Presiona &quot;Siguiente&quot;.
                </span>
              )}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handlePrevBlock}
                disabled={currentBlockIndex === 0}
                className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-900 disabled:opacity-30 flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Anterior</span>
              </button>

              <button
                type="button"
                onClick={handleNextBlock}
                disabled={!isCurrentBlockComplete || isSubmitting}
                className={`px-5 py-2.5 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
                  isCurrentBlockComplete && !isSubmitting
                    ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                <span>
                  {isSubmitting
                    ? 'Guardando en Firestore...'
                    : currentBlockIndex === DISC_BLOCKS.length - 1
                    ? 'Finalizar Evaluación'
                    : 'Siguiente'}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

          <div className="text-center text-[11px] text-slate-400">
            {fullName} · {department} · Campaña {currentCampaign?.accessCode}
          </div>

        </div>
      )}

      {/* STAGE 3: RESULT SUMMARY */}
      {stage === 'completed' && evaluationResult && (
        <div className="space-y-5 animate-in fade-in duration-300">
          
          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center space-y-2 shadow-sm">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full flex items-center justify-center mx-auto mb-1">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              ¡Evaluación Completada!
            </h2>
            <p className="text-xs text-slate-500">
              Tus respuestas han sido procesadas e incorporadas al dashboard empresarial.
            </p>
          </div>

          {/* Archetype card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Arquetipo Asignado
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              {evaluationResult.archetype.title}
            </h3>
            <p className="text-xs font-semibold text-slate-500">
              {evaluationResult.archetype.subtitle}
            </p>
            <p className="text-sm text-slate-700 leading-relaxed pt-1">
              {evaluationResult.archetype.description}
            </p>
          </div>

          {/* D - I - S - C Bars */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Puntajes DISC por Dimensión
              </h4>
              <span className="text-[11px] text-slate-400">Escala Neta (-28 a +28)</span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-rose-700">D · Dominancia</span>
                  <span className="font-mono text-slate-700 tabular-nums">
                    {evaluationResult.scores.D > 0 ? `+${evaluationResult.scores.D}` : evaluationResult.scores.D} ({evaluationResult.scores.dPercent}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-rose-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${evaluationResult.scores.dPercent}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-amber-700">I · Influencia</span>
                  <span className="font-mono text-slate-700 tabular-nums">
                    {evaluationResult.scores.I > 0 ? `+${evaluationResult.scores.I}` : evaluationResult.scores.I} ({evaluationResult.scores.iPercent}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${evaluationResult.scores.iPercent}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-emerald-700">S · Estabilidad</span>
                  <span className="font-mono text-slate-700 tabular-nums">
                    {evaluationResult.scores.S > 0 ? `+${evaluationResult.scores.S}` : evaluationResult.scores.S} ({evaluationResult.scores.sPercent}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${evaluationResult.scores.sPercent}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-blue-700">C · Cumplimiento</span>
                  <span className="font-mono text-slate-700 tabular-nums">
                    {evaluationResult.scores.C > 0 ? `+${evaluationResult.scores.C}` : evaluationResult.scores.C} ({evaluationResult.scores.cPercent}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${evaluationResult.scores.cPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-2.5">
            <button
              onClick={() => setShowFullReportModal(true)}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-xs"
            >
              <FileText className="w-4 h-4" />
              <span>Ver Reporte Ejecutivo e Imprimir PDF</span>
            </button>

            <button
              onClick={() => {
                setStage('onboarding');
                setFullName('');
                setEmail('');
                setAnswers({});
                setEvaluationResult(null);
              }}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Realizar Otra Evaluación</span>
            </button>
          </div>

          {showFullReportModal && (
            <IndividualReportModal
              collaborator={evaluationResult.collaborator}
              company={campaignCompany}
              campaign={currentCampaign}
              onClose={() => setShowFullReportModal(false)}
            />
          )}

        </div>
      )}

      {/* Interactive Guided Onboarding Tour for Evaluator */}
      <GuidedTour
        steps={evaluatorTourSteps}
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        storageKey="disc_tour_candidate_viewed_v1"
        tourName="Evaluación DISC"
      />

    </div>
  );
};
