import { vi } from 'vitest'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import * as schema from '../src/shared/schema'
import { join } from 'node:path'

let testDb: ReturnType<typeof drizzle<typeof schema>>
let testSqlite: Database.Database

export function setupTestDatabase() {
  testSqlite = new Database(':memory:')
  testSqlite.pragma('foreign_keys = ON')
  testDb = drizzle(testSqlite, { schema })
  migrate(testDb, { migrationsFolder: join(__dirname, '../drizzle') })
  return testDb
}

export function getTestDatabase() {
  if (!testDb) throw new Error('Test database not initialized')
  return testDb
}

export function closeTestDatabase() {
  if (testSqlite) testSqlite.close()
}

export function clearAllTables() {
  if (!testSqlite) return
  testSqlite.exec('DELETE FROM items')
}

vi.mock('../src/main/database/index', () => ({
  getDatabase: () => getTestDatabase(),
  initDatabase: () => setupTestDatabase(),
  closeDatabase: () => closeTestDatabase(),
}))
