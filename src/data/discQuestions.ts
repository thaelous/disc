import { DISCQuestionBlock, DISCArchetype, DISCFactor } from '../types';

export const DISC_BLOCKS: DISCQuestionBlock[] = [
  {
    id: 1,
    options: [
      { id: '1-1', text: 'Entusiasta y vivaz', factor: 'I' },
      { id: '1-2', text: 'Rápido y decidido', factor: 'D' },
      { id: '1-3', text: 'Lógico y analítico', factor: 'C' },
      { id: '1-4', text: 'Apacible y comprensivo', factor: 'S' }
    ]
  },
  {
    id: 2,
    options: [
      { id: '2-1', text: 'Cauteloso y meticuloso', factor: 'C' },
      { id: '2-2', text: 'Decidido y firme', factor: 'D' },
      { id: '2-3', text: 'Receptivo y paciente', factor: 'S' },
      { id: '2-4', text: 'Bondadoso y animado', factor: 'I' }
    ]
  },
  {
    id: 3,
    options: [
      { id: '3-1', text: 'Amistoso y sociable', factor: 'I' },
      { id: '3-2', text: 'Preciso y detallista', factor: 'C' },
      { id: '3-3', text: 'Enérgico e insistente', factor: 'D' },
      { id: '3-4', text: 'Tranquilo y tolerante', factor: 'S' }
    ]
  },
  {
    id: 4,
    options: [
      { id: '4-1', text: 'Elocuente y persuasivo', factor: 'I' },
      { id: '4-2', text: 'Controlado y sobrio', factor: 'S' },
      { id: '4-3', text: 'Convencional y exacto', factor: 'C' },
      { id: '4-4', text: 'Audaz y competitivo', factor: 'D' }
    ]
  },
  {
    id: 5,
    options: [
      { id: '5-1', text: 'Aventurero y desafiante', factor: 'D' },
      { id: '5-2', text: 'Perspicaz y observador', factor: 'C' },
      { id: '5-3', text: 'Cordial y acogedor', factor: 'I' },
      { id: '5-4', text: 'Moderado y constante', factor: 'S' }
    ]
  },
  {
    id: 6,
    options: [
      { id: '6-1', text: 'Gentil y sereno', factor: 'S' },
      { id: '6-2', text: 'Persuasivo y motivador', factor: 'I' },
      { id: '6-3', text: 'Modesto y pulcro', factor: 'C' },
      { id: '6-4', text: 'Pionero e impaciente', factor: 'D' }
    ]
  },
  {
    id: 7,
    options: [
      { id: '7-1', text: 'Expresivo y jovial', factor: 'I' },
      { id: '7-2', text: 'Concienzudo y cuidadoso', factor: 'C' },
      { id: '7-3', text: 'Dominante y exigente', factor: 'D' },
      { id: '7-4', text: 'Complaciente y leal', factor: 'S' }
    ]
  },
  {
    id: 8,
    options: [
      { id: '8-1', text: 'Seguro de sí mismo y directo', factor: 'D' },
      { id: '8-2', text: 'Económico y reflexivo', factor: 'C' },
      { id: '8-3', text: 'Confiable y cooperativo', factor: 'S' },
      { id: '8-4', text: 'Popular y alegre', factor: 'I' }
    ]
  },
  {
    id: 9,
    options: [
      { id: '9-1', text: 'Diplomático y discreto', factor: 'C' },
      { id: '9-2', text: 'Generoso y conciliador', factor: 'S' },
      { id: '9-3', text: 'Animador y espontáneo', factor: 'I' },
      { id: '9-4', text: 'Tenaz e independiente', factor: 'D' }
    ]
  },
  {
    id: 10,
    options: [
      { id: '10-1', text: 'Valiente y arriesgado', factor: 'D' },
      { id: '10-2', text: 'Inspirador y simpático', factor: 'I' },
      { id: '10-3', text: 'Sumiso y paciente', factor: 'S' },
      { id: '10-4', text: 'Sistemático y riguroso', factor: 'C' }
    ]
  },
  {
    id: 11,
    options: [
      { id: '11-1', text: 'Reservado y disciplinado', factor: 'C' },
      { id: '11-2', text: 'Atento y colaborador', factor: 'S' },
      { id: '11-3', text: 'Voluntarioso y contundente', factor: 'D' },
      { id: '11-4', text: 'Afectuoso y conversador', factor: 'I' }
    ]
  },
  {
    id: 12,
    options: [
      { id: '12-1', text: 'Estimulante y carismático', factor: 'I' },
      { id: '12-2', text: 'Perfeccionista y crítico', factor: 'C' },
      { id: '12-3', text: 'Amable y considerado', factor: 'S' },
      { id: '12-4', text: 'Incisivo e intrépido', factor: 'D' }
    ]
  },
  {
    id: 13,
    options: [
      { id: '13-1', text: 'Competitivo e impulsivo', factor: 'D' },
      { id: '13-2', text: 'Agradable y afable', factor: 'I' },
      { id: '13-3', text: 'Prudente y metódico', factor: 'C' },
      { id: '13-4', text: 'Fiel y constante', factor: 'S' }
    ]
  },
  {
    id: 14,
    options: [
      { id: '14-1', text: 'Estructurado y formal', factor: 'C' },
      { id: '14-2', text: 'Obediente y sosegado', factor: 'S' },
      { id: '14-3', text: 'Inquieto y líder natural', factor: 'D' },
      { id: '14-4', text: 'Vivaz y festivo', factor: 'I' }
    ]
  },
  {
    id: 15,
    options: [
      { id: '15-1', text: 'Dispuesto a ayudar y apacible', factor: 'S' },
      { id: '15-2', text: 'Eficaz y directo al grano', factor: 'D' },
      { id: '15-3', text: 'Optimista y comunicativo', factor: 'I' },
      { id: '15-4', text: 'Analítico y perfeccionista', factor: 'C' }
    ]
  },
  {
    id: 16,
    options: [
      { id: '16-1', text: 'Seguro y expeditivo', factor: 'D' },
      { id: '16-2', text: 'Minucioso y ordenado', factor: 'C' },
      { id: '16-3', text: 'Elocuente y expresivo', factor: 'I' },
      { id: '16-4', text: 'Tolerante y buen escucha', factor: 'S' }
    ]
  },
  {
    id: 17,
    options: [
      { id: '17-1', text: 'Generoso y comprensivo', factor: 'S' },
      { id: '17-2', text: 'Exigente con la exactitud', factor: 'C' },
      { id: '17-3', text: 'Firme ante la oposición', factor: 'D' },
      { id: '17-4', text: 'Divertido y entusiasta', factor: 'I' }
    ]
  },
  {
    id: 18,
    options: [
      { id: '18-1', text: 'Acepta riesgos sin dudar', factor: 'D' },
      { id: '18-2', text: 'Gana amigos fácilmente', factor: 'I' },
      { id: '18-3', text: 'Mantiene la calma en tensión', factor: 'S' },
      { id: '18-4', text: 'Sigue reglas y procedimientos', factor: 'C' }
    ]
  },
  {
    id: 19,
    options: [
      { id: '19-1', text: 'Crítico y reflexivo', factor: 'C' },
      { id: '19-2', text: 'Amistoso y cálido', factor: 'I' },
      { id: '19-3', text: 'Orientado a resultados', factor: 'D' },
      { id: '19-4', text: 'Estable y paciente', factor: 'S' }
    ]
  },
  {
    id: 20,
    options: [
      { id: '20-1', text: 'Persuasivo y cautivador', factor: 'I' },
      { id: '20-2', text: 'Paciente y predecible', factor: 'S' },
      { id: '20-3', text: 'Cauteloso y exhaustivo', factor: 'C' },
      { id: '20-4', text: 'Enérgico y dominante', factor: 'D' }
    ]
  },
  {
    id: 21,
    options: [
      { id: '21-1', text: 'Orientado a la calidad', factor: 'C' },
      { id: '21-2', text: 'Leal y cooperativo', factor: 'S' },
      { id: '21-3', text: 'Espontáneo y sociable', factor: 'I' },
      { id: '21-4', text: 'Asertivo y decisivo', factor: 'D' }
    ]
  },
  {
    id: 22,
    options: [
      { id: '22-1', text: 'Emprendedor y autónomo', factor: 'D' },
      { id: '22-2', text: 'Metódico y disciplinado', factor: 'C' },
      { id: '22-3', text: 'Cálido y conciliador', factor: 'S' },
      { id: '22-4', text: 'Entusiasta y motivador', factor: 'I' }
    ]
  },
  {
    id: 23,
    options: [
      { id: '23-1', text: 'Buen compañero de equipo', factor: 'S' },
      { id: '23-2', text: 'Excelente negociador y persuasor', factor: 'I' },
      { id: '23-3', text: 'Defensor de estándares altos', factor: 'C' },
      { id: '23-4', text: 'Líder en situaciones de crisis', factor: 'D' }
    ]
  },
  {
    id: 24,
    options: [
      { id: '24-1', text: 'Preciso en los datos', factor: 'C' },
      { id: '24-2', text: 'Directo y franco', factor: 'D' },
      { id: '24-3', text: 'Confiable y servicial', factor: 'S' },
      { id: '24-4', text: 'Alegre e influyente', factor: 'I' }
    ]
  },
  {
    id: 25,
    options: [
      { id: '25-1', text: 'Extrovertido y enérgico', factor: 'I' },
      { id: '25-2', text: 'Perseverante y constante', factor: 'S' },
      { id: '25-3', text: 'Objetivo y analítico', factor: 'C' },
      { id: '25-4', text: 'Determinado y firme', factor: 'D' }
    ]
  },
  {
    id: 26,
    options: [
      { id: '26-1', text: 'Impulsor de metas inmediatas', factor: 'D' },
      { id: '26-2', text: 'Sistemático en el trabajo', factor: 'C' },
      { id: '26-3', text: 'Promotor del buen ambiente', factor: 'I' },
      { id: '26-4', text: 'Sereno frente a imprevistos', factor: 'S' }
    ]
  },
  {
    id: 27,
    options: [
      { id: '27-1', text: 'Comprensivo con los demás', factor: 'S' },
      { id: '27-2', text: 'Investigador y riguroso', factor: 'C' },
      { id: '27-3', text: 'Carismático y conversador', factor: 'I' },
      { id: '27-4', text: 'Competitivo y resuelto', factor: 'D' }
    ]
  },
  {
    id: 28,
    options: [
      { id: '28-1', text: 'Audaz para tomar el mando', factor: 'D' },
      { id: '28-2', text: 'Inspirador para las personas', factor: 'I' },
      { id: '28-3', text: 'Pacífico y leal a su equipo', factor: 'S' },
      { id: '28-4', text: 'Perfeccionista y metódico', factor: 'C' }
    ]
  }
];

