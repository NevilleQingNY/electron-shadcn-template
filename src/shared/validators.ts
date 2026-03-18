/**
 * Zod Schema Validation
 *
 * Derived from Drizzle Schema -> fields/types always in sync.
 * Only hand-write business rules (regex, min/max) and virtual fields.
 */
import { z } from 'zod'
import { createInsertSchema } from 'drizzle-zod'
import { items, cards } from './schema'

// ==================== Entity Types ====================
export type { Item } from './schema'
export type { Card } from './schema'

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

// ==================== Card Schema ====================
const cardAutoFields = {
  id: true,
  created_at: true,
  is_deleted: true,
} as const

const baseCardInsert = createInsertSchema(cards)

export const createCardSchema = baseCardInsert.omit(cardAutoFields).extend({
  content: z.string().default(''),
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
  z_index: z.number().int(),
})

export const updateCardSchema = baseCardInsert
  .omit(cardAutoFields)
  .extend({
    x: z.number().min(0).max(100),
    y: z.number().min(0).max(100),
    z_index: z.number().int(),
  })
  .partial()
  .refine(
    data =>
      Object.keys(data).some(k => data[k as keyof typeof data] !== undefined),
    { message: 'At least one field is required' }
  )

// ==================== Input Types ====================
export type CreateItemInput = z.infer<typeof createItemSchema>
export type UpdateItemInput = z.infer<typeof updateItemSchema>
export type CreateCardInput = z.infer<typeof createCardSchema>
export type UpdateCardInput = z.infer<typeof updateCardSchema>
