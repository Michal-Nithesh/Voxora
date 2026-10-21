export interface ServerConfig {
  port: number;
  frontendOrigin: string;
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
  supabaseJwtSecret: string;
  allowAnonymousPersistence: boolean;
}

export function getServerConfig(env: NodeJS.ProcessEnv = process.env): ServerConfig {
  return {
    port: Number.parseInt(env.PORT || '5001', 10),
    frontendOrigin: env.FRONTEND_ORIGIN || '',
    supabaseUrl: env.SUPABASE_URL || '',
    supabaseServiceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY || '',
    supabaseJwtSecret: env.SUPABASE_JWT_SECRET || '',
    allowAnonymousPersistence: env.ALLOW_ANONYMOUS_PERSISTENCE === 'true',
  };
}

export function hasDatabaseConfig(config = getServerConfig()): boolean {
  return Boolean(config.supabaseUrl && config.supabaseServiceRoleKey);
}