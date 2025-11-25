// Admin authentication utilities

const ADMIN_SESSION_KEY = 'admin_session';
const SESSION_EXPIRY_HOURS = 24;

interface AdminSession {
  password: string;
  expiresAt: number;
}

/**
 * Save admin session to sessionStorage
 */
export function saveAdminSession(password: string): void {
  const expiresAt = Date.now() + (SESSION_EXPIRY_HOURS * 60 * 60 * 1000);
  const session: AdminSession = {
    password,
    expiresAt,
  };

  if (typeof window !== 'undefined') {
    sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
  }
}

/**
 * Get admin session from sessionStorage
 */
export function getAdminSession(): string | null {
  if (typeof window === 'undefined') return null;

  const sessionData = sessionStorage.getItem(ADMIN_SESSION_KEY);
  if (!sessionData) return null;

  try {
    const session: AdminSession = JSON.parse(sessionData);

    // Check if session has expired
    if (Date.now() > session.expiresAt) {
      clearAdminSession();
      return null;
    }

    return session.password;
  } catch {
    return null;
  }
}

/**
 * Clear admin session from sessionStorage
 */
export function clearAdminSession(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
  }
}

/**
 * Check if admin password is valid by testing against an API
 */
export async function validateAdminPassword(password: string, testEndpoint: string): Promise<boolean> {
  try {
    const res = await fetch(`${testEndpoint}?password=${password}`);
    return res.ok;
  } catch {
    return false;
  }
}
