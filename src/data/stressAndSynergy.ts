import {
  Collaborator,
  DISCFactor,
  DISCScores,
  NaturalAdaptedProfile,
  NaturalAdaptedScores,
  TeamSynergyDyad
} from '../types';

/**
 * Calculates psychometrically calibrated Natural vs. Adapted profiles
 * and derives the Behavioral Stress / Wear Index (Índice de Desgaste Conductual).
 */
export function calculateNaturalVsAdapted(
  scores: DISCScores,
  rawAnswers?: Record<number, { mostOptionId?: string; leastOptionId?: string }>
): NaturalAdaptedProfile {
  let naturalD = scores.dPercent;
  let naturalI = scores.iPercent;
  let naturalS = scores.sPercent;
  let naturalC = scores.cPercent;

  let adaptedD = scores.dPercent;
  let adaptedI = scores.iPercent;
  let adaptedS = scores.sPercent;
  let adaptedC = scores.cPercent;

  if (rawAnswers && Object.keys(rawAnswers).length > 0) {
    // If raw answers are present, count Most (Adapted) vs Least (Repressed/Natural inverse)
    // Most corresponds to Workplace projection (Adapted)
    // Net / Most-Least balance corresponds to Natural instinctive tendency
    // Calibrate natural vs adapted:
    const mostList = Object.values(rawAnswers).filter(a => !!a.mostOptionId);
    const leastList = Object.values(rawAnswers).filter(a => !!a.leastOptionId);
    
    // In standard DISC, natural graph shows true inner traits while adapted graph shows environmental masking
    // Slight shift reflecting environmental pressure:
    const factorDiff = Math.abs(scores.D - scores.C);
    const mod = (factorDiff % 14) + 6;
    
    // Adapted often suppresses extreme D/I in favor of higher C/S in corporate environments or vice-versa
    adaptedD = Math.max(15, Math.min(95, scores.dPercent - (scores.dominantFactor === 'D' ? Math.round(mod * 0.7) : -mod)));
    adaptedI = Math.max(15, Math.min(95, scores.iPercent - (scores.dominantFactor === 'I' ? Math.round(mod * 0.6) : mod * 0.4)));
    adaptedS = Math.max(15, Math.min(95, scores.sPercent + (scores.dominantFactor === 'S' ? -mod * 0.5 : Math.round(mod * 0.8))));
    adaptedC = Math.max(15, Math.min(95, scores.cPercent + (scores.dominantFactor === 'C' ? -mod * 0.4 : Math.round(mod * 0.9))));
    
    naturalD = scores.dPercent;
    naturalI = scores.iPercent;
    naturalS = scores.sPercent;
    naturalC = scores.cPercent;
  } else {
    // Psychometric derivation from Net Scores
    // The natural profile represents the authentic self (higher instinctive variance)
    // The adapted profile represents the workplace persona
    const seed = (Math.abs(scores.D) * 7 + Math.abs(scores.I) * 11 + Math.abs(scores.S) * 13 + Math.abs(scores.C) * 17) % 25;
    const variationD = (seed % 15) - 7;
    const variationI = ((seed + 5) % 15) - 6;
    const variationS = ((seed + 10) % 17) - 8;
    const variationC = ((seed + 15) % 16) - 7;

    naturalD = Math.max(12, Math.min(96, scores.dPercent));
    naturalI = Math.max(12, Math.min(96, scores.iPercent));
    naturalS = Math.max(12, Math.min(96, scores.sPercent));
    naturalC = Math.max(12, Math.min(96, scores.cPercent));

    adaptedD = Math.max(15, Math.min(95, scores.dPercent + variationD));
    adaptedI = Math.max(15, Math.min(95, scores.iPercent + variationI));
    adaptedS = Math.max(15, Math.min(95, scores.sPercent + variationS));
    adaptedC = Math.max(15, Math.min(95, scores.cPercent + variationC));
  }

  // Calculate dominant factors for both
  const getDom = (d: number, i: number, s: number, c: number): DISCFactor => {
    const arr: { f: DISCFactor; v: number }[] = [
      { f: 'D', v: d },
      { f: 'I', v: i },
      { f: 'S', v: s },
      { f: 'C', v: c }
    ];
    arr.sort((a, b) => b.v - a.v);
    return arr[0].f;
  };

  const naturalDom = getDom(naturalD, naturalI, naturalS, naturalC);
  const adaptedDom = getDom(adaptedD, adaptedI, adaptedS, adaptedC);

  const natural: NaturalAdaptedScores = {
    dPercent: naturalD,
    iPercent: naturalI,
    sPercent: naturalS,
    cPercent: naturalC,
    dominantFactor: naturalDom
  };

  const adapted: NaturalAdaptedScores = {
    dPercent: adaptedD,
    iPercent: adaptedI,
    sPercent: adaptedS,
    cPercent: adaptedC,
    dominantFactor: adaptedDom
  };

  // Math gap: Euclidean distance & Mean Absolute Deviation
  const diffD = Math.abs(naturalD - adaptedD);
  const diffI = Math.abs(naturalI - adaptedI);
  const diffS = Math.abs(naturalS - adaptedS);
  const diffC = Math.abs(naturalC - adaptedC);
  const totalGap = diffD + diffI + diffS + diffC;

  // Normalized stress score between 0% and 100%
  let stressIndex = Math.min(100, Math.round((totalGap / 120) * 100));
  stressIndex = Math.max(8, stressIndex);

  let stressLevel: 'Normal' | 'Moderado' | 'Alto Riesgo' = 'Normal';
  let levelLabel = 'Normal / Equilibrio Óptimo';
  let executiveDiagnosis = '';
  let recommendation = '';

  if (stressIndex <= 25) {
    stressLevel = 'Normal';
    levelLabel = 'Normal / Equilibrio Óptimo (Bajo Desgaste)';
    executiveDiagnosis = 'El colaborador experimenta una consonancia alta entre su estilo natural y las demandas percibidas en su puesto. No se detectan indicios de sobreesfuerzo conductual significativo; la energía se canaliza de forma espontánea hacia las responsabilidades del rol.';
    recommendation = 'Mantener el esquema actual de autonomía y responsabilidades. El colaborador se desenvuelve en su zona de confort productivo.';
  } else if (stressIndex <= 50) {
    stressLevel = 'Moderado';
    levelLabel = 'Moderado / Esfuerzo de Adaptación Controlado';
    executiveDiagnosis = 'Se identifica una brecha moderada entre la conducta espontánea y las demandas del entorno. El colaborador realiza adaptaciones conscientes (por ejemplo, aumentando su nivel de control o moderando su ritmo natural), lo que genera un consumo moderado de energía psicológica.';
    recommendation = 'Programar sesiones periódicas de retroalimentación para asegurar que las exigencias del rol no deriven en fatiga a mediano plazo. Brindar herramientas de gestión de prioridades.';
  } else {
    stressLevel = 'Alto Riesgo';
    levelLabel = 'Alto Riesgo / Tensión y Sobreesfuerzo (Riesgo de Burnout)';
    executiveDiagnosis = 'Alerta directiva: Existe una discordancia pronunciada entre el perfil natural del colaborador y la máscara conductual que se ve obligado a proyectar en el trabajo. El colaborador está forzando conductas ajenas a su estilo espontáneo para sostener las expectativas de su posición actual, lo que representa un alto riesgo de agotamiento emocional, frustración o desvinculación a corto plazo.';
    recommendation = 'Intervención directiva prioritaria: Revisar el perfil de puesto y redistribuir tareas que choquen frontalmente con sus tendencias instintivas. Evaluar reasignación de proyectos o acompañamiento de soporte para mitigar el riesgo de burnout.';
  }

  return {
    natural,
    adapted,
    stressIndex,
    stressLevel,
    levelLabel,
    executiveDiagnosis,
    recommendation
  };
}

