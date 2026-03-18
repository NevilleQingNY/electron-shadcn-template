/**
 * Cards Schema - Whiteboard card entities
 *
 * Cards are the core unit on the whiteboard. Content is stored as
 * tiptap JSON string; checklists live inside tiptap TaskList nodes.
 */
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'

export const cards = sqliteTable('cards', {
  id: text('id').primaryKey().notNull(),
  content: text('content').notNull().default(''),
  x: real('x').notNull().default(50),
  y: real('y').notNull().default(50),
  width: integer('width'),
  height: integer('height'),
  z_index: integer('z_index').notNull().default(0),
  is_pinned: integer('is_pinned').notNull().default(0),
  created_at: integer('created_at').notNull(),
  is_deleted: integer('is_deleted').notNull().default(0),
})

export type Card = typeof cards.$inferSelect
export type NewCard = typeof cards.$inferInsert
