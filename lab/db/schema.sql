CREATE TABLE IF NOT EXISTS lab_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    balance INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS runs (
    id TEXT PRIMARY KEY,
    scenario_id TEXT NOT NULL,
    execution_mode TEXT NOT NULL DEFAULT 'local-lab',
    fixture_version TEXT NOT NULL DEFAULT '1.0.0',
    started_at TEXT NOT NULL,
    completed_at TEXT,
    status TEXT NOT NULL DEFAULT 'running',
    config_json TEXT,
    initial_state_json TEXT,
    final_state_json TEXT,
    invariant_result TEXT,
    error_message TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    run_id TEXT NOT NULL REFERENCES runs(id),
    request_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    monotonic_ms REAL NOT NULL,
    wall_time TEXT NOT NULL,
    metadata_json TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS evidence (
    id TEXT PRIMARY KEY,
    run_id TEXT NOT NULL REFERENCES runs(id),
    scenario_id TEXT NOT NULL,
    execution_mode TEXT NOT NULL,
    request_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    observed_state_json TEXT,
    expected_invariant TEXT,
    actual_result TEXT,
    mitigation TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