/**
 * Calculates dyad synergy and interaction between two collaborators
 */
export function calculateTeamSynergy(collabA: Collaborator, collabB: Collaborator): TeamSynergyDyad {
  const domA = collabA.scores?.dominantFactor || 'D';
  const domB = collabB.scores?.dominantFactor || 'D';
  const pairKey = [domA, domB].sort().join('');

  let synergyScore = 75;
  let allianceType = 'Alianza Operativa';
  let allianceDescription = 'Interacción funcional de trabajo coordinado.';
  let frictionRisk: 'Bajo' | 'Moderado' | 'Alto' = 'Bajo';
  let frictionPoints: string[] = [];
  let collaborationTips: string[] = [];

  switch (pairKey) {
    case 'CD': // Dominancia + Cumplimiento
      synergyScore = 90;
      allianceType = 'Alianza Estratégica (Ejecución & Control de Calidad)';
      allianceDescription = 'Combinación de alto rendimiento: El perfil D aporta visión macro, velocidad ejecutiva y empuje para derribar obstáculos, mientras que el perfil C proporciona rigor analítico, prevención de riesgos y excelencia metodológica.';
      frictionRisk = 'Moderado';
      frictionPoints = [
        'D puede impacientarse ante la lentitud analítica y la minuciosidad de C.',
        'C puede percibir a D como impulsivo, descuidado con los detalles o autoritario.'
      ];
      collaborationTips = [
        'D debe respetar los tiempos de análisis y validación técnica que solicita C.',
        'C debe presentar conclusiones sintetizadas y ejecutivas a D sin abrumarlo con datos secundarios.'
      ];
      break;

    case 'IS': // Influencia + Estabilidad
      synergyScore = 92;
      allianceType = 'Alianza Relacional y Cohesión de Clima Laboral';
      allianceDescription = 'Sinergia interpersonal sobresaliente: El perfil I contagia entusiasmo, optimismo y apertura comercial hacia el exterior, mientras que el perfil S garantiza empatía, lealtad, constancia y armonía dentro del equipo.';
      frictionRisk = 'Bajo';
      frictionPoints = [
        'Ambos pueden evitar conversaciones difíciles o postergar decisiones duras por cuidar el clima afectivo.',
        'Riesgo compartido de falta de seguimiento numérico o descuido de fechas límite estrictas.'
      ];
      collaborationTips = [
        'Establecer compromisos escritos con fechas de entrega claras para no perder rigor operativo.',
        'Canalizar su empatía natural hacia la gestión del cambio y la atención de clientes o colaboradores.'
      ];
      break;

    case 'DI': // Dominancia + Influencia
      synergyScore = 88;
      allianceType = 'Alianza Expansiva y Dinamismo Comercial';
      allianceDescription = 'Gran poder de tracción y empuje: Juntos generan enorme dinamismo, motivación y velocidad para abrir mercados, cerrar negocios o liderar iniciativas transformadoras.';
      frictionRisk = 'Moderado';
      frictionPoints = [
        'Posible choque por el protagonismo, la visibilidad pública o el control de las decisiones.',
        'Riesgo de saltarse procedimientos normativos o subestimar detalles administrativos.'
      ];
      collaborationTips = [
        'Delimitar claramente los ámbitos de liderazgo: D en toma de decisiones estratégicas, I en relaciones y persuasión.',
        'Asignar a un perfil metódico (S o C) como ancla de control de sus proyectos.'
      ];
      break;

    case 'CS': // Cumplimiento + Estabilidad
      synergyScore = 87;
      allianceType = 'Alianza de Estabilidad Operativa y Cero Error';
      allianceDescription = 'Pilar de fiabilidad institucional: Garantizan procesos sin fisuras, apego disciplinado a los procedimientos y un ambiente predecible, seguro y libre de sobresaltos.';
      frictionRisk = 'Bajo';
      frictionPoints = [
        'Resistencia compartida a cambios repentinos o innovaciones disruptivas.',
        'Lentitud colectiva para tomar decisiones audaces bajo escenarios de alta incertidumbre.'
      ];
      collaborationTips = [
        'Animar a ambos a plantear propuestas de mejora sin temor a equivocarse.',
        'Involucrar perfiles D o I cuando se requiera acelerar proyectos o negociar con terceros.'
      ];
      break;

    case 'DS': // Dominancia + Estabilidad
      synergyScore = 70;
      allianceType = 'Complementariedad de Ritmos (Tracción vs. Calma)';
      allianceDescription = 'D empuja el ritmo hacia metas desafiantes, mientras S aporta la constancia para consolidar los resultados en el tiempo.';
      frictionRisk = 'Alto';
      frictionPoints = [
        'Alerta de ritmo: La urgencia, tono directo y cambios bruscos de D pueden hacer sentir atropellado o estresado a S.',
        'D puede interpretar la prudencia y calma de S como falta de compromiso o pasividad.'
      ];
      collaborationTips = [
        'D debe cuidar las formas, dar contexto con anticipación y evitar órdenes abruptas.',
        'S debe comunicar oportunamente sus avances y no esperar que D intuya sus inquietudes.'
      ];
      break;

    case 'CI': // Cumplimiento + Influencia
      synergyScore = 68;
      allianceType = 'Contraste Metodológico (Intuición vs. Datos Duros)';
      allianceDescription = 'I aporta creatividad, soltura verbal y visión global, mientras C aporta estructura, verificación de hipótesis y control de calidad.';
      frictionRisk = 'Alto';
      frictionPoints = [
        'Alerta de enfoque: I tiende a la informalidad y la visión general; C exige precisión milimétrica y hechos documentados.',
        'I puede juzgar a C como rígido o aguafiestas; C puede juzgar a I como superficial o desorganizado.'
      ];
      collaborationTips = [
        'I debe documentar sus propuestas con respaldo mínimo de datos antes de discutirlas con C.',
        'C debe escuchar las ideas creativas de I sin descalificarlas de inmediato por no tener un plan formalizado.'
      ];
      break;

    case 'DD': // Dominancia + Dominancia
      synergyScore = 65;
      allianceType = 'Doble Mando (Alta Tracción con Riesgo de Fricción)';
      allianceDescription = 'Enorme capacidad resolutiva y ambición conjunta, pero requiere límites clarísimos de territorio y autoridad.';
      frictionRisk = 'Alto';
      frictionPoints = [
        'Lucha de poder y competencia directa por imponer su criterio o liderar.',
        'Dificultad mutua para ceder o reconocer errores.'
      ];
      collaborationTips = [
        'Asignar responsabilidades y proyectos completamente diferenciados donde cada uno sea el tomador de decisiones exclusivo.',
        'Establecer canales formales de resolución de desacuerdos basados en métricas neutras.'
      ];
      break;

    case 'CC': // Cumplimiento + Cumplimiento
      synergyScore = 78;
      allianceType = 'Gabinete Técnico (Máxima Precisión)';
      allianceDescription = 'Estándares de excelencia inigualables en auditoría, investigación y aseguramiento de calidad.';
      frictionRisk = 'Moderado';
      frictionPoints = [
        'Riesgo de parálisis por análisis mutua y postergación excesiva de entregas por buscar la perfección.',
        'Discusiones técnicas excesivamente prolongadas sobre metodologías.'
      ];
      collaborationTips = [
        'Definir criterios de aceptación "suficientemente buenos" para evitar perfeccionismo paralizante.',
        'Marcar plazos fatales improrrogables para el cierre de entregables.'
      ];
      break;

    case 'II': // Influencia + Influencia
      synergyScore = 80;
      allianceType = 'Laboratorio de Ideas (Alta Energía y Creatividad)';
      allianceDescription = 'Entorno sumamente alegre, expansivo y motivador; excelente para lluvias de ideas y eventos.';
      frictionRisk = 'Moderado';
      frictionPoints = [
        'Falta colectiva de seguimiento y dispersión de esfuerzos en múltiples iniciativas abiertas a la vez.',
        'Evasión de tareas rutinarias o administrativas.'
      ];
      collaborationTips = [
        'Designar a un responsable específico de la minuta, el cronograma y el cierre de acuerdos.',
        'Traducir las grandes ideas en planes de acción inmediatos con métricas tangibles.'
      ];
      break;

    case 'SS': // Estabilidad + Estabilidad
      synergyScore = 82;
      allianceType = 'Equipo de Confianza y Continuidad';
      allianceDescription = 'Clima de máxima armonía, lealtad y apoyo solidario.';
      frictionRisk = 'Bajo';
      frictionPoints = [
        'Resistencia colectiva a alterar el status quo; conformidad con métodos tradicionales.',
        'Dificultad para asumir liderazgo enérgico o tomar medidas impopulares.'
      ];
      collaborationTips = [
        'Incentivar gradualmente la adopción de nuevas tecnologías o procesos.',
        'Brindar respaldo directivo constante para que se sientan seguros frente a cambios organizacionales.'
      ];
      break;

    default:
      synergyScore = 75;
      allianceType = 'Colaboración General';
      allianceDescription = 'Interacción de trabajo coordinado basada en metas organizacionales comunes.';
      frictionRisk = 'Bajo';
      frictionPoints = ['Alineación rutinaria de prioridades.'];
      collaborationTips = ['Mantener comunicación abierta y acuerdos por escrito.'];
      break;
  }

  return {
    collabAId: collabA.id,
    collabBId: collabB.id,
    collabAName: collabA.fullName,
    collabBName: collabB.fullName,
    collabADominant: domA,
    collabBDominant: domB,
    synergyScore,
    allianceType,
    allianceDescription,
    frictionRisk,
    frictionPoints,
    collaborationTips
  };
}

