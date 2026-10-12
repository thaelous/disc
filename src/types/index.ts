export type DISCFactor = 'D' | 'I' | 'S' | 'C';

export interface DISCOption {
  id: string;
  text: string;
  factor: DISCFactor;
}

export interface DISCQuestionBlock {
  id: number;
  options: DISCOption[];
}

export interface DISCScores {
  D: number;
  I: number;
  S: number;
  C: number;
  // Normalized percentile / 0-100 representation for clear comparison
  dPercent: number;
  iPercent: number;
  sPercent: number;
  cPercent: number;
  dominantFactor: DISCFactor;
  secondaryFactor: DISCFactor;
}

export interface DISCArchetype {
  id: string;
  title: string;
  subtitle: string;
  dominant: DISCFactor;
  secondary?: DISCFactor;
  description: string;
  strengths: string[];
  communicationStyle: string;
  idealEnvironment: string;
  growthAreas: string[];
  underPressure: string;
}

export interface Company {
  id: string;
  name: string;
  rfc: string;
  contactPerson: string;
  email: string;
  phone: string;
  industry: string;
  logoUrl?: string;
  createdAt: string;
}

export type CampaignStatus = 'pending' | 'active' | 'expired';

export interface Campaign {
  id: string;
  companyId: string;
  accessCode: string; // e.g. DISC-2026-ALPHA
  title: string;
  durationDays: number;
  createdAt: string;
  firstCompletedAt?: string | null;
  expiresAt?: string | null;
  targetParticipants: number;
}

export interface Collaborator {
  id: string;
  campaignId: string;
  companyId: string;
  fullName: string;
  email: string;
  department: string;
  role: string;
  status: 'pending' | 'completed';
  completedAt?: string;
  scores?: DISCScores;
  archetype?: DISCArchetype;
}

export type ActiveView = 'landing' | 'company' | 'evaluator' | 'admin';
