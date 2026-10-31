import { createFreebuffAuth, isSameOriginRequest } from '@freebuff/auth';
import schemaSql from '../schema.sql';
import {
  SUBJECT_BY_ID, subjectsForGrade, rubricFor, PLAN_SPECS,
} from './curriculum.js';

/**
 * ElimuTrack Enterprise — Cloudflare Worker
 *
 * Shape: auth.wrap(handler) → API routes → static assets.
 * Every /api/* route resolves the tenant from `user.sub`; the client can
 * never name another tenant's data.
 */

let auth;
let app;
let schemaReady = false;

const json = (body, init = {}) =>
  new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store', ...init.headers },
    ...init,
  });

const err = (status, code, message) => json({ error: message, code }, { status });

const uuid = () => crypto.randomUUID();

function planOf(tenant) {
  return PLAN_SPECS[tenant.plan] || PLAN_SPECS.trial;
}

/* --------------------------------------------------------- roles & access */

/** Every module an admin can grant a teacher. Keys are stable API/UI ids. */
const SERVICES = [
  'dashboard', 'marks', 'lesson_plans', 'attendance', 'observations',
  'broadsheet', 'learners', 'reportcards', 'pathways', 'fees', 'whatsapp',
  'schemes', 'timetable', 'recordwork', 'progress', 'kicd',
];

/** Which service a read/write route requires before a teacher may touch it. */
const SERVICE_BY_PATH = {
  '/api/dashboard': 'dashboard',
  '/api/marks': 'marks',
  '/api/attendance': 'attendance',
  '/api/observations': 'observations',
  '/api/broadsheet': 'broadsheet',
  '/api/broadsheet/csv': 'broadsheet',
  '/api/learners': 'learners',
  '/api/payments': 'fees',
  '/api/whatsapp': 'whatsapp',
  '/api/schemes': 'schemes',
  '/api/timetable': 'timetable',
  '/api/timetable/entry': 'timetable',
  '/api/timetable/periods': 'timetable',
  '/api/recordwork': 'recordwork',
  '/api/progress': 'progress',
  '/api/kicd': 'kicd',
  '/api/resources': 'kicd',
  '/api/klb/books': 'kicd',
  '/api/klb/topics': 'kicd',
  '/api/lesson-plans': 'lesson_plans',
  '/api/reportcards': 'reportcards',
  '/api/pathways': 'pathways',
};

/** Admin-only routes: a teacher session can never reach them (or anything nested under them). */
const ADMIN_PATHS = ['/api/staff', '/api/plan', '/api/seed'];

const STAFF_COOKIE = 'elmt_staff';
const SESSION_DAYS = 7;
const te = new TextEncoder();

const hexOf = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
const unhex = (s) => Uint8Array.from((s.match(/.{1,2}/g) || []).map((h) => parseInt(h, 16)));
const nowIso = () => new Date().toISOString();

async function sha256Hex(text) {
  return hexOf(await crypto.subtle.digest('SHA-256', te.encode(text)));
}

async function hashPassword(password, saltHex) {
  const key = await crypto.subtle.importKey('raw', te.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: unhex(saltHex), iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    key,
    256,
  );
  return hexOf(bits);
}

/**
 * Workers Free rejects PBKDF2 above 100,000 iterations in production (local
 * Miniflare does not enforce the cap, so only production surfaces it).
 */
const PBKDF2_ITERATIONS = 60000;

const newSalt = () => hexOf(crypto.getRandomValues(new Uint8Array(16)));
const newToken = () => hexOf(crypto.getRandomValues(new Uint8Array(32)));

function cookiesOf(request) {
  const out = {};
  for (const part of (request.headers.get('Cookie') || '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

function staffCookie(token, env) {
  const secure = /^https:/.test(env.APP_ORIGIN || '') ? '; Secure' : '';
  return `${STAFF_COOKIE}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${SESSION_DAYS * 86400}${secure}`;
}

function clearStaffCookie(env) {
  const secure = /^https:/.test(env.APP_ORIGIN || '') ? '; Secure' : '';
  return `${STAFF_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secure}`;
}

/** JSON response carrying a Set-Cookie header (json() would drop it). */
function jsonWithCookie(body, cookie, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'private, no-store',
      'Set-Cookie': cookie,
    },
  });
}

/**
 * Resolve who is asking and what they may see.
 *  - admin  — the Freebuff account that owns the tenant: every service, all classes
 *  - teacher — a staff session cookie: only granted services and assigned classes
 */
async function teacherAccess(env, staff) {
  const tenant = await env.DB.prepare('SELECT * FROM tenants WHERE id = ?').bind(staff.tenant_id).first();
  if (!tenant) return null;
  const [classes, services] = await Promise.all([
    env.DB.prepare('SELECT stream FROM staff_classes WHERE staff_id = ? ORDER BY stream').bind(staff.id).all(),
    env.DB.prepare('SELECT service FROM staff_services WHERE staff_id = ?').bind(staff.id).all(),
  ]);
  return {
    tenant,
    spec: planOf(tenant),
    role: 'teacher',
    staff,
    streams: classes.results.map((r) => r.stream),
    services: new Set(services.results.map((r) => r.service)),
  };
}

async function accessFor(env, user, request) {
  const staff = await staffFromRequest(env, request);
  if (staff) {
    if (!staff.active) return null;
    return teacherAccess(env, staff);
  }
  if (user) {
    const tenant = await ensureTenant(env, user);
    return {
      tenant,
      spec: planOf(tenant),
      role: 'admin',
      staff: null,
      streams: null, // null = every class in the school
      services: new Set(SERVICES),
    };
  }
  return null;
}

async function staffFromRequest(env, request) {
  const token = cookiesOf(request)[STAFF_COOKIE];
  if (!token) return null;
  const tokenHash = await sha256Hex(token);
  const row = await env.DB.prepare(
    `SELECT s.id, s.tenant_id, s.name, s.username, s.must_change_login, s.active, x.expires_at
       FROM staff_sessions x JOIN staff s ON s.id = x.staff_id
      WHERE x.token_hash = ?`,
  ).bind(tokenHash).first();
  if (!row) return null;
  if (row.expires_at <= nowIso()) {
    await env.DB.prepare('DELETE FROM staff_sessions WHERE token_hash = ?').bind(tokenHash).run();
    return null;
  }
  return {
    id: row.id,
    tenant_id: row.tenant_id,
    name: row.name,
    username: row.username,
    must_change_login: row.must_change_login,
    active: row.active,
  };
}

function sessionPayload(access, user) {
  if (!access) {
    return {
      authenticated: false, user: null, tenant: null,
      role: 'guest', services: [], streams: null, staff: null,
    };
  }
  const tenant = {
    id: access.tenant.id,
    name: access.tenant.name,
    plan: access.tenant.plan,
    owner_sub: access.tenant.owner_sub,
  };
  if (access.role === 'teacher') {
    return {
      authenticated: true,
      user: { sub: `staff:${access.staff.id}`, name: access.staff.name, email: access.staff.username },
      tenant,
      role: 'teacher',
      services: SERVICES.filter((s) => access.services.has(s)),
      streams: access.streams,
      staff: {
        id: access.staff.id,
        name: access.staff.name,
        username: access.staff.username,
        mustChangeLogin: !!access.staff.must_change_login,
      },
    };
  }
  return {
    authenticated: true,
    user: { sub: user.sub, name: user.name || '', email: user.email || '' },
    tenant,
    role: 'admin',
    services: SERVICES,
    streams: null,
    staff: null,
  };
}

/** SQL fragment limiting a query to a teacher's assigned classes. */
function scopeClause(access, alias = '') {
  if (access.role === 'admin') return { clause: '', binds: [] };
  if (!access.streams.length) return { clause: ' AND 1 = 0 ', binds: [] }; // no classes assigned
  const ph = access.streams.map(() => '?').join(',');
  return { clause: ` AND ${alias}stream IN (${ph})`, binds: [...access.streams] };
}

/** Server-side guard: a teacher may only write rows for their own classes. */
async function assertLearnersInScope(env, access, ids) {
  if (access.role === 'admin') return null;
  const unique = [...new Set((ids || []).map(String))];
  if (!unique.length) return null;
  if (!access.streams.length) return err(403, 'NO_CLASSES', 'You have no classes assigned yet');
  const idPh = unique.map(() => '?').join(',');
  const stPh = access.streams.map(() => '?').join(',');
  const res = await env.DB.prepare(
    `SELECT id FROM learners WHERE tenant_id = ? AND id IN (${idPh}) AND stream IN (${stPh})`,
  ).bind(access.tenant.id, ...unique, ...access.streams).all();
  if (res.results.length !== unique.length) {
    return err(403, 'OUT_OF_SCOPE', 'That learner is outside your assigned classes');
  }
  return null;
}

/**
 * Columns added after a table was first created. `CREATE TABLE IF NOT EXISTS`
 * never alters an existing table, so a database created by an earlier build
 * would otherwise be missing these and every SELECT naming them fails.
 * Applied one at a time so an already-present column is a harmless no-op.
 */
const COLUMN_MIGRATIONS = [
  ['learners', 'boarding', 'INTEGER NOT NULL DEFAULT 0'],
  ['learners', 'admission_fee_paid', 'INTEGER NOT NULL DEFAULT 0'],
  ['learners', 'additional_fees', 'INTEGER NOT NULL DEFAULT 0'],
  ['fee_config', 'fee_amount', 'INTEGER NOT NULL DEFAULT 0'],
  ['fee_config', 'boarding_fee', 'INTEGER NOT NULL DEFAULT 0'],
  ['fee_config', 'day_fee', 'INTEGER NOT NULL DEFAULT 0'],
  ['fee_config', 'admission_fee', 'INTEGER NOT NULL DEFAULT 0'],
  ['lesson_plans', 'sub_strand', "TEXT NOT NULL DEFAULT ''"],
  ['kicd_designs', 'experiences', "TEXT NOT NULL DEFAULT ''"],
  // Curriculum provenance: whether a design is official KICD content, school
  // entered, or (until verified) sample data — plus where it came from.
  ['kicd_designs', 'origin', "TEXT NOT NULL DEFAULT 'school'"],
  ['kicd_designs', 'source_url', "TEXT NOT NULL DEFAULT ''"],
  ['kicd_designs', 'source_title', "TEXT NOT NULL DEFAULT ''"],
  ['kicd_designs', 'version_label', "TEXT NOT NULL DEFAULT ''"],
  ['kicd_designs', 'version_date', "TEXT NOT NULL DEFAULT ''"],
  ['kicd_designs', 'last_checked_at', "TEXT NOT NULL DEFAULT ''"],
  ['kicd_designs', 'status', "TEXT NOT NULL DEFAULT 'active'"],
  // Marks that a tenant seeded before the Grade 1 pilot existed has been
  // backfilled, so the one-time backfill never resurrects deleted rows.
  ['tenants', 'kicd_pilot_backfilled', 'INTEGER NOT NULL DEFAULT 0'],
  ['progress_records', 'strand', "TEXT NOT NULL DEFAULT ''"],
  ['progress_records', 'sub_strand', "TEXT NOT NULL DEFAULT ''"],
];

