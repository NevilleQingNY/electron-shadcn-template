/**
 * 数据库工具函数（Repository 共享）
 */

import type { z } from 'zod'

export function createTimestamp() {
  return Date.now()
}

export function generateSortOrder(): string {
  return Date.now().toString(36)
}

/**
 * 从 data 中提取 !== undefined 的字段，构建 update 对象
 * undefined = 跳过, null = 清空字段
 */
export function buildUpdates<T extends Record<string, unknown>>(
  data: T
): Partial<T> {
  return Object.fromEntries(
    Object.entries(data).filter(([_, v]) => v !== undefined)
  ) as Partial<T>
}

/**
 * 解析 Zod schema，失败直接 throw
 */
export function parseOrThrow<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const parsed = schema.safeParse(data)
  if (!parsed.success) throw new Error(parsed.error.message)
  return parsed.data
}