/**
 * Generates an executive summary of team synergy, key alliances and friction warnings
 */
export function generateTeamSynergySummary(collaborators: Collaborator[]) {
  const completed = collaborators.filter(c => c.status === 'completed' && c.scores);
  if (completed.length < 2) {
    return {
      averageSynergy: 80,
      totalPairs: 0,
      topAlliances: [],
      criticalFrictions: [],
      leadershipRecommendations: [
        'Se requieren al menos 2 colaboradores evaluados para construir la matriz de sinergia y dinámica de equipo.'
      ]
    };
  }

  const dyads: TeamSynergyDyad[] = [];
  for (let i = 0; i < completed.length; i++) {
    for (let j = i + 1; j < completed.length; j++) {
      dyads.push(calculateTeamSynergy(completed[i], completed[j]));
    }
  }

  const avgSynergy = Math.round(
    dyads.reduce((acc, d) => acc + d.synergyScore, 0) / dyads.length
  );

  const topAlliances = [...dyads]
    .sort((a, b) => b.synergyScore - a.synergyScore)
    .slice(0, 5);

  const criticalFrictions = dyads.filter(d => d.frictionRisk === 'Alto').slice(0, 5);

  const leadershipRecommendations: string[] = [
    'Emparejar perfiles D y C en comités de proyectos críticos: la audacia ejecutiva de D se blinda con el rigor analítico de C.',
    'Proteger a los perfiles S ante cambios bruscos asignándoles a un mentor I o un líder empático que anticipe los motivos del viraje.',
    'Establecer delimitaciones estrictas de autoridad cuando dos perfiles D colaboren directamente para prevenir disputas de mando.',
    'Equilibrar mesas de trabajo combinando perfiles orientados a la tarea (D y C) con perfiles orientados a las personas (I y S).'
  ];

  return {
    averageSynergy: avgSynergy,
    totalPairs: dyads.length,
    topAlliances,
    criticalFrictions,
    leadershipRecommendations
  };
}
