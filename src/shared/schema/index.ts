/**
 * Database Schema (Drizzle ORM)
 *
 * Single source of truth: all entity fields defined here,
 * types auto-derived via $inferSelect/$inferInsert.
 *
 * Add your tables in separate files under schema/,
 * then re-export them here.
 */

// Example entity
export { items } from './items'
export type { Item, NewItem } from './items'
