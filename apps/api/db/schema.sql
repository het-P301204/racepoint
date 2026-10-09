-- API-level schema (reserved for API request logs, not lab runs)
CREATE TABLE IF NOT EXISTS api_request_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    method TEXT NOT NULL,
    path TEXT NOT NULL,
    status_code INTEGER,
    duration_ms REAL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