async function ensureSchema(env) {
  if (schemaReady) return;
  // D1's exec() splits the script in a way that breaks multi-line CREATE TABLE
  // statements, so split on ';' ourselves and run them as one batch. All schema
  // statements are idempotent (IF NOT EXISTS / CREATE UNIQUE INDEX IF NOT EXISTS).
  const sql = schemaSql
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n');
  const statements = sql.split(';').map((s) => s.trim()).filter(Boolean);
  await env.DB.batch(statements.map((s) => env.DB.prepare(s)));

  for (const [table, column, definition] of COLUMN_MIGRATIONS) {
    try {
      await env.DB.prepare(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`).run();
    } catch {
      // Column already exists — the only expected failure here.
    }
  }
  // Fix timetable unique constraint to include stream
  try {
    await env.DB.prepare('DROP INDEX IF EXISTS idx_tt_unique').run();
    await env.DB.prepare('CREATE UNIQUE INDEX IF NOT EXISTS idx_tt_unique ON timetable_entries (tenant_id, day, period, stream)').run();
  } catch {
    // ignore
  }
  schemaReady = true;
}

async function ensureTenant(env, user) {
  const existing = await env.DB.prepare('SELECT * FROM tenants WHERE owner_sub = ?').bind(user.sub).first();
  if (existing) return existing;

  const base = (user.name || user.email || 'My School').split('@')[0].trim() || 'My School';
  const tenant = {
    id: uuid(),
    name: `${base}'s School`,
    owner_sub: user.sub,
    plan: 'trial',
  };
  try {
    await env.DB.prepare(
      'INSERT INTO tenants (id, name, owner_sub, plan) VALUES (?, ?, ?, ?)',
    ).bind(tenant.id, tenant.name, tenant.owner_sub, tenant.plan).run();
  } catch {
    // Lost a race with a parallel first request — re-read.
    return env.DB.prepare('SELECT * FROM tenants WHERE owner_sub = ?').bind(user.sub).first();
  }
  return tenant;
}

/* ------------------------------------------------------------------ reads */

async function listLearners(env, access) {
  const scope = scopeClause(access);
  const res = await env.DB.prepare(
    `SELECT id, name, gender, stream, grade_level, admission_no, nemis_upi, knec_no,
            guardian_phone, fee_total, fee_paid, attendance_pct, boarding, admission_fee_paid, additional_fees
       FROM learners WHERE tenant_id = ?${scope.clause} ORDER BY stream, name`,
  ).bind(access.tenant.id, ...scope.binds).all();
  return res.results.map((r) => ({
    id: r.id,
    name: r.name,
    gender: r.gender,
    stream: r.stream,
    gradeLevel: r.grade_level,
    admissionNo: r.admission_no,
    nemisUpi: r.nemis_upi || '',
    knecNo: r.knec_no || '',
    guardianPhone: r.guardian_phone || '',
    feeTotal: r.fee_total,
    feePaid: r.fee_paid,
    feeBalance: Math.max(0, r.fee_total - r.fee_paid),
    attendancePct: r.attendance_pct,
    boarding: r.boarding === 1 || r.boarding === true,
    admissionFeePaid: r.admission_fee_paid === 1 || r.admission_fee_paid === true,
    additionalFees: r.additional_fees || 0,
  }));
}

async function listMarks(env, access, { stream, learnerId }) {
  const clauses = ['m.tenant_id = ?'];
  const binds = [access.tenant.id];
  if (learnerId) {
    clauses.push('m.learner_id = ?');
    binds.push(learnerId);
  }
  if (stream) {
    clauses.push('l.stream = ?');
    binds.push(stream);
  }
  const scope = scopeClause(access, 'l.');
  if (scope.clause) {
    clauses.push(`l.stream IN (${access.streams.map(() => '?').join(',')})`);
    binds.push(...scope.binds);
  }
  const res = await env.DB.prepare(
    `SELECT m.learner_id, m.subject_id, m.score, m.rubric, m.points
       FROM marks m JOIN learners l ON l.id = m.learner_id
      WHERE ${clauses.join(' AND ')}`,
  ).bind(...binds).all();
  return res.results.map((r) => ({
    learnerId: r.learner_id,
    subjectId: r.subject_id,
    score: r.score,
    rubric: r.rubric,
    points: r.points,
  }));
}

async function dashboard(env, access, stream) {
  const tenantId = access.tenant.id;
  const scope = scopeClause(access);
  const learnerRes = await env.DB.prepare(
    `SELECT COUNT(*) AS n FROM learners WHERE tenant_id = ?${scope.clause}`,
  ).bind(tenantId, ...scope.binds).first();

  const markClause = stream ? 'AND l.stream = ?' : '';
  const markBinds = stream ? [tenantId, stream] : [tenantId];
  const mScope = scopeClause(access, 'l.');
  const means = await env.DB.prepare(
    `SELECT m.subject_id AS sid, AVG(m.score) AS mean
       FROM marks m JOIN learners l ON l.id = m.learner_id
      WHERE m.tenant_id = ? ${markClause}${mScope.clause} GROUP BY m.subject_id`,
  ).bind(...markBinds, ...mScope.binds).all();

  const rubric = await env.DB.prepare(
    `SELECT m.rubric AS band, COUNT(*) AS count
       FROM marks m JOIN learners l ON l.id = m.learner_id
      WHERE m.tenant_id = ? ${markClause}${mScope.clause} GROUP BY m.rubric`,
  ).bind(...markBinds, ...mScope.binds).all();

  const attClause = stream ? 'AND l.stream = ?' : '';
  const attBinds = stream ? [tenantId, stream] : [tenantId];
  const att = await env.DB.prepare(
    `SELECT
        SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) AS present,
        COUNT(*) AS total,
        COUNT(DISTINCT a.day) AS days
       FROM attendance a JOIN learners l ON l.id = a.learner_id
      WHERE a.tenant_id = ? ${attClause}${mScope.clause}`,
  ).bind(...attBinds, ...mScope.binds).first();

  const feeClause = stream ? 'AND stream = ?' : '';
  const feeBinds = stream ? [tenantId, stream] : [tenantId];
  const fees = await env.DB.prepare(
    `SELECT COALESCE(SUM(MAX(fee_total - fee_paid, 0)), 0) AS outstanding
       FROM learners WHERE tenant_id = ? ${feeClause}${scope.clause}`,
  ).bind(...feeBinds, ...scope.binds).first();

  return {
    learners: learnerRes?.n ?? 0,
    subjects: (means.results || [])
      .filter((m) => SUBJECT_BY_ID[m.sid])
      .map((m) => ({
        code: SUBJECT_BY_ID[m.sid].code,
        name: SUBJECT_BY_ID[m.sid].name,
        mean: Math.round(m.mean || 0),
      })),
    rubric: ['EE', 'ME', 'AE', 'BE'].map((band) => ({
      band,
      count: (rubric.results || []).find((r) => r.band === band)?.count || 0,
    })),
    attendancePct: att && att.total ? Math.round((att.present / att.total) * 100) : 0,
    presentDays: att?.days ?? 0,
    totalDays: att?.days ?? 0,
    outstandingFees: fees?.outstanding ?? 0,
  };
}

/* ----------------------------------------------------------------- writes */

async function createLearner(env, access, body, spec) {
  const name = String(body.name || '').trim();
  const admissionNo = String(body.admissionNo || '').trim();
  if (!name || !admissionNo) return err(400, 'VALIDATION', 'Learner name and admission number are required');

  const stream = String(body.stream || 'Grade 7 Eta');
  if (access.role === 'teacher' && !access.streams.includes(stream)) {
    return err(403, 'OUT_OF_SCOPE', 'You can only add learners to your assigned classes');
  }
  const tenant = access.tenant;

  const count = await env.DB.prepare('SELECT COUNT(*) AS n FROM learners WHERE tenant_id = ?')
    .bind(tenant.id).first();
  if ((count?.n ?? 0) >= spec.maxLearners) {
    return err(403, 'PLAN_LEARNER_LIMIT', `Your plan allows up to ${spec.maxLearners} learners`);
  }

  const gradeLevel = String(body.gradeLevel || stream.split(' ').slice(0, 2).join(' '));
  const id = `lrn_${uuid()}`;
  const isBoarding = body.boarding === true || body.isBoarding === true || body.boarding === 1;
  const admissionFeePaid = body.admissionFeePaid === true || body.admissionFeePaid === 1;
  const additionalFees = Number(body.additionalFees || body.additional_fees || 0) || 0;
  const baseFee = await PRIMARY_OR_JSS_FEE(env, tenant.id, gradeLevel, isBoarding);
  const totalFee = baseFee + additionalFees;

  try {
    await env.DB.prepare(
      `INSERT INTO learners (id, tenant_id, name, gender, stream, grade_level, admission_no,
                             nemis_upi, knec_no, guardian_phone, fee_total, fee_paid, attendance_pct, boarding, admission_fee_paid, additional_fees)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 100, ?, ?, ?)`,
    ).bind(
      id, tenant.id, name, String(body.gender || 'Male'), stream, gradeLevel, admissionNo,
      String(body.nemisUpi || ''), String(body.knecNo || ''), String(body.guardianPhone || ''),
      totalFee, isBoarding ? 1 : 0, admissionFeePaid ? 1 : 0, additionalFees,
    ).run();
  } catch (e) {
    const msg = String(e && e.message);
    if (msg.includes('UNIQUE')) return err(409, 'DUPLICATE_ADMISSION', 'That admission number already exists in this school');
    throw e;
  }

  const row = await env.DB.prepare(
    `SELECT id, name, gender, stream, grade_level, admission_no, nemis_upi, knec_no,
            guardian_phone, fee_total, fee_paid, attendance_pct, boarding, admission_fee_paid, additional_fees
       FROM learners WHERE id = ? AND tenant_id = ?`,
  ).bind(id, tenant.id).first();

  return json({
    learner: {
      id: row.id, name: row.name, gender: row.gender, stream: row.stream,
      gradeLevel: row.grade_level, admissionNo: row.admission_no, nemisUpi: row.nemis_upi || '',
      knecNo: row.knec_no || '', guardianPhone: row.guardian_phone || '',
      feeTotal: row.fee_total, feePaid: row.fee_paid,
      feeBalance: Math.max(0, row.fee_total - row.fee_paid), attendancePct: row.attendance_pct,
      boarding: row.boarding === 1 || row.boarding === true,
      admissionFeePaid: row.admission_fee_paid === 1 || row.admission_fee_paid === true,
      additionalFees: row.additional_fees || 0,
    },
  }, { status: 201 });
}

async function getFeeConfig(env, tenantId) {
  const res = await env.DB.prepare(
    'SELECT grade_level, fee_amount, boarding_fee, day_fee, admission_fee FROM fee_config WHERE tenant_id = ?'
  ).bind(tenantId).all();
  const config = {};
  for (const row of res.results) {
    config[row.grade_level] = {
      feeAmount: row.fee_amount || 0,
      boardingFee: row.boarding_fee || 0,
      dayFee: row.day_fee || 0,
      admissionFee: row.admission_fee || 0,
    };
  }
  // Defaults if not configured
  const defaults = {
    'Grade 1': { feeAmount: 32000, dayFee: 32000, boardingFee: 45000, admissionFee: 2000 },
    'Grade 2': { feeAmount: 32000, dayFee: 32000, boardingFee: 45000, admissionFee: 2000 },
    'Grade 3': { feeAmount: 32000, dayFee: 32000, boardingFee: 45000, admissionFee: 2000 },
    'Grade 4': { feeAmount: 32000, dayFee: 32000, boardingFee: 45000, admissionFee: 2000 },
    'Grade 5': { feeAmount: 32000, dayFee: 32000, boardingFee: 45000, admissionFee: 2000 },
    'Grade 6': { feeAmount: 32000, dayFee: 32000, boardingFee: 45000, admissionFee: 2000 },
    'Grade 7': { feeAmount: 45000, dayFee: 45000, boardingFee: 55000, admissionFee: 2500 },
    'Grade 8': { feeAmount: 45000, dayFee: 45000, boardingFee: 55000, admissionFee: 2500 },
    'Grade 9': { feeAmount: 45000, dayFee: 45000, boardingFee: 55000, admissionFee: 2500 },
  };
  for (const [grade, def] of Object.entries(defaults)) {
    if (!config[grade]) config[grade] = def;
  }
  return config;
}

async function saveFeeConfig(env, access, body) {
  if (access.role !== 'admin') return err(403, 'FORBIDDEN', 'Only the administrator can configure fees');
  const tenantId = access.tenant.id;
  const configs = Array.isArray(body.configs) ? body.configs : [];
  const stmts = [];
  for (const cfg of configs) {
    const gradeLevel = String(cfg.gradeLevel || '');
    if (!gradeLevel) continue;
    const id = `fee_${tenantId}_${gradeLevel.replace(/\s+/g, '_')}`;
    stmts.push(
      env.DB.prepare(
        `INSERT INTO fee_config (id, tenant_id, grade_level, fee_amount, boarding_fee, day_fee, admission_fee)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(tenant_id, grade_level)
         DO UPDATE SET fee_amount = excluded.fee_amount, boarding_fee = excluded.boarding_fee,
                       day_fee = excluded.day_fee, admission_fee = excluded.admission_fee,
                       updated_at = datetime('now')`,
      ).bind(
        id, tenantId, gradeLevel,
        Number(cfg.feeAmount || 0),
        Number(cfg.boardingFee || 0),
        Number(cfg.dayFee || 0),
        Number(cfg.admissionFee || 0),
      )
    );
  }
  if (stmts.length) await env.DB.batch(stmts);
  return json({ ok: true, saved: stmts.length });
}

async function PRIMARY_OR_JSS_FEE(env, tenantId, gradeLevel, isBoarding) {
  const config = await getFeeConfig(env, tenantId);
  const grade = config[gradeLevel] || config[Object.keys(config)[0]];
  if (!grade) return 45000;
  if (isBoarding) return grade.boardingFee || grade.feeAmount || 45000;
  return grade.dayFee || grade.feeAmount || 45000;
}

async function saveMarks(env, access, items) {
  if (!Array.isArray(items) || items.length === 0) return err(400, 'VALIDATION', 'No marks supplied');
  const denied = await assertLearnersInScope(env, access, items.map((i) => i.learnerId));
  if (denied) return denied;
  const tenant = access.tenant;
  const stmts = [];
  for (const item of items) {
    const score = Number(item.score);
    if (!Number.isInteger(score) || score < 0 || score > 100) {
      return err(400, 'VALIDATION', 'Scores must be whole numbers between 0 and 100');
    }
    if (!SUBJECT_BY_ID[item.subjectId]) return err(400, 'VALIDATION', 'Unknown learning area');
    const { rubric, points } = rubricFor(score);
    stmts.push(
      env.DB.prepare(
        `INSERT INTO marks (tenant_id, learner_id, subject_id, score, rubric, points)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(tenant_id, learner_id, subject_id)
         DO UPDATE SET score = excluded.score, rubric = excluded.rubric,
                       points = excluded.points, updated_at = datetime('now')`,
      ).bind(tenant.id, String(item.learnerId), item.subjectId, score, rubric, points),
    );
  }
  await env.DB.batch(stmts);
  return json({ saved: stmts.length });
}

async function saveAttendance(env, access, items) {
  if (!Array.isArray(items) || items.length === 0) return err(400, 'VALIDATION', 'No attendance supplied');
  const denied = await assertLearnersInScope(env, access, items.map((i) => i.learnerId));
  if (denied) return denied;
  const tenant = access.tenant;
  const stmts = [];
  for (const item of items) {
    const status = item.status === 'absent' ? 'absent' : 'present';
    stmts.push(
      env.DB.prepare(
        `INSERT INTO attendance (tenant_id, learner_id, day, status)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(tenant_id, learner_id, day)
         DO UPDATE SET status = excluded.status, updated_at = datetime('now')`,
      ).bind(tenant.id, String(item.learnerId), String(item.day), status),
    );
  }
  await env.DB.batch(stmts);
  return json({ saved: stmts.length });
}

async function saveObservations(env, access, authorName, items) {
  if (!Array.isArray(items) || items.length === 0) return err(400, 'VALIDATION', 'No observations supplied');
  const denied = await assertLearnersInScope(env, access, items.map((i) => i.learnerId));
  if (denied) return denied;
  const tenant = access.tenant;
  const stmts = [];
  let n = 0;
  for (const item of items) {
    const note = String(item.note || '').trim();
    if (!note) continue;
    stmts.push(
      env.DB.prepare(
        'INSERT INTO observations (id, tenant_id, learner_id, day, note, author) VALUES (?, ?, ?, ?, ?, ?)',
      ).bind(uuid(), tenant.id, String(item.learnerId), String(item.day || ''), note, authorName || 'teacher'),
    );
    n++;
  }
  if (!n) return err(400, 'VALIDATION', 'Observation notes cannot be blank');
  await env.DB.batch(stmts);
  return json({ saved: n });
}

async function postPayment(env, access, body) {
  const amount = Number(body.amount);
  if (!Number.isInteger(amount) || amount <= 0) return err(400, 'VALIDATION', 'Payment amount must be a positive whole number');
  const learnerId = String(body.learnerId || '');
  const tenant = access.tenant;
  const denied = await assertLearnersInScope(env, access, [learnerId]);
  if (denied) return denied;
  const learner = await env.DB.prepare('SELECT id, fee_total, fee_paid FROM learners WHERE id = ? AND tenant_id = ?')
    .bind(learnerId, tenant.id).first();
  if (!learner) return err(404, 'NOT_FOUND', 'Learner not found');

  const reference = `MPE${Date.now().toString().slice(-9)}`;
  await env.DB.batch([
    env.DB.prepare(
      'INSERT INTO payments (tenant_id, learner_id, amount, phone, reference) VALUES (?, ?, ?, ?, ?)',
    ).bind(tenant.id, learnerId, amount, String(body.phone || ''), reference),
    env.DB.prepare(
      'UPDATE learners SET fee_paid = fee_paid + ? WHERE id = ? AND tenant_id = ?',
    ).bind(amount, learnerId, tenant.id),
  ]);

  const paid = learner.fee_paid + amount;
  return json({ reference, feePaid: paid, feeBalance: Math.max(0, learner.fee_total - paid) }, { status: 201 });
}

/* ------------------------------------------------------------- whatsapp */

/**
 * Evolution API configuration (self-hosted WhatsApp gateway). All three values
 * come from project secrets set in Sites → Secrets; nothing is exposed to the
 * browser — the client only ever receives a yes/no `configured` flag.
 */
function evolutionConfig(env) {
  const baseUrl = String(env.EVOLUTION_BASE_URL || '').replace(/\/+$/, '');
  const apiKey = String(env.EVOLUTION_API_KEY || '');
  const instance = String(env.EVOLUTION_INSTANCE || '');
  return { baseUrl, apiKey, instance, configured: !!(baseUrl && apiKey && instance) };
}

/**
 * Guardians' numbers are stored as +2547… (or 07…) locally; Evolution wants
 * E.164 digits without '+'. Kenyan landline/mobile prefixes are normalised.
 */
function normalizePhone(raw) {
  const digits = String(raw || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('0')) return `254${digits.slice(1)}`;
  return digits;
}

async function sendWhatsapp(env, access, body, spec) {
  if (!spec.whatsapp) {
    return err(403, 'PLAN_WHATSAPP_LOCKED', 'WhatsApp messaging is not included in your plan');
  }
  const message = String(body.message || '').trim();
  const learnerId = String(body.learnerId || '');
  if (!message || !learnerId) return err(400, 'VALIDATION', 'Choose a recipient and write a message');
  const tenant = access.tenant;
  const denied = await assertLearnersInScope(env, access, [learnerId]);
  if (denied) return denied;

  const learner = await env.DB.prepare(
    'SELECT id, name, guardian_phone FROM learners WHERE id = ? AND tenant_id = ?',
  ).bind(learnerId, tenant.id).first();
  if (!learner) return err(404, 'NOT_FOUND', 'Learner not found');
  if (!learner.guardian_phone) return err(400, 'NO_PHONE', 'This learner has no guardian phone number');

  const cfg = evolutionConfig(env);
  if (!cfg.configured) {
    return err(
      503,
      'NOT_CONFIGURED',
      'WhatsApp is not configured yet — set EVOLUTION_BASE_URL, EVOLUTION_API_KEY and EVOLUTION_INSTANCE in Sites → Secrets, then deploy once',
    );
  }
  const phone = normalizePhone(learner.guardian_phone);
  if (!phone) return err(400, 'NO_PHONE', 'This guardian phone number contains no digits');

  // One attempt: Evolution API v2 — POST /message/sendText/{instance},
  // authenticated only by the `apikey` header, E.164 number without '+'.
  const id = `wa_${uuid()}`;
  let status = 'SENT';
  let failure = '';
  try {
    const res = await fetch(`${cfg.baseUrl}/message/sendText/${encodeURIComponent(cfg.instance)}`, {
      method: 'POST',
      headers: { 'apikey': cfg.apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ number: phone, text: message }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      status = 'FAILED';
      failure = String(await res.text()).slice(0, 300);
    }
  } catch (e) {
    status = 'FAILED';
    failure = String((e && e.message) || 'Evolution API unreachable').slice(0, 300);
  }

  // Every attempt is logged — successes and failures both land in the outbox.
  await env.DB.prepare(
    'INSERT INTO whatsapp_log (id, tenant_id, learner_id, phone, message, status, error) VALUES (?, ?, ?, ?, ?, ?, ?)',
  ).bind(id, tenant.id, learnerId, phone, message, status, failure || null).run();

  if (status === 'FAILED') {
    return err(502, 'WHATSAPP_FAILED', `WhatsApp send failed: ${failure.slice(0, 200)}`);
  }
  return json({
    message: {
      id, learnerId, learnerName: learner.name, phone, message, status,
      createdAt: new Date().toISOString(),
    },
  }, { status: 201 });
}

/* ------------------------------------------------------------- demo seed */

async function seedDemo(env, tenant) {
  const existing = await env.DB.prepare('SELECT COUNT(*) AS n FROM learners WHERE tenant_id = ?')
    .bind(tenant.id).first();
  if ((existing?.n ?? 0) > 0) return err(409, 'ALREADY_SEEDED', 'This school already has learners');

  const first = ['Amina', 'Brian', 'Chloe', 'David', 'Emmanuel', 'Faith', 'Gideon', 'Hassan', 'Irene', 'Joseph',
    'Kevin', 'Lucy', 'Mercy', 'Nathan', 'Olivia', 'Peter', 'Queenie', 'Rashid', 'Sarah', 'Thomas',
    'Valarie', 'William', 'Zipporah', 'Baraka', 'Cynthia'];
  const middle = ['Wanjiku', 'Kipruto', 'Mwende', 'Ochieng', 'Achieng', 'Kipkorir', 'Njeri', 'Omondi', 'Chebet',
    'Kamau', 'Mutua', 'Atieno', 'Kigen', 'Nyambura', 'Odhiambo'];
  const last = ['Mohamed', 'Bett', 'Muthoni', 'Otieno', 'Kariuki', 'Oduor', 'Ndirangu', 'Koech', 'Simiyu',
    'Musyoka', 'Maina', 'Chepkorir', 'Juma', 'Wekesa', 'Ndwiga'];

  const cohorts = [
    { stream: 'Grade 4 Delta', level: 'Grade 4', prefix: 4000 },
    { stream: 'Grade 7 Eta', level: 'Grade 7', prefix: 7000 },
  ];

  const learnerStmts = [];
  const markStmts = [];
  const learners = [];
  let idx = 0;

  for (const cohort of cohorts) {
    const subjects = subjectsForGrade(cohort.level);
    for (let i = 1; i <= 25; i++) {
      idx++;
      const id = `lrn_seed_${cohort.prefix}_${i}`;
      const name = `${first[(i - 1) % first.length]} ${middle[(i + idx) % middle.length]} ${last[(i * 3 + idx) % last.length]}`;
      const gender = i % 2 === 0 ? 'Female' : 'Male';
      const feeTotal = cohort.prefix < 7000 ? 32000 : 45000;
      const feePaid = 15000 + ((i * 700) % 25000);
      const admissionNo = String(cohort.prefix + i);

      learnerStmts.push(
        env.DB.prepare(
          `INSERT INTO learners (id, tenant_id, name, gender, stream, grade_level, admission_no,
                                 nemis_upi, knec_no, guardian_phone, fee_total, fee_paid, attendance_pct)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        ).bind(
          id, tenant.id, name, gender, cohort.stream, cohort.level, admissionNo,
          `NEM-${cohort.prefix + 1000 + i}`, `KNC-2026-${String(idx).padStart(4, '0')}`,
          `+2547${String(10000000 + idx * 13579).slice(0, 8)}`,
          feeTotal, Math.min(feePaid, feeTotal), 88 + (i % 12),
        ),
      );
      learners.push({ id, stream: cohort.stream, i, idx });

      for (const s of subjects) {
        const score = 48 + ((i * 17 + idx * 11) % 51);
        const { rubric, points } = rubricFor(score);
        markStmts.push(
          env.DB.prepare(
            'INSERT INTO marks (tenant_id, learner_id, subject_id, score, rubric, points) VALUES (?, ?, ?, ?, ?, ?)',
          ).bind(tenant.id, id, s.id, score, rubric, points),
        );
      }
    }
  }

  // Ten weekdays of registers: ~92% present.
  const days = [];
  const cursor = new Date();
  while (days.length < 10) {
    const dow = cursor.getDay();
    if (dow !== 0 && dow !== 6) days.push(cursor.toISOString().slice(0, 10));
    cursor.setDate(cursor.getDate() - 1);
  }
  days.reverse();
  const attStmts = [];
  for (const l of learners) {
    for (let d = 0; d < days.length; d++) {
      const absent = (l.i + d + l.idx) % 13 === 0;
      attStmts.push(
        env.DB.prepare(
          'INSERT INTO attendance (tenant_id, learner_id, day, status) VALUES (?, ?, ?, ?)',
        ).bind(tenant.id, l.id, days[d], absent ? 'absent' : 'present'),
      );
    }
  }

  await env.DB.batch([...learnerStmts, ...markStmts, ...attStmts]);
  return json({ seeded: learners.length });
}

/* ------------------------------------------------------------- CSV export */

function toCsv(rows) {
  return rows
    .map((r) => r.map((cell) => {
      const v = cell === null || cell === undefined ? '' : String(cell);
      return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
    }).join(','))
    .join('\r\n');
}

async function broadsheetCsv(env, access, stream, spec) {
  if (!spec.exportCsv) return err(403, 'PLAN_EXPORT_LOCKED', 'CSV export is not included in your plan');

  const learners = (await listLearners(env, access)).filter((l) => !stream || l.stream === stream);
  const marks = await listMarks(env, access, { stream });
  const byLearner = {};
  for (const m of marks) {
    byLearner[m.learnerId] = byLearner[m.learnerId] || {};
    byLearner[m.learnerId][m.subjectId] = m;
  }

  const subjectIds = [...new Set(marks.map((m) => m.subjectId))].filter((id) => SUBJECT_BY_ID[id]);
  const header = [
    'Rank', 'Admission No', 'Learner', 'Stream', 'Gender',
    ...subjectIds.flatMap((id) => [`${SUBJECT_BY_ID[id].code} Score`, `${SUBJECT_BY_ID[id].code} Band`]),
    'Average', 'Attendance %', 'Fee Balance KES',
  ];

  const rows = learners
    .map((l) => {
      const lm = byLearner[l.id] || {};
      const scores = subjectIds.map((id) => lm[id]?.score).filter((s) => typeof s === 'number');
      const avg = scores.length ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : '';
      return {
        l,
        avg: typeof avg === 'number' ? avg : -1,
        cells: [
          '', l.admissionNo, l.name, l.stream, l.gender,
          ...subjectIds.flatMap((id) => [
            lm[id] ? lm[id].score : '',
            lm[id] ? lm[id].rubric : '',
          ]),
          avg, l.attendancePct, l.feeBalance,
        ],
      };
    })
    .sort((a, b) => b.avg - a.avg)
    .map((r, i) => [i + 1, ...r.cells.slice(1)])
    .map((cells) => cells);

  const csv = toCsv([header, ...rows]);
  return new Response(`﻿${csv}`, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="elimutrack-broadsheet-${stream || 'all'}.csv"`,
      'Cache-Control': 'private, no-store',
    },
  });
}

/* ------------------------------------------------------- staff & access  */

const USERNAME_RE = /^[a-z0-9][a-z0-9._-]{2,31}$/;

async function staffWithGrants(env, tenantId) {
  const res = await env.DB.prepare(
    `SELECT id, name, username, must_change_login, active, created_at
       FROM staff WHERE tenant_id = ? ORDER BY name`,
  ).bind(tenantId).all();
  const staff = res.results.map((r) => ({
    id: r.id,
    name: r.name,
    username: r.username,
    mustChangeLogin: !!r.must_change_login,
    active: !!r.active,
    createdAt: r.created_at,
    classes: [],
    services: [],
  }));
  if (!staff.length) return staff;
  const [classes, services] = await Promise.all([
    env.DB.prepare('SELECT staff_id, stream FROM staff_classes WHERE tenant_id = ?').bind(tenantId).all(),
    env.DB.prepare('SELECT staff_id, service FROM staff_services WHERE tenant_id = ?').bind(tenantId).all(),
  ]);
  const byId = Object.fromEntries(staff.map((s) => [s.id, s]));
  for (const c of classes.results) if (byId[c.staff_id]) byId[c.staff_id].classes.push(c.stream);
  for (const s of services.results) if (byId[s.staff_id]) byId[s.staff_id].services.push(s.service);
  return staff;
}

function validateStaffInput(body) {
  const name = String(body.name || '').trim();
  const username = String(body.username || '').trim().toLowerCase();
  if (!name) return { error: err(400, 'VALIDATION', 'Teacher name is required') };
  if (!USERNAME_RE.test(username)) {
    return { error: err(400, 'VALIDATION', 'Username must be 3-32 characters: letters, numbers, dot, dash or underscore') };
  }
  const services = Array.isArray(body.services) ? [...new Set(body.services.map(String))] : [];
  const classes = Array.isArray(body.classes) ? [...new Set(body.classes.map(String))] : [];
  const badService = services.find((s) => !SERVICES.includes(s));
  if (badService) return { error: err(400, 'VALIDATION', `Unknown service: ${badService}`) };
  return { name, username, services, classes };
}

async function setStaffGrants(env, tenant, staffId, services, classes) {
  const stmts = [
    env.DB.prepare('DELETE FROM staff_services WHERE staff_id = ?').bind(staffId),
    env.DB.prepare('DELETE FROM staff_classes WHERE staff_id = ?').bind(staffId),
  ];
  for (const s of services) {
    stmts.push(env.DB.prepare(
      'INSERT OR IGNORE INTO staff_services (staff_id, tenant_id, service) VALUES (?, ?, ?)',
    ).bind(staffId, tenant.id, s));
  }
  for (const c of classes) {
    stmts.push(env.DB.prepare(
      'INSERT OR IGNORE INTO staff_classes (staff_id, tenant_id, stream) VALUES (?, ?, ?)',
    ).bind(staffId, tenant.id, c));
  }
  await env.DB.batch(stmts);
}

async function createStaff(env, access, body) {
  const input = validateStaffInput(body);
  if (input.error) return input.error;
  const password = String(body.password || '');
  if (password.length < 6) return err(400, 'VALIDATION', 'Initial password must be at least 6 characters');
  if (!input.services.length) return err(400, 'VALIDATION', 'Choose at least one service for this teacher');
  if (!input.classes.length) return err(400, 'VALIDATION', 'Assign at least one class to this teacher');

  const id = `stf_${uuid()}`;
  const salt = newSalt();
  const hash = await hashPassword(password, salt);
  try {
    await env.DB.prepare(
      `INSERT INTO staff (id, tenant_id, name, username, password_hash, salt, must_change_login, active)
       VALUES (?, ?, ?, ?, ?, ?, 1, 1)`,
    ).bind(id, access.tenant.id, input.name, input.username, hash, salt).run();
  } catch (e) {
    if (String(e && e.message).includes('UNIQUE')) {
      return err(409, 'DUPLICATE_USERNAME', 'That username is already taken — choose another');
    }
    throw e;
  }
  await setStaffGrants(env, access.tenant, id, input.services, input.classes);
  const all = await staffWithGrants(env, access.tenant.id);
  return json({ staff: all.find((s) => s.id === id) || null }, { status: 201 });
}

async function updateStaff(env, access, body) {
  const id = String(body.id || '');
  const existing = await env.DB.prepare('SELECT id FROM staff WHERE id = ? AND tenant_id = ?')
    .bind(id, access.tenant.id).first();
  if (!existing) return err(404, 'NOT_FOUND', 'Teacher not found');

  const stmts = [];
  if (body.name !== undefined) {
    const name = String(body.name || '').trim();
    if (!name) return err(400, 'VALIDATION', 'Teacher name cannot be empty');
    stmts.push(env.DB.prepare('UPDATE staff SET name = ? WHERE id = ?').bind(name, id));
  }
  if (body.active !== undefined) {
    stmts.push(env.DB.prepare('UPDATE staff SET active = ? WHERE id = ?').bind(body.active ? 1 : 0, id));
    if (!body.active) {
      stmts.push(env.DB.prepare('DELETE FROM staff_sessions WHERE staff_id = ?').bind(id));
    }
  }
  if (stmts.length) await env.DB.batch(stmts);

  if (Array.isArray(body.services) || Array.isArray(body.classes)) {
    const input = validateStaffInput({
      name: 'x', username: 'x',
      services: body.services || [],
      classes: body.classes || [],
    });
    if (input.error) return input.error;
    if (!input.services.length) return err(400, 'VALIDATION', 'A teacher must keep at least one service');
    if (!input.classes.length) return err(400, 'VALIDATION', 'A teacher must keep at least one class');
    await setStaffGrants(env, access.tenant, id, input.services, input.classes);
  }

  const all = await staffWithGrants(env, access.tenant.id);
  return json({ staff: all.find((s) => s.id === id) || null });
}

async function resetStaffLogin(env, access, body) {
  const id = String(body.id || '');
  const password = String(body.password || '');
  if (password.length < 6) return err(400, 'VALIDATION', 'New password must be at least 6 characters');
  const existing = await env.DB.prepare('SELECT id FROM staff WHERE id = ? AND tenant_id = ?')
    .bind(id, access.tenant.id).first();
  if (!existing) return err(404, 'NOT_FOUND', 'Teacher not found');

  const salt = newSalt();
  const hash = await hashPassword(password, salt);
  await env.DB.batch([
    env.DB.prepare(
      'UPDATE staff SET password_hash = ?, salt = ?, must_change_login = 1 WHERE id = ?',
    ).bind(hash, salt, id),
    // Existing sessions die so the new password takes effect immediately.
    env.DB.prepare('DELETE FROM staff_sessions WHERE staff_id = ?').bind(id),
  ]);
  return json({ reset: true });
}

async function staffLogin(env, request, body) {
  const username = String(body.username || '').trim().toLowerCase();
  const password = String(body.password || '');
  if (!username || !password) return err(400, 'VALIDATION', 'Enter your username and password');

  // A sign-in failure must never escape as an unhandled exception (a 502):
  // everything below is defensive and reports a clean JSON error instead.
  try {
    const staff = await env.DB.prepare(
      'SELECT * FROM staff WHERE username = ? AND active = 1',
    ).bind(username).first();
    // Same generic error for unknown user and wrong password.
    const invalid = err(401, 'BAD_CREDENTIALS', 'Username or password is incorrect');
    if (!staff) {
      await hashPassword(password, '00'); // equalise timing for unknown usernames
      return invalid;
    }
    const hash = await hashPassword(password, staff.salt);
    if (hash !== staff.password_hash) return invalid;

    const token = newToken();
    const tokenHash = await sha256Hex(token);
    const expires = new Date(Date.now() + SESSION_DAYS * 86400000).toISOString();
    await env.DB.batch([
      env.DB.prepare('DELETE FROM staff_sessions WHERE expires_at <= ?').bind(nowIso()),
      env.DB.prepare('INSERT INTO staff_sessions (token_hash, staff_id, expires_at) VALUES (?, ?, ?)')
        .bind(tokenHash, staff.id, expires),
    ]);

    const access = await teacherAccess(env, staff);
    if (!access) return err(500, 'NO_TENANT', 'This school workspace is not ready yet');
    return jsonWithCookie(sessionPayload(access, null), staffCookie(token, env));
  } catch (e) {
    console.error('staff login failed:', e && e.message);
    return err(500, 'LOGIN_FAILED', 'Sign-in could not be completed — try again');
  }
}

async function staffLogout(env, request) {
  const token = cookiesOf(request)[STAFF_COOKIE];
  if (token) {
    await env.DB.prepare('DELETE FROM staff_sessions WHERE token_hash = ?')
      .bind(await sha256Hex(token)).run();
  }
  return jsonWithCookie({ ok: true }, clearStaffCookie(env));
}

async function changeOwnLogin(env, access, body) {
  if (access.role !== 'teacher') return err(403, 'FORBIDDEN', 'Only teachers sign in with a school login');
  const current = String(body.currentPassword || '');
  const newPassword = String(body.newPassword || '');
  const newUsername = String(body.username || '').trim().toLowerCase();

  const staff = await env.DB.prepare('SELECT * FROM staff WHERE id = ?').bind(access.staff.id).first();
  if (!staff) return err(404, 'NOT_FOUND', 'Account not found');
  const hash = await hashPassword(current, staff.salt);
  if (hash !== staff.password_hash) return err(401, 'BAD_CREDENTIALS', 'Your current password is incorrect');
  if (newPassword.length < 6) return err(400, 'VALIDATION', 'New password must be at least 6 characters');
  if (newUsername && !USERNAME_RE.test(newUsername)) {
    return err(400, 'VALIDATION', 'Username must be 3-32 characters: letters, numbers, dot, dash or underscore');
  }

  const salt = newSalt();
  const nextHash = await hashPassword(newPassword, salt);
  const targetUsername = newUsername || staff.username;
  try {
    await env.DB.prepare(
      'UPDATE staff SET username = ?, password_hash = ?, salt = ?, must_change_login = 0 WHERE id = ?',
    ).bind(targetUsername, nextHash, salt, staff.id).run();
  } catch (e) {
    if (String(e && e.message).includes('UNIQUE')) {
      return err(409, 'DUPLICATE_USERNAME', 'That username is already taken — choose another');
    }
    throw e;
  }
  return json({ ok: true, username: targetUsername });
}

/* ---------------------------------------------------------- lesson plans */

const DEFAULT_LESSON_TEMPLATE = {
  name: 'Standard Lesson Plan',
  sections: [
    { key: 'sec1', label: 'Learning Objectives' },
    { key: 'sec2', label: 'Prior Knowledge & Introduction' },
    { key: 'sec3', label: 'Learning Experiences & Activities' },
    { key: 'sec4', label: 'Learning Resources & Materials' },
    { key: 'sec5', label: 'Assessment / Evidence of Learning' },
    { key: 'sec6', label: 'Remedial & Enrichment' },
    { key: 'sec7', label: 'End-of-Lesson Remarks / Comments' },
  ],
};

async function getTemplate(env, tenantId) {
  const row = await env.DB.prepare('SELECT name, sections FROM lesson_plan_templates WHERE tenant_id = ?')
    .bind(tenantId).first();
  if (row) {
    try {
      const sections = JSON.parse(row.sections);
      if (Array.isArray(sections) && sections.length) return { name: row.name, sections };
    } catch { /* fall through to the default */ }
  }
  const fresh = {
    name: DEFAULT_LESSON_TEMPLATE.name,
    sections: DEFAULT_LESSON_TEMPLATE.sections,
  };
  await env.DB.prepare(
    `INSERT INTO lesson_plan_templates (tenant_id, name, sections) VALUES (?, ?, ?)
     ON CONFLICT(tenant_id) DO NOTHING`,
  ).bind(tenantId, fresh.name, JSON.stringify(fresh.sections)).run();
  return fresh;
}

async function saveTemplate(env, tenantId, body) {
  const name = String(body.name || '').trim();
  const raw = Array.isArray(body.sections) ? body.sections : [];
  if (!name) return err(400, 'VALIDATION', 'The lesson plan needs a name');
  if (raw.length < 2 || raw.length > 12) {
    return err(400, 'VALIDATION', 'A standard lesson plan needs between 2 and 12 sections');
  }
  const sections = raw.map((s, i) => ({ key: `sec${i + 1}`, label: String((s && s.label) || '').trim() }));
  if (sections.some((s) => !s.label)) return err(400, 'VALIDATION', 'Every section needs a heading');

  await env.DB.prepare(
    `INSERT INTO lesson_plan_templates (tenant_id, name, sections, updated_at)
     VALUES (?, ?, ?, datetime('now'))
     ON CONFLICT(tenant_id) DO UPDATE SET name = excluded.name, sections = excluded.sections,
                                          updated_at = datetime('now')`,
  ).bind(tenantId, name, JSON.stringify(sections)).run();
  return json({ template: { name, sections } });
}

function parseContent(value) {
  const content = {};
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    for (const [k, v] of Object.entries(value)) {
      const text = String(v || '').trim();
      if (text) content[String(k).slice(0, 32)] = text.slice(0, 5000);
    }
  }
  return content;
}

async function listLessonPlans(env, access) {
  const scope = scopeClause(access);
  const res = await env.DB.prepare(
    `SELECT id, staff_id, author, stream, subject_id, lesson_date, topic, sub_strand, content, updated_at
       FROM lesson_plans WHERE tenant_id = ?${scope.clause}
      ORDER BY lesson_date DESC, stream, topic LIMIT 300`,
  ).bind(access.tenant.id, ...scope.binds).all();
  return res.results.map((r) => ({
    id: r.id,
    staffId: r.staff_id,
    author: r.author,
    stream: r.stream,
    subjectId: r.subject_id,
    lessonDate: r.lesson_date,
    topic: r.topic,
    subStrand: r.sub_strand || '',
    content: parseContent(JSON.parse(r.content || '{}')),
    updatedAt: r.updated_at,
  }));
}

async function saveLessonPlan(env, access, user, body) {
  const stream = String(body.stream || '');
  const subjectId = String(body.subjectId || '');
  const lessonDate = String(body.lessonDate || '');
  const topic = String(body.topic || '').trim();
  const subStrand = String(body.subStrand || '').trim();
  if (!stream || !lessonDate || !topic) return err(400, 'VALIDATION', 'Class, date and topic are required');
  if (!SUBJECT_BY_ID[subjectId]) return err(400, 'VALIDATION', 'Choose a learning area');
  if (access.role === 'teacher' && !access.streams.includes(stream)) {
    return err(403, 'OUT_OF_SCOPE', 'You can only write lesson plans for your assigned classes');
  }
  const content = parseContent(body.content);
  if (!Object.keys(content).length) return err(400, 'VALIDATION', 'Fill in at least one lesson plan section');

  const author = access.staff ? access.staff.name : (user && (user.name || user.email)) || 'Admin';
  const id = `lp_${uuid()}`;
  await env.DB.prepare(
    `INSERT INTO lesson_plans (id, tenant_id, staff_id, author, stream, subject_id, lesson_date, topic, sub_strand, content)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).bind(
    id, access.tenant.id, access.staff ? access.staff.id : '', author,
    stream, subjectId, lessonDate, topic, subStrand, JSON.stringify(content),
  ).run();
  return json({ plan: { id, stream, subjectId, lessonDate, topic, subStrand, author, content } }, { status: 201 });
}

async function updateLessonPlan(env, access, user, body) {
  const id = String(body.id || '');
  const scope = scopeClause(access);
  const existing = await env.DB.prepare(
    `SELECT id, staff_id, stream FROM lesson_plans WHERE id = ? AND tenant_id = ?${scope.clause}`,
  ).bind(id, access.tenant.id, ...scope.binds).first();
  if (!existing) return err(404, 'NOT_FOUND', 'Lesson plan not found');
  // Teachers may only edit the plans they wrote; admins may edit any.
  if (access.role === 'teacher' && existing.staff_id !== access.staff.id) {
    return err(403, 'FORBIDDEN', 'You can only edit your own lesson plans');
  }

  const stream = body.stream !== undefined ? String(body.stream || '') : existing.stream;
  if (access.role === 'teacher' && !access.streams.includes(stream)) {
    return err(403, 'OUT_OF_SCOPE', 'You can only write lesson plans for your assigned classes');
  }
  const fields = [];
  const binds = [];
  if (body.stream !== undefined) { fields.push('stream = ?'); binds.push(stream); }
  if (body.subjectId !== undefined) {
    if (!SUBJECT_BY_ID[String(body.subjectId)]) return err(400, 'VALIDATION', 'Choose a learning area');
    fields.push('subject_id = ?'); binds.push(String(body.subjectId));
  }
  if (body.lessonDate !== undefined) { fields.push('lesson_date = ?'); binds.push(String(body.lessonDate)); }
  if (body.topic !== undefined) {
    const topic = String(body.topic || '').trim();
    if (!topic) return err(400, 'VALIDATION', 'Topic cannot be empty');
    fields.push('topic = ?'); binds.push(topic);
  }
  if (body.subStrand !== undefined) {
    fields.push('sub_strand = ?'); binds.push(String(body.subStrand || '').trim());
  }
  if (body.content !== undefined) {
    const content = parseContent(body.content);
    if (!Object.keys(content).length) return err(400, 'VALIDATION', 'Fill in at least one lesson plan section');
    fields.push('content = ?'); binds.push(JSON.stringify(content));
  }
  if (!fields.length) return json({ ok: true });
  fields.push("updated_at = datetime('now')");
  await env.DB.prepare(`UPDATE lesson_plans SET ${fields.join(', ')} WHERE id = ? AND tenant_id = ?`)
    .bind(...binds, id, access.tenant.id).run();
  return json({ ok: true });
}

async function deleteLessonPlan(env, access, body) {
  const id = String(body.id || '');
  const scope = scopeClause(access);
  const existing = await env.DB.prepare(
    `SELECT id, staff_id FROM lesson_plans WHERE id = ? AND tenant_id = ?${scope.clause}`,
  ).bind(id, access.tenant.id, ...scope.binds).first();
  if (!existing) return err(404, 'NOT_FOUND', 'Lesson plan not found');
  if (access.role === 'teacher' && existing.staff_id !== access.staff.id) {
    return err(403, 'FORBIDDEN', 'You can only delete your own lesson plans');
  }
  await env.DB.prepare('DELETE FROM lesson_plans WHERE id = ? AND tenant_id = ?')
    .bind(id, access.tenant.id).run();
  return json({ ok: true });
}

/* ------------------------------------------------------- teaching modules */

/** Admin: any class. Teacher: only the classes the admin assigned them. */
function canTouchStream(access, stream) {
  if (access.role === 'admin') return true;
  return access.streams.includes(String(stream));
}

/** Edit/delete rights: admins always; teachers on rows in their own classes. */
function canEditRow(access, row) {
  if (access.role === 'admin') return true;
  if (!canTouchStream(access, row.stream)) return false;
  // Teachers may finish rows the admin created (''), and always their own.
  return !row.staff_id || row.staff_id === access.staff.id;
}

const parseList = (raw) => {
  try {
    const v = JSON.parse(raw || '[]');
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
};

/** Accept an array from the client, store as a JSON string. */
const toJsonList = (value) =>
  Array.isArray(value) ? JSON.stringify(value.map((v) => String(v))) : String(value || '');

/* ---------------------------------------------------- schemes of work */

function schemeToJson(r) {
  return {
    id: r.id, staffId: r.staff_id, author: r.author, stream: r.stream,
    subjectId: r.subject_id, term: r.term, week: r.week,
    strand: r.strand, subStrand: r.sub_strand, outcomes: r.outcomes,
    experiences: r.experiences, inquiry: r.inquiry, resources: r.resources,
    assessment: r.assessment, remarks: r.remarks, updatedAt: r.updated_at,
  };
}

async function listSchemes(env, access, q) {
  const clauses = ['tenant_id = ?'];
  const binds = [access.tenant.id];
  if (q.get('stream')) { clauses.push('stream = ?'); binds.push(q.get('stream')); }
  if (q.get('subject')) { clauses.push('subject_id = ?'); binds.push(q.get('subject')); }
  if (q.get('term')) { clauses.push('term = ?'); binds.push(q.get('term')); }
  const scope = scopeClause(access);
  if (scope.clause) { clauses.push(scope.clause.replace(/^\s*AND\s+/, '').trim()); binds.push(...scope.binds); }
  const res = await env.DB.prepare(
    `SELECT * FROM scheme_rows WHERE ${clauses.join(' AND ')} ORDER BY stream, subject_id, term, week`,
  ).bind(...binds).all();
  return res.results.map(schemeToJson);
}

async function saveScheme(env, access, user, body, isUpdate) {
  const stream = String(body.stream || '');
  const subjectId = String(body.subjectId || '');
  const term = String(body.term || '').trim();
  const week = Number(body.week);
  if (!stream || !subjectId || !term || !Number.isInteger(week) || week < 1 || week > 40) {
    return err(400, 'VALIDATION', 'Class, learning area, term and a week (1-40) are required');
  }
  if (!canTouchStream(access, stream)) {
    return err(403, 'OUT_OF_SCOPE', 'You can only write schemes for your assigned classes');
  }
  const fields = {
    strand: String(body.strand || ''), sub_strand: String(body.subStrand || ''),
    outcomes: String(body.outcomes || ''), experiences: String(body.experiences || ''),
    inquiry: String(body.inquiry || ''), resources: String(body.resources || ''),
    assessment: String(body.assessment || ''), remarks: String(body.remarks || ''),
  };
  const author = access.staff ? access.staff.name : (user && (user.name || user.email)) || 'Admin';
  const staffId = access.staff ? access.staff.id : '';

  if (isUpdate) {
    const id = String(body.id || '');
    const existing = await env.DB.prepare('SELECT id, stream, staff_id FROM scheme_rows WHERE id = ? AND tenant_id = ?')
      .bind(id, access.tenant.id).first();
    if (!existing) return err(404, 'NOT_FOUND', 'Scheme row not found');
    if (!canEditRow(access, { stream: existing.stream, staff_id: existing.staff_id })) {
      return err(403, 'FORBIDDEN', 'You can only edit your own scheme rows');
    }
    await env.DB.prepare(
      `UPDATE scheme_rows SET week = ?, strand = ?, sub_strand = ?, outcomes = ?, experiences = ?,
              inquiry = ?, resources = ?, assessment = ?, remarks = ?, updated_at = datetime('now')
        WHERE id = ? AND tenant_id = ?`,
    ).bind(week, fields.strand, fields.sub_strand, fields.outcomes, fields.experiences,
      fields.inquiry, fields.resources, fields.assessment, fields.remarks, id, access.tenant.id).run();
    return json({ ok: true });
  }

  const id = `sch_${uuid()}`;
  try {
    await env.DB.prepare(
      `INSERT INTO scheme_rows (id, tenant_id, staff_id, author, stream, subject_id, term, week,
              strand, sub_strand, outcomes, experiences, inquiry, resources, assessment, remarks)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).bind(id, access.tenant.id, staffId, author, stream, subjectId, term, week,
      fields.strand, fields.sub_strand, fields.outcomes, fields.experiences,
      fields.inquiry, fields.resources, fields.assessment, fields.remarks).run();
  } catch (e) {
    if (String(e && e.message).includes('UNIQUE')) {
      return err(409, 'DUPLICATE_WEEK', 'That week already has a scheme row for this class and learning area');
    }
    throw e;
  }
  return json({ row: { id, stream, subjectId, term, week, ...fields } }, { status: 201 });
}

async function deleteScheme(env, access, body) {
  const id = String(body.id || '');
  const existing = await env.DB.prepare('SELECT id, stream, staff_id FROM scheme_rows WHERE id = ? AND tenant_id = ?')
    .bind(id, access.tenant.id).first();
  if (!existing) return err(404, 'NOT_FOUND', 'Scheme row not found');
  if (!canEditRow(access, { stream: existing.stream, staff_id: existing.staff_id })) {
    return err(403, 'FORBIDDEN', 'You can only delete your own scheme rows');
  }
  await env.DB.prepare('DELETE FROM scheme_rows WHERE id = ? AND tenant_id = ?').bind(id, access.tenant.id).run();
  return json({ ok: true });
}

/* ---------------------------------------------------------- timetable */

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

async function timetableData(env, access) {
  const periodRes = await env.DB.prepare(
    'SELECT position, label, starts_at, ends_at FROM timetable_periods WHERE tenant_id = ? ORDER BY position',
  ).bind(access.tenant.id).all();
  const periods = periodRes.results.map((p) => ({
    position: p.position, label: p.label, startsAt: p.starts_at, endsAt: p.ends_at,
  }));

  let entries;
  if (access.role === 'teacher') {
    const res = await env.DB.prepare(
      `SELECT id, day, period, stream, subject_id, staff_id, room FROM timetable_entries
        WHERE tenant_id = ? AND staff_id = ?`,
    ).bind(access.tenant.id, access.staff.id).all();
    entries = res.results;
  } else {
    const res = await env.DB.prepare(
      `SELECT id, day, period, stream, subject_id, staff_id, room FROM timetable_entries
        WHERE tenant_id = ? ORDER BY day, period`,
    ).bind(access.tenant.id).all();
    entries = res.results;
  }

  let staff = [];
  if (access.role === 'admin') {
    staff = await staffWithGrants(env, access.tenant.id);
  }
  return {
    periods,
    days: DAYS,
    entries: entries.map((e) => ({
      id: e.id, day: e.day, period: e.period, stream: e.stream,
      subjectId: e.subject_id, staffId: e.staff_id, room: e.room,
    })),
    staff: staff.map((s) => ({ id: s.id, name: s.name })),
  };
}

async function saveTimetableEntry(env, access, body) {
  if (access.role !== 'admin') return err(403, 'FORBIDDEN', 'Only the administrator edits the timetable');
  const day = String(body.day || '');
  const period = Number(body.period);
  const stream = String(body.stream || '');
  const subjectId = String(body.subjectId || '');
  if (!DAYS.includes(day) || !Number.isInteger(period) || period < 1 || !stream || !subjectId) {
    return err(400, 'VALIDATION', 'Day, period, class and learning area are required');
  }
  let staffId = String(body.staffId || '');
  if (staffId) {
    // For admins, staffId might be the user's sub; only validate if it's a staff record
    if (access.role === 'teacher') {
      const exists = await env.DB.prepare('SELECT id FROM staff WHERE id = ? AND tenant_id = ?')
        .bind(staffId, access.tenant.id).first();
      if (!exists) return err(404, 'NOT_FOUND', 'Teacher not found');
    } else if (access.role === 'admin') {
      // Check if it's a staff record; if not, treat as admin assignment (empty or keep as is)
      const exists = await env.DB.prepare('SELECT id FROM staff WHERE id = ? AND tenant_id = ?')
        .bind(staffId, access.tenant.id).first();
      if (!exists) {
        staffId = ''; // Admin assignment, don't require staff record
      }
    }
  }
  // Remove existing entry for this slot first to avoid ON CONFLICT issues
  await env.DB.prepare(
    'DELETE FROM timetable_entries WHERE tenant_id = ? AND day = ? AND period = ? AND stream = ?',
  ).bind(access.tenant.id, day, period, stream).run();
  await env.DB.prepare(
    `INSERT INTO timetable_entries (id, tenant_id, day, period, stream, subject_id, staff_id, room)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  ).bind(`tt_${uuid()}`, access.tenant.id, day, period, stream, subjectId, staffId, String(body.room || '')).run();
  return json({ ok: true }, { status: 201 });
}

async function saveTimetablePeriods(env, access, body) {
  if (access.role !== 'admin') return err(403, 'FORBIDDEN', 'Only the administrator edits timetable periods');
  const list = Array.isArray(body.periods) ? body.periods : [];
  // An empty list clears the day — the UI offers that via its empty state.
  if (list.length > 16) return err(400, 'VALIDATION', 'Keep at most 16 periods');
  const stmts = [env.DB.prepare('DELETE FROM timetable_periods WHERE tenant_id = ?').bind(access.tenant.id)];
  for (let i = 0; i < list.length; i++) {
    const p = list[i] || {};
    const label = String(p.label || `Period ${i + 1}`).slice(0, 40);
    const startsAt = String(p.startsAt || '').slice(0, 8);
    const endsAt = String(p.endsAt || '').slice(0, 8);
    if (!startsAt || !endsAt) return err(400, 'VALIDATION', 'Every period needs a start and end time');
    stmts.push(env.DB.prepare(
      'INSERT INTO timetable_periods (tenant_id, position, label, starts_at, ends_at) VALUES (?, ?, ?, ?, ?)',
    ).bind(access.tenant.id, i + 1, label, startsAt, endsAt));
  }
  await env.DB.batch(stmts);
  return json({ ok: true, saved: list.length });
}

async function deleteTimetableEntry(env, access, body) {
  if (access.role !== 'admin') return err(403, 'FORBIDDEN', 'Only the administrator edits the timetable');
  const id = String(body.id || '');
  await env.DB.prepare('DELETE FROM timetable_entries WHERE id = ? AND tenant_id = ?')
    .bind(id, access.tenant.id).run();
  return json({ ok: true });
}

/* ------------------------------------------------------ record of work */

function rowToJson(r) {
  return {
    id: r.id, staffId: r.staff_id, author: r.author, stream: r.stream,
    subjectId: r.subject_id, day: r.day, topic: r.topic, strand: r.strand,
    classSize: r.class_size, absences: r.absences, homework: r.homework,
    remarks: r.remarks, updatedAt: r.updated_at,
  };
}

async function listRecordOfWork(env, access, q) {
  const clauses = ['tenant_id = ?'];
  const binds = [access.tenant.id];
  if (q.get('stream')) { clauses.push('stream = ?'); binds.push(q.get('stream')); }
  const scope = scopeClause(access);
  if (scope.clause) { clauses.push(scope.clause.replace(/^\s*AND\s+/, '').trim()); binds.push(...scope.binds); }
  const res = await env.DB.prepare(
    `SELECT * FROM record_of_work WHERE ${clauses.join(' AND ')} ORDER BY day DESC, stream LIMIT 300`,
  ).bind(...binds).all();
  return res.results.map(rowToJson);
}

async function saveRecordOfWork(env, access, user, body, isUpdate) {
  const stream = String(body.stream || '');
  const subjectId = String(body.subjectId || '');
  const day = String(body.day || '');
  const topic = String(body.topic || '').trim();
  if (!stream || !subjectId || !day || !topic) {
    return err(400, 'VALIDATION', 'Class, learning area, date and topic are required');
  }
  if (!canTouchStream(access, stream)) {
    return err(403, 'OUT_OF_SCOPE', 'You can only record work for your assigned classes');
  }
  const classSize = Number(body.classSize || 0);
  const values = [
    topic, String(body.strand || ''), Number.isInteger(classSize) && classSize > 0 ? classSize : 0,
    String(body.absences || ''), String(body.homework || ''), String(body.remarks || ''),
  ];
  const author = access.staff ? access.staff.name : (user && (user.name || user.email)) || 'Admin';
  const staffId = access.staff ? access.staff.id : '';

  if (isUpdate) {
    const id = String(body.id || '');
    const existing = await env.DB.prepare('SELECT id, stream, staff_id FROM record_of_work WHERE id = ? AND tenant_id = ?')
      .bind(id, access.tenant.id).first();
    if (!existing) return err(404, 'NOT_FOUND', 'Entry not found');
    if (!canEditRow(access, { stream: existing.stream, staff_id: existing.staff_id })) {
      return err(403, 'FORBIDDEN', 'You can only edit your own entries');
    }
    await env.DB.prepare(
      `UPDATE record_of_work SET day = ?, topic = ?, strand = ?, class_size = ?, absences = ?,
              homework = ?, remarks = ?, updated_at = datetime('now') WHERE id = ? AND tenant_id = ?`,
    ).bind(day, ...values, id, access.tenant.id).run();
    return json({ ok: true });
  }

  const id = `row_${uuid()}`;
  await env.DB.prepare(
    `INSERT INTO record_of_work (id, tenant_id, staff_id, author, stream, subject_id, day, topic,
            strand, class_size, absences, homework, remarks)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).bind(id, access.tenant.id, staffId, author, stream, subjectId, day,
    values[0], values[1], values[2], values[3], values[4], values[5]).run();
  return json({ row: { id, stream, subjectId, day, topic } }, { status: 201 });
}

async function deleteRecordOfWork(env, access, body) {
  const id = String(body.id || '');
  const existing = await env.DB.prepare('SELECT id, stream, staff_id FROM record_of_work WHERE id = ? AND tenant_id = ?')
    .bind(id, access.tenant.id).first();
  if (!existing) return err(404, 'NOT_FOUND', 'Entry not found');
  if (!canEditRow(access, { stream: existing.stream, staff_id: existing.staff_id })) {
    return err(403, 'FORBIDDEN', 'You can only delete your own entries');
  }
  await env.DB.prepare('DELETE FROM record_of_work WHERE id = ? AND tenant_id = ?').bind(id, access.tenant.id).run();
  return json({ ok: true });
}

/* ------------------------------------------------------ learner progress */

const PROGRESS_STAGES = ['Beginning', 'Developing', 'Secure', 'Exceeding'];

async function listProgress(env, access, q) {
  const clauses = ['p.tenant_id = ?'];
  const binds = [access.tenant.id];
  const learnerId = q.get('learner') || '';
  const strand = q.get('strand') || '';
  const subStrand = q.get('substrand') || q.get('subStrand') || '';
  if (learnerId) { clauses.push('p.learner_id = ?'); binds.push(learnerId); }
  if (strand) { clauses.push('p.strand = ?'); binds.push(strand); }
  if (subStrand) { clauses.push('p.sub_strand = ?'); binds.push(subStrand); }
  const scope = scopeClause(access, 'l.');
  if (scope.clause) { clauses.push(scope.clause.replace(/^\s*AND\s+/, '').trim()); binds.push(...scope.binds); }
  const where = clauses.filter(Boolean).join(' AND ');
  const res = await env.DB.prepare(
    `SELECT p.id, p.learner_id, p.staff_id, p.author, p.subject_id, p.strand, p.sub_strand, p.term, p.day, p.stage, p.note,
            p.created_at, l.name AS learner_name, l.stream
       FROM progress_records p JOIN learners l ON l.id = p.learner_id
      WHERE ${where} ORDER BY p.created_at DESC LIMIT 500`,
  ).bind(...binds).all();
  return res.results.map((r) => ({
    id: r.id, learnerId: r.learner_id, learnerName: r.learner_name, stream: r.stream,
    staffId: r.staff_id, author: r.author, subjectId: r.subject_id, 
    strand: r.strand || '', subStrand: r.sub_strand || '',
    term: r.term, day: r.day, stage: r.stage, note: r.note, createdAt: r.created_at,
  }));
}

async function addProgress(env, access, user, body) {
  const learnerId = String(body.learnerId || '');
  const stage = String(body.stage || '');
  const note = String(body.note || '').trim();
  const day = String(body.day || '');
  if (!learnerId || !day || !note) return err(400, 'VALIDATION', 'Learner, date and note are required');
  if (!PROGRESS_STAGES.includes(stage)) return err(400, 'VALIDATION', 'Choose a progress stage');
  const denied = await assertLearnersInScope(env, access, [learnerId]);
  if (denied) return denied;
  const author = access.staff ? access.staff.name : (user && (user.name || user.email)) || 'Admin';
  const id = `prg_${uuid()}`;
  await env.DB.prepare(
    `INSERT INTO progress_records (id, tenant_id, learner_id, staff_id, author, subject_id, strand, sub_strand, term, day, stage, note)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).bind(id, access.tenant.id, learnerId, access.staff ? access.staff.id : '', author,
    String(body.subjectId || ''), String(body.strand || ''), String(body.subStrand || ''),
    String(body.term || ''), day, stage, note).run();
  return json({ record: { id, learnerId, day, stage, note } }, { status: 201 });
}

async function deleteProgress(env, access, body) {
  const id = String(body.id || '');
  const existing = await env.DB.prepare('SELECT id, staff_id FROM progress_records WHERE id = ? AND tenant_id = ?')
    .bind(id, access.tenant.id).first();
  if (!existing) return err(404, 'NOT_FOUND', 'Record not found');
  if (access.role !== 'admin' && existing.staff_id !== access.staff.id) {
    return err(403, 'FORBIDDEN', 'You can only delete your own records');
  }
  await env.DB.prepare('DELETE FROM progress_records WHERE id = ? AND tenant_id = ?').bind(id, access.tenant.id).run();
  return json({ ok: true });
}

/* ------------------------------------------------- KICD curriculum designs */

const KICD_LEVELS = ['Pre-Primary', 'Lower Primary', 'Upper Primary', 'Junior School'];

/**
 * Official KICD pages, verified against kicd.ac.ke. The site is
 * "© Kenya Institute of Curriculum Development. All Rights Reserved" — approval
 * to use material in schools is not a licence to redistribute it, so these are
 * links to the source rather than copies of the documents themselves.
 */
const KICD_SOURCES = [
  { key: 'materials', label: 'CBC Materials', url: 'https://kicd.ac.ke/cbc-materials/' },
  { key: 'designs', label: 'Curriculum Designs', url: 'https://kicd.ac.ke/cbc-materials/curriculum-designs/' },
  { key: 'regular', label: 'Regular Curriculum Designs', url: 'https://kicd.ac.ke/cbc-materials/curriculum-designs/regular-curriculum-designs/' },
  { key: 'course_books', label: 'Approved CBC Course Materials', url: 'https://kicd.ac.ke/cbc-materials/approved-cbc-course-materials/' },
  { key: 'complementary', label: 'Approved Complementary Materials', url: 'https://kicd.ac.ke/cbc-materials/approved-complementary-materials/' },
  { key: 'parents', label: 'Parental Empowerment & Engagement Guidelines', url: 'https://kicd.ac.ke/cbc-materials/guidelines-on-parental-empowerment-and-engagement/' },
];
const ORIGINS = ['kicd', 'school', 'sample'];

/**
 * A starter library so the page works out of the box. This is an abbreviated,
 * framework-shaped sample — schools paste the official KICD design text into
 * the library (admins can add/edit designs) for full fidelity.
 */
function starterDesigns(tenantId) {
  const CBC_COMPETENCIES = JSON.stringify([
    'Critical Thinking & Problem Solving', 'Creativity & Innovation',
    'Communication & Collaboration', 'Citizenship', 'Digital Literacy',
    'Learning to Learn', 'Self-Efficacy',
  ]);
  const BANDS = JSON.stringify([
    'Exceeding Expectations (EE)', 'Meeting Expectations (ME)',
    'Approaching Expectations (AE)', 'Below Expectations (BE)',
  ]);
  const rows = [
    ['regular', 'Lower Primary', 'Grade 1', 'math_p', 'Numbers', 'Numeration & Place Value',
      ['Count quantities up to 1000 using objects and pictures', 'Read and write numbers up to 1000 in words and figures', 'Identify place value of digits in 3-digit numbers'],
      ['Sort, classify and order objects while counting', 'Represent numbers using place value blocks and charts'],
      ['How do we know how many things we have?', 'Where do digits get their value?'],
      ['Counting sticks, bead strings, place value charts, locally made counters'], ''],
    ['regular', 'Lower Primary', 'Grade 1', 'math_p', 'Measurement', 'Length, Mass & Capacity',
      ['Compare and order objects by length, mass and capacity', 'Measure length using non-standard then standard units (cm, m)'],
      ['Measure classroom objects with rulers and metre sticks', 'Estimate and verify everyday quantities'],
      ['How do we compare how long or heavy things are?', 'What units help us measure fairly?'],
      ['Rulers, measuring tapes, balances, containers'], ''],
    ['regular', 'Lower Primary', 'Grade 1', 'eng_p', 'Listening & Speaking', 'Oral Language Skills',
      ['Greet others and take turns in conversation', 'Retell a short heard story in sequence'],
      ['Pair discussions, choral responding, story retelling'],
      ['How do we help each other understand when we talk?'],
      ['Picture cards, storybooks, charts'], ''],
    ['regular', 'Lower Primary', 'Grade 1', 'kis_p', 'Speaking', 'Everyday Conversation',
      ['Greet others and take part in short exchanges', 'Name familiar people, objects and actions', 'Answer simple questions about daily routine'],
      ['Greeting drills, role play at the shop and home', 'Naming games with classroom objects'],
      ['How do we greet one another politely?', 'Which words name the things we use every day?'],
      ['Picture cards, classroom objects, word wall'], ''],
    ['regular', 'Lower Primary', 'Grade 1', 'env_p', 'Environment', 'Our Surroundings',
      ['Identify living and non-living things around the school', 'Describe the weather on a given day', 'Practise keeping the school compound clean'],
      ['Nature walk around the school compound', 'Sorting cards into living and non-living', 'Clean-up routine'],
      ['What lives around our school?', 'How do we keep our environment clean?'],
      ['Chart paper, locally collected samples, pictures'], ''],
    ['regular', 'Lower Primary', 'Grade 1', 'rel_p', 'Creation', 'Care for Creation',
      ['Name things that show the world is cared for', 'Practise looking after plants and animals', 'Share one way of caring for others'],
      ['Watering the school garden', 'Story sharing about caring for one another'],
      ['Who looks after everything we see?', 'How can we care for what we have been given?'],
      ['School garden, picture cards, storybooks'], ''],
    ['regular', 'Lower Primary', 'Grade 1', 'crt_p', 'Movement & Rhythm', 'Body Awareness',
      ['Move safely to a steady beat', 'Copy simple action rhythms', 'Work with a partner without bumping into others'],
      ['Action songs and clapping patterns', 'Obstacle courses and partner mirroring'],
      ['How does our body keep time with the music?', 'How do we move safely together?'],
      ['Clapping sticks, drums, open floor space'], ''],
    ['regular', 'Upper Primary', 'Grade 4', 'math_p', 'Fractions', 'Equivalent Fractions & Operations',
      ['Identify and generate equivalent fractions', 'Add and subtract fractions with like denominators'],
      ['Fold paper strips to find equivalents', 'Solve money and measure problems using fractions'],
      ['How can two different fractions name the same amount?'],
      ['Fraction strips, number lines, real-life shopping contexts'], ''],
    ['regular', 'Upper Primary', 'Grade 4', 'env_p', 'Environmental Care', 'Soil & Water Conservation',
      ['Explain why soil and water need conservation', 'Practise terracing, mulching and clean water handling at school'],
      ['School compound survey, simple terrace model making'],
      ['How does our school protect the soil and water around it?'],
      ['Garden tools, charts, local water sources'], ''],
    ['regular', 'Junior School', 'Grade 7', 'math', 'Algebra', 'Linear Expressions & Equations',
      ['Simplify algebraic expressions', 'Solve one-step and two-step linear equations'],
      ['Pattern generalisation, balance-scale model of equations'],
      ['How can a pattern be written as a general rule?'],
      ['Multi-board, manila papers, simple balance scale'], ''],
    ['regular', 'Junior School', 'Grade 7', 'isci', 'Scientific Investigation', 'Scientific Enquiry Skills',
      ['Formulate testable questions and hypotheses', 'Conduct fair tests and record observations'],
      ['Investigating factors that affect dissolving; reporting findings'],
      ['What makes a test fair and trustworthy?'],
      ['Laboratory apparatus, measurement instruments'], ''],
    ['regular', 'Junior School', 'Grade 8', 'sost', 'Governance', 'Democracy & Participation',
      ['Explain the features of democratic governance', 'Describe ways learners participate in school governance'],
      ['Class election simulation, school government case study'],
      ['Why do communities organise themselves through government?'],
      ['Constitution extracts, current affairs clips'], ''],
    ['sne', 'Lower Primary', 'Grade 1', 'math_p', 'Numbers', 'Numeration — Adapted for Visual Impairment',
      ['Count and identify numbers up to 100 using tactile materials'],
      ['Tactile counting frames, raised-line writing boards, verbal narration'],
      ['How do we count things we cannot see?'],
      ['Tactile numerals, braille slates, abacus'],
      'Use tactile manipulatives, verbal description of every step, enlarged or braille print, and allow extra response time.'],
    ['sne', 'Lower Primary', 'Grade 1', 'eng_p', 'Listening & Speaking — Adapted for Hearing Impairment',
      ['Respond to simple instructions using sign and gesture', 'Express basic needs using sign, gesture or speech'],
      ['Facing-class instruction, visual cues, paired peer support'],
      ['How do we make sure everyone can follow along?'],
      ['Picture cards, sign language charts, visual timetables'],
      'Position the learner for lip-reading, pair with a peer buddy, reinforce verbally with visuals, and involve the interpreter consistently.'],
    ['sne', 'Upper Primary', 'Grade 4', 'math_p', 'Measurement — Adapted for Learners with Intellectual Impairment',
      ['Measure everyday lengths using a ruler with support'],
      ['Task analysis with matching, grading and practical life contexts'],
      ['Which tool matches this job?'],
      ['Concrete measuring tools, matching cards'],
      'Break tasks into small steps, repeat with varied concrete materials, and reduce content load while keeping the same strand.'],
    ['sne', 'Junior School', 'Grade 7', 'math', 'Numbers — Adapted for Autism',
      ['Perform operations with whole numbers following a consistent routine'],
      ['Structured timetable, visual schedule, predictable lesson sequence'],
      ['How does a predictable routine help us learn?'],
      ['Visual schedule boards, timers, structured work folders'],
      'Keep routines consistent, use visual schedules and advance notice of transitions, and reduce sensory distractions in the workspace.'],
    // Grade 2
    ['regular', 'Lower Primary', 'Grade 2', 'math_p', 'Numbers', 'Place Value & Operations',
      ['Read and write numbers up to 999', 'Add and subtract numbers up to 999 with and without regrouping'],
      ['Use place value charts and abacus for operations'],
      ['How do we regroup numbers?'],
      ['Place value charts, abacus, number cards'], ''],
    ['regular', 'Lower Primary', 'Grade 2', 'eng_p', 'Reading & Writing', 'Comprehension',
      ['Read aloud with fluency', 'Answer comprehension questions', 'Write simple paragraphs'],
      ['Shared reading, guided reading, story writing'],
      ['What can we learn from stories?'],
      ['Storybooks, charts, writing materials'], ''],
    ['regular', 'Lower Primary', 'Grade 2', 'kis_p', 'Reading', 'Ufahamu',
      ['Soma kwa matamshi mazuri', 'Jibu maswali ya ufahamu'],
      ['Kusoma kwa pamoja na kusimulia hadithi'],
      ['Tunajifunza nini kutoka kwa hadithi?'],
      ['Vitabu vya hadithi, michoro'], ''],
    ['regular', 'Lower Primary', 'Grade 2', 'env_p', 'Environment', 'Safety & Health',
      ['Identify safety rules at home and school', 'Practice personal hygiene'],
      ['Role play on safety, hygiene demonstrations'],
      ['How do we keep ourselves safe and healthy?'],
      ['Posters, soap, water containers'], ''],
    // Grade 3
    ['regular', 'Lower Primary', 'Grade 3', 'math_p', 'Numbers', 'Multiplication & Division',
      ['Multiply numbers up to 5x5', 'Divide numbers by 2,3,4,5'],
      ['Use arrays and grouping for multiplication'],
      ['How are multiplication and division related?'],
      ['Counters, multiplication tables, arrays'], ''],
    ['regular', 'Lower Primary', 'Grade 3', 'eng_p', 'Grammar', 'Parts of Speech',
      ['Identify nouns, verbs and adjectives', 'Use them in sentences'],
      ['Games on word classes, sentence construction'],
      ['How do words work together?'],
      ['Word cards, sentence strips'], ''],
    // Grade 5
    ['regular', 'Upper Primary', 'Grade 5', 'math_p', 'Decimals', 'Operations with Decimals',
      ['Add and subtract decimals', 'Convert fractions to decimals'],
      ['Use place value charts for decimals'],
      ['Where do we use decimals in real life?'],
      ['Decimal charts, money models'], ''],
    ['regular', 'Upper Primary', 'Grade 5', 'eng_p', 'Composition', 'Narrative Writing',
      ['Write a narrative with introduction, body and conclusion'],
      ['Planning, drafting and editing stories'],
      ['How do we tell an engaging story?'],
      ['Story outlines, sample narratives'], ''],
    // Grade 6
    ['regular', 'Upper Primary', 'Grade 6', 'math_p', 'Ratios & Proportions', 'Percentages',
      ['Calculate percentages', 'Solve problems involving ratios'],
      ['Use real-life shopping contexts'],
      ['When do we use percentages?'],
      ['Price tags, calculators, charts'], ''],
    ['regular', 'Upper Primary', 'Grade 6', 'sci_p', 'Living Things', 'Human Body Systems',
      ['Identify major body systems', 'Explain their functions'],
      ['Model making of body systems'],
      ['How do body systems work together?'],
      ['Models, charts, diagrams'], ''],
    // Grade 8
    ['regular', 'Junior School', 'Grade 8', 'isci', 'Matter', 'Acids, Bases & Indicators',
      ['Classify substances as acids or bases', 'Use natural indicators'],
      ['Practical experiments with indicators'],
      ['How can we identify acids and bases?'],
      ['Red cabbage, litmus paper, household substances'], ''],
    ['regular', 'Junior School', 'Grade 8', 'agri', 'Crop Production', 'Soil Fertility',
      ['Explain soil fertility', 'Practice soil conservation'],
      ['School farm activities'],
      ['How do we maintain soil fertility?'],
      ['Farm tools, compost, manure'], ''],
    // Grade 9
    ['regular', 'Junior School', 'Grade 9', 'math', 'Geometry', 'Transformations',
      ['Perform reflection, rotation, translation', 'Enlarge shapes'],
      ['Use grid paper for transformations'],
      ['Where do we see transformations?'],
      ['Graph paper, mirrors, shapes'], ''],
    ['regular', 'Junior School', 'Grade 9', 'ptech', 'Workshop Practice', 'Safety & Tools',
      ['Observe workshop safety rules', 'Identify and use basic tools'],
      ['Practical tool handling'],
      ['Why is safety important in the workshop?'],
      ['Workshop tools, safety gear'], ''],
  ];
  // Shape: category, level, grade, subject, strand, [sub-strand], outcomes,
  // learning experiences, inquiry questions, resources, inclusive notes.
  // Some rows omit the sub-strand (and fold it into the strand with an em dash),
  // so the slot is detected rather than assumed — indexing these wrongly binds an
  // array to a TEXT column, which D1 rejects and takes the whole route down.
  return rows.map((r, i) => {
    const hasSubStrand = !Array.isArray(r[5]);
    const strandCell = String(r[4] || '');
    const parts = strandCell.split('—').map((s) => s.trim());
    const rest = hasSubStrand ? r.slice(6) : r.slice(5);
    const [outcomes, experiences, inquiry, resources, inclusive] = rest;
    return {
      id: `kicd_starter_${i + 1}`,
      tenant_id: tenantId,
      category: String(r[0] || ''),
      level: String(r[1] || ''),
      grade: String(r[2] || ''),
      subject_id: String(r[3] || ''),
      strand: hasSubStrand ? strandCell : parts[0],
      sub_strand: hasSubStrand ? String(r[5] || '') : parts.slice(1).join(' — '),
      outcomes: JSON.stringify(outcomes || []),
      experiences: JSON.stringify(experiences || []),
      competencies: CBC_COMPETENCIES,
      standards: BANDS,
      inquiry: JSON.stringify(inquiry || []),
      resources: JSON.stringify(resources || []),
      inclusive: String(inclusive || ''),
      // Sample content, not KICD curriculum. The app must never present it as
      // official: provenance is what lets a teacher tell the difference.
      origin: 'sample',
      status: 'active',
      source_url: '',
      source_title: 'Sample framework data shipped with ElimuTrack',
      version_label: 'unverified sample',
      version_date: '',
      last_checked_at: '',
    };
  });
}

function designInsert(env, d) {
  return env.DB.prepare(
    `INSERT OR IGNORE INTO kicd_designs
       (id, tenant_id, category, level, grade, subject_id, strand, sub_strand,
        outcomes, experiences, competencies, standards, inquiry, resources, inclusive,
        origin, status, source_url, source_title, version_label, version_date, last_checked_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).bind(d.id, d.tenant_id, d.category, d.level, d.grade, d.subject_id, d.strand, d.sub_strand,
    d.outcomes, d.experiences, d.competencies, d.standards, d.inquiry, d.resources, d.inclusive,
    d.origin, d.status, d.source_url, d.source_title, d.version_label, d.version_date, d.last_checked_at);
}

async function ensureKicdLibrary(env, tenantId) {
  // Do not auto-load sample data - use only real KICD designs added by admin
  // Remove any existing sample data
  try {
    await env.DB.prepare("DELETE FROM kicd_designs WHERE tenant_id = ? AND origin = 'sample'").bind(tenantId).run();
  } catch {
    // ignore
  }
  const markDone = () => env.DB.prepare(
    'UPDATE tenants SET kicd_pilot_backfilled = 1 WHERE id = ?',
  ).bind(tenantId).run();
  try {
    await markDone();
  } catch {
    // ignore
  }
}

function designToJson(r) {
  return {
    id: r.id, category: r.category, level: r.level, grade: r.grade,
    subjectId: r.subject_id, strand: r.strand, subStrand: r.sub_strand,
    outcomes: parseList(r.outcomes), experiences: parseList(r.experiences),
    competencies: parseList(r.competencies),
    standards: parseList(r.standards), inquiry: parseList(r.inquiry),
    resources: parseList(r.resources), inclusive: r.inclusive || '',
    origin: r.origin || 'school',
    status: r.status || 'active',
    sourceUrl: r.source_url || '',
    sourceTitle: r.source_title || '',
    versionLabel: r.version_label || '',
    versionDate: r.version_date || '',
    lastCheckedAt: r.last_checked_at || '',
  };
}

async function listKicd(env, access, q) {
  await ensureKicdLibrary(env, access.tenant.id);
  const clauses = ['tenant_id = ?'];
  const binds = [access.tenant.id];
  const category = q.get('category') || 'regular';
  clauses.push('category = ?'); binds.push(category);
  // Do not show sample data
  if (q.get('includeSample') !== '1') clauses.push("origin <> 'sample'");
  if (q.get('level')) { clauses.push('level = ?'); binds.push(q.get('level')); }
  if (q.get('grade')) { clauses.push('grade = ?'); binds.push(q.get('grade')); }
  if (q.get('subject')) { clauses.push('subject_id = ?'); binds.push(q.get('subject')); }
  if (q.get('strand')) { clauses.push('strand = ?'); binds.push(q.get('strand')); }
  if (q.get('origin')) {
    if (!ORIGINS.includes(q.get('origin'))) return err(400, 'VALIDATION', 'Unknown origin');
    clauses.push('origin = ?'); binds.push(q.get('origin'));
  }
  // Withdrawn versions stay in the table so reports keep their history, but
  // they are not offered for new planning unless explicitly requested.
  if (q.get('includeDisabled') !== '1') clauses.push("status <> 'disabled'");
  const res = await env.DB.prepare(
    `SELECT * FROM kicd_designs WHERE ${clauses.join(' AND ')} ORDER BY level, subject_id, strand`,
  ).bind(...binds).all();
  const designs = res.results.map(designToJson);
  const strands = [...new Set(designs.map((d) => d.strand).filter(Boolean))].sort();
  return {
    levels: KICD_LEVELS,
    sources: KICD_SOURCES,
    strands,
    designs,
  };
}

async function saveKicd(env, access, body, isUpdate) {
  if (access.role !== 'admin') return err(403, 'FORBIDDEN', 'Only the administrator maintains the KICD library');
  const category = String(body.category || 'regular');
  if (!['regular', 'sne'].includes(category)) return err(400, 'VALIDATION', 'Category must be regular or sne');
  const level = String(body.level || '');
  const subjectId = String(body.subjectId || '');
  const strand = String(body.strand || '').trim();
  if (!KICD_LEVELS.includes(level) || !subjectId || !strand) {
    return err(400, 'VALIDATION', 'Level, learning area and strand are required');
  }
  const values = [
    level, String(body.grade || ''), subjectId, strand, String(body.subStrand || ''),
    toJsonList(body.outcomes), toJsonList(body.experiences),
    toJsonList(body.competencies), toJsonList(body.standards),
    toJsonList(body.inquiry), toJsonList(body.resources), String(body.inclusive || ''),
  ];

  // Provenance. Content claimed as official must cite where it came from,
  // otherwise a teacher cannot tell KICD curriculum from school notes.
  const origin = String(body.origin || 'school');
  if (!ORIGINS.includes(origin)) return err(400, 'VALIDATION', 'Origin must be KICD, school or sample');
  const status = String(body.status || 'active');
  if (!['active', 'disabled'].includes(status)) return err(400, 'VALIDATION', 'Status must be active or disabled');
  const sourceUrl = String(body.sourceUrl || '').trim();
  if (sourceUrl && !/^https:\/\//.test(sourceUrl)) {
    return err(400, 'VALIDATION', 'Source link must be an https URL');
  }
  if (origin === 'kicd' && !sourceUrl) {
    return err(400, 'VALIDATION', 'Official KICD content needs its source link and version');
  }
  if (origin === 'kicd' && !String(body.versionLabel || '').trim()) {
    return err(400, 'VALIDATION', 'Official KICD content needs a version label');
  }
  const provenance = [
    origin, status, sourceUrl, String(body.sourceTitle || '').slice(0, 200),
    String(body.versionLabel || '').slice(0, 120), String(body.versionDate || '').slice(0, 40),
    String(body.lastCheckedAt || '').slice(0, 40),
  ];

  if (isUpdate) {
    const id = String(body.id || '');
    await env.DB.prepare(
      `UPDATE kicd_designs SET category = ?, level = ?, grade = ?, subject_id = ?, strand = ?,
              sub_strand = ?, outcomes = ?, experiences = ?, competencies = ?, standards = ?,
              inquiry = ?, resources = ?, inclusive = ?,
              origin = ?, status = ?, source_url = ?, source_title = ?, version_label = ?,
              version_date = ?, last_checked_at = ?, updated_at = datetime('now')
        WHERE id = ? AND tenant_id = ?`,
    ).bind(category, ...values, ...provenance, id, access.tenant.id).run();
    return json({ ok: true });
  }
  const id = `kicd_${uuid()}`;
  await env.DB.prepare(
    `INSERT INTO kicd_designs
       (id, tenant_id, category, level, grade, subject_id, strand, sub_strand,
        outcomes, experiences, competencies, standards, inquiry, resources, inclusive,
        origin, status, source_url, source_title, version_label, version_date, last_checked_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).bind(id, access.tenant.id, category, ...values, ...provenance).run();
  return json({ design: { id } }, { status: 201 });
}

async function deleteKicd(env, access, body) {
  if (access.role !== 'admin') return err(403, 'FORBIDDEN', 'Only the administrator maintains the KICD library');
  const id = String(body.id || '');
  await env.DB.prepare('DELETE FROM kicd_designs WHERE id = ? AND tenant_id = ?')
    .bind(id, access.tenant.id).run();
  return json({ ok: true });
}

/* --------------------------------------------------------- KLB books & topics */

async function listKlbBooks(env, access, q) {
  const clauses = ['tenant_id = ?'];
  const binds = [access.tenant.id];
  if (q.get('grade')) { clauses.push('grade = ?'); binds.push(q.get('grade')); }
  if (q.get('subject')) { clauses.push('subject_id = ?'); binds.push(q.get('subject')); }
  if (q.get('status') !== 'all') clauses.push("status = 'active'");
  const res = await env.DB.prepare(
    `SELECT * FROM klb_books WHERE ${clauses.join(' AND ')} ORDER BY grade, subject_id, book_title`,
  ).bind(...binds).all();
  return {
    books: res.results.map((r) => ({
      id: r.id,
      publisher: r.publisher,
      bookTitle: r.book_title,
      grade: r.grade,
      level: r.level,
      subjectId: r.subject_id,
      edition: r.edition,
      year: r.year,
      isbn: r.isbn,
      licenseInfo: r.license_info,
      permittedUsage: r.permitted_usage,
      sourceDoc: r.source_doc,
      version: r.version,
      status: r.status,
    })),
  };
}

async function saveKlbBook(env, access, body, isUpdate) {
  if (access.role !== 'admin') return err(403, 'FORBIDDEN', 'Only the administrator manages KLB books');
  const bookTitle = String(body.bookTitle || '').trim();
  const grade = String(body.grade || '').trim();
  const subjectId = String(body.subjectId || '').trim();
  if (!bookTitle || !grade || !subjectId) return err(400, 'VALIDATION', 'Book title, grade and subject are required');
  const values = [
    String(body.publisher || ''),
    bookTitle,
    grade,
    String(body.level || ''),
    subjectId,
    String(body.edition || ''),
    String(body.year || ''),
    String(body.isbn || ''),
    String(body.licenseInfo || ''),
    String(body.permittedUsage || ''),
    String(body.sourceDoc || ''),
    String(body.version || '1.0'),
    String(body.status || 'active'),
  ];
  if (isUpdate) {
    const id = String(body.id || '');
    await env.DB.prepare(
      `UPDATE klb_books SET publisher=?, book_title=?, grade=?, level=?, subject_id=?, edition=?, year=?, isbn=?,
              license_info=?, permitted_usage=?, source_doc=?, version=?, status=?, updated_at=datetime('now')
       WHERE id=? AND tenant_id=?`,
    ).bind(...values, id, access.tenant.id).run();
    return json({ ok: true });
  }
  const id = `klb_${uuid()}`;
  await env.DB.prepare(
    `INSERT INTO klb_books (id, tenant_id, publisher, book_title, grade, level, subject_id, edition, year, isbn,
       license_info, permitted_usage, source_doc, version, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).bind(id, access.tenant.id, ...values).run();
  return json({ book: { id } }, { status: 201 });
}

async function listKlbTopics(env, access, q) {
  const clauses = ['t.tenant_id = ?'];
  const binds = [access.tenant.id];
  if (q.get('bookId')) { clauses.push('t.book_id = ?'); binds.push(q.get('bookId')); }
  if (q.get('grade')) { clauses.push('t.grade = ?'); binds.push(q.get('grade')); }
  if (q.get('subject')) { clauses.push('t.subject_id = ?'); binds.push(q.get('subject')); }
  if (q.get('term')) { clauses.push('t.term = ?'); binds.push(q.get('term')); }
  const res = await env.DB.prepare(
    `SELECT t.*, b.book_title, b.publisher
       FROM klb_topics t LEFT JOIN klb_books b ON b.id = t.book_id
      WHERE ${clauses.join(' AND ')} ORDER BY t.lesson_seq, t.topic`,
  ).bind(...binds).all();
  return {
    topics: res.results.map((r) => ({
      id: r.id,
      bookId: r.book_id,
      bookTitle: r.book_title,
      publisher: r.publisher,
      grade: r.grade,
      subjectId: r.subject_id,
      term: r.term,
      topic: r.topic,
      subtopic: r.subtopic,
      lessonSeq: r.lesson_seq,
      strand: r.strand,
      subStrand: r.sub_strand,
      outcomes: r.outcomes ? JSON.parse(r.outcomes) : [],
      activities: r.activities ? JSON.parse(r.activities) : [],
      experiences: r.experiences ? JSON.parse(r.experiences) : [],
      resources: r.resources ? JSON.parse(r.resources) : [],
      assessment: r.assessment ? JSON.parse(r.assessment) : [],
      pageRefs: r.page_refs,
      week: r.week,
    })),
  };
}

async function saveKlbTopic(env, access, body, isUpdate) {
  if (access.role !== 'admin') return err(403, 'FORBIDDEN', 'Only the administrator manages KLB content');
  const topic = String(body.topic || '').trim();
  if (!topic) return err(400, 'VALIDATION', 'Topic is required');
  const values = [
    String(body.bookId || ''),
    String(body.grade || ''),
    String(body.subjectId || ''),
    String(body.term || ''),
    topic,
    String(body.subtopic || ''),
    Number(body.lessonSeq || 0),
    String(body.strand || ''),
    String(body.subStrand || ''),
    JSON.stringify(Array.isArray(body.outcomes) ? body.outcomes : []),
    JSON.stringify(Array.isArray(body.activities) ? body.activities : []),
    JSON.stringify(Array.isArray(body.experiences) ? body.experiences : []),
    JSON.stringify(Array.isArray(body.resources) ? body.resources : []),
    JSON.stringify(Array.isArray(body.assessment) ? body.assessment : []),
    String(body.pageRefs || ''),
    body.week ? Number(body.week) : null,
  ];
  if (isUpdate) {
    const id = String(body.id || '');
    await env.DB.prepare(
      `UPDATE klb_topics SET book_id=?, grade=?, subject_id=?, term=?, topic=?, subtopic=?, lesson_seq=?,
              strand=?, sub_strand=?, outcomes=?, activities=?, experiences=?, resources=?, assessment=?,
              page_refs=?, week=?, updated_at=datetime('now')
       WHERE id=? AND tenant_id=?`,
    ).bind(...values, id, access.tenant.id).run();
    return json({ ok: true });
  }
  const id = `klbt_${uuid()}`;
  await env.DB.prepare(
    `INSERT INTO klb_topics (id, tenant_id, book_id, grade, subject_id, term, topic, subtopic, lesson_seq,
       strand, sub_strand, outcomes, activities, experiences, resources, assessment, page_refs, week)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).bind(id, access.tenant.id, ...values).run();
  return json({ topic: { id } }, { status: 201 });
}

/* ------------------------------------------- approved material references */

/**
 * Bibliographic pointers to material KICD has approved or published, verified
 * against kicd.ac.ke on 2026-10-28. Nothing is hosted here: KICD's site is
 * "All Rights Reserved", so an approval listing does not grant redistribution.
 */
const RESOURCE_SEED = [
  {
    category: 'curriculum_design',
    title: 'CBC Materials',
    level: '', grade: '', learningArea: '',
    note: 'KICD hub linking curriculum designs, approved learning materials, teacher education resources and parental engagement guidelines.',
    url: 'https://kicd.ac.ke/cbc-materials/', versionDate: '',
  },
  {
    category: 'curriculum_design',
    title: 'Curriculum Designs',
    level: '', grade: '', learningArea: '',
    note: 'Index of curriculum designs for regular learners and for learners with special needs.',
    url: 'https://kicd.ac.ke/cbc-materials/curriculum-designs/', versionDate: '',
  },
  {
    category: 'curriculum_design',
    title: 'Regular Curriculum Designs',
    level: 'Lower Primary', grade: 'Grade 1', learningArea: '',
    note: 'Navigation table for Pre-Primary, Lower Primary and Upper Primary designs.',
    url: 'https://kicd.ac.ke/cbc-materials/curriculum-designs/regular-curriculum-designs/', versionDate: '',
  },
  {
    category: 'curriculum_design',
    title: 'Lower Primary Curriculum Designs, Volume 1',
    level: 'Lower Primary', grade: 'Grade 1', learningArea: '',
    note: 'Official design volume carrying the lower-primary designs (four volumes).',
    url: 'https://kicd.ac.ke/wp-content/uploads/2017/10/Volume-1-curriculum-designs-September-2017.pdf', versionDate: '2017-09',
  },
  {
    category: 'course_book',
    title: 'Approved CBC Course Materials (PP1, PP2 & Grades 1-9)',
    level: 'Lower Primary', grade: 'Grade 1', learningArea: '',
    note: 'KICD list of approved course books. Consult the list for publisher and approval details; files are not stored here.',
    url: 'https://kicd.ac.ke/cbc-materials/approved-cbc-course-materials/', versionDate: '',
  },
  {
    category: 'complementary',
    title: 'Approved Complementary Materials',
    level: '', grade: '', learningArea: '',
    note: 'KICD list of approved complementary materials alongside the core course books.',
    url: 'https://kicd.ac.ke/cbc-materials/approved-complementary-materials/', versionDate: '',
  },
  {
    category: 'parent',
    title: 'Guidelines on Parental Empowerment and Engagement',
    level: '', grade: '', learningArea: '',
    note: 'Official guidance for home-school communication and parental engagement.',
    url: 'https://kicd.ac.ke/cbc-materials/guidelines-on-parental-empowerment-and-engagement/', versionDate: '',
  },
];
const RESOURCE_CHECKED_ON = '2026-10-28';
const RESOURCE_CATEGORIES = ['curriculum_design', 'course_book', 'complementary', 'teacher', 'parent'];

async function ensureResourceLibrary(env, tenantId) {
  const count = await env.DB.prepare('SELECT COUNT(*) AS n FROM approved_resources WHERE tenant_id = ?')
    .bind(tenantId).first();
  if ((count?.n ?? 0) > 0) return;
  await env.DB.batch(RESOURCE_SEED.map((r, i) => env.DB.prepare(
    `INSERT OR IGNORE INTO approved_resources
       (id, tenant_id, category, title, publisher, level, grade, learning_area,
        approval_note, source_url, version_date, last_checked_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).bind(
    `res_seed_${i + 1}`, tenantId, r.category, r.title,
    'Kenya Institute of Curriculum Development', r.level, r.grade, r.learningArea,
    r.note, r.url, r.versionDate, RESOURCE_CHECKED_ON,
  )));
}

function resourceToJson(r) {
  return {
    id: r.id, category: r.category, title: r.title, publisher: r.publisher,
    level: r.level, grade: r.grade, learningArea: r.learning_area,
    approvalNote: r.approval_note, sourceUrl: r.source_url,
    versionDate: r.version_date, lastCheckedAt: r.last_checked_at,
    status: r.status || 'active',
  };
}

async function listResources(env, access, q) {
  await ensureResourceLibrary(env, access.tenant.id);
  const clauses = ['tenant_id = ?'];
  const binds = [access.tenant.id];
  if (q.get('category')) {
    if (!RESOURCE_CATEGORIES.includes(q.get('category'))) return err(400, 'VALIDATION', 'Unknown category');
    clauses.push('category = ?'); binds.push(q.get('category'));
  }
  if (q.get('level')) { clauses.push('level = ?'); binds.push(q.get('level')); }
  if (q.get('grade')) { clauses.push('grade = ?'); binds.push(q.get('grade')); }
  if (q.get('learningArea')) { clauses.push('learning_area = ?'); binds.push(q.get('learningArea')); }
  if (q.get('q')) {
    clauses.push('(title LIKE ? OR publisher LIKE ? OR approval_note LIKE ? OR learning_area LIKE ?)');
    const like = `%${q.get('q')}%`;
    binds.push(like, like, like, like);
  }
  if (q.get('includeDisabled') !== '1') clauses.push("status <> 'disabled'");
  const res = await env.DB.prepare(
    `SELECT * FROM approved_resources WHERE ${clauses.join(' AND ')} ORDER BY category, level, title`,
  ).bind(...binds).all();
  return {
    categories: RESOURCE_CATEGORIES,
    checkedOn: RESOURCE_CHECKED_ON,
    resources: res.results.map(resourceToJson),
  };
}

async function saveResource(env, access, body, isUpdate) {
  if (access.role !== 'admin') return err(403, 'FORBIDDEN', 'Only the administrator maintains curriculum sources');
  const title = String(body.title || '').trim();
  const category = String(body.category || '');
  const url = String(body.sourceUrl || '').trim();
  if (!title || !category) return err(400, 'VALIDATION', 'Title and category are required');
  if (!RESOURCE_CATEGORIES.includes(category)) return err(400, 'VALIDATION', 'Unknown category');
  if (url && !/^https:\/\//.test(url)) return err(400, 'VALIDATION', 'Link must be an https URL');
  const status = String(body.status || 'active');
  if (!['active', 'disabled'].includes(status)) return err(400, 'VALIDATION', 'Status must be active or disabled');
  const values = [
    category, title, String(body.publisher || '').slice(0, 200),
    String(body.level || ''), String(body.grade || ''), String(body.learningArea || '').slice(0, 120),
    String(body.approvalNote || '').slice(0, 1000), url,
    String(body.versionDate || '').slice(0, 40), String(body.lastCheckedAt || '').slice(0, 40), status,
  ];
  if (isUpdate) {
    const id = String(body.id || '');
    await env.DB.prepare(
      `UPDATE approved_resources SET category = ?, title = ?, publisher = ?, level = ?, grade = ?,
              learning_area = ?, approval_note = ?, source_url = ?, version_date = ?,
              last_checked_at = ?, status = ?, updated_at = datetime('now')
        WHERE id = ? AND tenant_id = ?`,
    ).bind(...values, id, access.tenant.id).run();
    return json({ ok: true });
  }
  const id = `res_${uuid()}`;
  await env.DB.prepare(
    `INSERT INTO approved_resources
       (id, tenant_id, category, title, publisher, level, grade, learning_area,
        approval_note, source_url, version_date, last_checked_at, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).bind(id, access.tenant.id, ...values).run();
  return json({ resource: { id } }, { status: 201 });
}

async function deleteResource(env, access, body) {
  if (access.role !== 'admin') return err(403, 'FORBIDDEN', 'Only the administrator maintains curriculum sources');
  const id = String(body.id || '');
  await env.DB.prepare('DELETE FROM approved_resources WHERE id = ? AND tenant_id = ?')
    .bind(id, access.tenant.id).run();
  return json({ ok: true });
}

/* ---------------------------------------------------------------- router */


async function updateLearner(env, access, body) {
  if (access.role !== 'admin') return err(403, 'FORBIDDEN', 'Only admin can update learner details');
  const id = String(body.id || '').trim();
  if (!id) return err(400, 'VALIDATION', 'Learner id required');
  const tenant = access.tenant;

  const row = await env.DB.prepare('SELECT * FROM learners WHERE id = ? AND tenant_id = ?').bind(id, tenant.id).first();
  if (!row) return err(404, 'NOT_FOUND', 'Learner not found');

  const updates = [];
  const binds = [];
  if (body.boarding !== undefined) { updates.push('boarding = ?'); binds.push(body.boarding === true || body.boarding === 1 ? 1 : 0); }
  if (body.isBoarding !== undefined) { updates.push('boarding = ?'); binds.push(body.isBoarding === true || body.isBoarding === 1 ? 1 : 0); }
  if (body.admissionFeePaid !== undefined) { updates.push('admission_fee_paid = ?'); binds.push(body.admissionFeePaid === true || body.admissionFeePaid === 1 ? 1 : 0); }
  if (body.additionalFees !== undefined || body.additional_fees !== undefined) {
    const add = Number(body.additionalFees || body.additional_fees || 0) || 0;
    updates.push('additional_fees = ?'); binds.push(add);
    // recalc total fee
    const gradeLevel = row.grade_level;
    const isBoarding = body.boarding !== undefined ? (body.boarding === true || body.boarding === 1) : (row.boarding === 1);
    const baseFee = await PRIMARY_OR_JSS_FEE(env, tenant.id, gradeLevel, isBoarding);
    updates.push('fee_total = ?'); binds.push(baseFee + add);
  }

  if (updates.length === 0) return json({ ok: true });

  binds.push(id, tenant.id);
  await env.DB.prepare(`UPDATE learners SET ${updates.join(', ')} WHERE id = ? AND tenant_id = ?`).bind(...binds).run();

  const updated = await env.DB.prepare(
    `SELECT id, name, gender, stream, grade_level, admission_no, nemis_upi, knec_no,
            guardian_phone, fee_total, fee_paid, attendance_pct, boarding, admission_fee_paid, additional_fees
       FROM learners WHERE id = ? AND tenant_id = ?`
  ).bind(id, tenant.id).first();

  return json({
    learner: {
      id: updated.id, name: updated.name, gender: updated.gender, stream: updated.stream,
      gradeLevel: updated.grade_level, admissionNo: updated.admission_no, nemisUpi: updated.nemis_upi || '',
      knecNo: updated.knec_no || '', guardianPhone: updated.guardian_phone || '',
      feeTotal: updated.fee_total, feePaid: updated.fee_paid,
      feeBalance: Math.max(0, updated.fee_total - updated.fee_paid), attendancePct: updated.attendance_pct,
      boarding: updated.boarding === 1 || updated.boarding === true,
      admissionFeePaid: updated.admission_fee_paid === 1 || updated.admission_fee_paid === true,
      additionalFees: updated.additional_fees || 0,
    },
  });
}

async function handleApi(request, env, user) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;
  const mutating = method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE';

  // CSRF first: a state-changing request from a foreign origin is rejected
  // outright, before any tenant work happens.
  if (mutating && !isSameOriginRequest(request, env.APP_ORIGIN)) {
    return err(403, 'BAD_ORIGIN', 'Cross-origin request rejected');
  }

  const body = mutating ? await request.json().catch(() => ({})) : {};
  const q = url.searchParams;

  // ---- session (public): says who you are and exactly what you may see
  if (path === '/api/session') {
    const access = await accessFor(env, user, request);
    return json(sessionPayload(access, user));
  }

  // ---- school logins created by the admin (teachers)
  if (path === '/api/auth/login' && method === 'POST') return staffLogin(env, request, body);
  if (path === '/api/auth/logout' && method === 'POST') return staffLogout(env, request);

  // Everything below requires an account: a Freebuff admin or a staff session.
  const access = await accessFor(env, user, request);
  if (!access) return err(401, 'UNAUTHENTICATED', 'Sign in required');

  const tenant = access.tenant;
  const spec = access.spec;
  const author = access.staff
    ? access.staff.name
    : (user && (user.name || user.email)) || 'Admin';

  // ---- a teacher changing their own username / password
  if (path === '/api/auth/change-login' && method === 'POST') return changeOwnLogin(env, access, body);

  // The initial login the admin created must be replaced before any other
  // teacher route works — enforced here, not just in the UI.
  if (access.staff && access.staff.must_change_login) {
    return err(403, 'MUST_CHANGE_LOGIN', 'Change your initial login before continuing');
  }

  // ---- administrator-only surface
  if (ADMIN_PATHS.some((p) => path === p || path.startsWith(`${p}/`)) && access.role !== 'admin') {
    return err(403, 'FORBIDDEN', 'Administrator access required');
  }
  if (path === '/api/staff' && method === 'GET') return json({ staff: await staffWithGrants(env, tenant.id) });
  if (path === '/api/staff' && method === 'POST') return createStaff(env, access, body);
  if (path === '/api/staff' && method === 'PUT') return updateStaff(env, access, body);
  if (path === '/api/staff/reset' && method === 'POST') return resetStaffLogin(env, access, body);
  if (path === '/api/fees/config' && method === 'GET') {
    const config = await getFeeConfig(env, tenant.id);
    return json({ config });
  }
  if (path === '/api/fees/config' && method === 'POST') {
    return saveFeeConfig(env, access, body);
  }
  if (path === '/api/lesson-plans/template' && method === 'PUT') {
    if (access.role !== 'admin') return err(403, 'FORBIDDEN', 'Administrator access required');
    return saveTemplate(env, tenant.id, body);
  }

  if (path === '/api/plan' && method === 'POST') {
    const plan = String(body.plan || '');
    if (!PLAN_SPECS[plan]) return err(400, 'VALIDATION', 'Unknown plan');
    await env.DB.prepare('UPDATE tenants SET plan = ? WHERE id = ?').bind(plan, tenant.id).run();
    return json({ plan, planSpec: PLAN_SPECS[plan] });
  }
  if (path === '/api/seed' && method === 'POST') return seedDemo(env, tenant);

  // ---- service gating: a teacher only reaches the services the admin granted
  // The learner roster is shared backing data for several of those modules,
  // so reading it is allowed when ANY of them is granted — still class-scoped.
  const LEARNER_ROSTER = [
    'learners', 'marks', 'attendance', 'observations',
    'fees', 'whatsapp', 'reportcards', 'broadsheet', 'progress',
  ];
  const required = path === '/api/learners'
    ? null
    : SERVICE_BY_PATH[path];
  if (access.role === 'teacher') {
    if (path === '/api/learners' && !LEARNER_ROSTER.some((s) => access.services.has(s))) {
      return err(403, 'SERVICE_DENIED', 'This module is not enabled for your account');
    }
    if (required && !access.services.has(required)) {
      return err(403, 'SERVICE_DENIED', 'This module is not enabled for your account');
    }
  }

  // ---- lesson plans (standard template + stored plans)
  if (path === '/api/lesson-plans') {
    if (method === 'GET') {
      const template = await getTemplate(env, tenant.id);
      return json({ template, plans: await listLessonPlans(env, access) });
    }
    if (method === 'POST') return saveLessonPlan(env, access, user, body);
    if (method === 'PUT') return updateLessonPlan(env, access, user, body);
    if (method === 'DELETE') return deleteLessonPlan(env, access, body);
  }

  // ---- schemes of work (built from the KICD designs)
  if (path === '/api/schemes') {
    if (method === 'GET') return json({ rows: await listSchemes(env, access, q) });
    if (method === 'POST') return saveScheme(env, access, user, body, false);
    if (method === 'PUT') return saveScheme(env, access, user, body, true);
    if (method === 'DELETE') return deleteScheme(env, access, body);
  }

  // ---- timetable (admin writes; teachers read their own lessons)
  if (path === '/api/timetable' && method === 'GET') return json(await timetableData(env, access));
  if (path === '/api/timetable/entry' && method === 'POST') return saveTimetableEntry(env, access, body);
  if (path === '/api/timetable/entry' && method === 'DELETE') return deleteTimetableEntry(env, access, body);
  if (path === '/api/timetable/periods' && method === 'PUT') return saveTimetablePeriods(env, access, body);

  // ---- record of work
  if (path === '/api/recordwork') {
    if (method === 'GET') return json({ rows: await listRecordOfWork(env, access, q) });
    if (method === 'POST') return saveRecordOfWork(env, access, user, body, false);
    if (method === 'PUT') return saveRecordOfWork(env, access, user, body, true);
    if (method === 'DELETE') return deleteRecordOfWork(env, access, body);
  }

  // ---- learners' progress records
  if (path === '/api/progress') {
    if (method === 'GET') return json({ records: await listProgress(env, access, q) });
    if (method === 'POST') return addProgress(env, access, user, body);
    if (method === 'DELETE') return deleteProgress(env, access, body);
  }

  // ---- KICD curriculum designs (Regular / SNE library)
  if (path === '/api/kicd') {
    if (method === 'GET') return json(await listKicd(env, access, q));
    if (method === 'POST') return saveKicd(env, access, body, false);
    if (method === 'PUT') return saveKicd(env, access, body, true);
    if (method === 'DELETE') return deleteKicd(env, access, body);
  }

  // ---- approved-material reference index: metadata and links only
  if (path === '/api/resources') {
    if (method === 'GET') return json(await listResources(env, access, q));
    if (method === 'POST') return saveResource(env, access, body, false);
    if (method === 'PUT') return saveResource(env, access, body, true);
    if (method === 'DELETE') return deleteResource(env, access, body);
  }

  // ---- KLB books and topics
  if (path === '/api/klb/books') {
    if (method === 'GET') return json(await listKlbBooks(env, access, q));
    if (method === 'POST') return saveKlbBook(env, access, body, false);
    if (method === 'PUT') return saveKlbBook(env, access, body, true);
  }
  if (path === '/api/klb/topics') {
    if (method === 'GET') return json(await listKlbTopics(env, access, q));
    if (method === 'POST') return saveKlbTopic(env, access, body, false);
    if (method === 'PUT') return saveKlbTopic(env, access, body, true);
  }

  // ---- learners
  if (path === '/api/learners' && method === 'GET') return json({ learners: await listLearners(env, access) });
  if (path === '/api/learners' && method === 'POST') return createLearner(env, access, body, spec);
  if ((path === '/api/learners' || path === '/api/learner') && (method === 'PUT' || method === 'PATCH')) return updateLearner(env, access, body);
  if (path.startsWith('/api/learners/') && (method === 'PUT' || method === 'PATCH')) {
    const id = path.split('/api/learners/')[1];
    return updateLearner(env, access, { ...body, id });
  }

  // ---- marks
  if (path === '/api/marks' && method === 'GET') {
    return json({ marks: await listMarks(env, access, { stream: q.get('stream') || '', learnerId: q.get('learner') || '' }) });
  }
  if (path === '/api/marks' && method === 'PUT') return saveMarks(env, access, body.items);

  // ---- attendance
  if (path === '/api/attendance' && method === 'GET') {
    const scope = scopeClause(access, 'l.');
    const res = await env.DB.prepare(
      `SELECT a.learner_id, a.day, a.status
         FROM attendance a JOIN learners l ON l.id = a.learner_id
        WHERE a.tenant_id = ?${scope.clause}`,
    ).bind(tenant.id, ...scope.binds).all();
    return json({ records: res.results.map((r) => ({ learnerId: r.learner_id, day: r.day, status: r.status })) });
  }
  if (path === '/api/attendance' && method === 'POST') return saveAttendance(env, access, body.items);

  // ---- observations
  if (path === '/api/observations' && method === 'GET') {
    const scope = scopeClause(access, 'l.');
    const res = await env.DB.prepare(
      `SELECT o.id, o.learner_id, o.day, o.note, o.author, o.created_at, l.name AS learner_name, l.stream
         FROM observations o JOIN learners l ON l.id = o.learner_id
        WHERE o.tenant_id = ?${scope.clause} ORDER BY o.created_at DESC LIMIT 100`,
    ).bind(tenant.id, ...scope.binds).all();
    return json({
      observations: res.results.map((r) => ({
        id: r.id, learnerId: r.learner_id, learnerName: r.learner_name, stream: r.stream,
        day: r.day, note: r.note, author: r.author, createdAt: r.created_at,
      })),
    });
  }
  if (path === '/api/observations' && method === 'POST') return saveObservations(env, access, author, body.items);

  // ---- settings
  if (path === '/api/settings' && method === 'GET') {
    if (access.role !== 'admin') return err(403, 'FORBIDDEN', 'Admin only');
    const row = await env.DB.prepare('SELECT * FROM school_settings WHERE tenant_id = ?').bind(tenant.id).first();
    return json({
      schoolType: row?.school_type || 'both',
      streams: row?.streams_config ? JSON.parse(row.streams_config || '[]') : []
    });
  }
  if (path === '/api/settings' && method === 'POST') {
    if (access.role !== 'admin') return err(403, 'FORBIDDEN', 'Admin only');
    await env.DB.prepare(
      `INSERT INTO school_settings (tenant_id, school_type, streams_config)
       VALUES (?, ?, ?)
       ON CONFLICT(tenant_id) DO UPDATE SET
         school_type = excluded.school_type,
         streams_config = excluded.streams_config,
         updated_at = datetime('now')`,
    ).bind(tenant.id, body.schoolType || 'both', JSON.stringify(body.streams || [])).run();
    return json({ ok: true });
  }

  // ---- fees
  if (path === '/api/payments' && method === 'GET') {
    const scope = scopeClause(access, 'l.');
    const res = await env.DB.prepare(
      `SELECT p.id, p.learner_id, p.amount, p.phone, p.reference, p.created_at, l.name AS learner_name
         FROM payments p JOIN learners l ON l.id = p.learner_id
        WHERE p.tenant_id = ?${scope.clause} ORDER BY p.created_at DESC LIMIT 100`,
    ).bind(tenant.id, ...scope.binds).all();
    return json({
      payments: res.results.map((r) => ({
        id: r.id, learnerId: r.learner_id, learnerName: r.learner_name,
        amount: r.amount, phone: r.phone, reference: r.reference, createdAt: r.created_at,
      })),
    });
  }
  if (path === '/api/payments' && method === 'POST') return postPayment(env, access, body);

  // ---- whatsapp (Evolution API)
  if (path === '/api/whatsapp' && method === 'GET') {
    const cfg = evolutionConfig(env);
    const scope = scopeClause(access, 'l.');
    const res = await env.DB.prepare(
      `SELECT w.id, w.learner_id, w.phone, w.message, w.status, w.error, w.created_at, l.name AS learner_name
         FROM whatsapp_log w JOIN learners l ON l.id = w.learner_id
        WHERE w.tenant_id = ?${scope.clause} ORDER BY w.created_at DESC LIMIT 100`,
    ).bind(tenant.id, ...scope.binds).all();
    return json({
      configured: cfg.configured,
      messages: res.results.map((r) => ({
        id: r.id, learnerId: r.learner_id, learnerName: r.learner_name,
        phone: r.phone, message: r.message, status: r.status,
        error: r.error || '', createdAt: r.created_at,
      })),
    });
  }
  if (path === '/api/whatsapp' && method === 'POST') return sendWhatsapp(env, access, body, spec);

  // ---- dashboard / broadsheet
  if (path === '/api/dashboard' && method === 'GET') {
    return json(await dashboard(env, access, q.get('stream') || ''));
  }
  if (path === '/api/broadsheet/csv' && method === 'GET') {
    return broadsheetCsv(env, access, q.get('stream') || '', spec);
  }

  return err(404, 'NOT_FOUND', `No route for ${method} ${path}`);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) {
      try {
        await ensureSchema(env);
        let user = null;
        try {
          if (env.FREEBUFF_CLIENT_ID && env.FREEBUFF_ISSUER) {
            const a = createFreebuffAuth({
              clientId: env.FREEBUFF_CLIENT_ID,
              issuer: env.FREEBUFF_ISSUER,
              baseUrl: env.APP_ORIGIN || url.origin,
              allowInsecureLocalhost: /^http:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?\/?$/.test(env.APP_ORIGIN || url.origin),
            });
            user = await a.getUser(request).catch(() => null);
          }
        } catch (_) {}
        return await handleApi(request, env, user);
      } catch (e) {
        return json({ error: 'Server error', code: 'INTERNAL', message: String(e?.message || e) }, { status: 500 });
      }
    }
    if (env.ASSETS) {
      try {
        const res = await env.ASSETS.fetch(request);
        const urlPath = url.pathname;
        const hasFileExt = /\.[a-zA-Z0-9]+$/.test(urlPath);
        if (hasFileExt) {
          const ct = res.headers.get('content-type') || '';
          if (res.status === 404) {
            return new Response('Not Found', { status: 404 });
          }
          if (res.status === 200 && ct.includes('text/html')) {
            // Don't serve HTML for asset files
            return new Response('Not Found', { status: 404 });
          }
          return res;
        }
        if (res.status === 404 || ((res.headers.get('content-type') || '').includes('text/html') && urlPath !== '/')) {
          try {
            const indexRes = await env.ASSETS.fetch(new Request(new URL('/index.html', url.origin)));
            if (indexRes && indexRes.status === 200) return indexRes;
          } catch (_) {}
        }
        return res;
      } catch (e) {
        const hasFileExt = /\.[a-zA-Z0-9]+$/.test(url.pathname);
        if (!hasFileExt) {
          try {
            return await env.ASSETS.fetch(new Request(new URL('/index.html', url.origin)));
          } catch (_) {
            return new Response('Site unavailable', { status: 500 });
          }
        }
        return new Response('Not Found', { status: 404 });
      }
    }
    return new Response('Site unavailable', { status: 500 });
  },
};
