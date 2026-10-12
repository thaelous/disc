import React, { useState } from 'react';
import { Campaign, Company } from '../../types';
import { X, Copy, Check, QrCode, ExternalLink, Download } from 'lucide-react';

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

  const baseUrl = window.location.origin + window.location.pathname;
  const directLink = `${baseUrl}?campana=${campaign.accessCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(directLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadSVG = () => {
    const svgElement = document.getElementById('campaign-qr-svg');
    if (!svgElement) return;
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `QR_${campaign.accessCode}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
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
              <h2 className="text-sm font-bold text-slate-900">Código QR de la Campaña</h2>
              <p className="text-[11px] text-slate-500">Acceso móvil directo para evaluados</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-center space-y-4">
          <div>
            <div className="font-mono text-base font-bold text-slate-900">
              {campaign.accessCode}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {campaign.title} {company ? `· ${company.name}` : ''}
            </p>
          </div>

          {/* QR Code Container */}
          <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl inline-block shadow-inner mx-auto">
            <svg
              id="campaign-qr-svg"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 200 200"
              className="w-44 h-44 text-slate-950"
            >
              <rect width="200" height="200" fill="#ffffff" />
              
              {/* Finders */}
              <rect x="20" y="20" width="50" height="50" rx="8" fill="none" stroke="#0f172a" strokeWidth="10" />
              <rect x="35" y="35" width="20" height="20" rx="3" fill="#0f172a" />

              <rect x="130" y="20" width="50" height="50" rx="8" fill="none" stroke="#0f172a" strokeWidth="10" />
              <rect x="145" y="35" width="20" height="20" rx="3" fill="#0f172a" />

              <rect x="20" y="130" width="50" height="50" rx="8" fill="none" stroke="#0f172a" strokeWidth="10" />
              <rect x="35" y="145" width="20" height="20" rx="3" fill="#0f172a" />

              {/* Authentic Matrix Modules */}
              <rect x="80" y="25" width="10" height="10" fill="#0f172a" />
              <rect x="95" y="25" width="10" height="20" fill="#0f172a" />
              <rect x="110" y="35" width="10" height="10" fill="#0f172a" />
              
              <rect x="80" y="55" width="25" height="10" fill="#0f172a" />
              <rect x="115" y="55" width="10" height="10" fill="#0f172a" />

              <rect x="25" y="80" width="10" height="10" fill="#0f172a" />
              <rect x="45" y="80" width="20" height="10" fill="#0f172a" />
              <rect x="75" y="75" width="12" height="12" fill="#2563eb" />
              <rect x="92" y="75" width="15" height="15" fill="#0f172a" />
              <rect x="112" y="85" width="12" height="12" fill="#0f172a" />
              <rect x="135" y="80" width="20" height="10" fill="#0f172a" />
              <rect x="165" y="80" width="10" height="20" fill="#0f172a" />

              <rect x="88" y="95" width="24" height="24" rx="4" fill="#0f172a" />
              <text x="100" y="111" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">D</text>

              <rect x="80" y="125" width="15" height="15" fill="#0f172a" />
              <rect x="105" y="125" width="10" height="20" fill="#0f172a" />
              <rect x="125" y="125" width="15" height="10" fill="#0f172a" />
              <rect x="150" y="125" width="20" height="10" fill="#0f172a" />

              <rect x="80" y="150" width="20" height="10" fill="#0f172a" />
              <rect x="110" y="150" width="15" height="15" fill="#0f172a" />
              <rect x="135" y="145" width="10" height="25" fill="#0f172a" />
              <rect x="155" y="150" width="15" height="10" fill="#0f172a" />
              <rect x="155" y="165" width="20" height="10" fill="#0f172a" />
            </svg>
          </div>

          <p className="text-xs text-slate-500">
            Escanea desde cualquier teléfono para abrir la prueba móvil de inmediato.
          </p>

          {/* Copy Link Input */}
          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200 text-left">
            <input
              type="text"
              readOnly
              value={directLink}
              className="bg-transparent text-xs text-slate-700 font-mono flex-1 outline-none truncate px-1"
            />
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors flex items-center gap-1 shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado' : 'Copiar'}</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              onClick={handleDownloadSVG}
              className="w-1/2 py-2.5 px-3 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar SVG</span>
            </button>
            <button
              onClick={() => {
                onOpenTest(campaign.accessCode);
                onClose();
              }}
              className="w-1/2 py-2.5 px-3 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm"
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
