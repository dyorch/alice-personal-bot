-- Esquema inicial de Alice. Spec §6.
-- Las fechas se guardan como TEXT en formato ISO 8601 UTC con milisegundos:
-- `2026-05-27T14:30:00.123Z` (compatible con Zod .datetime({ offset: true })).

CREATE TABLE expenses (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  amount      REAL    NOT NULL,
  currency    TEXT    NOT NULL DEFAULT 'PEN',
  category    TEXT    NOT NULL,
  description TEXT    NOT NULL DEFAULT '',
  spent_at    TEXT    NOT NULL,  -- formato YYYY-MM-DD (fecha local de Lima)
  created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX idx_expenses_spent_at ON expenses(spent_at);
CREATE INDEX idx_expenses_category ON expenses(category);

CREATE TABLE reminders (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  text       TEXT    NOT NULL,
  fire_at    TEXT    NOT NULL,                  -- ISO 8601 UTC
  sent       INTEGER NOT NULL DEFAULT 0,        -- 0 | 1
  created_at TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX idx_reminders_pending ON reminders(fire_at, sent);

CREATE TABLE watchlist (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  kind       TEXT    NOT NULL,                  -- movie | series | tiktok | video | other
  title      TEXT,
  url        TEXT,
  notes      TEXT,
  watched    INTEGER NOT NULL DEFAULT 0,
  created_at TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  watched_at TEXT,
  updated_at TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX idx_watchlist_pending ON watchlist(watched);

CREATE TABLE message_log (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  direction        TEXT    NOT NULL,            -- in | out
  sender_phone     TEXT    NOT NULL DEFAULT '',
  sender_name      TEXT,
  wa_message_id    TEXT,
  body             TEXT    NOT NULL DEFAULT '',
  message_type     TEXT    NOT NULL DEFAULT 'text',
  intent           TEXT,                        -- expense | reminder | watch | unknown | null
  status           TEXT    NOT NULL,            -- allowed | rejected_* | sent | failed
  rejection_reason TEXT,
  raw_payload      TEXT    NOT NULL DEFAULT '{}',
  created_at       TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX idx_message_log_sender  ON message_log(sender_phone, created_at);
CREATE INDEX idx_message_log_status  ON message_log(status, created_at);
CREATE INDEX idx_message_log_created ON message_log(created_at);
CREATE UNIQUE INDEX idx_message_log_wamid ON message_log(wa_message_id) WHERE wa_message_id IS NOT NULL;
