/**
 * Items Schema - Example Entity
 *
 * A simple example showing the Drizzle table pattern.
 * Replace with your actual entities.
 */
import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core'

export const items = sqliteTable(
  'items',
  {
    id: text('id').primaryKey().notNull(),
    name: text('name').notNull(),
    description: text('description'),
    sort_order: text('sort_order').notNull(),
    created_at: integer('created_at').notNull(),
    is_deleted: integer('is_deleted').default(0).notNull(),
  },
  table => [index('idx_items_is_deleted').on(table.is_deleted)]
)

export type Item = typeof items.$inferSelect
export type NewItem = typeof items.$inferInsert
