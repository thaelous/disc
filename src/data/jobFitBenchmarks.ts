import { JobBenchmark, JobFitResult, DISCScores, DISCFactor, JobFitGap } from '../types';

export const JOB_BENCHMARKS: JobBenchmark[] = [
  {
    id: 'comercial',
    title: 'Dirección Comercial y Ventas',
    department: 'Ventas y Comercial',
    targetD: 75,
    targetI: 85,
    targetS: 40,
    targetC: 45,
    description: 'Enfoque en prospección activa, persuasión de clientes, cierre de acuerdos estratégicos y resiliencia ante el rechazo comercial.',
    keyCompetencies: ['Negociación agresiva', 'Persuasión e impacto', 'Proactividad', 'Orientación al logro']
  },
  {
    id: 'operaciones',
    title: 'Operaciones y Logística',
    department: 'Operaciones',
    targetD: 65,
    targetI: 45,
    targetS: 80,
    targetC: 75,
    description: 'Garantía del flujo de suministro, cumplimiento de tiempos de entrega, resolución metódica de contingencias y control de procesos.',
    keyCompetencies: ['Ejecución consistente', 'Control de procesos', 'Resistencia a la fatiga', 'Resolución práctica']
  },
  {
    id: 'finanzas',
    title: 'Finanzas, Contraloría y Auditoría',
    department: 'Finanzas',
    targetD: 45,
    targetI: 35,
    targetS: 65,
    targetC: 90,
    description: 'Rigor analítico exhaustivo, apego estricto a normativas contables y fiscales, precisión numérica y mitigación de riesgos de capital.',
    keyCompetencies: ['Pensamiento analítico', 'Apego a estándares', 'Minuciosidad técnica', 'Control de riesgos']
  },
  {
    id: 'servicio_cliente',
    title: 'Servicio al Cliente y Soporte',
    department: 'Atención a Clientes',
    targetD: 35,
    targetI: 75,
    targetS: 85,
    targetC: 55,
    description: 'Empatía y escucha activa para desactivar quejas, paciencia sostenida, calidez en el trato y apego a protocolos de atención.',
    keyCompetencies: ['Escucha activa y paciencia', 'Empatía interpersonal', 'Resolución conciliadora', 'Autocontrol']
  },
  {
    id: 'gestion_proyectos',
    title: 'Gestión de Proyectos / PMO',
    department: 'Operaciones y PMO',
    targetD: 70,
    targetI: 60,
    targetS: 55,
    targetC: 80,
    description: 'Coordinación metodológica de hitos, exigencia de entregables a equipos multidisciplinarios, gestión de riesgos y métricas.',
    keyCompetencies: ['Planeación estructurada', 'Exigencia de compromisos', 'Comunicación asertiva', 'Gestión de riesgos']
  },
  {
    id: 'liderazgo_ejecutivo',
    title: 'Liderazgo Ejecutivo / Dirección General',
    department: 'Dirección General',
    targetD: 85,
    targetI: 75,
    targetS: 45,
    targetC: 65,
    description: 'Toma de decisiones de alto impacto bajo incertidumbre, visión estratégica, alineación de comités directivos y rendición de cuentas.',
    keyCompetencies: ['Visión estratégica', 'Toma de decisiones crítica', 'Liderazgo inspirador', 'Responsabilidad total']
  },
  {
    id: 'recursos_humanos',
    title: 'Recursos Humanos y Desarrollo Organizacional',
    department: 'Recursos Humanos',
    targetD: 45,
    targetI: 80,
    targetS: 80,
    targetC: 55,
    description: 'Fomento del clima organizacional, mediación de conflictos laborales, atracción y desarrollo del talento y gestión del cambio cultural.',
    keyCompetencies: ['Sensibilidad interpersonal', 'Mediación de conflictos', 'Comunicación empática', 'Cultura laboral']
  },
  {
    id: 'tecnologia',
    title: 'Tecnología y Desarrollo de Software (TI)',
    department: 'TI & Desarrollo',
    targetD: 50,
    targetI: 40,
    targetS: 65,
    targetC: 88,
    description: 'Pensamiento lógico estructurado, resolución metódica de problemas complejos, arquitectura de sistemas y disciplina en código.',
    keyCompetencies: ['Pensamiento lógico y abstracto', 'Atención al detalle', 'Aprendizaje autodidacta', 'Resolución metódica']
  },
  {
    id: 'marketing_creativo',
    title: 'Marketing, Contenido y Creatividad',
    department: 'Marketing',
    targetD: 55,
    targetI: 85,
    targetS: 50,
    targetC: 50,
    description: 'Generación de conceptos innovadores, conexión emocional con audiencias, agilidad creativa y comunicación multicanal.',
    keyCompetencies: ['Innovación y creatividad', 'Pensamiento divergente', 'Storytelling persuasivo', 'Adaptabilidad veloz']
  },
  {
    id: 'administracion',
    title: 'Administración y Gestión Documental',
    department: 'Administración',
    targetD: 45,
    targetI: 50,
    targetS: 75,
    targetC: 75,
    description: 'Organización documental confiable, seguimiento puntual de trámites y soporte operativo continuo a las gerencias.',
    keyCompetencies: ['Organización sistemática', 'Confiabilidad operativa', 'Seguimiento de trámites', 'Soporte metódico']
  }
];

