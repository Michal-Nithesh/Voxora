import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';
import type { Request, Response, NextFunction } from 'express';
import { getServerConfig } from './config';

export interface AuthenticatedRequest extends Request {
  authUserId?: string;
}

function bearerToken(req: Request): string | null {
  const value = req.header('authorization');
  if (!value || !/^Bearer\s+\S+$/i.test(value)) return null;
  return value.replace(/^Bearer\s+/i, '').trim();
}

function issuer(config = getServerConfig()): string | undefined {
  return config.supabaseUrl ? `${config.supabaseUrl.replace(/\/$/, '')}/auth/v1` : undefined;
}

async function verifyToken(token: string, config = getServerConfig()): Promise<JWTPayload> {
  const expectedIssuer = issuer(config);
  if (!expectedIssuer) throw new Error('Supabase URL is not configured');
  if (config.supabaseJwtSecret) {
    const secret = new TextEncoder().encode(config.supabaseJwtSecret);
    return (await jwtVerify(token, secret, { issuer: expectedIssuer, audience: 'authenticated' })).payload;
  }
  const jwks = createRemoteJWKSet(new URL(`${expectedIssuer}/.well-known/jwks.json`));
  return (await jwtVerify(token, jwks, { issuer: expectedIssuer, audience: 'authenticated' })).payload;
}

export async function authenticateRequest(req: AuthenticatedRequest): Promise<string | null> {
  const token = bearerToken(req);
  if (!token) return null;
  const payload = await verifyToken(token);
  return typeof payload.sub === 'string' && payload.sub ? payload.sub : null;
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const config = getServerConfig();
    const userId = await authenticateRequest(req);
    if (!userId && process.env.NODE_ENV !== 'production' && config.allowAnonymousPersistence) {
      const developmentOwner = req.header('x-voxora-owner');
      if (developmentOwner && /^[0-9a-f-]{36}$/i.test(developmentOwner)) {
        req.authUserId = developmentOwner;
        next();
        return;
      }
    }
    if (!userId) { res.status(401).json({ error: 'A valid Bearer token is required' }); return; }
    req.authUserId = userId;
    next();
  } catch (error) {
    console.warn('Rejected Supabase access token:', error instanceof Error ? error.message : 'verification failed');
    res.status(401).json({ error: 'Invalid or expired access token' });
  }
}

export function authConfigurationError(): string | null {
  const config = getServerConfig();
  if (process.env.NODE_ENV === 'production' && (!config.supabaseUrl || !config.supabaseServiceRoleKey)) {
    return 'Production requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY';
  }
  return null;
}