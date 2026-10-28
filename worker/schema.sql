-- ElimuTrack Enterprise — D1 schema
-- Every tenant-scoped table carries tenant_id; the API always filters by the
-- authenticated user's tenant, never by a client-supplied id.

CREATE TABLE IF NOT EXISTS tenants (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  owner_sub   TEXT NOT NULL,
  plan        TEXT NOT NULL DEFAULT 'trial',
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS learners (
  id             TEXT PRIMARY KEY,
  tenant_id      TEXT NOT NULL,
  name           TEXT NOT NULL,
  gender         TEXT NOT NULL DEFAULT 'Male',
  stream         TEXT NOT NULL,
  grade_level    TEXT NOT NULL,
  admission_no   TEXT NOT NULL,
  nemis_upi      TEXT,
  knec_no        TEXT,
  guardian_phone TEXT,
  fee_total      INTEGER NOT NULL DEFAULT 0,
  fee_paid       INTEGER NOT NULL DEFAULT 0,
  attendance_pct INTEGER NOT NULL DEFAULT 100,
  boarding       INTEGER NOT NULL DEFAULT 0,
  admission_fee_paid INTEGER NOT NULL DEFAULT 0,
  additional_fees INTEGER NOT NULL DEFAULT 0,
  created_at     TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_learners_tenant_adm
  ON learners (tenant_id, admission_no);
CREATE INDEX IF NOT EXISTS idx_learners_tenant_stream
  ON learners (tenant_id, stream);

CREATE TABLE IF NOT EXISTS marks (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id   TEXT NOT NULL,
  learner_id  TEXT NOT NULL,
  subject_id  TEXT NOT NULL,
  score       INTEGER NOT NULL,
  rubric      TEXT NOT NULL,
  points      INTEGER NOT NULL,
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_marks_unique
  ON marks (tenant_id, learner_id, subject_id);
CREATE INDEX IF NOT EXISTS idx_marks_tenant_subject
  ON marks (tenant_id, subject_id);

CREATE TABLE IF NOT EXISTS attendance (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id   TEXT NOT NULL,
  learner_id  TEXT NOT NULL,
  day         TEXT NOT NULL,
  status      TEXT NOT NULL,
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_attendance_unique
  ON attendance (tenant_id, learner_id, day);
CREATE INDEX IF NOT EXISTS idx_attendance_tenant_day
  ON attendance (tenant_id, day);

CREATE TABLE IF NOT EXISTS observations (
  id          TEXT PRIMARY KEY,
  tenant_id   TEXT NOT NULL,
  learner_id  TEXT NOT NULL,
  day         TEXT NOT NULL,
  note        TEXT NOT NULL,
  author      TEXT NOT NULL DEFAULT '',
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_obs_tenant ON observations (tenant_id, created_at);

CREATE TABLE IF NOT EXISTS payments (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id   TEXT NOT NULL,
  learner_id  TEXT NOT NULL,
  amount      INTEGER NOT NULL,
  phone       TEXT,
  reference   TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_payments_tenant ON payments (tenant_id, created_at);

-- School staff accounts: the admin creates each teacher's initial login.
-- Usernames are globally unique so a teacher session can be resolved before
-- the tenant is known; passwords are never stored in plaintext (PBKDF2).
CREATE TABLE IF NOT EXISTS staff (
  id                TEXT PRIMARY KEY,
  tenant_id         TEXT NOT NULL,
  name              TEXT NOT NULL,
  username          TEXT NOT NULL,
  password_hash     TEXT NOT NULL,
  salt              TEXT NOT NULL,
  must_change_login INTEGER NOT NULL DEFAULT 1,
  active            INTEGER NOT NULL DEFAULT 1,
  created_at        TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_staff_username ON staff (username);
CREATE INDEX IF NOT EXISTS idx_staff_tenant ON staff (tenant_id, name);

-- The classes (streams) an admin puts a teacher in charge of. A teacher's
-- class selector and every query they can run is limited to these rows.
CREATE TABLE IF NOT EXISTS staff_classes (
  staff_id  TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  stream    TEXT NOT NULL,
  PRIMARY KEY (staff_id, stream)
);

-- The services (modules) an admin grants a teacher. This is exactly what the
-- teacher sees on their dashboard navigation.
CREATE TABLE IF NOT EXISTS staff_services (
  staff_id  TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  service   TEXT NOT NULL,
  PRIMARY KEY (staff_id, service)
);

-- Teacher sign-in sessions (admin signs in with Sign in with Freebuff).
-- Only the SHA-256 of the cookie token is stored.
CREATE TABLE IF NOT EXISTS staff_sessions (
  token_hash TEXT PRIMARY KEY,
  staff_id   TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_staff_sessions_staff ON staff_sessions (staff_id);

-- The school's standard lesson plan: sections are a JSON array of
-- {key,label} written by the admin (keys are positional: sec1..secN).
CREATE TABLE IF NOT EXISTS lesson_plan_templates (
  tenant_id  TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  sections   TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Lesson plans themselves. `content` is JSON keyed by section key, so the
-- end-of-lesson remarks and every other block are stored per lesson.
CREATE TABLE IF NOT EXISTS lesson_plans (
  id          TEXT PRIMARY KEY,
  tenant_id   TEXT NOT NULL,
  staff_id    TEXT NOT NULL DEFAULT '',
  author      TEXT NOT NULL DEFAULT '',
  stream      TEXT NOT NULL,
  subject_id  TEXT NOT NULL,
  lesson_date TEXT NOT NULL,
  topic       TEXT NOT NULL,
  content     TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_lp_tenant_date ON lesson_plans (tenant_id, lesson_date);
CREATE INDEX IF NOT EXISTS idx_lp_tenant_stream ON lesson_plans (tenant_id, stream);

CREATE TABLE IF NOT EXISTS sms_log (
  id          TEXT PRIMARY KEY,
  tenant_id   TEXT NOT NULL,
  learner_id  TEXT NOT NULL,
  phone       TEXT NOT NULL,
  message     TEXT NOT NULL,
  status      TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_sms_tenant ON sms_log (tenant_id, created_at);

-- WhatsApp outbox, sent through Evolution API (POST /message/sendText/{instance}).
-- sms_log above is kept for history only — it is no longer written.
CREATE TABLE IF NOT EXISTS whatsapp_log (
  id          TEXT PRIMARY KEY,
  tenant_id   TEXT NOT NULL,
  learner_id  TEXT NOT NULL,
  phone       TEXT NOT NULL,
  message     TEXT NOT NULL,
  status      TEXT NOT NULL,
  error       TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_wa_tenant ON whatsapp_log (tenant_id, created_at);

-- Schemes of work: one row per class/subject/term/week, matching the KICD
-- scheme format. Teachers write rows for their assigned classes; admins write
-- any. `staff_id` is the author's staff row ('' when an admin wrote it).
CREATE TABLE IF NOT EXISTS scheme_rows (
  id          TEXT PRIMARY KEY,
  tenant_id   TEXT NOT NULL,
  staff_id    TEXT NOT NULL DEFAULT '',
  author      TEXT NOT NULL DEFAULT '',
  stream      TEXT NOT NULL,
  subject_id  TEXT NOT NULL,
  term        TEXT NOT NULL,
  week        INTEGER NOT NULL,
  strand      TEXT NOT NULL DEFAULT '',
  sub_strand  TEXT NOT NULL DEFAULT '',
  outcomes    TEXT NOT NULL DEFAULT '',
  experiences TEXT NOT NULL DEFAULT '',
  inquiry     TEXT NOT NULL DEFAULT '',
  resources   TEXT NOT NULL DEFAULT '',
  assessment  TEXT NOT NULL DEFAULT '',
  remarks     TEXT NOT NULL DEFAULT '',
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_scheme_unique
  ON scheme_rows (tenant_id, stream, subject_id, term, week);
CREATE INDEX IF NOT EXISTS idx_scheme_tenant ON scheme_rows (tenant_id, stream);

-- Timetable: the admin defines teaching periods and places lessons in the
-- grid, assigning each to a teacher (staff_id). Teachers read their own rows.
CREATE TABLE IF NOT EXISTS timetable_periods (
  tenant_id  TEXT NOT NULL,
  position   INTEGER NOT NULL,
  label      TEXT NOT NULL,
  starts_at  TEXT NOT NULL,
  ends_at    TEXT NOT NULL,
  PRIMARY KEY (tenant_id, position)
);

CREATE TABLE IF NOT EXISTS timetable_entries (
  id           TEXT PRIMARY KEY,
  tenant_id    TEXT NOT NULL,
  day          TEXT NOT NULL,
  period       INTEGER NOT NULL,
  stream       TEXT NOT NULL,
  subject_id   TEXT NOT NULL,
  staff_id     TEXT NOT NULL DEFAULT '',
  room         TEXT NOT NULL DEFAULT '',
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_tt_unique
  ON timetable_entries (tenant_id, day, period);
CREATE INDEX IF NOT EXISTS idx_tt_tenant ON timetable_entries (tenant_id, day);
CREATE INDEX IF NOT EXISTS idx_tt_staff ON timetable_entries (staff_id);

-- Record of work: what actually got taught (scheme vs reality, absences,
-- homework, end-of-lesson remarks). Teacher-authored, class-scoped.
CREATE TABLE IF NOT EXISTS record_of_work (
  id          TEXT PRIMARY KEY,
  tenant_id   TEXT NOT NULL,
  staff_id    TEXT NOT NULL DEFAULT '',
  author      TEXT NOT NULL DEFAULT '',
  stream      TEXT NOT NULL,
  subject_id  TEXT NOT NULL,
  day         TEXT NOT NULL,
  topic       TEXT NOT NULL,
  strand      TEXT NOT NULL DEFAULT '',
  class_size  INTEGER NOT NULL DEFAULT 0,
  absences    TEXT NOT NULL DEFAULT '',
  homework    TEXT NOT NULL DEFAULT '',
  remarks     TEXT NOT NULL DEFAULT '',
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_row_tenant ON record_of_work (tenant_id, day);
CREATE INDEX IF NOT EXISTS idx_row_stream ON record_of_work (tenant_id, stream);

-- Learners' progress records: narrative competency snapshots per learner.
CREATE TABLE IF NOT EXISTS progress_records (
  id          TEXT PRIMARY KEY,
  tenant_id   TEXT NOT NULL,
  learner_id  TEXT NOT NULL,
  staff_id    TEXT NOT NULL DEFAULT '',
  author      TEXT NOT NULL DEFAULT '',
  subject_id  TEXT NOT NULL,
  term        TEXT NOT NULL DEFAULT '',
  day         TEXT NOT NULL,
  stage       TEXT NOT NULL,
  note        TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_progress_learner ON progress_records (learner_id, created_at);
CREATE INDEX IF NOT EXISTS idx_progress_tenant ON progress_records (tenant_id, created_at);

-- Fee configuration per grade level (boarding/day differentiation)
CREATE TABLE IF NOT EXISTS fee_config (
  id          TEXT PRIMARY KEY,
  tenant_id   TEXT NOT NULL,
  grade_level TEXT NOT NULL,
  fee_amount  INTEGER NOT NULL DEFAULT 0,
  boarding_fee INTEGER NOT NULL DEFAULT 0,
  day_fee     INTEGER NOT NULL DEFAULT 0,
  admission_fee INTEGER NOT NULL DEFAULT 0,
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_fee_config_unique ON fee_config (tenant_id, grade_level);

-- KICD curriculum designs: the official framework strands teachers pick from
-- when writing schemes and lesson plans. Category separates the Regular and
-- SNE designs; admins maintain the library, teachers browse it.
CREATE TABLE IF NOT EXISTS kicd_designs (
  id           TEXT PRIMARY KEY,
  tenant_id    TEXT NOT NULL,
  category     TEXT NOT NULL,
  level        TEXT NOT NULL,
  grade        TEXT NOT NULL DEFAULT '',
  subject_id   TEXT NOT NULL,
  strand       TEXT NOT NULL,
  sub_strand   TEXT NOT NULL DEFAULT '',
  outcomes     TEXT NOT NULL DEFAULT '',
  competencies TEXT NOT NULL DEFAULT '',
  standards    TEXT NOT NULL DEFAULT '',
  inquiry      TEXT NOT NULL DEFAULT '',
  resources    TEXT NOT NULL DEFAULT '',
  inclusive    TEXT NOT NULL DEFAULT '',
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_kicd_tenant ON kicd_designs (tenant_id, category, level);


