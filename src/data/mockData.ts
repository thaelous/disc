import { Company, Campaign, Collaborator } from '../types';
import { DISC_ARCHETYPES } from './discQuestions';

export const INITIAL_COMPANIES: Company[] = [
  {
    id: 'comp-1',
    name: 'Grupo InnovaTech S.A. de C.V.',
    rfc: 'GIN1904128K3',
    contactPerson: 'Lic. Mariana Cordero Ramos',
    email: 'm.cordero@innovatech-corp.mx',
    phone: '+52 (55) 4120-8890',
    industry: 'Tecnología & Software Corporativo',
    createdAt: '2026-01-15T09:00:00.000Z'
  },
  {
    id: 'comp-2',
    name: 'Soluciones Financieras Atlas',
    rfc: 'SFA1508219L2',
    contactPerson: 'Mtro. Roberto Garza Sada',
    email: 'r.garza@finanzas-atlas.com',
    phone: '+52 (81) 8345-2200',
    industry: 'Banca & Servicios Financieros',
    createdAt: '2026-02-01T10:30:00.000Z'
  },
  {
    id: 'comp-3',
    name: 'Logística Global Nexus',
    rfc: 'LGN2001157M1',
    contactPerson: 'Ing. Carlos Valencia Morales',
    email: 'carlos.valencia@nexuslogistics.mx',
    phone: '+52 (33) 3612-9011',
    industry: 'Cadena de Suministro & Transporte',
    createdAt: '2026-03-10T14:15:00.000Z'
  }
];

const now = Date.now();
const dayMs = 24 * 60 * 60 * 1000;

export const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp-1',
    companyId: 'comp-1',
    accessCode: 'DISC-2026-INNOVA',
    title: 'Evaluación Talento Q1 & Desarrollo Directivo',
    durationDays: 15,
    createdAt: new Date(now - 6 * dayMs).toISOString(),
    firstCompletedAt: new Date(now - 3 * dayMs).toISOString(), // Activated 3 days ago, 12 days left
    expiresAt: new Date(now + 12 * dayMs).toISOString(),
    targetParticipants: 35
  },
  {
    id: 'camp-2',
    companyId: 'comp-2',
    accessCode: 'DISC-2026-VENTAS',
    title: 'Mapeo Conductual Fuerza Comercial 2026',
    durationDays: 10,
    createdAt: new Date(now - 4 * dayMs).toISOString(),
    firstCompletedAt: new Date(now - 2 * dayMs).toISOString(), // Activated 2 days ago, 8 days left
    expiresAt: new Date(now + 8 * dayMs).toISOString(),
    targetParticipants: 20
  },
  {
    id: 'camp-3',
    companyId: 'comp-3',
    accessCode: 'DISC-2026-LIDERAZGO',
    title: 'Diagnóstico Mandos Medios y Operaciones',
    durationDays: 20,
    createdAt: new Date(now - 1 * dayMs).toISOString(),
    firstCompletedAt: null, // PENDING ACTIVATION - timer has not started!
    expiresAt: null,
    targetParticipants: 25
  },
  {
    id: 'camp-4',
    companyId: 'comp-1',
    accessCode: 'DISC-2025-PILOTO',
    title: 'Prueba Piloto Departamento TI (Concluida)',
    durationDays: 7,
    createdAt: new Date(now - 180 * dayMs).toISOString(),
    firstCompletedAt: new Date(now - 175 * dayMs).toISOString(), // Expired
    expiresAt: new Date(now - 168 * dayMs).toISOString(),
    targetParticipants: 10
  },
  {
    id: 'camp-5',
    companyId: 'comp-1',
    accessCode: 'DISC-2025-ANUAL',
    title: 'Evaluación Anual Clima & Desempeño 2025',
    durationDays: 21,
    createdAt: new Date(now - 90 * dayMs).toISOString(),
    firstCompletedAt: new Date(now - 86 * dayMs).toISOString(), // Expired
    expiresAt: new Date(now - 65 * dayMs).toISOString(),
    targetParticipants: 30
  }
];

