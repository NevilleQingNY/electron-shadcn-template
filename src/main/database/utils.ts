/**
 * Database utility functions (shared by repositories)
 */

import type { z } from 'zod'

export function createTimestamp() {
  return Date.now()
}

export function generateSortOrder(): string {
  return Date.now().toString(36)
}

/**
 * Extract fields that are !== undefined from data to build update object
 * undefined = skip, null = clear field
 */
export function buildUpdates<T extends Record<string, unknown>>(
  data: T
): Partial<T> {
  return Object.fromEntries(
    Object.entries(data).filter(([_, v]) => v !== undefined)
  ) as Partial<T>
}

/**
 * Parse Zod schema, throw on failure
 */
export function parseOrThrow<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const parsed = schema.safeParse(data)
  if (!parsed.success) throw new Error(parsed.error.message)
  return parsed.data
}
