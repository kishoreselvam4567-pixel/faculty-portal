import net from 'net';

let cachedDbStatus: boolean | null = null;
let lastCheckTime = 0;
const CACHE_TTL_MS = 30000; // Cache connection state for 30s to eliminate latency

export function parseDatabaseUrl(urlStr?: string): { host: string; port: number } | null {
  if (!urlStr) return null;
  try {
    if (urlStr.includes('[') || urlStr.includes('YOUR_') || urlStr.includes('PROJECT_REF')) {
      return null;
    }
    const parsed = new URL(urlStr);
    const host = parsed.hostname;
    const port = parsed.port ? parseInt(parsed.port, 10) : 5432;
    if (!host) return null;
    return { host, port };
  } catch {
    return null;
  }
}

/**
 * Rapidly checks if the target database port is accepting connections.
 * Resolves in < 20ms on failed/closed ports without triggering heavy Prisma timeouts.
 */
export async function isDatabaseOnline(): Promise<boolean> {
  const now = Date.now();
  if (cachedDbStatus !== null && now - lastCheckTime < CACHE_TTL_MS) {
    return cachedDbStatus;
  }

  const dbUrl = process.env.DATABASE_URL;
  const parsed = parseDatabaseUrl(dbUrl);

  if (!parsed) {
    cachedDbStatus = false;
    lastCheckTime = now;
    return false;
  }

  // Fast TCP reachability check (max 500ms timeout)
  const isReachable = await new Promise<boolean>((resolve) => {
    const socket = new net.Socket();
    let settled = false;

    socket.setTimeout(500);

    socket.once('connect', () => {
      if (!settled) {
        settled = true;
        socket.destroy();
        resolve(true);
      }
    });

    socket.once('timeout', () => {
      if (!settled) {
        settled = true;
        socket.destroy();
        resolve(false);
      }
    });

    socket.once('error', () => {
      if (!settled) {
        settled = true;
        socket.destroy();
        resolve(false);
      }
    });

    socket.connect(parsed.port, parsed.host);
  });

  cachedDbStatus = isReachable;
  lastCheckTime = now;

  return isReachable;
}

export function markDatabaseOffline(): void {
  cachedDbStatus = false;
  lastCheckTime = Date.now();
}
