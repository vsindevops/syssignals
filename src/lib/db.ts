import { Pool } from 'pg'

/** Lazily created singleton — survives dev hot-reload without leaking pools. */
const globalForDb = globalThis as unknown as { pgPool?: Pool }

export function db(): Pool {
  if (!globalForDb.pgPool) {
    globalForDb.pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
    })
  }
  return globalForDb.pgPool
}
