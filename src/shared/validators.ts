/**
 * Zod Schema Validation
 *
 * Derived from Drizzle Schema -> fields/types always in sync.
 * Only hand-write business rules (regex, min/max) and virtual fields.
 */
import { z } from 'zod'
import { createInsertSchema } from 'drizzle-zod'
import { items } from './schema'

// ==================== Entity Types ====================
export type { Item } from './schema'

// ==================== Auto Fields (omit from create/update) ====================
const autoFields = {
  id: true,
  sort_order: true,
  created_at: true,
  is_deleted: true,
} as const

// ==================== Item Schema ====================
const baseItemInsert = createInsertSchema(items)

export const createItemSchema = baseItemInsert.omit(autoFields).extend({
  name: z.string().min(1, 'Item name is required'),
})

export const updateItemSchema = baseItemInsert
  .omit(autoFields)
  .partial()
  .extend({
    name: z.string().min(1).optional(),
    description: z.string().nullish(),
  })
  .refine(
    data =>
      Object.keys(data).some(k => data[k as keyof typeof data] !== undefined),
    { message: 'At least one field is required' }
  )

// ==================== Utility Schemas ====================
export const idSchema = z.string().min(1, 'ID is required')

// ==================== Input Types ====================
export type CreateItemInput = z.infer<typeof createItemSchema>
export type UpdateItemInput = z.infer<typeof updateItemSchema>
