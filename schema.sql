-- Single event settings row (id=1)
CREATE TABLE IF NOT EXISTS event_settings (
  id INTEGER PRIMARY KEY NOT NULL CHECK (id = 1),
  event_date TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT ''
);

INSERT OR IGNORE INTO event_settings (id, event_date, notes)
VALUES (1, '2026-01-16', '');

-- Registrations per date
CREATE TABLE IF NOT EXISTS registrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_date TEXT NOT NULL,
  name TEXT NOT NULL,
  name_norm TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H%M%fZ','now')),
  UNIQUE (event_date, name_norm)
);

-- Games list + score
CREATE TABLE IF NOT EXISTS games (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  title_norm TEXT NOT NULL UNIQUE,
  difficulty INTEGER NOT NULL,
  host TEXT NOT NULL,
  players TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H%M%fZ','now'))
);