export const INITIAL_COLLABORATORS: Collaborator[] = [
  // Campaign 1 - InnovaTech
  {
    id: 'col-1',
    campaignId: 'camp-1',
    companyId: 'comp-1',
    fullName: 'Alejandro Morales Fuentes',
    email: 'a.morales@innovatech-corp.mx',
    department: 'Dirección General',
    role: 'Director de Operaciones',
    status: 'completed',
    completedAt: new Date(now - 3 * dayMs).toISOString(), // Activated camp-1
    scores: {
      D: 18,
      I: 8,
      S: -10,
      C: -16,
      dPercent: 82,
      iPercent: 64,
      sPercent: 32,
      cPercent: 21,
      dominantFactor: 'D',
      secondaryFactor: 'I'
    },
    archetype: DISC_ARCHETYPES['DI']
  },
  {
    id: 'col-2',
    campaignId: 'camp-1',
    companyId: 'comp-1',
    fullName: 'Lucía Fernández Villaseñor',
    email: 'l.fernandez@innovatech-corp.mx',
    department: 'Ventas y Expansión',
    role: 'Gerente Comercial Regional',
    status: 'completed',
    completedAt: new Date(now - 2.5 * dayMs).toISOString(),
    scores: {
      D: 10,
      I: 20,
      S: -4,
      C: -26,
      dPercent: 68,
      iPercent: 86,
      sPercent: 43,
      cPercent: 4,
      dominantFactor: 'I',
      secondaryFactor: 'D'
    },
    archetype: DISC_ARCHETYPES['I']
  },
  {
    id: 'col-3',
    campaignId: 'camp-1',
    companyId: 'comp-1',
    fullName: 'David Mendoza Castillo',
    email: 'd.mendoza@innovatech-corp.mx',
    department: 'TI & Desarrollo',
    role: 'Arquitecto de Software Principal',
    status: 'completed',
    completedAt: new Date(now - 2 * dayMs).toISOString(),
    scores: {
      D: -6,
      I: -18,
      S: 4,
      C: 20,
      dPercent: 39,
      iPercent: 18,
      sPercent: 57,
      cPercent: 86,
      dominantFactor: 'C',
      secondaryFactor: 'S'
    },
    archetype: DISC_ARCHETYPES['C']
  },
  {
    id: 'col-4',
    campaignId: 'camp-1',
    companyId: 'comp-1',
    fullName: 'Sofia Navarro Quiroz',
    email: 's.navarro@innovatech-corp.mx',
    department: 'Recursos Humanos',
    role: 'Líder de Cultura y Bienestar',
    status: 'completed',
    completedAt: new Date(now - 1.8 * dayMs).toISOString(),
    scores: {
      D: -14,
      I: 12,
      S: 18,
      C: -16,
      dPercent: 25,
      iPercent: 71,
      sPercent: 82,
      cPercent: 21,
      dominantFactor: 'S',
      secondaryFactor: 'I'
    },
    archetype: DISC_ARCHETYPES['S']
  },
  {
    id: 'col-5',
    campaignId: 'camp-1',
    companyId: 'comp-1',
    fullName: 'Rodrigo Benítez Solís',
    email: 'r.benitez@innovatech-corp.mx',
    department: 'TI & Desarrollo',
    role: 'Líder Técnico DevOps',
    status: 'completed',
    completedAt: new Date(now - 1.2 * dayMs).toISOString(),
    scores: {
      D: 12,
      I: -10,
      S: -4,
      C: 16,
      dPercent: 71,
      iPercent: 32,
      sPercent: 43,
      cPercent: 79,
      dominantFactor: 'C',
      secondaryFactor: 'D'
    },
    archetype: DISC_ARCHETYPES['DC']
  },
  {
    id: 'col-6',
    campaignId: 'camp-1',
    companyId: 'comp-1',
    fullName: 'Camila Reyes Salazar',
    email: 'c.reyes@innovatech-corp.mx',
    department: 'Operaciones',
    role: 'Coordinadora de Procesos',
    status: 'completed',
    completedAt: new Date(now - 0.8 * dayMs).toISOString(),
    scores: {
      D: -8,
      I: -6,
      S: 16,
      C: 14,
      dPercent: 36,
      iPercent: 39,
      sPercent: 79,
      cPercent: 75,
      dominantFactor: 'S',
      secondaryFactor: 'C'
    },
    archetype: DISC_ARCHETYPES['SC']
  },
  {
    id: 'col-7',
    campaignId: 'camp-1',
    companyId: 'comp-1',
    fullName: 'Héctor Vega Domínguez',
    email: 'h.vega@innovatech-corp.mx',
    department: 'Ventas y Expansión',
    role: 'Ejecutivo de Cuentas Enterprise',
    status: 'pending'
  },
  {
    id: 'col-8',
    campaignId: 'camp-1',
    companyId: 'comp-1',
    fullName: 'Valeria Ortiz Peña',
    email: 'v.ortiz@innovatech-corp.mx',
    department: 'Finanzas',
    role: 'Analista Financiera Senior',
    status: 'pending'
  },
  {
    id: 'col-9',
    campaignId: 'camp-1',
    companyId: 'comp-1',
    fullName: 'Gustavo Estrada Luna',
    email: 'g.estrada@innovatech-corp.mx',
    department: 'Operaciones',
    role: 'Supervisor de Calidad',
    status: 'pending'
  },

  // Campaign 2 - Finanzas Atlas
  {
    id: 'col-10',
    campaignId: 'camp-2',
    companyId: 'comp-2',
    fullName: 'Mauricio Garza Treviño',
    email: 'm.garza@finanzas-atlas.com',
    department: 'Banca Patrimonial',
    role: 'Director Comercial',
    status: 'completed',
    completedAt: new Date(now - 2 * dayMs).toISOString(), // Activated camp-2
    scores: {
      D: 16,
      I: 14,
      S: -12,
      C: -18,
      dPercent: 79,
      iPercent: 75,
      sPercent: 29,
      cPercent: 18,
      dominantFactor: 'D',
      secondaryFactor: 'I'
    },
    archetype: DISC_ARCHETYPES['DI']
  },
  {
    id: 'col-11',
    campaignId: 'camp-2',
    companyId: 'comp-2',
    fullName: 'Paulina Villarreal Soto',
    email: 'p.villarreal@finanzas-atlas.com',
    department: 'Riesgos y Crédito',
    role: 'Subdirectora de Modelos de Riesgo',
    status: 'completed',
    completedAt: new Date(now - 1.5 * dayMs).toISOString(),
    scores: {
      D: -4,
      I: -16,
      S: 2,
      C: 22,
      dPercent: 43,
      iPercent: 21,
      sPercent: 54,
      cPercent: 89,
      dominantFactor: 'C',
      secondaryFactor: 'S'
    },
    archetype: DISC_ARCHETYPES['C']
  },
  {
    id: 'col-12',
    campaignId: 'camp-2',
    companyId: 'comp-2',
    fullName: 'Enrique Cantú Zambrano',
    email: 'e.cantu@finanzas-atlas.com',
    department: 'Fuerza de Ventas',
    role: 'Asesor Financiero Senior',
    status: 'pending'
  },

  // Campaign 3 - Nexus Logistics (Pending 1st completion)
  {
    id: 'col-13',
    campaignId: 'camp-3',
    companyId: 'comp-3',
    fullName: 'Guillermo Ramos Arriaga',
    email: 'g.ramos@nexuslogistics.mx',
    department: 'Operaciones y Flota',
    role: 'Gerente Nacional de Tráfico',
    status: 'pending'
  },
  {
    id: 'col-14',
    campaignId: 'camp-3',
    companyId: 'comp-3',
    fullName: 'Lorena Alarcón Pineda',
    email: 'l.alarcon@nexuslogistics.mx',
    department: 'Cadena de Suministro',
    role: 'Planeadora de Inventarios',
    status: 'pending'
  },

  // Campaign 4 (Histórica: DISC-2025-PILOTO - Enfoque Técnico C/S)
  {
    id: 'col-h1',
    campaignId: 'camp-4',
    companyId: 'comp-1',
    fullName: 'Roberto Benítez Luna',
    email: 'r.benitez@innovatech-corp.mx',
    department: 'TI & Desarrollo',
    role: 'Líder Técnico Arquitectura',
    status: 'completed',
    completedAt: new Date(now - 174 * dayMs).toISOString(),
    scores: {
      D: 2,
      I: -14,
      S: 6,
      C: 20,
      dPercent: 48,
      iPercent: 25,
      sPercent: 62,
      cPercent: 88,
      dominantFactor: 'C',
      secondaryFactor: 'S'
    },
    archetype: DISC_ARCHETYPES['C']
  },
  {
    id: 'col-h2',
    campaignId: 'camp-4',
    companyId: 'comp-1',
    fullName: 'Diana Castillo Peñaloza',
    email: 'd.castillo@innovatech-corp.mx',
    department: 'TI & Desarrollo',
    role: 'Ingeniera de Calidad QA',
    status: 'completed',
    completedAt: new Date(now - 173 * dayMs).toISOString(),
    scores: {
      D: -10,
      I: -8,
      S: 12,
      C: 18,
      dPercent: 32,
      iPercent: 36,
      sPercent: 74,
      cPercent: 84,
      dominantFactor: 'C',
      secondaryFactor: 'S'
    },
    archetype: DISC_ARCHETYPES['CS']
  },
  {
    id: 'col-h3',
    campaignId: 'camp-4',
    companyId: 'comp-1',
    fullName: 'Jorge Luis Morales',
    email: 'j.morales@innovatech-corp.mx',
    department: 'Operaciones',
    role: 'Coordinador de Servidores y Redes',
    status: 'completed',
    completedAt: new Date(now - 172 * dayMs).toISOString(),
    scores: {
      D: -6,
      I: 2,
      S: 18,
      C: 10,
      dPercent: 39,
      iPercent: 53,
      sPercent: 83,
      cPercent: 68,
      dominantFactor: 'S',
      secondaryFactor: 'C'
    },
    archetype: DISC_ARCHETYPES['S']
  },
  {
    id: 'col-h4',
    campaignId: 'camp-4',
    companyId: 'comp-1',
    fullName: 'Sofía Valdés Treviño',
    email: 's.valdes@innovatech-corp.mx',
    department: 'TI & Desarrollo',
    role: 'Desarrolladora Backend Cloud',
    status: 'completed',
    completedAt: new Date(now - 171 * dayMs).toISOString(),
    scores: {
      D: 10,
      I: -12,
      S: -4,
      C: 16,
      dPercent: 67,
      iPercent: 29,
      sPercent: 43,
      cPercent: 79,
      dominantFactor: 'C',
      secondaryFactor: 'D'
    },
    archetype: DISC_ARCHETYPES['CD']
  },

  // Campaign 5 (Histórica: DISC-2025-ANUAL - Evaluación Integral)
  {
    id: 'col-h5',
    campaignId: 'camp-5',
    companyId: 'comp-1',
    fullName: 'Alejandro Morales Fuentes',
    email: 'a.morales@innovatech-corp.mx',
    department: 'Dirección General',
    role: 'Director de Operaciones',
    status: 'completed',
    completedAt: new Date(now - 85 * dayMs).toISOString(),
    scores: {
      D: 14,
      I: 4,
      S: -4,
      C: -8,
      dPercent: 75,
      iPercent: 57,
      sPercent: 43,
      cPercent: 36,
      dominantFactor: 'D',
      secondaryFactor: 'I'
    },
    archetype: DISC_ARCHETYPES['D']
  },
  {
    id: 'col-h6',
    campaignId: 'camp-5',
    companyId: 'comp-1',
    fullName: 'Mariana Rivas Saldaña',
    email: 'm.rivas@innovatech-corp.mx',
    department: 'Ventas y Expansión',
    role: 'Ejecutiva Comercial Corporativa',
    status: 'completed',
    completedAt: new Date(now - 84 * dayMs).toISOString(),
    scores: {
      D: 6,
      I: 18,
      S: -6,
      C: -12,
      dPercent: 60,
      iPercent: 82,
      sPercent: 39,
      cPercent: 29,
      dominantFactor: 'I',
      secondaryFactor: 'D'
    },
    archetype: DISC_ARCHETYPES['I']
  },
  {
    id: 'col-h7',
    campaignId: 'camp-5',
    companyId: 'comp-1',
    fullName: 'Carlos Méndez Olvera',
    email: 'c.mendez@innovatech-corp.mx',
    department: 'Operaciones',
    role: 'Jefe de Logística y Rutas',
    status: 'completed',
    completedAt: new Date(now - 83 * dayMs).toISOString(),
    scores: {
      D: -10,
      I: -2,
      S: 18,
      C: 8,
      dPercent: 32,
      iPercent: 46,
      sPercent: 83,
      cPercent: 64,
      dominantFactor: 'S',
      secondaryFactor: 'C'
    },
    archetype: DISC_ARCHETYPES['S']
  },
  {
    id: 'col-h8',
    campaignId: 'camp-5',
    companyId: 'comp-1',
    fullName: 'Beatriz Silva Hinojosa',
    email: 'b.silva@innovatech-corp.mx',
    department: 'Finanzas',
    role: 'Contadora General',
    status: 'completed',
    completedAt: new Date(now - 82 * dayMs).toISOString(),
    scores: {
      D: -8,
      I: -14,
      S: 8,
      C: 22,
      dPercent: 36,
      iPercent: 25,
      sPercent: 65,
      cPercent: 91,
      dominantFactor: 'C',
      secondaryFactor: 'S'
    },
    archetype: DISC_ARCHETYPES['C']
  },
  {
    id: 'col-h9',
    campaignId: 'camp-5',
    companyId: 'comp-1',
    fullName: 'Rodrigo Garza Cantú',
    email: 'r.garza@innovatech-corp.mx',
    department: 'TI & Desarrollo',
    role: 'Desarrollador Full Stack',
    status: 'completed',
    completedAt: new Date(now - 81 * dayMs).toISOString(),
    scores: {
      D: 0,
      I: -8,
      S: 6,
      C: 16,
      dPercent: 50,
      iPercent: 36,
      sPercent: 62,
      cPercent: 79,
      dominantFactor: 'C',
      secondaryFactor: 'S'
    },
    archetype: DISC_ARCHETYPES['CS']
  },
  {
    id: 'col-h10',
    campaignId: 'camp-5',
    companyId: 'comp-1',
    fullName: 'Patricia Mendoza Cruz',
    email: 'p.mendoza@innovatech-corp.mx',
    department: 'Recursos Humanos',
    role: 'Especialista en Cultura y Clima',
    status: 'completed',
    completedAt: new Date(now - 80 * dayMs).toISOString(),
    scores: {
      D: -12,
      I: 14,
      S: 16,
      C: -6,
      dPercent: 29,
      iPercent: 75,
      sPercent: 79,
      cPercent: 39,
      dominantFactor: 'S',
      secondaryFactor: 'I'
    },
    archetype: DISC_ARCHETYPES['SI']
  }
];