export const DISC_ARCHETYPES: Record<string, DISCArchetype> = {
  'D': {
    id: 'D',
    title: 'Directivo / Conductor',
    subtitle: 'Orientado a Resultados, Firmeza y Decisión',
    dominant: 'D',
    description: 'Perfil de alta energía y firmeza ejecutiva. Busca superar obstáculos, desafiar el statu quo y obtener victorias rápidas. Se enfoca intensamente en el "QUÉ" y prioriza la eficiencia por encima de la diplomacia.',
    strengths: [
      'Toma de decisiones ágil y asertiva bajo presión',
      'Liderazgo natural enfocado en el logro de objetivos estratégicos',
      'Gran tolerancia al riesgo y resolución directa de problemas',
      'Iniciativa para asumir el mando en momentos de incertidumbre'
    ],
    communicationStyle: 'Directo, conciso, al grano. Prefiere hechos sin rodeos, viñetas claras y conclusiones ejecutivas inmediatas.',
    idealEnvironment: 'Entornos dinámicos, de alta autonomía, con desafíos constantes y libertad para gestionar su propio camino hacia el resultado.',
    growthAreas: [
      'Desarrollar paciencia activa y escucha empática hacia los demás',
      'Reconocer las contribuciones del equipo antes de demandar nuevos retos',
      'Evitar imponer criterios de manera unilateral en consensos grupales'
    ],
    underPressure: 'Puede mostrarse impaciente, tajante o excesivamente crítico si los resultados se demoran.'
  },
  'I': {
    id: 'I',
    title: 'Promotor / Persuasivo',
    subtitle: 'Orientado a Personas, Entusiasmo y Visión',
    dominant: 'I',
    description: 'Perfil comunicativo, carismático y magnético. Conecta con las personas con facilidad, genera entusiasmo colectivo y vende ideas y visiones con pasión. Su enfoque primordial es el "QUIÉN".',
    strengths: [
      'Capacidad excepcional para motivar e inspirar a grupos de trabajo',
      'Facilidad para entablar alianzas, networking y relaciones públicas',
      'Pensamiento creativo y generación espontánea de ideas',
      'Optimismo contagioso y adaptabilidad social'
    ],
    communicationStyle: 'Cálido, enérgico, verbal e interactivo. Prefiere conversaciones cara a cara o llamadas dinámicas que correos extensos.',
    idealEnvironment: 'Ambientes colaborativos, abiertos, con reconocimiento público y oportunidad de interactuar con clientes y equipos diversos.',
    growthAreas: [
      'Mantener la atención al detalle y el rigor en el seguimiento operativo',
      'Aprender a decir "no" para no saturarse de compromisos simultáneos',
      'Gestionar el tiempo con calendarios y agendas estrictas'
    ],
    underPressure: 'Tiende a volverse desorganizado o buscar validación social rápida cuando siente rechazo.'
  },
  'S': {
    id: 'S',
    title: 'Asesor / Facilitador',
    subtitle: 'Orientado a la Estabilidad, Lealtad y Cooperación',
    dominant: 'S',
    description: 'Pilar de consistencia, armonía y fiabilidad en los equipos. Es paciente, metódico y excelente escucha. Protege las relaciones interpersonales y prefiere procesos bien definidos. Su pregunta clave es el "CÓMO".',
    strengths: [
      'Gran lealtad institucional y compromiso a largo plazo',
      'Habilidad innata para mediar conflictos y mantener la paz grupal',
      'Constancia inquebrantable en tareas secuenciales y operativas',
      'Empatía profunda y respaldo incondicional a sus colaboradores'
    ],
    communicationStyle: 'Tranquilo, considerado, respetuoso. Valora que se le consulte con tiempo y se le escuche sin interrupciones.',
    idealEnvironment: 'Entornos seguros, estables, colaborativos y predecibles, con mínimo cambio brusco y liderazgo comprensivo.',
    growthAreas: [
      'Aceptar y promover cambios estructurales sin excesiva resistencia',
      'Expresar desacuerdos abiertamente en vez de guardar silencio',
      'Acelerar el ritmo cuando la situación requiera urgencia competitiva'
    ],
    underPressure: 'Puede resistirse al cambio pasivamente o dudar al momento de tomar decisiones unilaterales.'
  },
  'C': {
    id: 'C',
    title: 'Analítico / Evaluador',
    subtitle: 'Orientado a la Calidad, Métodos y Precisión',
    dominant: 'C',
    description: 'Garante del rigor técnico, la exactitud y los estándares de excelencia. Analiza minuciosamente los datos, previene errores antes de que ocurran y busca la perfección lógica. Su eje es el "POR QUÉ".',
    strengths: [
      'Precisión técnica superior y pensamiento crítico exhaustivo',
      'Cumplimiento estricto de normativas, leyes y estándares de calidad',
      'Capacidad para estructurar procesos complejos y auditorías',
      'Objetividad matemática desprovista de sesgos emocionales'
    ],
    communicationStyle: 'Formal, preciso, respaldado por datos y métricas escritas. Valora la exactitud y la preparación previa.',
    idealEnvironment: 'Espacios ordenados y profesionales donde prime la lógica, el análisis de datos y la autonomía intelectual.',
    growthAreas: [
      'Evitar la "parálisis por análisis" ante decisiones rápidas de negocio',
      'Ser más flexible con errores menores que no comprometan el fondo',
      'Compartir sus conocimientos con calidez pedagógica sin sonar distante'
    ],
    underPressure: 'Se aísla en el análisis exhaustivo y puede volverse excesivamente defensivo respecto a sus metodologías.'
  },
  // Combination Archetypes
  'DI': {
    id: 'DI',
    title: 'Conductor Persuasivo (D/I)',
    subtitle: 'Iniciador Proactivo y Líder Carismático',
    dominant: 'D',
    secondary: 'I',
    description: 'Combina el empuje audaz del Directivo con el encanto persuasivo del Promotor. Es un líder nato para nuevos proyectos, negociaciones de alto nivel y arranque de startups.',
    strengths: [
      'Capacidad para movilizar equipos con rapidez hacia metas ambiciosas',
      'Persuasión comercial agresiva pero magnética',
      'Alta resiliencia frente a negativas y contratiempos'
    ],
    communicationStyle: 'Enérgico, inspirador y contundente. Va al grano pero con carisma.',
    idealEnvironment: 'Comercial, de expansión de negocios o de transformación corporativa.',
    growthAreas: ['Delegar el seguimiento operativo y escuchar objeciones con calma.'],
    underPressure: 'Puede actuar con impulsividad y pasar por alto detalles críticos.'
  },
  'DC': {
    id: 'DC',
    title: 'Estratega Riguroso (D/C)',
    subtitle: 'Comandante Técnico y Orientado a Resultados con Calidad',
    dominant: 'D',
    secondary: 'C',
    description: 'Fusión de firmeza de mando con rigor metodológico. Exige resultados impecables y soluciones medibles.',
    strengths: [
      'Planeación estratégica combinada con ejecución implacable',
      'Detección anticipada de cuellos de botella con solución ejecutiva',
      'Altos estándares de rendimiento personal y de equipo'
    ],
    communicationStyle: 'Lógico, frío, estructurado y orientado al cumplimiento de metas cuantificables.',
    idealEnvironment: 'Dirección operativa, consultoría estratégica o auditoría de proyectos críticos.',
    growthAreas: ['Desarrollar empatía hacia el factor humano y celebrar pequeñas victorias.'],
    underPressure: 'Tiende a ser severo e inflexible ante el error ajeno.'
  },
  'IS': {
    id: 'IS',
    title: 'Consejero Armónico (I/S)',
    subtitle: 'Facilitador de Cultura y Relaciones Humanas',
    dominant: 'I',
    secondary: 'S',
    description: 'Calidez humana en su máxima expresión. Fomenta el bienestar, la confianza y la cohesión en el equipo.',
    strengths: [
      'Construcción de equipos leales, motivados y cohesionados',
      'Excelente escucha activa y vocación genuina de servicio',
      'Capacidad para suavizar tensiones y generar empatía colectiva'
    ],
    communicationStyle: 'Amigable, empático, integrador y respetuoso.',
    idealEnvironment: 'Recursos Humanos, desarrollo organizacional, atención a clientes clave.',
    growthAreas: ['Afrontar confrontaciones difíciles sin postergarlas por evitar el conflicto.'],
    underPressure: 'Puede absorber el estrés de los demás o posponer decisiones duras.'
  },
  'SC': {
    id: 'SC',
    title: 'Especialista Técnico (S/C)',
    subtitle: 'Metódico, Confiable y Garante de Procesos',
    dominant: 'S',
    secondary: 'C',
    description: 'La columna vertebral operativa. Garantiza que los sistemas funcionen sin sobresaltos con estabilidad y precisión continua.',
    strengths: [
      'Consistencia y precisión inquebrantable a través del tiempo',
      'Documentación impecable y cumplimiento de procedimientos',
      'Cero improvisaciones erráticas en operaciones críticas'
    ],
    communicationStyle: 'Calmado, claro, detallado y reflexivo por escrito.',
    idealEnvironment: 'Ingeniería, finanzas, control de calidad, operaciones sistemáticas.',
    growthAreas: ['Aceptar innovaciones rápidas y adaptarse a cambios imprevistos.'],
    underPressure: 'Puede cerrarse ante exigencias de velocidad desmedida.'
  }
};