export function detectBenchmarkFromRole(role: string, department: string = ''): string {
  const text = `${role} ${department}`.toLowerCase();
  
  if (text.includes('comer') || text.includes('vent') || text.includes('sales') || text.includes('comerci') || text.includes('ejecutivo de cuent') || text.includes('kam')) {
    return 'comercial';
  }
  if (text.includes('financ') || text.includes('conta') || text.includes('audit') || text.includes('fiscal') || text.includes('tesor')) {
    return 'finanzas';
  }
  if (text.includes('ti') || text.includes('sistem') || text.includes('desarroll') || text.includes('software') || text.includes('program') || text.includes('tech') || text.includes('ingeni')) {
    return 'tecnologia';
  }
  if (text.includes('servici') || text.includes('atenc') || text.includes('soporte') || text.includes('help') || text.includes('call') || text.includes('cliente')) {
    return 'servicio_cliente';
  }
  if (text.includes('recurs') || text.includes('rh') || text.includes('talento') || text.includes('human') || text.includes('people') || text.includes('cultura')) {
    return 'recursos_humanos';
  }
  if (text.includes('proyect') || text.includes('pmo') || text.includes('project') || text.includes('scrum') || text.includes('ágil')) {
    return 'gestion_proyectos';
  }
  if (text.includes('direct') || text.includes('gerent general') || text.includes('ceo') || text.includes('director') || text.includes('ejecutiv')) {
    return 'liderazgo_ejecutivo';
  }
  if (text.includes('operac') || text.includes('logíst') || text.includes('supply') || text.includes('almac') || text.includes('embarqu')) {
    return 'operaciones';
  }
  if (text.includes('market') || text.includes('mercad') || text.includes('creativ') || text.includes('diseñ') || text.includes('public')) {
    return 'marketing_creativo';
  }
  return 'administracion';
}

export function getBenchmarkById(benchmarkId: string): JobBenchmark {
  const found = JOB_BENCHMARKS.find(b => b.id === benchmarkId);
  return found || JOB_BENCHMARKS[0];
}

