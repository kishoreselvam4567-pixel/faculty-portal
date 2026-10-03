import { PrismaClient } from '@prisma/client';
import net from 'net';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

let isDbReachable: boolean | null = null;
let lastCheckTime = 0;
const CACHE_TTL_MS = 30000; // Cache connection state for 30s for maximum speed

export async function isDatabaseAvailable(): Promise<boolean> {
  const now = Date.now();
  if (isDbReachable !== null && now - lastCheckTime < CACHE_TTL_MS) {
    return isDbReachable;
  }

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl || dbUrl.includes('[PROJECT_REF]') || dbUrl.includes('YOUR_')) {
    isDbReachable = false;
    lastCheckTime = now;
    return false;
  }

  let host = 'localhost';
  let port = 5432;
  try {
    const parsed = new URL(dbUrl);
    host = parsed.hostname || 'localhost';
    port = parsed.port ? parseInt(parsed.port, 10) : 5432;
  } catch {
    isDbReachable = false;
    lastCheckTime = now;
    return false;
  }

  // Fast non-blocking socket check with 150ms timeout
  const targetHost = host === 'localhost' ? '127.0.0.1' : host;
  const reachable = await new Promise<boolean>((resolve) => {
    const socket = new net.Socket();
    let settled = false;

    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        socket.destroy();
        resolve(false);
      }
    }, 150);

    socket.once('connect', () => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        socket.destroy();
        resolve(true);
      }
    });

    socket.once('error', () => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        socket.destroy();
        resolve(false);
      }
    });

    socket.connect(port, targetHost);
  });

  isDbReachable = reachable;
  lastCheckTime = now;
  return reachable;
}

export function markDatabaseUnavailable(): void {
  isDbReachable = false;
  lastCheckTime = Date.now();
}

export default prisma;
