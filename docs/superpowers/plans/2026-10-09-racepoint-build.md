# RACEPOINT Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Build RACEPOINT — a world-class Race Condition & TOCTOU Research Platform with React+TS+Vite frontend, Python FastAPI backend, concurrency engine, and race-window visualizer.

**Architecture:** npm monorepo (apps/web, packages/shared) + Python FastAPI backend (apps/api) + Python lab fixtures (lab/). The frontend communicates with the API over HTTP. Demo mode uses a client-side synthetic data layer. Local lab mode calls the live FastAPI backend.

**Tech Stack:** React 18, TypeScript, Vite, framer-motion, zustand, react-router-dom, recharts, lucide-react, Python 3.11+, FastAPI, uvicorn, aiosqlite, pydantic v2

**Spec:** Pasted master build prompt (RACEPOINT MASTER BUILD PROMPT)

## Global Constraints

- NO blue color anywhere in backgrounds — palette: Graphite #191918, Warm Charcoal #242321, Ivory #F5F0E7, Stone #E3DACE, Coral #E45D4B, Marigold #D5A642, Sage #81977C, Iris #9282AD, Plum #594451
- Primary font: Manrope; monospace: IBM Plex Mono — load from Google Fonts with fallbacks
- Rounded corners: controls 12-14px, cards 16px, panels 20px, workspaces 24px
- No arbitrary external targets, no unbounded concurrency, request limits enforced
- Demo mode data must be deterministic and versioned
- All findings traceable to evidence; never fabricate results

---

## Phase 1 — Monorepo Scaffold & Tooling

### Task 1: Root workspace + shared package

**Files:**
- Create: `package.json` (root workspace)
- Create: `tsconfig.base.json`
- Create: `packages/shared/package.json`
- Create: `packages/shared/src/index.ts` (barrel)
- Create: `packages/shared/src/types.ts` (all domain types)

**Deliverable:** `npm install` at root succeeds; `packages/shared` can be imported by apps.

---

### Task 2: Web app scaffold (Vite + React + TS)