export function calculateJobFit(scores: DISCScores, benchmarkIdOrRole: string, department: string = ''): JobFitResult {
  let benchmark = JOB_BENCHMARKS.find(b => b.id === benchmarkIdOrRole);
  if (!benchmark) {
    const detectedId = detectBenchmarkFromRole(benchmarkIdOrRole, department);
    benchmark = getBenchmarkById(detectedId);
  }

  // Calculate Euclidean Distance across normalized 0-100% scores
  const diffD = scores.dPercent - benchmark.targetD;
  const diffI = scores.iPercent - benchmark.targetI;
  const diffS = scores.sPercent - benchmark.targetS;
  const diffC = scores.cPercent - benchmark.targetC;

  const squaredDistance = diffD * diffD + diffI * diffI + diffS * diffS + diffC * diffC;
  const distance = Math.sqrt(squaredDistance); // Max theoretical is ~200

  // Convert distance to 0 - 100% Match
  // Distance of 0 = 100%, Distance of 50 = 75%, Distance of 100 = 50%
  let fitPercentage = Math.round(100 - (distance / 1.7));
  fitPercentage = Math.max(25, Math.min(99, fitPercentage));

  let fitLevel: 'Alto' | 'Medio' | 'Requiere Acompañamiento' = 'Alto';
  if (fitPercentage < 65) {
    fitLevel = 'Requiere Acompañamiento';
  } else if (fitPercentage < 80) {
    fitLevel = 'Medio';
  }

  const factorNames: Record<DISCFactor, string> = {
    D: 'Dominancia (Empuje)',
    I: 'Influencia (Conexión)',
    S: 'Estabilidad (Constancia)',
    C: 'Cumplimiento (Rigor)'
  };

  const gaps: JobFitGap[] = [
    {
      factor: 'D',
      actualPercent: scores.dPercent,
      benchmarkPercent: benchmark.targetD,
      difference: diffD,
      status: Math.abs(diffD) <= 15 ? 'Alineado' : diffD > 15 ? 'Superior' : 'Por Desarrollar',
      comment: diffD > 15
        ? `Supera el requerimiento (+${diffD}%): Aporta mayor determinación y rapidez decisional de la esperada.`
        : diffD < -15
        ? `Bajo el perfil ideal (${diffD}%): Podría dudar al asumir riesgos o confrontar situaciones difíciles.`
        : 'Plenamente equilibrado con la exigencia de empuje del puesto.'
    },
    {
      factor: 'I',
      actualPercent: scores.iPercent,
      benchmarkPercent: benchmark.targetI,
      difference: diffI,
      status: Math.abs(diffI) <= 15 ? 'Alineado' : diffI > 15 ? 'Superior' : 'Por Desarrollar',
      comment: diffI > 15
        ? `Supera el requerimiento (+${diffI}%): Muy carismático e influyente; dinamiza las relaciones con clientes o pares.`
        : diffI < -15
        ? `Bajo el perfil ideal (${diffI}%): Prefiere la comunicación técnica y puntual; menor inclinación a la persuasión informal.`
        : 'Alineado óptimamente con la demanda de comunicación del rol.'
    },
    {
      factor: 'S',
      actualPercent: scores.sPercent,
      benchmarkPercent: benchmark.targetS,
      difference: diffS,
      status: Math.abs(diffS) <= 15 ? 'Alineado' : diffS > 15 ? 'Superior' : 'Por Desarrollar',
      comment: diffS > 15
        ? `Supera el requerimiento (+${diffS}%): Gran consistencia y lealtad; requiere acompañamiento ante cambios abruptos.`
        : diffS < -15
        ? `Bajo el perfil ideal (${diffS}%): Ritmo acelerado e impaciente ante tareas repetitivas o rutinas continuas.`
        : 'Estabilidad y paciencia ajustadas al ritmo estándar requerido.'
    },
    {
      factor: 'C',
      actualPercent: scores.cPercent,
      benchmarkPercent: benchmark.targetC,
      difference: diffC,
      status: Math.abs(diffC) <= 15 ? 'Alineado' : diffC > 15 ? 'Superior' : 'Por Desarrollar',
      comment: diffC > 15
        ? `Supera el requerimiento (+${diffC}%): Excepcional minuciosidad y rigor analítico; vigilar que no caiga en perfeccionismo extremo.`
        : diffC < -15
        ? `Bajo el perfil ideal (${diffC}%): Menor apego a reglas o detalles finos; se sugiere supervisión en calidad y procesos.`
        : 'Rigor y apego normativo calibrados con precisión para la posición.'
    }
  ];

  let summary = '';
  if (fitLevel === 'Alto') {
    summary = `El colaborador presenta un ajuste excelente (${fitPercentage}%) con respecto al perfil estándar de ${benchmark.title}. Sus conductas naturales coinciden estrechamente con las demandas operativas y estratégicas del puesto.`;
  } else if (fitLevel === 'Medio') {
    summary = `Ajuste funcional moderado (${fitPercentage}%) frente a ${benchmark.title}. Existen fortalezas aprovechables, complementadas por ciertas brechas que pueden ser niveladas mediante mentoría focalizada y acuerdos claros de desempeño.`;
  } else {
    summary = `El colaborador se ubica en ${fitPercentage}% respecto al perfil benchmark de ${benchmark.title}. Manifiesta un estilo conductual con marcadas divergencias que pueden generar sobreesfuerzo o fricción en el rol si no se le brinda acompañamiento estratégico.`;
  }

  const recommendations: string[] = [];
  gaps.forEach(g => {
    if (g.status === 'Por Desarrollar') {
      recommendations.push(`Reforzar dimensión ${g.factor} (${factorNames[g.factor]}): Desarrollar competencias clave mediante asignaciones estructuradas.`);
    } else if (g.status === 'Superior') {
      recommendations.push(`Aprovechar exceso de dimensión ${g.factor}: Canalizar esta inclinación hacia proyectos de mayor impacto o liderazgo complementario.`);
    }
  });
  if (recommendations.length === 0) {
    recommendations.push('Mantener el plan de asignaciones actual y potenciar su autonomía técnica en el rol.');
  }

  return {
    benchmarkId: benchmark.id,
    benchmarkTitle: benchmark.title,
    fitPercentage,
    fitLevel,
    gaps,
    summary,
    recommendations
  };
}
