import { DISCFactor, LeadershipGuide } from '../types';

export function getLeadershipGuide(dominantFactor: DISCFactor, secondaryFactor?: DISCFactor): LeadershipGuide {
  switch (dominantFactor) {
    case 'D':
      return {
        dos: [
          'Sé directo, conciso y ve al grano: presenta primero los resultados y las conclusiones ejecutivas.',
          'Dále autonomía y libertad de maniobra sobre cómo alcanzar las metas sin microgestionar sus pasos.',
          'Asígnale retos desafiantes y proyectos de alta visibilidad que pongan a prueba su capacidad de liderazgo.',
          'Reconoce públicamente sus victorias tangibles, su velocidad de respuesta y el cumplimiento de objetivos.',
          'Plantea los desacuerdos con firmeza basada en hechos objetivos y lógica de negocio, sin rodeos emocionales.'
        ],
        donts: [
          'No caigas en la microgestión ni exijas reportes excesivos de cada detalle operativo.',
          'No le impongas órdenes arbitrarias sin explicar el objetivo estratégico que persiguen.',
          'No lo hagas esperar en reuniones interminables sin agenda clara o sin toma de decisiones concreta.',
          'No cuestiones su autoridad o juicio delante de sus subordinados o de otros pares.',
          'No le cierres el paso a la innovación ni restrinjas su iniciativa con trabas burocráticas innecesarias.'
        ],
        communicationTips: [
          'Habla con seguridad, lenguaje asertivo y enfocado en el "qué" y el "cuándo".',
          'Evita justificaciones extensas; enfócate en opciones y cursos de acción inmediatos.'
        ],
        motivationKeys: [
          'Sensación de control y autoridad sobre sus proyectos.',
          'Oportunidades de ascenso, bonos por metas superadas y reconocimiento a su impacto.'
        ]
      };

    case 'I':
      return {
        dos: [
          'Crea un ambiente cálido, colaborativo y positivo; dedica unos minutos a la conexión personal antes de entrar a la agenda.',
          'Involúcrale en proyectos que impliquen interacción con personas, presentaciones grupales y generación de ideas.',
          'Reconoce su esfuerzo de manera pública y entusiasta; el aprecio social es su mayor combustible.',
          'Permítele expresar su creatividad e intuición; escucha sus propuestas sin juzgarlas prematuramente.',
          'Ayúdale a canalizar su entusiasmo estableciendo por escrito acuerdos, fechas de entrega y compromisos clave.'
        ],
        donts: [
          'No lo aísles en trabajos solitarios y repetitivos durante periodos prolongados.',
          'No ignores sus aportaciones ni respondas con frialdad o escepticismo cortante a sus iniciativas.',
          'No lo satures de reglamentos rígidos o papeleo burocrático que asfixien su espontaneidad.',
          'No le des retroalimentación correctiva en público que pueda hacerle sentir expuesto o avergonzado.',
          'No asumas que un acuerdo verbal equivale a un compromiso cerrado; respalda todo por escrito con amabilidad.'
        ],
        communicationTips: [
          'Comunícate con energía positiva, lenguaje inspirador y contacto visual cercano.',
          'Fomenta el diálogo de dos vías e invítale a compartir su visión sobre el equipo.'
        ],
        motivationKeys: [
          'Pertenencia a un grupo entusiasta, popularidad y liderazgo de opinión.',
          'Tareas variadas con proyección pública y libertad creativa.'
        ]
      };

    case 'S':
      return {
        dos: [
          'Comunícate con paciencia, empatía y calidez; crea un entorno predecible y seguro para trabajar.',
          'Anticipa los cambios organizacionales con tiempo, explicando el porqué y permitiéndole asimilar la transición.',
          'Valora su constancia, lealtad y el trabajo silencioso que mantiene la operación en marcha sin fricciones.',
          'Proporciónale instrucciones claras, procedimientos paso a paso y expectativas de calidad bien definidas.',
          'Bríndale apoyo personal genuino y demuéstrale que sus aportaciones son un pilar indispensable para el equipo.'
        ],
        donts: [
          'No le impongas cambios súbitos de prioridades a última hora sin una explicación razonable y empática.',
          'No lo expongas a ambientes de alta agresividad verbal, conflicto abierto o confrontación pública.',
          'No asumas que su silencio o cortesía significa acuerdo total; pregúntale explícitamente su opinión en privado.',
          'No le exijas multitasking caótico ni lo presiones con ultimátums de tiempo desmedidos.',
          'No pases por alto su esfuerzo constante solo porque no suele autopromocionarse con estridencia.'
        ],
        communicationTips: [
          'Mantén un tono de voz tranquilo, respetuoso y consistente, asegurando escucha activa.',
          'Permítele procesar la información antes de exigir una respuesta definitiva.'
        ],
        motivationKeys: [
          'Estabilidad laboral, armonía en el equipo y relaciones de largo plazo.',
          'Reconocimiento sincero en privado por su confiabilidad y espíritu de servicio.'
        ]
      };

    case 'C':
      return {
        dos: [
          'Proporciona datos precisos, especificaciones técnicas completas y criterios objetivos de evaluación.',
          'Dale tiempo suficiente para analizar la información, contrastar alternativas y verificar la calidad de los entregables.',
          'Respeta su necesidad de orden, métodos estructurados y apego a las normas establecidas.',
          'Reconoce su rigor intelectual, la exactitud de sus análisis y su contribución para evitar errores costosos.',
          'Prepara argumentos lógicos fundamentados en evidencias cuando discutas ajustes o cambios de estrategia.'
        ],
        donts: [
          'No le pidas que "improvise" soluciones críticas sobre la marcha sin información suficiente.',
          'No critiques su trabajo con vaguedades o generalizaciones subjetivas ("no me convence"); sé puntual y técnico.',
          'No desestimes sus advertencias sobre riesgos operativos o fallas metodológicas como "pesimismo".',
          'No invadas su espacio de concentración con interrupciones constantes y no programadas.',
          'No prometas cambios o acuerdos que luego no puedas respaldar con hechos verificables.'
        ],
        communicationTips: [
          'Utiliza canales estructurados (correo, documentos detallados) y sé riguroso en tus planteamientos.',
          'Enfócate en el "cómo" y el "por qué", privilegiando la precisión sobre la retórica.'
        ],
        motivationKeys: [
          'Oportunidad de producir trabajos impecables y dominar áreas de alta especialización técnica.',
          'Entornos donde se respete la excelencia y se premie la precisión sin atajos deshonestos.'
        ]
      };

    default:
      return {
        dos: [
          'Establece metas claras y medibles con seguimiento periódico.',
          'Comunícate con transparencia y respeto profesional.',
          'Brinda retroalimentación equilibrada reconociendo logros y señalando oportunidades.',
          'Facilita los recursos necesarios para el cumplimiento de sus responsabilidades.',
          'Fomenta la colaboración armónica con los demás miembros del equipo.'
        ],
        donts: [
          'No des instrucciones contradictorias o ambiguas.',
          'No descuides el seguimiento de los compromisos adquiridos.',
          'No limites el desarrollo del colaborador con tareas excesivamente monótonas.',
          'No evites conversaciones difíciles cuando sean necesarias.',
          'No descuides el bienestar integral del colaborador en el entorno laboral.'
        ],
        communicationTips: ['Claridad y asertividad.', 'Escucha activa.'],
        motivationKeys: ['Reconocimiento al trabajo bien hecho.', 'Crecimiento profesional.']
      };
  }
}
