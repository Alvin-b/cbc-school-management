/**
 * Auth entry points served by the Worker by createFreebuffAuth (see
 * node_modules/@freebuff/auth/AGENTS.md):
 *   sign in  — link to /auth/freebuff/signin?returnTo=<path>
 *   sign out — POST form to /auth/freebuff/signout (never a plain link)
 *   session  — GET /auth/freebuff/session (display only; the server decides)
 */
export const AUTH = {
  signin: '/auth/freebuff/signin',
  signout: '/auth/freebuff/signout',
  callback: '/auth/freebuff/callback',
  session: '/auth/freebuff/session',
};

export const signInUrl = (returnTo = '/') =>
  `${AUTH.signin}?returnTo=${encodeURIComponent(returnTo)}`;
