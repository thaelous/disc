import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowRight, KeyRound, Sparkles, Copy, Check, Loader2 } from 'lucide-react';

export const LandingAccessView: React.FC = () => {
  const {
    campaigns,
    setSelectedCampaignCode,
    setSelectedCompanyId,
    setActiveView,
    verifyCodeInFirestore,
    showToast
  } = useApp();

  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // El usuario solo entra al panel al oprimir el botón principal "Ingresar al Panel"
  const handleEnterPanel = async () => {
    setError(null);
    const target = accessCode.trim().toUpperCase();

    if (!target) {
      setError('Por favor ingresa un código de acceso.');
      return;
    }

    setIsValidating(true);
    try {
      // Buscar directamente en Firestore
      const campaign = await verifyCodeInFirestore(target);

      if (!campaign) {
        setError(`El código "${target}" no existe en Firestore. Verifica que esté bien escrito o selecciona uno de los códigos de demostración.`);
        setIsValidating(false);
        return;
      }

      setSelectedCampaignCode(campaign.accessCode);
      setSelectedCompanyId(campaign.companyId);
      setActiveView('company');
      showToast(`Campaña ${campaign.accessCode} validada en Firestore`);
    } catch (err) {
      console.error('Error validando en Firestore:', err);
      setError('Error al consultar Firestore. Intenta de nuevo.');
    } finally {
      setIsValidating(false);
    }
  };

  // Al hacer clic en un código de demo, solo se pega en el campo de entrada sin navegar
  const handleSelectDemoCode = (code: string) => {
    setAccessCode(code);
    setError(null);
    setCopiedCode(code);
    showToast(`Código "${code}" colocado en el campo de acceso`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      
      {/* Tarjeta Central Elegante y Responsiva */}
      <div className="max-w-md w-full mx-auto p-8 bg-white rounded-2xl shadow-lg border border-slate-200">
        
        {/* Encabezado */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center mx-auto shadow-md">
            <KeyRound className="w-6 h-6 text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Portal de Evaluación DISC
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Ingresa el código de acceso proporcionado para tu empresa o campaña
          </p>
        </div>

        {/* Formulario de Acceso */}
        <form
          onSubmit={e => {
            e.preventDefault();
            handleEnterPanel();
          }}
          className="mt-8 space-y-4"
        >
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
              Código de Acceso Corporativo
            </label>
            <div className="relative">
              <input
                type="text"
                value={accessCode}
                onChange={e => {
                  setAccessCode(e.target.value.toUpperCase());
                  setError(null);
                }}
                placeholder="ej. DISC-2026-X"
                disabled={isValidating}
                className="w-full bg-slate-50 border border-slate-300 focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900/10 rounded-xl px-4 py-3.5 text-base font-mono font-semibold uppercase tracking-wider text-slate-900 placeholder:text-slate-400 placeholder:normal-case placeholder:font-normal outline-none transition-all shadow-inner disabled:opacity-60"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl leading-relaxed">
              {error}
            </div>
          )}

          {/* Botón ancho: "Ingresar al Panel" */}
          <button
            type="submit"
            disabled={isValidating}
            className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-700 text-white font-semibold rounded-xl shadow-md shadow-slate-900/10 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
          >
            {isValidating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Consultando Firestore...</span>
              </>
            ) : (
              <>
                <span>Ingresar al Panel</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Sección: Códigos de Demostración Activos (Solo autocompletan el input) */}
        <div className="mt-8 pt-6 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Códigos de demostración activos:
            </span>
            <span className="text-[11px] text-slate-400">Clic para pegar</span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {campaigns.slice(0, 3).map(camp => {
              const isSelected = accessCode === camp.accessCode;
              const isJustCopied = copiedCode === camp.accessCode;

              return (
                <div
                  key={camp.id}
                  onClick={() => handleSelectDemoCode(camp.accessCode)}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-300 shadow-2xs'
                      : 'bg-slate-50/70 hover:bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                  title="Haz clic para pegar este código en el campo de acceso"
                >
                  <div className="pr-2">
                    <span className="font-mono font-bold text-slate-900 text-xs block">
                      {camp.accessCode}
                    </span>
                    <span className="text-[11px] text-slate-500 block truncate max-w-[210px] mt-0.5">
                      {camp.title}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      handleSelectDemoCode(camp.accessCode);
                    }}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-colors flex items-center gap-1 shrink-0 ${
                      isJustCopied || isSelected
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-700 hover:text-slate-900 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {isJustCopied ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Pegado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-slate-400" />
                        <span>Usar código</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-center text-slate-400 pt-1">
            Selecciona un código para colocarlo arriba y luego pulsa <strong>Ingresar al Panel</strong>.
          </p>
        </div>

      </div>

      {/* Pie institucional */}
      <div className="mt-8 text-center text-xs text-slate-400">
        <span>Conectado a Firebase Firestore · Proyecto: disc-plataforma</span>
      </div>

    </div>
  );
};
