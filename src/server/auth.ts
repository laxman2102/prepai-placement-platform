import crypto from 'crypto';

/**
 * Creates a salted scrypt hash of a password.
 * Format: `${salt}:${derivedKey}`
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derivedKey}`;
}

/**
 * Timing-safe verification of a password against a stored hash.
 * Also backwards-compatible with legacy unhashed passwords for development migrations.
 */
export function verifyPassword(password: string, storedHash?: string): boolean {
  if (!storedHash || !password) return false;

  // Support legacy unhashed password comparison if any unmigrated account exists
  if (!storedHash.includes(':')) {
    return password === storedHash;
  }

  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, key] = parts;
  if (!salt || !key) return false;

  try {
    const derivedKey = crypto.scryptSync(password, salt, 64).toString('hex');
    const keyBuf = Buffer.from(key, 'hex');
    const derivedBuf = Buffer.from(derivedKey, 'hex');
    if (keyBuf.length !== derivedBuf.length) return false;
    return crypto.timingSafeEqual(derivedBuf, keyBuf);
  } catch {
    return false;
  }
}

/**
 * Cryptographically signed session token using HMAC-SHA256
 */
const TOKEN_SECRET = process.env.JWT_SECRET || 'prepai_secure_fallback_development_secret_min_32chars_2026';

export function createSignedToken(userId: string, role: string): string {
  const payload = Buffer.from(JSON.stringify({ userId, role, ts: Date.now() })).toString('base64url');
  const hmac = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('hex');
  return `stk_${payload}.${hmac}`;
}

export function verifySignedToken(token: string): { userId: string; role: string } | null {
  if (!token) return null;

  // Signed token format: "stk_{base64urlPayload}.{hmac}"
  if (token.startsWith('stk_')) {
    const raw = token.slice(4);
    const lastDot = raw.lastIndexOf('.');
    if (lastDot === -1) return null;

    const payload = raw.slice(0, lastDot);
    const signature = raw.slice(lastDot + 1);

    const expectedSignature = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('hex');
    try {
      const sigBuf = Buffer.from(signature, 'hex');
      const expBuf = Buffer.from(expectedSignature, 'hex');
      if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
        return null;
      }
    } catch {
      return null;
    }

    try {
      const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
      if (decoded && typeof decoded.userId === 'string' && typeof decoded.role === 'string') {
        return { userId: decoded.userId, role: decoded.role };
      }
    } catch {
      return null;
    }
    return null;
  }

  // Gracefully support legacy token format: "token_{userId}_{role}" for dev transition
  if (token.startsWith('token_')) {
    const withoutPrefix = token.slice(6);
    for (const r of ['ROLE_STUDENT', 'ROLE_MENTOR', 'ROLE_ADMIN']) {
      if (withoutPrefix.endsWith(`_${r}`)) {
        const userId = withoutPrefix.slice(0, withoutPrefix.length - r.length - 1);
        return { userId, role: r };
      }
    }
  }

  return null;
}
