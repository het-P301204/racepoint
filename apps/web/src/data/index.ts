import { DEMO_SCENARIOS } from './scenarios'
import { DEMO_RUNS } from './runs'
import { DEMO_EVIDENCE } from './evidence'
import { DEMO_COMPARISONS } from './comparisons'
import { DEMO_ACTIVITY } from './activity'
import { DEMO_NOTES } from './notes'
import { computeMetrics } from './metrics'

export { DEMO_SCENARIOS }
export { DEMO_RUNS }
export { DEMO_EVIDENCE }
export { DEMO_COMPARISONS }
export { DEMO_ACTIVITY }
export { DEMO_NOTES }
export { computeMetrics }
export type { DatasetMetrics } from './metrics'

export const DATASET_VERSION = '1.0.0'
export const DATASET_CREATED_AT = '2026-10-09T00:00:00Z'

export const DEMO_DATASET = {
  version: DATASET_VERSION,
  createdAt: DATASET_CREATED_AT,
  scenarios: DEMO_SCENARIOS,
  runs: DEMO_RUNS,
  evidence: DEMO_EVIDENCE,
  comparisons: DEMO_COMPARISONS,
  activity: DEMO_ACTIVITY,
  notes: DEMO_NOTES,
}

export const DEMO_METRICS = computeMetrics(DEMO_RUNS, DEMO_EVIDENCE, DEMO_COMPARISONS)