**Files:**
- Create: `apps/web/package.json`
- Create: `apps/web/vite.config.ts`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/index.html`
- Create: `apps/web/src/main.tsx`
- Create: `apps/web/src/App.tsx` (router root)
- Create: `apps/web/src/styles/globals.css` (design tokens, font imports)

**Deliverable:** `npm run dev -w apps/web` renders a warm-charcoal page.

---

### Task 3: Python API scaffold

**Files:**
- Create: `apps/api/requirements.txt`
- Create: `apps/api/main.py`
- Create: `apps/api/routers/__init__.py`
- Create: `apps/api/models/__init__.py`
- Create: `apps/api/core/config.py`

**Deliverable:** `uvicorn apps.api.main:app --reload` returns `{"status":"ok"}` at `/health`.

---

## Phase 2 — Design System & App Shell

### Task 4: Design tokens + global styles

**Files:**
- Modify: `apps/web/src/styles/globals.css`
- Create: `apps/web/src/styles/tokens.css`

CSS custom properties for all colors, spacing, typography scale, radius values.

---

### Task 5: Core UI components

**Files:**
- Create: `apps/web/src/components/ui/Button.tsx`
- Create: `apps/web/src/components/ui/Badge.tsx`
- Create: `apps/web/src/components/ui/StatusIndicator.tsx`
- Create: `apps/web/src/components/ui/Card.tsx`
- Create: `apps/web/src/components/ui/Toast.tsx`
- Create: `apps/web/src/components/ui/Skeleton.tsx`
- Create: `apps/web/src/components/ui/index.ts`

---

### Task 6: App shell — layout + navigation

**Files:**
- Create: `apps/web/src/components/layout/AppShell.tsx`
- Create: `apps/web/src/components/layout/Header.tsx`
- Create: `apps/web/src/components/layout/Sidebar.tsx`
- Create: `apps/web/src/components/layout/ModeToggle.tsx` (DEMO / LOCAL LAB)

---

### Task 7: Router + all route stubs

**Files:**
- Modify: `apps/web/src/App.tsx`
- Create: `apps/web/src/routes/` (one file per route)

All 20 routes render with a title and placeholder content — navigation fully functional.

---

## Phase 3 — Domain Types & Demo Data

### Task 8: Shared TypeScript domain types

**Files:**
- Modify: `packages/shared/src/types.ts`

Types: Scenario, Fixture, ResearchRun, RequestEvent, StateSnapshot, StateTransition, RaceWindow, Invariant, Mitigation, Evidence, Comparison, ResearchNote, DatasetVersion, ActivityEntry.

---

### Task 9: Demo data layer — scenarios + runs

**Files:**
- Create: `apps/web/src/data/scenarios.ts` (20 scenarios)
- Create: `apps/web/src/data/runs.ts` (35 runs)
- Create: `apps/web/src/data/evidence.ts` (65 evidence records)
- Create: `apps/web/src/data/activity.ts` (activity feed)
- Create: `apps/web/src/data/index.ts` (barrel)

All records deterministic; IDs use RACE-NNN, RUN-YYYY-NNNN, EV-NNNNN format.

---

## Phase 4 — Dashboard & Scenario Library

### Task 10: Dashboard (Overview route)

**Files:**
- Create: `apps/web/src/routes/Overview.tsx`
- Create: `apps/web/src/features/dashboard/MetricsBar.tsx`
- Create: `apps/web/src/features/dashboard/RecentActivity.tsx`
- Create: `apps/web/src/features/dashboard/ScenarioCoverage.tsx`
- Create: `apps/web/src/features/dashboard/VulnVsHardened.tsx`

---

### Task 11: Scenario Library

**Files:**
- Create: `apps/web/src/routes/Scenarios.tsx`
- Create: `apps/web/src/routes/ScenarioDetail.tsx`
- Create: `apps/web/src/features/scenarios/ScenarioCard.tsx`
- Create: `apps/web/src/features/scenarios/ScenarioFilters.tsx`

---

## Phase 5 — Race Timeline & State Inspector

### Task 12: Race Timeline visualization

**Files:**
- Create: `apps/web/src/routes/RaceTimeline.tsx`
- Create: `apps/web/src/components/timeline/TimelineCanvas.tsx`
- Create: `apps/web/src/components/timeline/RequestLane.tsx`
- Create: `apps/web/src/components/timeline/EventMarker.tsx`
- Create: `apps/web/src/components/timeline/RaceWindowOverlay.tsx`
- Create: `apps/web/src/components/timeline/PlaybackControls.tsx`
- Create: `apps/web/src/components/timeline/TimelineStore.ts` (zustand)

---

### Task 13: State Inspector

**Files:**
- Create: `apps/web/src/routes/StateInspector.tsx`
- Create: `apps/web/src/components/state/StateTransitionView.tsx`
- Create: `apps/web/src/components/state/ObservedValueGrid.tsx`
- Create: `apps/web/src/components/state/InvariantPanel.tsx`

---

## Phase 6 — Concurrency Engine (Python)

### Task 14: Python concurrency engine

**Files:**
- Create: `lab/engine/coordinator.py` (barrier-based request coordination)
- Create: `lab/engine/events.py` (event types + EventRecorder)
- Create: `lab/engine/invariant.py` (InvariantEvaluator)
- Create: `lab/engine/race_window.py` (RaceWindowDetector)
- Create: `lab/engine/run_manager.py` (RunManager)

---

### Task 15: Vulnerable + hardened balance fixture

**Files:**
- Create: `lab/fixtures/balance_vulnerable.py`
- Create: `lab/fixtures/balance_hardened.py`
- Create: `lab/fixtures/base.py`

Vulnerable: check-then-act without atomic protection.
Hardened: SQLite UPDATE with WHERE balance >= amount.

---

### Task 16: Database TOCTOU fixture

**Files:**
- Create: `lab/fixtures/db_toctou_vulnerable.py`
- Create: `lab/fixtures/db_toctou_hardened.py`
- Create: `lab/db/connection.py` (aiosqlite pool)

---

### Task 17: Filesystem TOCTOU fixture

**Files:**
- Create: `lab/fixtures/fs_toctou_vulnerable.py`
- Create: `lab/fixtures/fs_toctou_hardened.py`
- Create: `lab/fixtures/fs_cleanup.py`

Uses tempfile for isolated sandbox; O_CREAT|O_EXCL for hardened.

---

### Task 18: Registration race fixture

**Files:**
- Create: `lab/fixtures/registration_vulnerable.py`
- Create: `lab/fixtures/registration_hardened.py`

---

## Phase 7 — API Routes

### Task 19: Scenario + run API routes

**Files:**
- Create: `apps/api/routers/scenarios.py`
- Create: `apps/api/routers/runs.py`
- Create: `apps/api/routers/evidence.py`
- Create: `apps/api/routers/lab.py` (trigger lab runs)

---

## Phase 8 — Vulnerable/Hardened Lab Pages

### Task 20: Database TOCTOU page

**Files:**
- Create: `apps/web/src/routes/Database.tsx`
- Create: `apps/web/src/features/lab/DatabaseScenario.tsx`

---

### Task 21: Filesystem TOCTOU page

**Files:**
- Create: `apps/web/src/routes/Filesystem.tsx`
- Create: `apps/web/src/features/lab/FilesystemScenario.tsx`

---

### Task 22: Distributed state page

**Files:**
- Create: `apps/web/src/routes/Distributed.tsx`
- Create: `apps/web/src/features/lab/DistributedTopology.tsx`

---

## Phase 9 — Comparison, Evidence & Reports

### Task 23: Vulnerable/Hardened comparison screen

**Files:**
- Create: `apps/web/src/routes/Comparisons.tsx`
- Create: `apps/web/src/features/comparison/ComparisonPanel.tsx`
- Create: `apps/web/src/features/comparison/SideBySideTimeline.tsx`

---

### Task 24: Evidence page + drawer

**Files:**
- Create: `apps/web/src/routes/Evidence.tsx`
- Create: `apps/web/src/features/evidence/EvidenceTable.tsx`
- Create: `apps/web/src/features/evidence/EvidenceDrawer.tsx`

---

### Task 25: Export (JSON/Markdown/CSV)

**Files:**
- Create: `apps/web/src/features/reports/exportRun.ts`
- Create: `apps/web/src/features/reports/ExportDialog.tsx`

---

## Phase 10 — Showcase Mode

### Task 26: Showcase Mode

**Files:**
- Create: `apps/web/src/routes/Showcase.tsx`
- Create: `apps/web/src/features/showcase/ShowcaseScript.ts` (synthetic event sequence)
- Create: `apps/web/src/features/showcase/ShowcasePlayer.tsx`

60–90 second guided demonstration using synthetic events, labeled clearly as synthetic showcase.

---

## Phase 11 — Search, Command Palette, Notifications

### Task 27: Command palette + global search

**Files:**
- Create: `apps/web/src/components/command/CommandPalette.tsx`
- Create: `apps/web/src/components/command/SearchResults.tsx`
- Create: `apps/web/src/hooks/useSearch.ts`

Ctrl+K trigger; searches scenarios, runs, evidence.

---

## Phase 12 — Testing

### Task 28: Python unit tests

**Files:**
- Create: `lab/tests/test_coordinator.py`
- Create: `lab/tests/test_invariant.py`
- Create: `lab/tests/test_race_window.py`
- Create: `lab/tests/test_fixtures.py`

---

### Task 29: Frontend tests (Vitest)

**Files:**
- Create: `apps/web/src/tests/` (component + hook tests)

---

## Phase 13 — Polish & Docs

### Task 30: README + docs

**Files:**
- Create: `README.md`
- Create: `docs/architecture.md`
- Create: `docs/methodology.md`

---
