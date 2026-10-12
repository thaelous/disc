import { DISC_BLOCKS, DISC_ARCHETYPES } from '../data/discQuestions';
import { DISCFactor, DISCScores, DISCArchetype, Campaign, CampaignStatus } from '../types';

export interface AnswerMap {
  [blockId: number]: {
    mostOptionId?: string;
    leastOptionId?: string;
  };
}

export function calculateDISCScores(answers: AnswerMap): DISCScores {
  const mostCounts: Record<DISCFactor, number> = { D: 0, I: 0, S: 0, C: 0 };
  const leastCounts: Record<DISCFactor, number> = { D: 0, I: 0, S: 0, C: 0 };

  // Map options for fast lookup
  const optionFactorMap = new Map<string, DISCFactor>();
  DISC_BLOCKS.forEach(block => {
    block.options.forEach(opt => {
      optionFactorMap.set(opt.id, opt.factor);
    });
  });

  Object.values(answers).forEach(ans => {
    if (ans.mostOptionId) {
      const factor = optionFactorMap.get(ans.mostOptionId);
      if (factor) mostCounts[factor]++;
    }
    if (ans.leastOptionId) {
      const factor = optionFactorMap.get(ans.leastOptionId);
      if (factor) leastCounts[factor]++;
    }
  });

  // Calculate Net Scores: D = Most(D) - Least(D), etc.
  const D = mostCounts.D - leastCounts.D;
  const I = mostCounts.I - leastCounts.I;
  const S = mostCounts.S - leastCounts.S;
  const C = mostCounts.C - leastCounts.C;

  // Normalized 0 - 100 representation (from theoretical -28 to +28 span)
  const normalize = (val: number) => {
    const clamped = Math.max(-28, Math.min(28, val));
    return Math.round(((clamped + 28) / 56) * 100);
  };

  const factors: DISCFactor[] = ['D', 'I', 'S', 'C'];
  const netScores: Record<DISCFactor, number> = { D, I, S, C };
  
  // Sort factors by net score descending
  const sortedFactors = [...factors].sort((a, b) => netScores[b] - netScores[a]);
  const dominantFactor = sortedFactors[0];
  const secondaryFactor = sortedFactors[1];

  return {
    D,
    I,
    S,
    C,
    dPercent: normalize(D),
    iPercent: normalize(I),
    sPercent: normalize(S),
    cPercent: normalize(C),
    dominantFactor,
    secondaryFactor
  };
}

export function resolveArchetype(scores: DISCScores): DISCArchetype {
  const comboKey = `${scores.dominantFactor}${scores.secondaryFactor}`;
  if (DISC_ARCHETYPES[comboKey]) {
    return DISC_ARCHETYPES[comboKey];
  }
  return DISC_ARCHETYPES[scores.dominantFactor] || DISC_ARCHETYPES['D'];
}

/**
 * Dynamic Expiration Logic:
 * Counter does NOT start when campaign is created,
 * but at the exact moment the FIRST evaluation is completed!
 */
export function getCampaignLiveStatus(campaign: Campaign): {
  status: CampaignStatus;
  statusLabel: string;
  daysRemaining: number;
  totalDays: number;
  progressPercent: number;
  expiresAtFormatted: string;
} {
  const totalDays = campaign.durationDays || 15;

  if (!campaign.firstCompletedAt) {
    return {
      status: 'pending',
      statusLabel: 'Pendiente de activación',
      daysRemaining: totalDays,
      totalDays,
      progressPercent: 0,
      expiresAtFormatted: 'Inicia con la 1ª evaluación'
    };
  }

  const firstDate = new Date(campaign.firstCompletedAt).getTime();
  const durationMs = totalDays * 24 * 60 * 60 * 1000;
  const expiryTime = firstDate + durationMs;
  const now = Date.now();
  const diffMs = expiryTime - now;

  if (diffMs <= 0) {
    return {
      status: 'expired',
      statusLabel: 'Vencida / Periodo Concluido',
      daysRemaining: 0,
      totalDays,
      progressPercent: 100,
      expiresAtFormatted: new Date(expiryTime).toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    };
  }

  const daysRemaining = Math.max(1, Math.ceil(diffMs / (24 * 60 * 60 * 1000)));
  const elapsedMs = now - firstDate;
  const progressPercent = Math.min(100, Math.round((elapsedMs / durationMs) * 100));

  return {
    status: 'active',
    statusLabel: `Activa (${daysRemaining} días restantes)`,
    daysRemaining,
    totalDays,
    progressPercent,
    expiresAtFormatted: new Date(expiryTime).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  };
}

export function downloadCSV(filename: string, rows: (string | number)[][]) {
  const processRow = (row: (string | number)[]) => {
    return row.map(val => {
      const str = String(val ?? '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }).join(',');
  };

  const csvContent = '\uFEFF' + rows.map(processRow).join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
