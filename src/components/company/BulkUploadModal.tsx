import React, { useState, useRef } from 'react';
import XLSX from 'xlsx-js-style';
import { useApp } from '../../context/AppContext';
import { Campaign, Company } from '../../types';
import {
  Upload,
  X,
  FileSpreadsheet,
  Check,
  AlertCircle,
  Download,
  FileCheck2,
  Trash2,
  Loader2
} from 'lucide-react';

interface BulkUploadModalProps {
  campaign: Campaign;
  company: Company;
  onClose: () => void;
}

interface ParsedCollaborator {
  fullName: string;
  email: string;
  department: string;
  role: string;
}

export const BulkUploadModal: React.FC<BulkUploadModalProps> = ({
  campaign,
  company,
  onClose
}) => {
  const { addCollaborators, showToast } = useApp();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedCollaborator[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Descargar Plantilla Oficial Excel (.xlsx)
  const handleDownloadTemplate = () => {
    try {
      const wb = XLSX.utils.book_new();

      const headers = ['Nombre Completo', 'Correo Electrónico', 'Cargo / Puesto', 'Departamento / Área'];
      const exampleRows = [
        ['Laura Castillo Méndez', 'l.castillo@empresa.com', 'Ejecutivo Comercial Senior', 'Ventas y Comercial'],
        ['Esteban Ríos Gómez', 'e.rios@empresa.com', 'Ingeniero DevOps', 'TI & Tecnología']
      ];

      const wsData = [headers, ...exampleRows];
      const ws = XLSX.utils.aoa_to_sheet(wsData);

      // Estilos ejecutivos para el encabezado
      const headerStyle = {
        fill: { fgColor: { rgb: '0F172A' } }, // Slate 900
        font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: 'FFFFFF' } },
        alignment: { vertical: 'center', horizontal: 'center' }
      };

      const cellStyle = {
        font: { name: 'Calibri', sz: 10 },
        alignment: { vertical: 'center', horizontal: 'left' }
      };

      // Aplicar estilos a encabezados
      ['A1', 'B1', 'C1', 'D1'].forEach(cell => {
        if (ws[cell]) {
          ws[cell].s = headerStyle;
        }
      });

      // Ancho automático de columnas
      ws['!cols'] = [
        { wch: 30 }, // Nombre Completo
        { wch: 32 }, // Correo
        { wch: 28 }, // Puesto
        { wch: 26 }  // Departamento
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Plantilla Colaboradores');

      const safeCompany = company.name.replace(/[^a-zA-Z0-9]/g, '_');
      XLSX.writeFile(wb, `Plantilla_Colaboradores_DISC_${safeCompany}.xlsx`);
      showToast('Plantilla oficial descargada con éxito');
    } catch (err) {
      console.error('Error generando plantilla:', err);
      setError('No se pudo generar el archivo de plantilla Excel.');
    }
  };

  // 2. Procesar archivo cargado (Excel o CSV con SheetJS)
  const processUploadedFile = (file: File) => {
    setError(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          setError('El archivo Excel está vacío o no contiene hojas de cálculo.');
          setParsedRows([]);
          return;
        }

        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (!rawJson || rawJson.length < 2) {
          setError('El archivo no contiene filas de colaboradores para importar.');
          setParsedRows([]);
          return;
        }

        // Detectar si la fila 0 es encabezado
        const headerRow = rawJson[0].map(h => String(h || '').trim().toLowerCase());
        let nameIdx = headerRow.findIndex(h => h.includes('nombre') || h.includes('completo'));
        let emailIdx = headerRow.findIndex(h => h.includes('correo') || h.includes('email') || h.includes('mail'));
        let roleIdx = headerRow.findIndex(h => h.includes('cargo') || h.includes('puesto') || h.includes('rol'));
        let deptIdx = headerRow.findIndex(h => h.includes('departamento') || h.includes('área') || h.includes('area'));

        // Fallbacks por índice estándar si no se identifican por nombre
        if (nameIdx === -1) nameIdx = 0;
        if (emailIdx === -1) emailIdx = 1;
        if (roleIdx === -1) roleIdx = 2;
        if (deptIdx === -1) deptIdx = 3;

        const parsed: ParsedCollaborator[] = [];

        // Leer filas a partir de la fila 1
        for (let i = 1; i < rawJson.length; i++) {
          const row = rawJson[i];
          if (!row || row.length === 0) continue;

          const fullName = String(row[nameIdx] || '').trim();
          const email = String(row[emailIdx] || '').trim();
          const role = String(row[roleIdx] || '').trim() || 'Colaborador';
          const department = String(row[deptIdx] || '').trim() || 'General';

          if (fullName && fullName.length > 1) {
            parsed.push({
              fullName,
              email: email || `colab_${i}@${company.name.toLowerCase().replace(/[^a-z]/g, '')}.com`,
              role,
              department
            });
          }
        }

        if (parsed.length === 0) {
          setError('No se encontraron registros válidos de colaboradores en el archivo cargado.');
          setParsedRows([]);
          return;
        }

        setParsedRows(parsed);
      } catch (err) {
        console.error('Error al procesar archivo:', err);
        setError('Ocurrió un error al leer el archivo Excel (.xlsx). Verifica que el formato sea válido.');
        setParsedRows([]);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // 3. Confirmar e importar a Firestore
  const handleConfirmImport = async () => {
    if (parsedRows.length === 0) return;
    setIsProcessing(true);

    try {
      const toAdd = parsedRows.map(r => ({
        campaignId: campaign.id,
        companyId: company.id,
        fullName: r.fullName,
        email: r.email,
        department: r.department,
        role: r.role
      }));

      await addCollaborators(toAdd);
      onClose();
    } catch (err) {
      console.error('Error al guardar en Firestore:', err);
      setError('Error al registrar colaboradores en la base de datos.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetFile = () => {
    setFileName(null);
    setParsedRows([]);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl text-slate-900 overflow-hidden">
        
        {/* Encabezado */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Carga Masiva de Colaboradores
              </h2>
              <p className="text-[11px] text-slate-500">
                {campaign.accessCode} · {company.name}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contenido Limpio */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Paso 1: Botón Destacado Descargar Plantilla Oficial (.xlsx) */}
          <div className="bg-gradient-to-r from-blue-50/60 to-indigo-50/40 border border-blue-200/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">Paso 1: Plantilla recomendada</span>
              <h3 className="text-xs font-bold text-slate-900">Descargar Formato Oficial (.xlsx)</h3>
              <p className="text-[11px] text-slate-500">
                Incluye encabezados preformateados (Nombre, Correo, Puesto, Área) y filas de ejemplo.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="px-4 py-2 text-xs font-semibold text-blue-700 hover:text-blue-800 bg-white hover:bg-blue-50/80 border border-blue-300 rounded-xl shadow-2xs transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>Descargar Plantilla Oficial (.xlsx)</span>
            </button>
          </div>

          {/* Paso 2: Área Drag & Drop / Selector de Archivo */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Paso 2: Subir archivo completado
              </span>
              {fileName && (
                <button
                  type="button"
                  onClick={handleResetFile}
                  className="text-[11px] text-rose-600 hover:text-rose-700 flex items-center gap-1 font-semibold"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Quitar archivo</span>
                </button>
              )}
            </div>

            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all text-center ${
                isDragging
                  ? 'border-blue-600 bg-blue-50/60'
                  : fileName
                  ? 'border-emerald-400 bg-emerald-50/30'
                  : 'border-slate-300 hover:border-slate-400 bg-slate-50/60 hover:bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileInputChange}
                className="hidden"
              />

              {fileName ? (
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2">
                    <FileCheck2 className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">{fileName}</span>
                  <span className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                    Archivo cargado correctamente. Clic para cambiarlo.
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center mb-2">
                    <Upload className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">
                    Arrastra aquí tu archivo Excel (.xlsx) o haz clic para examinar
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    Formatos compatibles: .xlsx, .xls o .csv
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Error visual */}
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Paso 3: Vista previa de registros detectados */}
          {parsedRows.length > 0 && (
            <div className="space-y-2.5 pt-2 border-t border-slate-100 animate-in fade-in">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-700 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  {parsedRows.length} colaboradores listos para importar
                </span>
                <span className="text-[11px] text-slate-400">
                  Mostrando primeros {Math.min(parsedRows.length, 50)} registros
                </span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold sticky top-0 border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">No.</th>
                      <th className="py-2 px-3">Nombre Completo</th>
                      <th className="py-2 px-3">Correo Electrónico</th>
                      <th className="py-2 px-3">Cargo / Puesto</th>
                      <th className="py-2 px-3">Departamento / Área</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                    {parsedRows.slice(0, 50).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2 px-3 text-[11px] font-mono text-slate-400">{idx + 1}</td>
                        <td className="py-2 px-3 font-semibold text-slate-900">{row.fullName}</td>
                        <td className="py-2 px-3 font-mono text-[11px] text-slate-500">{row.email}</td>
                        <td className="py-2 px-3 text-slate-700">{row.role}</td>
                        <td className="py-2 px-3 text-slate-500">{row.department}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/70">
          <button
            type="button"
            disabled={isProcessing}
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Cancelar
          </button>

          <button
            type="button"
            disabled={parsedRows.length === 0 || isProcessing}
            onClick={handleConfirmImport}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-xl shadow-sm transition-all flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Guardando en Firestore...</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>
                  {parsedRows.length > 0
                    ? `Procesar e Importar Colaboradores (${parsedRows.length})`
                    : 'Procesar e Importar Colaboradores'}
                </span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
