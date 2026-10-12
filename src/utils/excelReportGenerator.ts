import XLSX from 'xlsx-js-style';
import { Company, Campaign, Collaborator, DISCFactor } from '../types';
import { DISC_ARCHETYPES } from '../data/discQuestions';

interface ExcelReportParams {
  company: Company;
  campaign: Campaign;
  collaborators: Collaborator[];
}

export function exportExecutiveExcelReport({
  company,
  campaign,
  collaborators
}: ExcelReportParams): void {
  const wb = XLSX.utils.book_new();

  // Metrics calculation
  const totalEnrolled = collaborators.length;
  const completed = collaborators.filter(c => c.status === 'completed');
  const completedCount = completed.length;
  const participationRate = totalEnrolled > 0 ? Math.round((completedCount / totalEnrolled) * 100) : 0;

  const quadrantCounts: Record<DISCFactor, number> = { D: 0, I: 0, S: 0, C: 0 };
  let sumD = 0, sumI = 0, sumS = 0, sumC = 0;

  completed.forEach(c => {
    if (c.scores) {
      quadrantCounts[c.scores.dominantFactor]++;
      sumD += c.scores.D;
      sumI += c.scores.I;
      sumS += c.scores.S;
      sumC += c.scores.C;
    }
  });

  const dominantFactor: DISCFactor = (['D', 'I', 'S', 'C'] as DISCFactor[]).reduce((best, f) => 
    quadrantCounts[f] > quadrantCounts[best] ? f : best, 'D');

  const dominantLabels: Record<DISCFactor, string> = {
    D: 'Dominancia (Orientado a Resultados y Retos)',
    I: 'Influencia (Promotores y Comunicación)',
    S: 'Estabilidad (Consistencia y Soporte)',
    C: 'Cumplimiento (Analítico y Rigor de Procesos)'
  };

  // Common styles
  const navyHeaderStyle = {
    fill: { fgColor: { rgb: '0F172A' } }, // Slate 900
    font: { name: 'Arial', sz: 11, bold: true, color: { rgb: 'FFFFFF' } },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    border: {
      top: { style: 'thin', color: { rgb: 'CBD5E1' } },
      bottom: { style: 'thin', color: { rgb: 'CBD5E1' } },
      left: { style: 'thin', color: { rgb: 'CBD5E1' } },
      right: { style: 'thin', color: { rgb: 'CBD5E1' } }
    }
  };

  const subHeaderStyle = {
    fill: { fgColor: { rgb: '1E293B' } }, // Slate 800
    font: { name: 'Arial', sz: 10, bold: true, color: { rgb: 'FFFFFF' } },
    alignment: { horizontal: 'left', vertical: 'center' }
  };

  const titleStyle = {
    font: { name: 'Arial', sz: 16, bold: true, color: { rgb: '0F172A' } }
  };

  const subtitleStyle = {
    font: { name: 'Arial', sz: 10, italic: true, color: { rgb: '64748B' } }
  };

  const cardLabelStyle = {
    fill: { fgColor: { rgb: 'F1F5F9' } },
    font: { name: 'Arial', sz: 9, bold: true, color: { rgb: '475569' } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: {
      top: { style: 'thin', color: { rgb: 'CBD5E1' } },
      left: { style: 'thin', color: { rgb: 'CBD5E1' } },
      right: { style: 'thin', color: { rgb: 'CBD5E1' } }
    }
  };

  const cardValueStyle = {
    fill: { fgColor: { rgb: 'F8FAFC' } },
    font: { name: 'Arial', sz: 14, bold: true, color: { rgb: '0F172A' } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: {
      bottom: { style: 'thin', color: { rgb: 'CBD5E1' } },
      left: { style: 'thin', color: { rgb: 'CBD5E1' } },
      right: { style: 'thin', color: { rgb: 'CBD5E1' } }
    }
  };

  const regularCellStyle = {
    font: { name: 'Arial', sz: 10, color: { rgb: '1E293B' } },
    alignment: { vertical: 'center' },
    border: {
      top: { style: 'thin', color: { rgb: 'E2E8F0' } },
      bottom: { style: 'thin', color: { rgb: 'E2E8F0' } },
      left: { style: 'thin', color: { rgb: 'E2E8F0' } },
      right: { style: 'thin', color: { rgb: 'E2E8F0' } }
    }
  };

  const zebraCellStyle = {
    fill: { fgColor: { rgb: 'F8FAFC' } },
    font: { name: 'Arial', sz: 10, color: { rgb: '1E293B' } },
    alignment: { vertical: 'center' },
    border: {
      top: { style: 'thin', color: { rgb: 'E2E8F0' } },
      bottom: { style: 'thin', color: { rgb: 'E2E8F0' } },
      left: { style: 'thin', color: { rgb: 'E2E8F0' } },
      right: { style: 'thin', color: { rgb: 'E2E8F0' } }
    }
  };

  const centerCellStyle = {
    ...regularCellStyle,
    alignment: { horizontal: 'center', vertical: 'center' }
  };

  const centerZebraCellStyle = {
    ...zebraCellStyle,
    alignment: { horizontal: 'center', vertical: 'center' }
  };

  // ==========================================
  // PESTAÑA 1: RESUMEN EJECUTIVO
  // ==========================================
  const wsSummary: XLSX.WorkSheet = {};
  
  // Set cell helper
  const setCell = (ws: XLSX.WorkSheet, col: number, row: number, val: any, style?: any) => {
    const ref = XLSX.utils.encode_cell({ c: col, r: row });
    ws[ref] = { v: val, t: typeof val === 'number' ? 'n' : 's', s: style };
  };

  // Header Title
  setCell(wsSummary, 0, 0, 'INFORME EJECUTIVO DE EVALUACIÓN PSICOMÉTRICA DISC', titleStyle);
  setCell(wsSummary, 0, 1, `Empresa: ${company.name} | RFC: ${company.rfc}`, subtitleStyle);
  setCell(wsSummary, 0, 2, `Campaña: ${campaign.accessCode} - ${campaign.title} | Emisión: ${new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}`, subtitleStyle);

  // KPI Row Labels (Row 4) and Values (Row 5)
  setCell(wsSummary, 0, 4, 'TOTAL INSCRITOS', cardLabelStyle);
  setCell(wsSummary, 0, 5, totalEnrolled, cardValueStyle);

  setCell(wsSummary, 1, 4, 'TESTS COMPLETADOS', cardLabelStyle);
  setCell(wsSummary, 1, 5, completedCount, cardValueStyle);

  setCell(wsSummary, 2, 4, 'TASA PARTICIPACIÓN', cardLabelStyle);
  setCell(wsSummary, 2, 5, `${participationRate}%`, cardValueStyle);

  setCell(wsSummary, 3, 4, 'ESTILO DOMINANTE', cardLabelStyle);
  setCell(wsSummary, 3, 5, dominantFactor, cardValueStyle);

  // Table: Distribución por Cuadrante DISC
  setCell(wsSummary, 0, 7, 'DISTRIBUCIÓN DE TALENTO POR CUADRANTE DISC', subHeaderStyle);
  
  const discHeaders = ['Dimensión Conductual', 'Descripción / Perfil', 'No. Evaluados', '% del Talento', 'Promedio Neto'];
  discHeaders.forEach((h, idx) => {
    setCell(wsSummary, idx, 8, h, navyHeaderStyle);
  });

  const discData = [
    { factor: 'D · Dominancia', desc: 'Orientación a resultados, firmeza, toma de decisiones y retos', count: quadrantCounts.D, avg: completedCount ? (sumD / completedCount).toFixed(1) : '0' },
    { factor: 'I · Influencia', desc: 'Orientación a personas, persuasión, optimismo y relaciones', count: quadrantCounts.I, avg: completedCount ? (sumI / completedCount).toFixed(1) : '0' },
    { factor: 'S · Estabilidad', desc: 'Consistencia, escucha activa, trabajo colaborativo y paciencia', count: quadrantCounts.S, avg: completedCount ? (sumS / completedCount).toFixed(1) : '0' },
    { factor: 'C · Cumplimiento', desc: 'Rigor lógico, análisis exhaustivo, calidad técnica y normas', count: quadrantCounts.C, avg: completedCount ? (sumC / completedCount).toFixed(1) : '0' }
  ];

  discData.forEach((item, idx) => {
    const row = 9 + idx;
    const isZebra = idx % 2 === 1;
    const baseStyle = isZebra ? zebraCellStyle : regularCellStyle;
    const centerStyle = isZebra ? centerZebraCellStyle : centerCellStyle;
    const pct = completedCount > 0 ? Math.round((item.count / completedCount) * 100) : 0;

    setCell(wsSummary, 0, row, item.factor, { ...baseStyle, font: { ...baseStyle.font, bold: true } });
    setCell(wsSummary, 1, row, item.desc, baseStyle);
    setCell(wsSummary, 2, row, item.count, centerStyle);
    setCell(wsSummary, 3, row, `${pct}%`, centerStyle);
    setCell(wsSummary, 4, row, item.avg, centerStyle);
  });

  // Table: Desglose por Departamento
  setCell(wsSummary, 0, 15, 'DESGLOSE DE PARTICIPACIÓN POR DEPARTAMENTO', subHeaderStyle);
  const deptHeaders = ['Departamento', 'Inscritos', 'Completados', 'Tasa Avance (%)'];
  deptHeaders.forEach((h, idx) => {
    setCell(wsSummary, idx, 16, h, navyHeaderStyle);
  });

  // Calculate unique departments
  const deptMap = new Map<string, { total: number; done: number }>();
  collaborators.forEach(c => {
    const d = c.department || 'General';
    if (!deptMap.has(d)) deptMap.set(d, { total: 0, done: 0 });
    const cur = deptMap.get(d)!;
    cur.total++;
    if (c.status === 'completed') cur.done++;
  });

  let deptRow = 17;
  Array.from(deptMap.entries()).forEach(([deptName, dData], idx) => {
    const isZebra = idx % 2 === 1;
    const baseStyle = isZebra ? zebraCellStyle : regularCellStyle;
    const centerStyle = isZebra ? centerZebraCellStyle : centerCellStyle;
    const rate = dData.total > 0 ? Math.round((dData.done / dData.total) * 100) : 0;

    setCell(wsSummary, 0, deptRow, deptName, baseStyle);
    setCell(wsSummary, 1, deptRow, dData.total, centerStyle);
    setCell(wsSummary, 2, deptRow, dData.done, centerStyle);
    setCell(wsSummary, 3, deptRow, `${rate}%`, centerStyle);
    deptRow++;
  });

  wsSummary['!ref'] = `A1:E${deptRow + 2}`;
  wsSummary['!cols'] = [
    { wch: 28 },
    { wch: 60 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 }
  ];

  XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen Ejecutivo');

  // ==========================================
  // PESTAÑA 2: MATRIZ DE COLABORADORES
  // ==========================================
  const wsMatrix: XLSX.WorkSheet = {};

  const matrixHeaders = [
    'No.',
    'Nombre Completo',
    'Correo Electrónico',
    'Departamento',
    'Puesto / Cargo',
    'Estatus',
    'Puntaje D',
    'Puntaje I',
    'Puntaje S',
    'Puntaje C',
    'Perfil Predominante',
    'Código de Estilo',
    'Fecha Finalización'
  ];

  matrixHeaders.forEach((h, colIdx) => {
    setCell(wsMatrix, colIdx, 0, h, navyHeaderStyle);
  });

  collaborators.forEach((collab, idx) => {
    const row = idx + 1;
    const isZebra = idx % 2 === 1;
    const baseStyle = isZebra ? zebraCellStyle : regularCellStyle;
    const centerStyle = isZebra ? centerZebraCellStyle : centerCellStyle;

    const isDone = collab.status === 'completed';
    const statusText = isDone ? 'COMPLETADO' : 'PENDIENTE';
    const statusStyle = {
      ...centerStyle,
      font: {
        ...centerStyle.font,
        bold: true,
        color: { rgb: isDone ? '16A34A' : 'D97706' }
      }
    };

    setCell(wsMatrix, 0, row, idx + 1, centerStyle);
    setCell(wsMatrix, 1, row, collab.fullName, { ...baseStyle, font: { ...baseStyle.font, bold: true } });
    setCell(wsMatrix, 2, row, collab.email, baseStyle);
    setCell(wsMatrix, 3, row, collab.department, baseStyle);
    setCell(wsMatrix, 4, row, collab.role || 'Colaborador', baseStyle);
    setCell(wsMatrix, 5, row, statusText, statusStyle);

    // Scores
    const scoreD = collab.scores ? (collab.scores.D > 0 ? `+${collab.scores.D}` : `${collab.scores.D}`) : '—';
    const scoreI = collab.scores ? (collab.scores.I > 0 ? `+${collab.scores.I}` : `${collab.scores.I}`) : '—';
    const scoreS = collab.scores ? (collab.scores.S > 0 ? `+${collab.scores.S}` : `${collab.scores.S}`) : '—';
    const scoreC = collab.scores ? (collab.scores.C > 0 ? `+${collab.scores.C}` : `${collab.scores.C}`) : '—';

    // Highlight dominant factor in score cell
    const scoreStyleD = { ...centerStyle, font: { ...centerStyle.font, bold: true, color: { rgb: 'BE123C' } } };
    const scoreStyleI = { ...centerStyle, font: { ...centerStyle.font, bold: true, color: { rgb: 'B45309' } } };
    const scoreStyleS = { ...centerStyle, font: { ...centerStyle.font, bold: true, color: { rgb: '047857' } } };
    const scoreStyleC = { ...centerStyle, font: { ...centerStyle.font, bold: true, color: { rgb: '0369A1' } } };

    setCell(wsMatrix, 6, row, scoreD, scoreStyleD);
    setCell(wsMatrix, 7, row, scoreI, scoreStyleI);
    setCell(wsMatrix, 8, row, scoreS, scoreStyleS);
    setCell(wsMatrix, 9, row, scoreC, scoreStyleC);

    setCell(wsMatrix, 10, row, collab.archetype?.title || (isDone ? 'Calculado' : 'Pendiente'), baseStyle);
    setCell(wsMatrix, 11, row, collab.scores?.dominantFactor ? `${collab.scores.dominantFactor}${collab.scores.secondaryFactor || ''}` : '—', centerStyle);
    
    const dateFormatted = collab.completedAt ? new Date(collab.completedAt).toLocaleDateString('es-MX') : '—';
    setCell(wsMatrix, 12, row, dateFormatted, centerStyle);
  });

  wsMatrix['!ref'] = `A1:M${collaborators.length + 1}`;
  wsMatrix['!cols'] = [
    { wch: 6 },   // No.
    { wch: 28 },  // Nombre
    { wch: 28 },  // Correo
    { wch: 20 },  // Departamento
    { wch: 24 },  // Puesto
    { wch: 14 },  // Estatus
    { wch: 12 },  // D
    { wch: 12 },  // I
    { wch: 12 },  // S
    { wch: 12 },  // C
    { wch: 28 },  // Perfil Predominante
    { wch: 14 },  // Código
    { wch: 16 }   // Fecha
  ];

  XLSX.utils.book_append_sheet(wb, wsMatrix, 'Matriz de Colaboradores');

  // ==========================================
  // PESTAÑA 3: DICCIONARIO DE PERFILES DISC
  // ==========================================
  const wsDict: XLSX.WorkSheet = {};

  setCell(wsDict, 0, 0, 'DICCIONARIO Y GUÍA DE INTERPRETACIÓN DISC', titleStyle);
  setCell(wsDict, 0, 1, 'Metodología estandarizada de 4 dimensiones conductuales y arquetipos clásicos', subtitleStyle);

  const dictHeaders = ['Factor', 'Dimensión', 'Eje Principal', 'Fortalezas Clave', 'Estilo de Comunicación', 'Áreas de Oportunidad'];
  dictHeaders.forEach((h, idx) => {
    setCell(wsDict, idx, 3, h, navyHeaderStyle);
  });

  const factorsInfo = [
    {
      code: 'D',
      name: 'Dominancia',
      focus: 'Resultados y Retos',
      strengths: 'Decisión rápida, firmeza, superación de obstáculos, orientación a metas.',
      comms: 'Directo, conciso, al grano, orientado a conclusiones ejecutivas.',
      growth: 'Desarrollar paciencia, escucha activa y evitar la imposición unilateral.'
    },
    {
      code: 'I',
      name: 'Influencia',
      focus: 'Personas y Visión',
      strengths: 'Persuasión, carisma, motivación grupal, creatividad y optimismo.',
      comms: 'Cálido, enérgico, verbal, estimulante y enfocado en relaciones.',
      growth: 'Mejorar el rigor de seguimiento operativo y la gestión estricta del tiempo.'
    },
    {
      code: 'S',
      name: 'Estabilidad',
      focus: 'Consistencia y Cooperación',
      strengths: 'Lealtad, perseverancia, escucha atenta, mediación de conflictos.',
      comms: 'Tranquilo, considerado, respetuoso y abierto a consensos.',
      growth: 'Aceptar cambios rápidos y expresar discrepancias abiertamente.'
    },
    {
      code: 'C',
      name: 'Cumplimiento',
      focus: 'Calidad y Procesos',
      strengths: 'Precisión técnica, estándares de calidad, rigor analítico, orden.',
      comms: 'Formal, preciso, sustentado en métricas y datos documentados.',
      growth: 'Evitar la parálisis por análisis y ganar flexibilidad ante imprevistos.'
    }
  ];

  factorsInfo.forEach((item, idx) => {
    const row = 4 + idx;
    const isZebra = idx % 2 === 1;
    const baseStyle = isZebra ? zebraCellStyle : regularCellStyle;
    const centerStyle = isZebra ? centerZebraCellStyle : centerCellStyle;

    setCell(wsDict, 0, row, item.code, { ...centerStyle, font: { ...centerStyle.font, bold: true } });
    setCell(wsDict, 1, row, item.name, { ...baseStyle, font: { ...baseStyle.font, bold: true } });
    setCell(wsDict, 2, row, item.focus, baseStyle);
    setCell(wsDict, 3, row, item.strengths, baseStyle);
    setCell(wsDict, 4, row, item.comms, baseStyle);
    setCell(wsDict, 5, row, item.growth, baseStyle);
  });

  // Archetypes dictionary subtable
  setCell(wsDict, 0, 10, 'ARQUETIPOS CONDUCTUALES COMBINADOS MÁS COMUNES', subHeaderStyle);
  const archHeaders = ['Arquetipo', 'Código', 'Descripción Breve', 'Entorno Óptimo'];
  archHeaders.forEach((h, idx) => {
    setCell(wsDict, idx, 11, h, navyHeaderStyle);
  });

  const archList = Object.values(DISC_ARCHETYPES);
  archList.forEach((arch, idx) => {
    const row = 12 + idx;
    const isZebra = idx % 2 === 1;
    const baseStyle = isZebra ? zebraCellStyle : regularCellStyle;
    const centerStyle = isZebra ? centerZebraCellStyle : centerCellStyle;

    setCell(wsDict, 0, row, arch.title, { ...baseStyle, font: { ...baseStyle.font, bold: true } });
    setCell(wsDict, 1, row, arch.id, centerStyle);
    setCell(wsDict, 2, row, arch.description, baseStyle);
    setCell(wsDict, 3, row, arch.idealEnvironment, baseStyle);
  });

  wsDict['!ref'] = `A1:F${12 + archList.length}`;
  wsDict['!cols'] = [
    { wch: 10 },
    { wch: 22 },
    { wch: 26 },
    { wch: 45 },
    { wch: 45 },
    { wch: 45 }
  ];

  XLSX.utils.book_append_sheet(wb, wsDict, 'Diccionario de Perfiles DISC');

  // Trigger immediate formatted .xlsx download
  const cleanCode = campaign.accessCode.replace(/[^a-zA-Z0-9_-]/g, '_');
  XLSX.writeFile(wb, `Reporte_Maestro_DISC_${cleanCode}.xlsx`);
}
