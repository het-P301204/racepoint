import type { ResearchRun, Evidence, Comparison, RaceWindow } from '@racepoint/shared';

export interface DatasetMetrics {
  totalRuns: number;
  completedRuns: number;
  failedRuns: number;
  violatedRuns: number;
  preservedRuns: number;
  inconclusiveRuns: number;
  totalRaceWindows: number;
  totalEvidence: number;
  totalComparisons: number;
  violationRate: number;
  mitigationSuccessRate: number;
  avgRaceWindowMs: number;
  avgVulnerableRuntimeMs: number;
  avgHardenedRuntimeMs: number;
  scenariosWithViolations: Set<string>;
  scenariosHardened: Set<string>;
  mostRecentRun?: ResearchRun | undefined;
  mostRecentViolation?: ResearchRun | undefined;
}

export function computeMetrics(
  runs: ResearchRun[],
  evidence: Evidence[],
  comparisons: Comparison[],
): DatasetMetrics {
  const completed = runs.filter(r => r.status === 'completed');
  const failed = runs.filter(r => r.status === 'failed');
  const violated = completed.filter(r => r.invariantResult === 'violated');
  const preserved = completed.filter(r => r.invariantResult === 'preserved');
  const inconclusive = completed.filter(r => r.invariantResult === 'inconclusive');

  const allRaceWindows: RaceWindow[] = runs.flatMap(r => r.raceWindows ?? []);

  const avgRaceWindowMs = allRaceWindows.length > 0
    ? allRaceWindows.reduce((sum, w) => sum + (w.endMonotonicMs - w.startMonotonicMs), 0) / allRaceWindows.length
    : 0;

  const avgVulnerableRuntimeMs = comparisons.length > 0
    ? comparisons.reduce((sum, c) => sum + c.vulnerableRuntimeMs, 0) / comparisons.length
    : 0;

  const avgHardenedRuntimeMs = comparisons.length > 0
    ? comparisons.reduce((sum, c) => sum + c.hardenedRuntimeMs, 0) / comparisons.length
    : 0;

  const scenariosWithViolations = new Set(violated.map(r => r.scenarioId));
  const scenariosHardened = new Set(preserved.map(r => r.scenarioId));

  const sortedCompleted = [...completed].sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
  );

  const mostRecentRun = sortedCompleted[0];
  const mostRecentViolation = violated.sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
  )[0];

  const violationRate = completed.length > 0 ? violated.length / completed.length : 0;
  const mitigationSuccessRate = (violated.length + preserved.length) > 0
    ? preserved.length / (violated.length + preserved.length)
    : 0;

  return {
    totalRuns: runs.length,
    completedRuns: completed.length,
    failedRuns: failed.length,
    violatedRuns: violated.length,
    preservedRuns: preserved.length,
    inconclusiveRuns: inconclusive.length,
    totalRaceWindows: allRaceWindows.length,
    totalEvidence: evidence.length,
    totalComparisons: comparisons.length,
    violationRate,
    mitigationSuccessRate,
    avgRaceWindowMs,
    avgVulnerableRuntimeMs,
    avgHardenedRuntimeMs,
    scenariosWithViolations,
    scenariosHardened,
    mostRecentRun,
    mostRecentViolation,
  };
}
