import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Company, Campaign, Collaborator, DISCFactor } from '../types';

interface GeneralPdfParams {
  company: Company;
  campaign: Campaign;
  collaborators: Collaborator[];
}

interface IndividualPdfParams {
  collaborator: Collaborator;
  company?: Company;
  campaign?: Campaign;
}

/**
 * Carga la imagen corporativa comgico.png como Base64 de forma asíncrona
 */
async function loadLogoBase64(): Promise<string | null> {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const dataURL = canvas.toDataURL('image/png');
            resolve(dataURL);
          } else {
            resolve(null);
          }
        } catch {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = '/comgico.png';
    } catch {
      resolve(null);
    }
  });
}

/**
 * 1. REPORTE GENERAL CONSOLIDADO Y COMPLETO EN PDF (Doble Nivel en un solo documento)
 * Sección 1: Reporte Ejecutivo General de Campaña (Portada, Radiografía Conductual, Diagnóstico Estratégico Grupal, Matriz)
 * Sección 2: Fichas Técnicas Individuales (Página completa exhaustiva por cada colaborador evaluado)
 */
export async function exportExecutiveGeneralPdfReport({
  company,
  campaign,
  collaborators
}: GeneralPdfParams): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // Cargar logotipo oficial comgico.png
  const logoBase64 = await loadLogoBase64();

  const completed = collaborators.filter(c => c.status === 'completed');
  const totalEnrolled = collaborators.length;
  const completedCount = completed.length;
  const participationRate = totalEnrolled > 0 ? Math.round((completedCount / totalEnrolled) * 100) : 0;

  // Conteo y distribución por factor dominante
  const quadrantCounts: Record<DISCFactor, number> = { D: 0, I: 0, S: 0, C: 0 };
  let sumD = 0, sumI = 0, sumS = 0, sumC = 0;
  let sumDPct = 0, sumIPct = 0, sumSPct = 0, sumCPct = 0;

  completed.forEach(c => {
    if (c.scores) {
      quadrantCounts[c.scores.dominantFactor]++;
      sumD += c.scores.D;
      sumI += c.scores.I;
      sumS += c.scores.S;
      sumC += c.scores.C;
      sumDPct += c.scores.dPercent;
      sumIPct += c.scores.iPercent;
      sumSPct += c.scores.sPercent;
      sumCPct += c.scores.cPercent;
    }
  });

  const countSafe = completedCount || 1;
  const avgScores = {
    D: Math.round(sumD / countSafe),
    I: Math.round(sumI / countSafe),
    S: Math.round(sumS / countSafe),
    C: Math.round(sumC / countSafe),
    dPercent: Math.round(sumDPct / countSafe),
    iPercent: Math.round(sumIPct / countSafe),
    sPercent: Math.round(sumSPct / countSafe),
    cPercent: Math.round(sumCPct / countSafe)
  };

  const dominantFactor: DISCFactor = (['D', 'I', 'S', 'C'] as DISCFactor[]).reduce((best, f) => 
    quadrantCounts[f] > quadrantCounts[best] ? f : best, 'D');

  const dominantNames: Record<DISCFactor, string> = {
    D: 'Dominancia (Orientada a Metas, Rapidez y Decisión)',
    I: 'Influencia (Promotores, Sociabilidad y Persuasión)',
    S: 'Estabilidad (Consistencia, Lealtad y Soporte Grupal)',
    C: 'Cumplimiento (Analítico, Calidad Técnica y Precisión)'
  };

  // Helper para dibujar encabezado institucional con logo comgico.png
  const drawPageHeader = (title: string, subtitle: string) => {
    doc.setFillColor(15, 23, 42); // Slate 900
    doc.rect(0, 0, pageWidth, 24, 'F');

    if (logoBase64) {
      try {
        doc.addImage(logoBase64, 'PNG', margin, 4.5, 20, 15);
      } catch (e) {
        console.warn('Error dibujando logo:', e);
      }
    }

    const titleX = logoBase64 ? margin + 24 : margin;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text(title, titleX, 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.text(subtitle, titleX, 18);
  };

  // Helper para dibujar pie de página institucional
  const drawPageFooter = (pageNum: number, totalPages: number) => {
    doc.setDrawColor(226, 232, 240); // Slate 200
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139); // Slate 500
    doc.text(`DISC Enterprise · ${company.name} · Documento Oficial Confidencial`, margin, pageHeight - 7);
    doc.text(`Página ${pageNum} de ${totalPages}`, pageWidth - margin, pageHeight - 7, { align: 'right' });
  };

  // =========================================================================
  // HOJA 1: PORTADA EJECUTIVA Y RADIOGRAFÍA CONDUCTUAL DEL EQUIPO
  // =========================================================================
  drawPageHeader(
    'INFORME EJECUTIVO DE TALENTO CONDUCTUAL DISC',
    `Evaluación Directiva · Campaña: ${campaign.accessCode}`
  );

  let currentY = 30;

  // Tarjeta de Metadatos y Ficha Corporativa
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, contentWidth, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('EMPRESA CLIENTE:', margin + 4, currentY + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(`${company.name} (RFC: ${company.rfc})`, margin + 38, currentY + 6);

  doc.setFont('helvetica', 'bold');
  doc.text('CAMPAÑA / PROYECTO:', margin + 4, currentY + 12);
  doc.setFont('helvetica', 'normal');
  doc.text(`${campaign.title} (Código: ${campaign.accessCode})`, margin + 38, currentY + 12);

  doc.setFont('helvetica', 'bold');
  doc.text('FECHA DE CORTE:', margin + 4, currentY + 18);
  doc.setFont('helvetica', 'normal');
  const nowFormatted = new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });
  const durStr = `${campaign.durationDays || 15} días de vigencia`;
  doc.text(`${nowFormatted} · Periodo activo: ${durStr}`, margin + 38, currentY + 18);

  currentY += 28;

  // Franja de KPIs de Portada (4 Bloques)
  const boxWidth = (contentWidth - 9) / 4;
  const kpis = [
    { label: 'TOTAL INSCRITOS', val: `${totalEnrolled}`, sub: 'En plantilla' },
    { label: 'EVALUACIONES HECHAS', val: `${completedCount}`, sub: 'Evaluados' },
    { label: 'PARTICIPACIÓN', val: `${participationRate}%`, sub: 'Tasa global' },
    { label: 'ESTILO DOMINANTE', val: dominantFactor, sub: dominantNames[dominantFactor].split(' ')[0] }
  ];

  kpis.forEach((kpi, idx) => {
    const x = margin + idx * (boxWidth + 3);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(x, currentY, boxWidth, 20, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label, x + boxWidth / 2, currentY + 5.5, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text(kpi.val, x + boxWidth / 2, currentY + 13, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text(kpi.sub, x + boxWidth / 2, currentY + 17.5, { align: 'center' });
  });

  currentY += 25;

  // Sección 1: Radiografía Conductual del Equipo (Gráficas y Datos)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('1. Radiografía Conductual del Equipo (Distribución e Intensidad)', margin, currentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Distribución porcentual por factor dominante y promedio de intensidad general del grupo', margin, currentY + 4.5);

  currentY += 8;

  const dimensions = [
    {
      code: 'D',
      title: 'Dominancia (D)',
      desc: 'Enfocados a resultados, toma rápida de decisiones, retos e impulso competitivo.',
      count: quadrantCounts.D,
      avgPct: avgScores.dPercent,
      color: [190, 18, 60] // Rose 700
    },
    {
      code: 'I',
      title: 'Influencia (I)',
      desc: 'Enfocados a relaciones humanas, dinamismo, persuasión comercial y optimismo grupal.',
      count: quadrantCounts.I,
      avgPct: avgScores.iPercent,
      color: [217, 119, 6] // Amber 600
    },
    {
      code: 'S',
      title: 'Estabilidad (S)',
      desc: 'Enfocados a procesos consistentes, empatía, cohesión de equipo, lealtad y soporte.',
      count: quadrantCounts.S,
      avgPct: avgScores.sPercent,
      color: [5, 150, 105] // Emerald 600
    },
    {
      code: 'C',
      title: 'Cumplimiento (C)',
      desc: 'Enfocados a precisión analítica, calidad técnica, rigor normativo y metodología.',
      count: quadrantCounts.C,
      avgPct: avgScores.cPercent,
      color: [2, 132, 199] // Sky 600
    }
  ];

  dimensions.forEach((dim) => {
    const pct = completedCount > 0 ? Math.round((dim.count / completedCount) * 100) : 0;

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, currentY, contentWidth, 13.5, 1.5, 1.5, 'FD');

    // Badge
    doc.setFillColor(dim.color[0], dim.color[1], dim.color[2]);
    doc.roundedRect(margin + 2.5, currentY + 2.5, 7, 8.5, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(dim.code, margin + 6, currentY + 8, { align: 'center' });

    // Título y descripción
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(dim.title, margin + 12, currentY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(dim.desc, margin + 12, currentY + 10);

    // Barra de porcentaje del talento
    const barAreaWidth = 48;
    const barStartX = pageWidth - margin - barAreaWidth - 28;

    doc.setFillColor(226, 232, 240);
    doc.roundedRect(barStartX, currentY + 5, barAreaWidth, 3.5, 1, 1, 'F');

    if (pct > 0) {
      doc.setFillColor(dim.color[0], dim.color[1], dim.color[2]);
      const fillW = Math.max(2, (barAreaWidth * pct) / 100);
      doc.roundedRect(barStartX, currentY + 5, fillW, 3.5, 1, 1, 'F');
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`${pct}% (${dim.count})`, pageWidth - margin - 3, currentY + 6.5, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Intensidad media: ${dim.avgPct}%`, pageWidth - margin - 3, currentY + 10.5, { align: 'right' });

    currentY += 15.5;
  });

  currentY += 3;

  // Clima Conductual Colectivo
  let climaNombre = '';
  let climaResumen = '';
  if (dominantFactor === 'D') {
    climaNombre = 'Equipo Orientado al Resultado Rápido, Desafíos y la Ejecución Asertiva';
    climaResumen = 'Predominio de proactividad, firmeza en decisiones y orientación al cumplimiento de hitos comerciales u operativos inmediatos.';
  } else if (dominantFactor === 'I') {
    climaNombre = 'Equipo Orientado a la Relación, Expansión Comercial y Entusiasmo Colectivo';
    climaResumen = 'Predominio de apertura social, persuasión, espíritu de colaboración y dinamismo para proyectar ideas al exterior.';
  } else if (dominantFactor === 'S') {
    climaNombre = 'Equipo Orientado a la Estabilidad, Cohesión Interna y Consistencia Metódica';
    climaResumen = 'Predominio de soporte mutuo, retención de conocimientos, fiabilidad operativa y armonía en las relaciones laborales.';
  } else {
    climaNombre = 'Equipo Orientado a la Precisión Analítica, Estándares de Calidad y Rigor Técnico';
    climaResumen = 'Predominio de rigor metodológico, búsqueda de exactitud, prevención sistemática de riesgos y cumplimiento estricto.';
  }

  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, currentY, contentWidth, 20, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(`CLIMA CONDUCTUAL COLECTIVO IDENTIFICADO:`, margin + 4, currentY + 6);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(2, 132, 199);
  doc.text(climaNombre, margin + 4, currentY + 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text(climaResumen, margin + 4, currentY + 16, { maxWidth: contentWidth - 8 });

  // =========================================================================
  // HOJA 2: DIAGNÓSTICO ESTRATÉGICO GRUPAL (ANÁLISIS CUALITATIVO PROFUNDO)
  // =========================================================================
  doc.addPage();
  drawPageHeader(
    'DIAGNÓSTICO ESTRATÉGICO GRUPAL Y DIRECTRICES DE LIDERAZGO',
    `Análisis Cualitativo Directivo · Sinergia y Puntos Ciegos · ${company.name}`
  );

  let diagY = 30;

  // Textos detallados para el diagnóstico estratégico
  let fortalezasColectivasDetalladas = '';
  let puntosCiegosFricciones = '';
  let directricesLiderazgo = '';

  if (dominantFactor === 'D') {
    fortalezasColectivasDetalladas =
      '• Velocidad y Asertividad de Ejecución: El equipo no posterga decisiones complejas; aborda los problemas frontales y actúa con rapidez.\n' +
      '• Resiliencia ante Metas Ambiciosas: Responde con vigor ante metas comerciales o de entrega retadoras, movilizándose con energía.\n' +
      '• Liderazgo Proactivo: Predisposición para asumir el control de proyectos sin esperar órdenes detalladas ni supervisiones constantes.';
    puntosCiegosFricciones =
      '• Fricción D vs S por Ritmo y Urgencia: Los perfiles orientados a Dominancia presionan por inmediatez, lo cual desgasta a los perfiles S que requieren método y estabilidad.\n' +
      '• Escucha Activa Limitada: Tendencia a interrumpir o minimizar objeciones de proceso para no frenar el ritmo.\n' +
      '• Riesgo de Fatiga Colectiva: Mantener un ritmo de alta tensión constante puede provocar rotación o desgaste si no se celebran hitos intermedios.';
    directricesLiderazgo =
      '1. Definir Objetivos en términos de "QUÉ" y dar autonomía en el "CÓMO": Permitirles definir el camino operativo sin microgestión.\n' +
      '2. Establecer Espacios de Escucha Obligatoria: Forzar 10 minutos de análisis de riesgos antes de arrancar ejecuciones irreversibles.\n' +
      '3. Equilibrar el Reconocimiento: Reconocer no solo la victoria rápida sino también el orden y la sostenibilidad operativa.';
  } else if (dominantFactor === 'I') {
    fortalezasColectivasDetalladas =
      '• Magnetismo Comercial y Persuasión: Habilidad sobresaliente para vender proyectos, captar clientes y motivar a grupos interdisciplinarios.\n' +
      '• Innovación y Creatividad Espontánea: Abundancia de propuestas frescas, facilidad para brainstorms y visión holística de negocio.\n' +
      '• Cohesión y Clima Laboral Dinámico: Fomenta un ambiente positivo, abierto al diálogo y con bajo temor a proponer ideas.';
    puntosCiegosFricciones =
      '• Fricción I vs C por Nivel de Detalle: Los perfiles I presentan ideas globales sin métricas, chocando frontalmente con perfiles C que exigen rigor y datos duros.\n' +
      '• Dispersión en la Entrega Final: Dificultad para mantener el enfoque en tareas repetitivas o en el cierre meticuloso de minutas y acuerdos.\n' +
      '• Sobrecrompromiso Social: Tendencia a prometer fechas de entrega irreales por optimismo y deseo de agradar a la contraparte.';
    directricesLiderazgo =
      '1. Asignar Parejas de Trabajo I + C: Emparejar la creatividad e iniciativa del Influente con el rigor y seguimiento analítico del Cumplidor.\n' +
      '2. Minutas y Acuerdos por Escrito al Cierre de Cada Junta: No dar por sentada una tarea hasta que quede calendarizada formalmente.\n' +
      '3. Gestionar Retroalimentación en Privado con Calidez: El perfil I es sensible al rechazo público; corregir en privado y alabar en público.';
  } else if (dominantFactor === 'S') {
    fortalezasColectivasDetalladas =
      '• Lealtad y Alta Retención de Talento: Genera estabilidad institucional sólida, minimizando la rotación y cuidando el clima humano.\n' +
      '• Consistencia Operativa y Paciencia: Destacan en el soporte continuo, atención minuciosa a clientes y ejecución paso a paso sin sobresaltos.\n' +
      '• Trabajo en Equipo y Colaboración Empática: Gran disposición para apoyar a compañeros en sobrecarga sin buscar protagonismos individuales.';
    puntosCiegosFricciones =
      '• Resistencia al Cambio Disruptivo Repentino: Los cambios de estrategia de último minuto generan desorientación e inseguridad.\n' +
      '• Dificultad para Expresar Inconformidades: Tienden a callar discrepancias por evitar la confrontación, acumulando estrés silencioso.\n' +
      '• Lentitud para Asumir Riesgos Competitivos: Puede retrasarse la adopción de herramientas innovadoras por apego al proceso conocido.';
    directricesLiderazgo =
      '1. Comunicar Transformaciones con Anticipación: Explicar las razones del cambio antes de implementarlo, ofreciendo capacitación paulatina.\n' +
      '2. Abrir Foros Seguros de Preguntas: Preguntar directamente: "¿Qué riesgos o dudas te genera este ajuste?" para validar sus opiniones.\n' +
      '3. Respaldar la Toma de Decisiones: Asegurarles que cometer errores en procesos nuevos es parte natural del aprendizaje directivo.';
  } else {
    fortalezasColectivasDetalladas =
      '• Rigor Metodológico y Calidad Superior: Los entregables cuentan con un estándar de precisión impecable, con mínima tasa de error.\n' +
      '• Pensamiento Crítico y Prevención de Riesgos: Detectan vulnerabilidades normativas o técnicas que otros perfiles pasan por alto.\n' +
      '• Objetividad y Decisiones Basadas en Datos: Priorizan métricas verificables y hechos cuantificables antes que corazonadas o emociones.';
    puntosCiegosFricciones =
      '• Parálisis por Análisis: Retraso en la toma de decisiones por buscar el 100% de la información cuando el mercado exige actuar con el 80%.\n' +
      '• Fricción C vs I por Estilo Comunicativo: El perfil C puede sonar frío, cortante o hipercrítico frente a la emotividad del perfil I.\n' +
      '• Perfeccionismo Paralizante: Dificultad para delegar por el temor de que otros no cumplan los mismos estándares de exactitud.';
    directricesLiderazgo =
      '1. Establecer Umbrales de Suficiencia (Regla 80/20): Definir qué nivel de datos es suficiente para avanzar sin frenar el time-to-market.\n' +
      '2. Fomentar la Empatía Pedagógica: Guiar a los perfiles analíticos para que comuniquen sus hallazgos como soporte y no como juicio punitivo.\n' +
      '3. Valorar Explícitamente su Rigor: Agradecer su trabajo de auditoría y estructuración como escudo protector de la reputación institucional.';
  }

  // 1. Tarjeta Fortalezas Colectivas
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, diagY, contentWidth, 48, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(5, 150, 105); // Verde esmeralda
  doc.text('A. FORTALEZAS COLECTIVAS DEL EQUIPO', margin + 4, diagY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(30, 41, 59);
  doc.text(fortalezasColectivasDetalladas, margin + 4, diagY + 12, { maxWidth: contentWidth - 8, lineHeightFactor: 1.35 });

  diagY += 52;

  // 2. Tarjeta Puntos Ciegos y Fricciones Potenciales
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, diagY, contentWidth, 50, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(190, 18, 60); // Rojo rubí
  doc.text('B. PUNTOS CIEGOS Y FRICCIONES POTENCIALES DE RELACIÓN', margin + 4, diagY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(30, 41, 59);
  doc.text(puntosCiegosFricciones, margin + 4, diagY + 12, { maxWidth: contentWidth - 8, lineHeightFactor: 1.35 });

  diagY += 54;

  // 3. Tarjeta Directrices de Liderazgo para la Dirección
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, diagY, contentWidth, 54, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(2, 132, 199); // Azul corporativo
  doc.text('C. DIRECTRICES DE LIDERAZGO PARA LA DIRECCIÓN GENERAL', margin + 4, diagY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(30, 41, 59);
  doc.text(directricesLiderazgo, margin + 4, diagY + 12, { maxWidth: contentWidth - 8, lineHeightFactor: 1.35 });

  // =========================================================================
  // HOJA 3: MATRIZ DETALLADA DE TALENTO (TABLA CORPORATIVA)
  // =========================================================================
  doc.addPage();
  drawPageHeader(
    'MATRIZ DETALLADA DE TALENTO CONDUCTUAL DE LA ORGANIZACIÓN',
    `Resultados Consolidados · Evaluados: ${collaborators.length} · Campaña: ${campaign.accessCode}`
  );

  const tableData = collaborators.map((c, index) => {
    const dScore = c.scores ? (c.scores.D > 0 ? `+${c.scores.D}` : `${c.scores.D}`) : '—';
    const iScore = c.scores ? (c.scores.I > 0 ? `+${c.scores.I}` : `${c.scores.I}`) : '—';
    const sScore = c.scores ? (c.scores.S > 0 ? `+${c.scores.S}` : `${c.scores.S}`) : '—';
    const cScore = c.scores ? (c.scores.C > 0 ? `+${c.scores.C}` : `${c.scores.C}`) : '—';

    return [
      `${index + 1}`,
      c.fullName,
      c.department,
      c.role || 'Colaborador',
      c.status === 'completed' ? 'Completado' : 'Pendiente',
      c.archetype?.title || (c.status === 'completed' ? 'Asignado' : '—'),
      dScore,
      iScore,
      sScore,
      cScore
    ];
  });

  autoTable(doc, {
    startY: 30,
    head: [[
      'No.',
      'Nombre Completo',
      'Departamento',
      'Puesto / Cargo',
      'Estatus',
      'Arquetipo DISC Predominante',
      'D',
      'I',
      'S',
      'C'
    ]],
    body: tableData,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 7.5,
      textColor: [30, 41, 59],
      cellPadding: 2,
      lineColor: [226, 232, 240],
      lineWidth: 0.2
    },
    headStyles: {
      fillColor: [15, 23, 42], // Slate 900
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 8 },
      1: { cellWidth: 38, fontStyle: 'bold' },
      2: { cellWidth: 26 },
      3: { cellWidth: 26 },
      4: { halign: 'center', cellWidth: 18 },
      5: { cellWidth: 36, fontStyle: 'bold' },
      6: { halign: 'center', cellWidth: 8, textColor: [190, 18, 60] },
      7: { halign: 'center', cellWidth: 8, textColor: [217, 119, 6] },
      8: { halign: 'center', cellWidth: 8, textColor: [5, 150, 105] },
      9: { halign: 'center', cellWidth: 8, textColor: [2, 132, 199] }
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    margin: { left: margin, right: margin, bottom: 16 }
  });

  // =========================================================================
  // SECCIÓN 2: FICHAS TÉCNICAS INDIVIDUALES (PÁGINA COMPLETA POR CADA COLABORADOR)
  // Cada evaluado cuenta con una hoja completa, estructurada y profunda
  // =========================================================================
  completed.forEach((collab) => {
    doc.addPage();
    drawPageHeader(
      'FICHA PSICOMÉTRICA INDIVIDUAL DISC · REPORTE EJECUTIVO',
      `Diagnóstico Conductual · ${collab.fullName} · ${company.name}`
    );

    let indY = 28;
    const scores = collab.scores;
    const archetype = collab.archetype;
    const dom = scores?.dominantFactor || 'D';
    const sec = scores?.secondaryFactor || 'I';

    // 1. Tarjeta de Datos del Evaluado
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, indY, contentWidth, 23, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(collab.fullName, margin + 4, indY + 6.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Puesto: ${collab.role || 'Colaborador'}   ·   Área: ${collab.department}   ·   Correo: ${collab.email}`, margin + 4, indY + 12.5);

    const compDate = collab.completedAt 
      ? new Date(collab.completedAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })
      : nowFormatted;
    doc.text(`Empresa: ${company.name}   ·   Campaña: ${campaign.accessCode}   ·   Fecha Evaluación: ${compDate}`, margin + 4, indY + 18);

    indY += 26;

    // 2. Gráfica de Barras Horizontales DISC
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text('Perfil de Intensidad por Dimensión Conductual (D - I - S - C):', margin, indY);

    indY += 4.5;

    const indBarWidth = (contentWidth - 9) / 4;
    const indFactors = [
      {
        code: 'D',
        title: 'Dominancia',
        score: scores?.D ?? 0,
        pct: scores?.dPercent ?? 50,
        color: [190, 18, 60]
      },
      {
        code: 'I',
        title: 'Influencia',
        score: scores?.I ?? 0,
        pct: scores?.iPercent ?? 50,
        color: [217, 119, 6]
      },
      {
        code: 'S',
        title: 'Estabilidad',
        score: scores?.S ?? 0,
        pct: scores?.sPercent ?? 50,
        color: [5, 150, 105]
      },
      {
        code: 'C',
        title: 'Cumplimiento',
        score: scores?.C ?? 0,
        pct: scores?.cPercent ?? 50,
        color: [2, 132, 199]
      }
    ];

    indFactors.forEach((f, idx) => {
      const x = margin + idx * (indBarWidth + 3);
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(x, indY, indBarWidth, 23, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(f.color[0], f.color[1], f.color[2]);
      doc.text(`${f.code} · ${f.title}`, x + 3, indY + 5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      const scoreStr = f.score > 0 ? `+${f.score}` : `${f.score}`;
      doc.text(scoreStr, x + indBarWidth - 3, indY + 5, { align: 'right' });

      doc.setFillColor(226, 232, 240);
      doc.roundedRect(x + 3, indY + 8.5, indBarWidth - 6, 3, 1, 1, 'F');

      doc.setFillColor(f.color[0], f.color[1], f.color[2]);
      const fillW = Math.max(2, ((indBarWidth - 6) * f.pct) / 100);
      doc.roundedRect(x + 3, indY + 8.5, fillW, 3, 1, 1, 'F');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`${f.pct}% Intensidad`, x + 3, indY + 16.5);
    });

    indY += 27;

    // 3. Arquetipo Dominante y Subtipo Secundario
    if (archetype) {
      doc.setFillColor(241, 245, 249);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(margin, indY, contentWidth, 28, 2, 2, 'FD');

      // Badge Dominante
      doc.setFillColor(15, 23, 42);
      doc.roundedRect(margin + 3, indY + 3.5, 13, 13, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text(dom, margin + 9.5, indY + 12, { align: 'center' });

      // Título
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text(`Arquetipo Dominante: ${archetype.title}`, margin + 19, indY + 7);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(2, 132, 199);
      doc.text(`Subtipo Secundario: Dimensión ${sec} (${dominantNames[sec].split('(')[0].trim()}) · ${archetype.subtitle}`, margin + 19, indY + 12);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.8);
      doc.setTextColor(51, 65, 85);
      doc.text(archetype.description, margin + 4, indY + 20, { maxWidth: contentWidth - 8 });

      indY += 32;
    }

    // 4. Secciones Cualitativas Profundas (2x2 Grid)
    if (archetype) {
      const boxW = (contentWidth - 4) / 2;
      const boxH = 43;

      // Card A: Personalidad Laboral y Fortalezas
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, indY, boxW, boxH, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(5, 150, 105);
      doc.text('PERSONALIDAD LABORAL Y FORTALEZAS', margin + 3.5, indY + 5.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(51, 65, 85);
      let fY = indY + 10.5;
      archetype.strengths.slice(0, 4).forEach(st => {
        doc.text(`• ${st}`, margin + 3.5, fY, { maxWidth: boxW - 7 });
        fY += 7;
      });

      // Card B: Estilo de Comunicación Óptimo
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(margin + boxW + 4, indY, boxW, boxH, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(2, 132, 199);
      doc.text('ESTILO DE COMUNICACIÓN ÓPTIMO', margin + boxW + 7.5, indY + 5.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(51, 65, 85);
      doc.text(archetype.communicationStyle, margin + boxW + 7.5, indY + 10.5, { maxWidth: boxW - 10 });

      doc.setFont('helvetica', 'bold');
      doc.text('Cómo prefiere recibir retroalimentación:', margin + boxW + 7.5, indY + 26);
      doc.setFont('helvetica', 'normal');
      let prefFeedback = '';
      if (dom === 'D') prefFeedback = 'Directo al grano, con datos de impacto y metas claras.';
      else if (dom === 'I') prefFeedback = 'Con calidez personal, resaltando lo positivo antes de ajustar.';
      else if (dom === 'S') prefFeedback = 'Con calma, en privado y dando tiempo para procesar el cambio.';
      else prefFeedback = 'Con datos precisos por escrito, lógica impecable y sin ambigüedades.';
      doc.text(prefFeedback, margin + boxW + 7.5, indY + 31, { maxWidth: boxW - 10 });

      indY += boxH + 4;

      // Card C: Comportamiento Bajo Tensión y Estrés
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(margin, indY, boxW, boxH, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(190, 18, 60);
      doc.text('CONDUCTA BAJO PRESIÓN Y ESTRÉS', margin + 3.5, indY + 5.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(51, 65, 85);
      doc.text(archetype.underPressure, margin + 3.5, indY + 10.5, { maxWidth: boxW - 7 });

      doc.setFont('helvetica', 'bold');
      doc.text('Cómo recuperar el equilibrio:', margin + 3.5, indY + 25);
      doc.setFont('helvetica', 'normal');
      let eqStr = '';
      if (dom === 'D') eqStr = 'Brindar autonomía para solucionar el obstáculo sin microgestión.';
      else if (dom === 'I') eqStr = 'Espacios para dialogar y validar sus aportes creativos.';
      else if (dom === 'S') eqStr = 'Garantizar estabilidad y reducir la incertidumbre inmediata.';
      else eqStr = 'Dar tiempo para verificar datos y no forzar decisiones precipitadas.';
      doc.text(eqStr, margin + 3.5, indY + 30, { maxWidth: boxW - 7 });

      // Card D: Entorno Laboral Ideal y Guía Directiva para el Líder
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(margin + boxW + 4, indY, boxW, boxH, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(217, 119, 6);
      doc.text('GUÍA PARA SU JEFE / LÍDER DIRECTO', margin + boxW + 7.5, indY + 5.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(51, 65, 85);
      let gY = indY + 10.5;
      archetype.growthAreas.slice(0, 3).forEach(ga => {
        doc.text(`• ${ga}`, margin + boxW + 7.5, gY, { maxWidth: boxW - 10 });
        gY += 8;
      });

      doc.setFont('helvetica', 'bold');
      doc.text('Entorno propicio:', margin + boxW + 7.5, indY + 34.5);
      doc.setFont('helvetica', 'normal');
      doc.text(archetype.idealEnvironment, margin + boxW + 7.5, indY + 38.5, { maxWidth: boxW - 10 });
    }
  });

  // Numeración formal y pie de página en todas las páginas
  const totalPages = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawPageFooter(i, totalPages);
  }

  // Descarga directa
  const cleanCode = campaign.accessCode.replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`Informe_Consolidado_DISC_${cleanCode}.pdf`);
}

/**
 * 2. REPORTE INDIVIDUAL EN PDF — FICHA TÉCNICA Y PSICOMÉTRICA DISC
 * Genera la ficha individual autónoma cuando se pulsa el botón en la fila o en el modal
 */
export async function exportIndividualPdfReport({
  collaborator,
  company,
  campaign
}: IndividualPdfParams): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  const logoBase64 = await loadLogoBase64();

  const scores = collaborator.scores;
  const archetype = collaborator.archetype;
  const dom = scores?.dominantFactor || 'D';
  const sec = scores?.secondaryFactor || 'I';

  const dominantNames: Record<DISCFactor, string> = {
    D: 'Dominancia (Orientada a Metas, Rapidez y Decisión)',
    I: 'Influencia (Promotores, Sociabilidad y Persuasión)',
    S: 'Estabilidad (Consistencia, Lealtad y Soporte Grupal)',
    C: 'Cumplimiento (Analítico, Calidad Técnica y Precisión)'
  };

  // Header Banner
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, pageWidth, 24, 'F');

  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'PNG', margin, 4.5, 20, 15);
    } catch (e) {
      console.warn('Error dibujando logo:', e);
    }
  }

  const titleX = logoBase64 ? margin + 24 : margin;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text('FICHA PSICOMÉTRICA INDIVIDUAL DISC · REPORTE EJECUTIVO', titleX, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Informe Confidencial de Perfil Conductual Organizacional', titleX, 18);

  let currentY = 28;

  // 1. Datos del Evaluado
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, currentY, contentWidth, 23, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(collaborator.fullName, margin + 4, currentY + 6.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Puesto: ${collaborator.role || 'Colaborador'}   ·   Área: ${collaborator.department}   ·   Correo: ${collaborator.email}`, margin + 4, currentY + 12.5);
  
  const compDate = collaborator.completedAt 
    ? new Date(collaborator.completedAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })
    : 'Completado';
  doc.text(`Empresa: ${company?.name || 'Cliente'}   ·   Campaña: ${campaign?.accessCode || 'DISC'}   ·   Fecha Evaluación: ${compDate}`, margin + 4, currentY + 18);

  currentY += 26;

  // 2. Gráfica de Barras DISC
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Perfil de Intensidad por Dimensión Conductual (D - I - S - C):', margin, currentY);

  currentY += 4.5;

  const barWidth = (contentWidth - 9) / 4;
  const factors = [
    {
      code: 'D',
      title: 'Dominancia',
      score: scores?.D ?? 0,
      pct: scores?.dPercent ?? 50,
      color: [190, 18, 60]
    },
    {
      code: 'I',
      title: 'Influencia',
      score: scores?.I ?? 0,
      pct: scores?.iPercent ?? 50,
      color: [217, 119, 6]
    },
    {
      code: 'S',
      title: 'Estabilidad',
      score: scores?.S ?? 0,
      pct: scores?.sPercent ?? 50,
      color: [5, 150, 105]
    },
    {
      code: 'C',
      title: 'Cumplimiento',
      score: scores?.C ?? 0,
      pct: scores?.cPercent ?? 50,
      color: [2, 132, 199]
    }
  ];

  factors.forEach((f, idx) => {
    const x = margin + idx * (barWidth + 3);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, currentY, barWidth, 23, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(f.color[0], f.color[1], f.color[2]);
    doc.text(`${f.code} · ${f.title}`, x + 3, currentY + 5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    const scoreStr = f.score > 0 ? `+${f.score}` : `${f.score}`;
    doc.text(scoreStr, x + barWidth - 3, currentY + 5, { align: 'right' });

    doc.setFillColor(226, 232, 240);
    doc.roundedRect(x + 3, currentY + 8.5, barWidth - 6, 3, 1, 1, 'F');

    doc.setFillColor(f.color[0], f.color[1], f.color[2]);
    const fillW = Math.max(2, ((barWidth - 6) * f.pct) / 100);
    doc.roundedRect(x + 3, currentY + 8.5, fillW, 3, 1, 1, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`${f.pct}% Intensidad`, x + 3, currentY + 16.5);
  });

  currentY += 27;

  // 3. Arquetipo Dominante y Secundario
  if (archetype) {
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, currentY, contentWidth, 28, 2, 2, 'FD');

    doc.setFillColor(15, 23, 42);
    doc.roundedRect(margin + 3, currentY + 3.5, 13, 13, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(dom, margin + 9.5, currentY + 12, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`Arquetipo Dominante: ${archetype.title}`, margin + 19, currentY + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(2, 132, 199);
    doc.text(`Subtipo Secundario: Dimensión ${sec} (${dominantNames[sec].split('(')[0].trim()}) · ${archetype.subtitle}`, margin + 19, currentY + 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(51, 65, 85);
    doc.text(archetype.description, margin + 4, currentY + 20, { maxWidth: contentWidth - 8 });

    currentY += 32;
  }

  // 4. Secciones Cualitativas (2x2 Grid)
  if (archetype) {
    const boxW = (contentWidth - 4) / 2;
    const boxH = 43;

    // Fortalezas
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, currentY, boxW, boxH, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(5, 150, 105);
    doc.text('PERSONALIDAD LABORAL Y FORTALEZAS', margin + 3.5, currentY + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(51, 65, 85);
    let strY = currentY + 10.5;
    archetype.strengths.slice(0, 4).forEach((st) => {
      doc.text(`• ${st}`, margin + 3.5, strY, { maxWidth: boxW - 7 });
      strY += 7;
    });

    // Comunicación
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin + boxW + 4, currentY, boxW, boxH, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(2, 132, 199);
    doc.text('ESTILO DE COMUNICACIÓN ÓPTIMO', margin + boxW + 7.5, currentY + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(51, 65, 85);
    doc.text(archetype.communicationStyle, margin + boxW + 7.5, currentY + 10.5, { maxWidth: boxW - 10 });

    doc.setFont('helvetica', 'bold');
    doc.text('Cómo prefiere recibir retroalimentación:', margin + boxW + 7.5, currentY + 26);
    doc.setFont('helvetica', 'normal');
    let prefFeedback = '';
    if (dom === 'D') prefFeedback = 'Directo al grano, con datos de impacto y metas claras.';
    else if (dom === 'I') prefFeedback = 'Con calidez personal, resaltando lo positivo antes de ajustar.';
    else if (dom === 'S') prefFeedback = 'Con calma, en privado y dando tiempo para procesar el cambio.';
    else prefFeedback = 'Con datos precisos por escrito, lógica impecable y sin ambigüedades.';
    doc.text(prefFeedback, margin + boxW + 7.5, currentY + 31, { maxWidth: boxW - 10 });

    currentY += boxH + 4;

    // Tensión
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, currentY, boxW, boxH, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(190, 18, 60);
    doc.text('CONDUCTA BAJO PRESIÓN Y ESTRÉS', margin + 3.5, currentY + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(51, 65, 85);
    doc.text(archetype.underPressure, margin + 3.5, currentY + 10.5, { maxWidth: boxW - 7 });

    doc.setFont('helvetica', 'bold');
    doc.text('Cómo recuperar el equilibrio:', margin + 3.5, currentY + 25);
    doc.setFont('helvetica', 'normal');
    let eqStr = '';
    if (dom === 'D') eqStr = 'Brindar autonomía para solucionar el obstáculo sin microgestión.';
    else if (dom === 'I') eqStr = 'Espacios para dialogar y validar sus aportes creativos.';
    else if (dom === 'S') eqStr = 'Garantizar estabilidad y reducir la incertidumbre inmediata.';
    else eqStr = 'Dar tiempo para verificar datos y no forzar decisiones precipitadas.';
    doc.text(eqStr, margin + 3.5, currentY + 30, { maxWidth: boxW - 7 });

    // Líder
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin + boxW + 4, currentY, boxW, boxH, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(217, 119, 6);
    doc.text('GUÍA PARA SU JEFE / LÍDER DIRECTO', margin + boxW + 7.5, currentY + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(51, 65, 85);
    let recY = currentY + 10.5;
    archetype.growthAreas.slice(0, 3).forEach((rec) => {
      doc.text(`• ${rec}`, margin + boxW + 7.5, recY, { maxWidth: boxW - 10 });
      recY += 8;
    });

    doc.setFont('helvetica', 'bold');
    doc.text('Entorno propicio:', margin + boxW + 7.5, currentY + 34.5);
    doc.setFont('helvetica', 'normal');
    doc.text(archetype.idealEnvironment, margin + boxW + 7.5, currentY + 38.5, { maxWidth: boxW - 10 });
  }

  // Footer
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`DISC Enterprise · Evaluación Psicométrica · Licencia Corporativa`, margin, pageHeight - 7);
  doc.text(`ID Registro: ${collaborator.id}`, pageWidth - margin, pageHeight - 7, { align: 'right' });

  // Descarga directa
  const cleanName = collaborator.fullName.replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`Ficha_DISC_${cleanName}.pdf`);
}
