import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Company, Campaign, Collaborator, DISCFactor } from '../types';
import { calculateNaturalVsAdapted, generateTeamSynergySummary } from '../data/stressAndSynergy';
import { calculateJobFit, detectBenchmarkFromRole } from '../data/jobFitBenchmarks';
import { getLeadershipGuide } from '../data/managerLeadershipGuides';

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
 * Sección 1: Reporte Ejecutivo General de Campaña (Portada, Radiografía Conductual, Diagnóstico Estratégico Grupal, Mapa de Sinergia y Matriz)
 * Sección 2: Fichas Técnicas Individuales (Páginas completas con Natural vs Adaptado, Job-Fit y Manual DOs & DON'Ts)
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
    doc.setFontSize(10.5);
    doc.setTextColor(255, 255, 255);
    doc.text(title, titleX, 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.text(subtitle, titleX, 18);
  };

  // Helper para dibujar pie de página
  const drawPageFooter = (pageNum: number, total: number) => {
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`DISC Enterprise · ${company.name} · Campaña: ${campaign.accessCode}`, margin, pageHeight - 7);
    doc.text(`Página ${pageNum} de ${total}`, pageWidth - margin, pageHeight - 7, { align: 'right' });
  };

  const nowFormatted = new Date().toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  // =========================================================================
  // HOJA 1: PORTADA Y RADIOGRAFÍA CONDUCTUAL DEL EQUIPO
  // =========================================================================
  drawPageHeader(
    'INFORME EJECUTIVO DIRECTIVO DE EVALUACIÓN DISC',
    `Radiografía de Talento Organizacional · ${company.name} · Campaña ${campaign.accessCode}`
  );

  let currentY = 30;

  // 1. Tarjeta Resumen de Campaña & Portada Corporativa
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, currentY, contentWidth, 32, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('DATOS GENERALES DE LA EVALUACIÓN', margin + 4, currentY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text(`Empresa Cliente: ${company.name}   ·   RFC: ${company.rfc}`, margin + 4, currentY + 14);
  doc.text(`Código de Campaña: ${campaign.accessCode}   ·   Título: ${campaign.title}`, margin + 4, currentY + 20);
  doc.text(`Fecha de Emisión: ${nowFormatted}   ·   Periodo Vigencia: ${campaign.durationDays} días`, margin + 4, currentY + 26);

  currentY += 36;

  // 2. Tarjetas de Indicadores Globales (KPIs)
  const kpiWidth = (contentWidth - 9) / 4;
  const kpis = [
    { label: 'TOTAL INSCRITOS', val: `${totalEnrolled}`, sub: 'En plantilla' },
    { label: 'EVALUACIONES COMPLETAS', val: `${completedCount}`, sub: `${participationRate}% de avance` },
    { label: 'TASA DE PARTICIPACIÓN', val: `${participationRate}%`, sub: `${totalEnrolled - completedCount} pendientes` },
    { label: 'FACTOR PREDOMINANTE', val: dominantFactor, sub: dominantNames[dominantFactor].split('(')[0].trim() }
  ];

  kpis.forEach((kpi, idx) => {
    const x = margin + idx * (kpiWidth + 3);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(x, currentY, kpiWidth, 22, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label, x + kpiWidth / 2, currentY + 5.5, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text(kpi.val, x + kpiWidth / 2, currentY + 13.5, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(71, 85, 105);
    doc.text(kpi.sub, x + kpiWidth / 2, currentY + 18.5, { align: 'center' });
  });

  currentY += 26;

  // 3. Distribución Porcentual y Gráfica del Clima Conductual
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('DISTRIBUCIÓN Y RADIOGRAFÍA DEL TALENTO (D - I - S - C):', margin, currentY);

  currentY += 4.5;

  const quadrantData = [
    {
      code: 'D',
      name: 'Dominancia',
      desc: 'Orientado a Resultados, Desafíos y Ritmo Rápido',
      count: quadrantCounts.D,
      pct: completedCount > 0 ? Math.round((quadrantCounts.D / completedCount) * 100) : 0,
      avgPct: avgScores.dPercent,
      color: [190, 18, 60] // Rose 700
    },
    {
      code: 'I',
      name: 'Influencia',
      desc: 'Orientado a Personas, Persuasión y Comunicación',
      count: quadrantCounts.I,
      pct: completedCount > 0 ? Math.round((quadrantCounts.I / completedCount) * 100) : 0,
      avgPct: avgScores.iPercent,
      color: [217, 119, 6] // Amber 600
    },
    {
      code: 'S',
      name: 'Estabilidad',
      desc: 'Orientado a la Cooperación, Consistencia y Soporte',
      count: quadrantCounts.S,
      pct: completedCount > 0 ? Math.round((quadrantCounts.S / completedCount) * 100) : 0,
      avgPct: avgScores.sPercent,
      color: [5, 150, 105] // Emerald 600
    },
    {
      code: 'C',
      name: 'Cumplimiento',
      desc: 'Orientado a la Calidad, Rigor Analítico y Normas',
      count: quadrantCounts.C,
      pct: completedCount > 0 ? Math.round((quadrantCounts.C / completedCount) * 100) : 0,
      avgPct: avgScores.cPercent,
      color: [2, 132, 199] // Sky 600
    }
  ];

  quadrantData.forEach((q) => {
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, currentY, contentWidth, 14, 2, 2, 'FD');

    // Badge con letra
    doc.setFillColor(q.color[0], q.color[1], q.color[2]);
    doc.roundedRect(margin + 2.5, currentY + 2.5, 9, 9, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(q.code, margin + 7, currentY + 8.5, { align: 'center' });

    // Título y descripción
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(`${q.name} (${q.count} personas)`, margin + 14, currentY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(100, 116, 139);
    doc.text(q.desc, margin + 14, currentY + 10.5);

    // Barra de progreso y porcentaje
    const barX = margin + 100;
    const barW = 55;
    doc.setFillColor(226, 232, 240);
    doc.roundedRect(barX, currentY + 5, barW, 4, 1, 1, 'F');

    doc.setFillColor(q.color[0], q.color[1], q.color[2]);
    const fillWidth = Math.max(1, (barW * q.pct) / 100);
    doc.roundedRect(barX, currentY + 5, fillWidth, 4, 1, 1, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(`${q.pct}% del equipo`, margin + contentWidth - 4, currentY + 8, { align: 'right' });

    currentY += 16;
  });

  currentY += 4;

  // 4. Clima Conductual Colectivo
  let climaNombre = '';
  let climaResumen = '';
  if (dominantFactor === 'D') {
    climaNombre = 'Equipo Altamente Orientado a Resultados, Desafíos y Velocidad de Ejecución';
    climaResumen = 'Predomina un estilo directo, resolutivo y competitivo. El equipo muestra gran capacidad para superar obstáculos bajo presión, aunque requiere cuidar la escucha activa y la paciencia.';
  } else if (dominantFactor === 'I') {
    climaNombre = 'Equipo Orientado a las Relaciones, Comunicación Abierta e Innovación';
    climaResumen = 'Predomina la energía grupal, la creatividad y la facilidad de conexión interpersonal. Gran impacto en ventas y proyectos colaborativos; requiere reforzar el seguimiento metódico de minutas y fechas de entrega.';
  } else if (dominantFactor === 'S') {
    climaNombre = 'Equipo Orientado a la Estabilidad, Consistencia y Soporte Mutuo';
    climaResumen = 'Predomina la lealtad, la perseverancia y la armonía laboral. Excelente ritmo sostenido en tareas continuas; se beneficia de acompañamiento directivo ante cambios estratégicos bruscos.';
  } else {
    climaNombre = 'Equipo Orientado a la Precisión Técnica, Calidad y Rigor de Procesos';
    climaResumen = 'Predomina el análisis objetivo y el apego estricto a las normas. Garantiza entregas con mínimo margen de error; requiere evitar la parálisis por análisis en decisiones que demandan rapidez.';
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
  // HOJA 2: DIAGNÓSTICO ESTRATÉGICO GRUPAL
  // =========================================================================
  doc.addPage();
  drawPageHeader(
    'DIAGNÓSTICO ESTRATÉGICO GRUPAL Y DIRECTRICES DE LIDERAZGO',
    `Análisis Cualitativo Directivo · Sinergia y Puntos Ciegos · ${company.name}`
  );

  let diagY = 30;

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
  doc.setTextColor(5, 150, 105);
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
  doc.setTextColor(190, 18, 60);
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
  doc.setTextColor(2, 132, 199);
  doc.text('C. DIRECTRICES DE LIDERAZGO PARA LA DIRECCIÓN GENERAL', margin + 4, diagY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(30, 41, 59);
  doc.text(directricesLiderazgo, margin + 4, diagY + 12, { maxWidth: contentWidth - 8, lineHeightFactor: 1.35 });

  // =========================================================================
  // HOJA 3: DIAGNÓSTICO DE FRICCIONES Y ALIANZAS DEL EQUIPO (MAPA DE SINERGIA)
  // =========================================================================
  doc.addPage();
  drawPageHeader(
    'DIAGNÓSTICO DE FRICCIONES Y ALIANZAS DEL EQUIPO (MAPA DE SINERGIA)',
    `Dinámica Grupal · Riesgos Operativos y Recomendaciones de Balance · ${company.name}`
  );

  const synergySummary = generateTeamSynergySummary(collaborators);
  let synY = 30;

  // Header Box de Sinergia
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, synY, contentWidth, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('ÍNDICE GLOBAL DE COMPATIBILIDAD Y SINERGIA GRUPAL:', margin + 4, synY + 7);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(5, 150, 105);
  doc.text(`${synergySummary.averageSynergy}%`, margin + 4, synY + 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Basado en ${synergySummary.totalPairs} interacciones pareadas de colaboradores evaluados en esta campaña.`,
    margin + 26,
    synY + 15
  );

  synY += 28;

  // Alianzas Clave Detectadas
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, synY, contentWidth, 55, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(5, 150, 105);
  doc.text('1. ALIANZAS NATURALES Y COMPLEMENTARIEDADES ESTRATÉGICAS', margin + 4, synY + 6);

  let aY = synY + 12;
  if (synergySummary.topAlliances.length > 0) {
    synergySummary.topAlliances.slice(0, 3).forEach((al) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);
      doc.text(`• ${al.collabAName} (${al.collabADominant}) + ${al.collabBName} (${al.collabBDominant}): ${al.synergyScore}% Sinergia`, margin + 4, aY);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.8);
      doc.setTextColor(71, 85, 105);
      doc.text(al.allianceDescription, margin + 6, aY + 4, { maxWidth: contentWidth - 12 });
      aY += 13;
    });
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text('Se requiere completar más evaluaciones para mapear alianzas específicas.', margin + 4, aY);
  }

  synY += 60;

  // Alertas Tempranas de Fricción
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, synY, contentWidth, 55, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(190, 18, 60);
  doc.text('2. ALERTAS TEMPRANAS DE FRICCIÓN POTENCIAL Y RIESGOS DE OPERACIÓN', margin + 4, synY + 6);

  let fY = synY + 12;
  if (synergySummary.criticalFrictions.length > 0) {
    synergySummary.criticalFrictions.slice(0, 3).forEach((fr) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);
      doc.text(`• ${fr.collabAName} + ${fr.collabBName} (${fr.allianceType})`, margin + 4, fY);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.8);
      doc.setTextColor(71, 85, 105);
      doc.text(fr.frictionPoints.join(' · '), margin + 6, fY + 4, { maxWidth: contentWidth - 12 });
      fY += 13;
    });
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text('No se detectaron parejas con fricción de alto riesgo crítico en el muestreo actual.', margin + 4, fY);
  }

  synY += 60;

  // Recomendaciones para conformación de comités
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, synY, contentWidth, 42, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(2, 132, 199);
  doc.text('3. RECOMENDACIONES PARA BALANCEAR COMITÉS O PROYECTOS INTERDISCIPLINARIOS', margin + 4, synY + 6);

  let rY = synY + 12;
  synergySummary.leadershipRecommendations.slice(0, 3).forEach((rec) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(51, 65, 85);
    doc.text(`• ${rec}`, margin + 4, rY, { maxWidth: contentWidth - 8 });
    rY += 9;
  });

  // =========================================================================
  // HOJA 4: MATRIZ DETALLADA DE TALENTO (TABLA CORPORATIVA)
  // =========================================================================
  doc.addPage();
  drawPageHeader(
    'MATRIZ DETALLADA DE TALENTO CONDUCTUAL DE LA ORGANIZACIÓN',
    `Resultados Consolidados · Evaluados: ${collaborators.length} · Campaña: ${campaign.accessCode}`
  );

  const tableData = collaborators.map((c, index) => {
    const isDone = c.status === 'completed';
    let natAdapText = '—';
    let stressText = '—';
    let jobFitText = '—';

    if (isDone && c.scores) {
      const natAdap = calculateNaturalVsAdapted(c.scores);
      natAdapText = `Nat:${natAdap.natural.dominantFactor} / Adap:${natAdap.adapted.dominantFactor}`;
      stressText = `${natAdap.stressIndex}% (${natAdap.stressLevel.slice(0, 3)})`;
      const jobFitRes = calculateJobFit(c.scores, c.benchmarkId || c.role, c.department);
      jobFitText = `${jobFitRes.fitPercentage}% (${jobFitRes.fitLevel.slice(0, 4)})`;
    }

    return [
      `${index + 1}`,
      c.fullName,
      c.department,
      c.role || 'Colaborador',
      isDone ? 'Completado' : 'Pendiente',
      c.archetype?.title || (isDone ? 'Asignado' : '—'),
      natAdapText,
      stressText,
      jobFitText
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
      'Arquetipo DISC',
      'Natural / Adaptado',
      'Tensión',
      'Job-Fit'
    ]],
    body: tableData,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 7,
      textColor: [30, 41, 59],
      cellPadding: 2,
      lineColor: [226, 232, 240],
      lineWidth: 0.2
    },
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 7 },
      1: { cellWidth: 34, fontStyle: 'bold' },
      2: { cellWidth: 24 },
      3: { cellWidth: 24 },
      4: { halign: 'center', cellWidth: 16 },
      5: { cellWidth: 30, fontStyle: 'bold' },
      6: { halign: 'center', cellWidth: 20 },
      7: { halign: 'center', cellWidth: 13 },
      8: { halign: 'center', cellWidth: 14 }
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    margin: { left: margin, right: margin, bottom: 16 }
  });

  // =========================================================================
  // SECCIÓN 2: FICHAS TÉCNICAS INDIVIDUALES (DOS HOJAS ESTRUCTURADAS POR COLABORADOR)
  // =========================================================================
  completed.forEach((collab) => {
    const scores = collab.scores;
    const archetype = collab.archetype;
    if (!scores) return;

    const natAdap = calculateNaturalVsAdapted(scores);
    const jobFitRes = calculateJobFit(scores, collab.benchmarkId || collab.role, collab.department);
    const leadershipGuide = getLeadershipGuide(scores.dominantFactor, scores.secondaryFactor);

    // --- PÁGINA INDIVIDUAL 1: PERFIL PSICOMÉTRICO, NATURAL VS ADAPTADO & JOB-FIT ---
    doc.addPage();
    drawPageHeader(
      'FICHA PSICOMÉTRICA INDIVIDUAL DISC · REPORTE EJECUTIVO',
      `Diagnóstico Conductual · ${collab.fullName} · ${company.name}`
    );

    let indY = 28;

    // 1. Datos del Evaluado
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, indY, contentWidth, 23, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
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

    // 2. Gráfica Dual: Perfil Natural (Azul Marino) vs. Perfil Adaptado (Índigo)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text('Contraste Psicométrico: Estilo Natural vs. Estilo Adaptado (Índice de Desgaste):', margin, indY);

    // Badge Tensión
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    const stressColor = natAdap.stressLevel === 'Normal' ? [5, 150, 105] : natAdap.stressLevel === 'Moderado' ? [217, 119, 6] : [190, 18, 60];
    doc.setTextColor(stressColor[0], stressColor[1], stressColor[2]);
    doc.text(`Tensión: ${natAdap.stressIndex}% (${natAdap.stressLevel})`, margin + contentWidth, indY, { align: 'right' });

    indY += 4.5;

    const dualBarWidth = (contentWidth - 9) / 4;
    const indFactors: { code: DISCFactor; title: string; natPct: number; adapPct: number }[] = [
      { code: 'D', title: 'Dominancia', natPct: natAdap.natural.dPercent, adapPct: natAdap.adapted.dPercent },
      { code: 'I', title: 'Influencia', natPct: natAdap.natural.iPercent, adapPct: natAdap.adapted.iPercent },
      { code: 'S', title: 'Estabilidad', natPct: natAdap.natural.sPercent, adapPct: natAdap.adapted.sPercent },
      { code: 'C', title: 'Cumplimiento', natPct: natAdap.natural.cPercent, adapPct: natAdap.adapted.cPercent }
    ];

    indFactors.forEach((f, idx) => {
      const x = margin + idx * (dualBarWidth + 3);
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(x, indY, dualBarWidth, 29, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);
      doc.text(`${f.code} · ${f.title}`, x + 3, indY + 5);

      // Barra Natural (Azul Marino)
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(15, 23, 42);
      doc.text(`Nat: ${f.natPct}%`, x + 3, indY + 11);

      doc.setFillColor(226, 232, 240);
      doc.roundedRect(x + 18, indY + 8.5, dualBarWidth - 21, 3, 1, 1, 'F');
      doc.setFillColor(15, 23, 42); // Azul Marino
      doc.roundedRect(x + 18, indY + 8.5, Math.max(1, ((dualBarWidth - 21) * f.natPct) / 100), 3, 1, 1, 'F');

      // Barra Adaptada (Índigo)
      doc.setTextColor(79, 70, 229);
      doc.text(`Adap: ${f.adapPct}%`, x + 3, indY + 18);

      doc.setFillColor(226, 232, 240);
      doc.roundedRect(x + 18, indY + 15.5, dualBarWidth - 21, 3, 1, 1, 'F');
      doc.setFillColor(99, 102, 241); // Índigo
      doc.roundedRect(x + 18, indY + 15.5, Math.max(1, ((dualBarWidth - 21) * f.adapPct) / 100), 3, 1, 1, 'F');

      // Gap
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.2);
      doc.setTextColor(100, 116, 139);
      const gap = Math.abs(f.natPct - f.adapPct);
      doc.text(`Brecha: Δ ${gap}%`, x + 3, indY + 25);
    });

    indY += 33;

    // Diagnóstico Directivo del Desgaste
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, indY, contentWidth, 20, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`Diagnóstico de Desgaste Conductual: ${natAdap.levelLabel}`, margin + 4, indY + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(51, 65, 85);
    doc.text(natAdap.executiveDiagnosis, margin + 4, indY + 10.5, { maxWidth: contentWidth - 8 });
    doc.text(`Directriz: ${natAdap.recommendation}`, margin + 4, indY + 16, { maxWidth: contentWidth - 8 });

    indY += 24;

    // 3. Compatibilidad con el Puesto (Job-Fit Score %)
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, indY, contentWidth, 34, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(2, 132, 199);
    doc.text(`COMPATIBILIDAD CON EL PUESTO (JOB-FIT): ${jobFitRes.benchmarkTitle.toUpperCase()}`, margin + 4, indY + 5.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    const fitBadgeColor = jobFitRes.fitLevel === 'Alto' ? [5, 150, 105] : jobFitRes.fitLevel === 'Medio' ? [217, 119, 6] : [190, 18, 60];
    doc.setTextColor(fitBadgeColor[0], fitBadgeColor[1], fitBadgeColor[2]);
    doc.text(`${jobFitRes.fitPercentage}% · Ajuste ${jobFitRes.fitLevel}`, margin + contentWidth - 4, indY + 5.5, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(51, 65, 85);
    doc.text(jobFitRes.summary, margin + 4, indY + 11.5, { maxWidth: contentWidth - 8 });

    // Gaps en Job-Fit
    let gX = margin + 4;
    const gColW = (contentWidth - 12) / 4;
    jobFitRes.gaps.forEach((g) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(15, 23, 42);
      doc.text(`${g.factor}: ${g.status}`, gX, indY + 23);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.2);
      doc.setTextColor(100, 116, 139);
      doc.text(`Real:${g.actualPercent}% / Ideal:${g.benchmarkPercent}%`, gX, indY + 28);
      gX += gColW + 2;
    });

    indY += 38;

    // 4. Arquetipo Conductual
    if (archetype) {
      doc.setFillColor(241, 245, 249);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(margin, indY, contentWidth, 28, 2, 2, 'FD');

      doc.setFillColor(15, 23, 42);
      doc.roundedRect(margin + 3, indY + 3.5, 13, 13, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text(archetype.dominant, margin + 9.5, indY + 12, { align: 'center' });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text(`Arquetipo: ${archetype.title}`, margin + 19, indY + 7);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(2, 132, 199);
      doc.text(archetype.subtitle, margin + 19, indY + 12);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.8);
      doc.setTextColor(51, 65, 85);
      doc.text(archetype.description, margin + 4, indY + 20, { maxWidth: contentWidth - 8 });
    }

    // --- PÁGINA INDIVIDUAL 2: MANUAL DE LIDERAZGO PARA EL JEFE DIRECTO (DOs & DONTs) Y DESARROLLO ---
    doc.addPage();
    drawPageHeader(
      'MANUAL DE GESTIÓN Y LIDERAZGO PARA EL JEFE DIRECTO',
      `Guía Ejecutiva de Bolsillo (DOs & DON'Ts) · ${collab.fullName} · ${company.name}`
    );

    let manY = 30;

    // Header del Manual
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, manY, contentWidth, 18, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(`DIRECTRICES DE SUPERVISIÓN Y MOTIVACIÓN PERSONALIZADAS`, margin + 4, manY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text(
      `Pautas directivas para maximizar el engagement, evitar errores comunes de supervisión y potenciar el desempeño de ${collab.fullName}.`,
      margin + 4,
      manY + 12
    );

    manY += 22;

    // Dos Columnas: DOs (Verde) vs DON'Ts (Rojo)
    const colW = (contentWidth - 6) / 2;
    const colH = 92;

    // Columna Izquierda: QUÉ SÍ HACER (DOs)
    doc.setFillColor(240, 253, 244); // Emerald 50
    doc.setDrawColor(187, 247, 208); // Emerald 200
    doc.roundedRect(margin, manY, colW, colH, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(5, 150, 105); // Emerald 600
    doc.text('QUÉ SÍ HACER (DOs) · MAXIMIZA SU RENDIMIENTO', margin + 4, manY + 7);

    let doY = manY + 14;
    leadershipGuide.dos.forEach((item) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(5, 150, 105);
      doc.text('✓', margin + 4, doY);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.8);
      doc.setTextColor(30, 41, 59);
      doc.text(item, margin + 9, doY, { maxWidth: colW - 13 });
      doY += 15;
    });

    // Columna Derecha: QUÉ NUNCA HACER (DON'Ts)
    const rightX = margin + colW + 6;
    doc.setFillColor(255, 241, 242); // Rose 50
    doc.setDrawColor(254, 205, 211); // Rose 200
    doc.roundedRect(rightX, manY, colW, colH, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(190, 18, 60); // Rose 700
    doc.text("QUÉ NUNCA HACER (DON'Ts) · DESMOTIVA O PARALIZA", rightX + 4, manY + 7);

    let dontY = manY + 14;
    leadershipGuide.donts.forEach((item) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(190, 18, 60);
      doc.text('✕', rightX + 4, dontY);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.8);
      doc.setTextColor(30, 41, 59);
      doc.text(item, rightX + 9, dontY, { maxWidth: colW - 13 });
      dontY += 15;
    });

    manY += colH + 6;

    // Sección inferior: Comunicación, Tensión y Entorno
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, manY, contentWidth, 54, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(2, 132, 199);
    doc.text('FACTORES CLAVE DE COMUNICACIÓN Y ENTORNO ÓPTIMO', margin + 4, manY + 6);

    let subY = manY + 13;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(15, 23, 42);
    doc.text('• Cómo retroalimentarle óptimamente:', margin + 4, subY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(archetype?.communicationStyle || 'Directo y respetuoso.', margin + 48, subY, { maxWidth: contentWidth - 52 });

    subY += 11;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('• Comportamiento bajo estrés severo:', margin + 4, subY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(archetype?.underPressure || 'Mantener calma y reducir presión.', margin + 48, subY, { maxWidth: contentWidth - 52 });

    subY += 11;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('• Entorno físico y laboral preferido:', margin + 4, subY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(archetype?.idealEnvironment || 'Espacio estructurado.', margin + 48, subY, { maxWidth: contentWidth - 52 });

    subY += 11;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('• Palancas principales de motivación:', margin + 4, subY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(leadershipGuide.motivationKeys.join(' · '), margin + 48, subY, { maxWidth: contentWidth - 52 });
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
 * Genera la ficha individual completa de 2 páginas cuando se descarga por separado
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
  if (!scores) return;

  const natAdap = calculateNaturalVsAdapted(scores);
  const jobFitRes = calculateJobFit(scores, collaborator.benchmarkId || collaborator.role, collaborator.department);
  const leadershipGuide = getLeadershipGuide(scores.dominantFactor, scores.secondaryFactor);

  const nowFormatted = collaborator.completedAt 
    ? new Date(collaborator.completedAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });

  const drawIndHeader = (title: string, subtitle: string) => {
    doc.setFillColor(15, 23, 42);
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
    doc.setFontSize(10.5);
    doc.setTextColor(255, 255, 255);
    doc.text(title, titleX, 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(subtitle, titleX, 18);
  };

  const drawIndFooter = (pageNum: number, total: number) => {
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`DISC Enterprise · ${company?.name || 'Cliente'} · ${collaborator.fullName}`, margin, pageHeight - 7);
    doc.text(`Página ${pageNum} de ${total}`, pageWidth - margin, pageHeight - 7, { align: 'right' });
  };

  // --- HOJA 1: FICHA TÉCNICA, NATURAL VS ADAPTADO & JOB-FIT ---
  drawIndHeader(
    'FICHA PSICOMÉTRICA INDIVIDUAL DISC · REPORTE EJECUTIVO',
    `Diagnóstico Conductual Integral · ${collaborator.fullName} · ${company?.name || 'Cliente'}`
  );

  let currentY = 28;

  // 1. Datos del Evaluado
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, currentY, contentWidth, 23, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text(collaborator.fullName, margin + 4, currentY + 6.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Puesto: ${collaborator.role || 'Colaborador'}   ·   Área: ${collaborator.department}   ·   Correo: ${collaborator.email}`, margin + 4, currentY + 12.5);
  doc.text(`Empresa: ${company?.name || 'Cliente'}   ·   Campaña: ${campaign?.accessCode || 'DISC'}   ·   Fecha Evaluación: ${nowFormatted}`, margin + 4, currentY + 18);

  currentY += 26;

  // 2. Gráfica Dual: Perfil Natural (Azul Marino) vs. Perfil Adaptado (Índigo)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Contraste Psicométrico: Estilo Natural vs. Estilo Adaptado (Índice de Desgaste):', margin, currentY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  const stressColor = natAdap.stressLevel === 'Normal' ? [5, 150, 105] : natAdap.stressLevel === 'Moderado' ? [217, 119, 6] : [190, 18, 60];
  doc.setTextColor(stressColor[0], stressColor[1], stressColor[2]);
  doc.text(`Tensión: ${natAdap.stressIndex}% (${natAdap.stressLevel})`, margin + contentWidth, currentY, { align: 'right' });

  currentY += 4.5;

  const dualBarWidth = (contentWidth - 9) / 4;
  const indFactors: { code: DISCFactor; title: string; natPct: number; adapPct: number }[] = [
    { code: 'D', title: 'Dominancia', natPct: natAdap.natural.dPercent, adapPct: natAdap.adapted.dPercent },
    { code: 'I', title: 'Influencia', natPct: natAdap.natural.iPercent, adapPct: natAdap.adapted.iPercent },
    { code: 'S', title: 'Estabilidad', natPct: natAdap.natural.sPercent, adapPct: natAdap.adapted.sPercent },
    { code: 'C', title: 'Cumplimiento', natPct: natAdap.natural.cPercent, adapPct: natAdap.adapted.cPercent }
  ];

  indFactors.forEach((f, idx) => {
    const x = margin + idx * (dualBarWidth + 3);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, currentY, dualBarWidth, 29, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`${f.code} · ${f.title}`, x + 3, currentY + 5);

    // Natural
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`Nat: ${f.natPct}%`, x + 3, currentY + 11);

    doc.setFillColor(226, 232, 240);
    doc.roundedRect(x + 18, currentY + 8.5, dualBarWidth - 21, 3, 1, 1, 'F');
    doc.setFillColor(15, 23, 42);
    doc.roundedRect(x + 18, currentY + 8.5, Math.max(1, ((dualBarWidth - 21) * f.natPct) / 100), 3, 1, 1, 'F');

    // Adaptado
    doc.setTextColor(79, 70, 229);
    doc.text(`Adap: ${f.adapPct}%`, x + 3, currentY + 18);

    doc.setFillColor(226, 232, 240);
    doc.roundedRect(x + 18, currentY + 15.5, dualBarWidth - 21, 3, 1, 1, 'F');
    doc.setFillColor(99, 102, 241);
    doc.roundedRect(x + 18, currentY + 15.5, Math.max(1, ((dualBarWidth - 21) * f.adapPct) / 100), 3, 1, 1, 'F');

    // Gap
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.2);
    doc.setTextColor(100, 116, 139);
    const gap = Math.abs(f.natPct - f.adapPct);
    doc.text(`Brecha: Δ ${gap}%`, x + 3, currentY + 25);
  });

  currentY += 33;

  // Diagnóstico de Desgaste
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, currentY, contentWidth, 20, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`Diagnóstico de Desgaste Conductual: ${natAdap.levelLabel}`, margin + 4, currentY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(51, 65, 85);
  doc.text(natAdap.executiveDiagnosis, margin + 4, currentY + 10.5, { maxWidth: contentWidth - 8 });
  doc.text(`Directriz: ${natAdap.recommendation}`, margin + 4, currentY + 16, { maxWidth: contentWidth - 8 });

  currentY += 24;

  // 3. Job-Fit Score %
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, currentY, contentWidth, 34, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(2, 132, 199);
  doc.text(`COMPATIBILIDAD CON EL PUESTO (JOB-FIT): ${jobFitRes.benchmarkTitle.toUpperCase()}`, margin + 4, currentY + 5.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  const fitColor = jobFitRes.fitLevel === 'Alto' ? [5, 150, 105] : jobFitRes.fitLevel === 'Medio' ? [217, 119, 6] : [190, 18, 60];
  doc.setTextColor(fitColor[0], fitColor[1], fitColor[2]);
  doc.text(`${jobFitRes.fitPercentage}% · Ajuste ${jobFitRes.fitLevel}`, margin + contentWidth - 4, currentY + 5.5, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(51, 65, 85);
  doc.text(jobFitRes.summary, margin + 4, currentY + 11.5, { maxWidth: contentWidth - 8 });

  let jgX = margin + 4;
  const jgColW = (contentWidth - 12) / 4;
  jobFitRes.gaps.forEach((g) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`${g.factor}: ${g.status}`, jgX, currentY + 23);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.2);
    doc.setTextColor(100, 116, 139);
    doc.text(`Real:${g.actualPercent}% / Ideal:${g.benchmarkPercent}%`, jgX, currentY + 28);
    jgX += jgColW + 2;
  });

  currentY += 38;

  // 4. Arquetipo
  if (archetype) {
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, currentY, contentWidth, 28, 2, 2, 'FD');

    doc.setFillColor(15, 23, 42);
    doc.roundedRect(margin + 3, currentY + 3.5, 13, 13, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(archetype.dominant, margin + 9.5, currentY + 12, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(`Arquetipo: ${archetype.title}`, margin + 19, currentY + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(2, 132, 199);
    doc.text(archetype.subtitle, margin + 19, currentY + 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(51, 65, 85);
    doc.text(archetype.description, margin + 4, currentY + 20, { maxWidth: contentWidth - 8 });
  }

  // --- HOJA 2: MANUAL PARA EL JEFE DIRECTO (DOs & DONTs) ---
  doc.addPage();
  drawIndHeader(
    'MANUAL DE GESTIÓN Y LIDERAZGO PARA EL JEFE DIRECTO',
    `Guía Ejecutiva de Bolsillo (DOs & DON'Ts) · ${collaborator.fullName} · ${company?.name || 'Cliente'}`
  );

  let p2Y = 30;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, p2Y, contentWidth, 18, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(`DIRECTRICES DE SUPERVISIÓN Y MOTIVACIÓN PERSONALIZADAS`, margin + 4, p2Y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Pautas directivas para maximizar el engagement, evitar errores comunes de supervisión y potenciar el desempeño de ${collaborator.fullName}.`,
    margin + 4,
    p2Y + 12
  );

  p2Y += 22;

  const p2ColW = (contentWidth - 6) / 2;
  const p2ColH = 92;

  // DOs
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(margin, p2Y, p2ColW, p2ColH, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(5, 150, 105);
  doc.text('QUÉ SÍ HACER (DOs) · MAXIMIZA SU RENDIMIENTO', margin + 4, p2Y + 7);

  let p2doY = p2Y + 14;
  leadershipGuide.dos.forEach((item) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(5, 150, 105);
    doc.text('✓', margin + 4, p2doY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(30, 41, 59);
    doc.text(item, margin + 9, p2doY, { maxWidth: p2ColW - 13 });
    p2doY += 15;
  });

  // DONTs
  const p2RightX = margin + p2ColW + 6;
  doc.setFillColor(255, 241, 242);
  doc.setDrawColor(254, 205, 211);
  doc.roundedRect(p2RightX, p2Y, p2ColW, p2ColH, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(190, 18, 60);
  doc.text("QUÉ NUNCA HACER (DON'Ts) · DESMOTIVA O PARALIZA", p2RightX + 4, p2Y + 7);

  let p2dontY = p2Y + 14;
  leadershipGuide.donts.forEach((item) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(190, 18, 60);
    doc.text('✕', p2RightX + 4, p2dontY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(30, 41, 59);
    doc.text(item, p2RightX + 9, p2dontY, { maxWidth: p2ColW - 13 });
    p2dontY += 15;
  });

  p2Y += p2ColH + 6;

  // Factores Clave
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, p2Y, contentWidth, 54, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(2, 132, 199);
  doc.text('FACTORES CLAVE DE COMUNICACIÓN Y ENTORNO ÓPTIMO', margin + 4, p2Y + 6);

  let p2SubY = p2Y + 13;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(15, 23, 42);
  doc.text('• Cómo retroalimentarle óptimamente:', margin + 4, p2SubY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(archetype?.communicationStyle || 'Directo y respetuoso.', margin + 48, p2SubY, { maxWidth: contentWidth - 52 });

  p2SubY += 11;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('• Comportamiento bajo estrés severo:', margin + 4, p2SubY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(archetype?.underPressure || 'Mantener calma y reducir presión.', margin + 48, p2SubY, { maxWidth: contentWidth - 52 });

  p2SubY += 11;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('• Entorno físico y laboral preferido:', margin + 4, p2SubY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(archetype?.idealEnvironment || 'Espacio estructurado.', margin + 48, p2SubY, { maxWidth: contentWidth - 52 });

  p2SubY += 11;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('• Palancas principales de motivación:', margin + 4, p2SubY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(leadershipGuide.motivationKeys.join(' · '), margin + 48, p2SubY, { maxWidth: contentWidth - 52 });

  // Footers
  const totalIndPages = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= totalIndPages; i++) {
    doc.setPage(i);
    drawIndFooter(i, totalIndPages);
  }

  const cleanName = collaborator.fullName.replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`Ficha_DISC_${cleanName}.pdf`);
}
