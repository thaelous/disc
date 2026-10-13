import React, { useState, useEffect } from 'react';
import { Campaign, Company } from '../../types';
import {
  getCampaignBaseUrl,
  setCampaignBaseUrl,
  getCampaignDirectUrl,
  generateQRCodeSVG
} from '../../utils/campaignUrlHelper';
import {
  X,
  Copy,
  Check,
  QrCode,
  ExternalLink,
  Download,
  Settings,
  Globe,
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface QRCodeModalProps {
  campaign: Campaign;
  company?: Company;
  onClose: () => void;
  onOpenTest: (accessCode: string) => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  campaign,
  company,
  onClose,
  onOpenTest
}) => {
  const [copied, setCopied] = useState(false);
  const [svgHtml, setSvgHtml] = useState<string>('');
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [customBaseInput, setCustomBaseInput] = useState<string>(() => getCampaignBaseUrl());
  const [currentDirectLink, setCurrentDirectLink] = useState<string>(() =>
    getCampaignDirectUrl(campaign.accessCode)
  );

  // Re-generate direct link whenever base changes
  useEffect(() => {
    const link = getCampaignDirectUrl(campaign.accessCode);
    setCurrentDirectLink(link);

    // Generate real, authentic QR code
    generateQRCodeSVG(link)
      .then(svg => setSvgHtml(svg))
      .catch(err => {
        console.error('Failed to generate QR svg:', err);
      });
  }, [campaign.accessCode]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentDirectLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleApplyCustomBase = (e: React.FormEvent) => {
    e.preventDefault();
    setCampaignBaseUrl(customBaseInput.trim() || null);
    const newLink = getCampaignDirectUrl(campaign.accessCode);
    setCurrentDirectLink(newLink);
    generateQRCodeSVG(newLink)
      .then(svg => setSvgHtml(svg))
      .catch(console.error);
    setIsConfigOpen(false);
  };

  const handleResetToOrigin = () => {
    setCampaignBaseUrl(null);
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    setCustomBaseInput(origin);
    const newLink = getCampaignDirectUrl(campaign.accessCode);
    setCurrentDirectLink(newLink);
    generateQRCodeSVG(newLink)
      .then(svg => setSvgHtml(svg))
      .catch(console.error);
  };

  const handleDownloadSVG = () => {
    if (!svgHtml) return;
    const blob = new Blob([svgHtml], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `QR_${campaign.accessCode}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl text-slate-900 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Código QR y Enlace de Campaña</h2>
              <p className="text-[11px] text-slate-500">Acceso móvil directo para evaluados</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsConfigOpen(!isConfigOpen)}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              title="Configurar dominio público o URL base"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Optional Domain Configuration Drawer */}
        {isConfigOpen && (
          <form
            onSubmit={handleApplyCustomBase}
            className="p-4 bg-blue-50/80 border-b border-blue-100 text-left text-xs space-y-2.5 animate-in slide-in-from-top-2 duration-150"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-blue-900">
                <Globe className="w-3.5 h-3.5 text-blue-700" />
                <span>Configurar Dominio Público Base</span>
              </div>
              <button
                type="button"
                onClick={handleResetToOrigin}
                className="text-[11px] text-blue-700 hover:underline flex items-center gap-1"
                title="Restablecer a dominio del navegador"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restablecer</span>
              </button>
            </div>
            <p className="text-[11px] text-blue-800/80">
              Personaliza el dominio si tu aplicación está desplegada en Netlify, Vercel o un dominio corporativo:
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={customBaseInput}
                onChange={e => setCustomBaseInput(e.target.value)}
                placeholder="ej. https://tu-dominio.netlify.app"
                className="flex-1 bg-white border border-blue-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-mono outline-none focus:ring-1 focus:ring-blue-600"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-2xs text-xs shrink-0"
              >
                Aplicar
              </button>
            </div>
          </form>
        )}

        {/* Content */}
        <div className="p-6 text-center space-y-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200 font-mono text-sm font-bold">
              <span>{campaign.accessCode}</span>
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              {campaign.title} {company ? `· ${company.name}` : ''}
            </p>
          </div>

          {/* QR Code Container with authentic SVG rendered */}
          <div className="bg-white border-2 border-slate-200 p-4 rounded-2xl inline-block shadow-inner mx-auto">
            {svgHtml ? (
              <div
                className="w-48 h-48 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
                dangerouslySetInnerHTML={{ __html: svgHtml }}
              />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center text-xs text-slate-400">
                Generando Código QR...
              </div>
            )}
          </div>

          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-700 flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Escaneo móvil inmediato</span>
            </p>
            <p className="text-[11px] text-slate-500">
              Apunta la cámara del celular al código QR para cargar la evaluación con la campaña precargada.
            </p>
          </div>

          {/* Clean Direct Link Box */}
          <div className="space-y-1 text-left">
            <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              Enlace Directo de la Campaña:
            </label>
            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
              <input
                type="text"
                readOnly
                value={currentDirectLink}
                className="bg-transparent text-xs text-slate-700 font-mono flex-1 outline-none truncate px-1 select-all"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleDownloadSVG}
              disabled={!svgHtml}
              className="w-1/2 py-2.5 px-3 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Descargar SVG</span>
            </button>
            
            {/* Abrir Test Móvil (Internal navigation without opening new tabs) */}
            <button
              type="button"
              onClick={() => {
                onOpenTest(campaign.accessCode);
                onClose();
              }}
              className="w-1/2 py-2.5 px-3 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Abrir Test Móvil</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
