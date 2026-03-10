/**
 * Item Repository - Example CRUD
 */
import { eq, and, asc } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { getDatabase } from '../index'
import { items } from 'shared/schema'
import type { Item } from 'shared/schema'
import type { CreateItemInput, UpdateItemInput } from 'shared/validators'
import { createTimestamp, generateSortOrder, buildUpdates } from '../utils'

class ItemRepository {
  getAll(): Item[] {
    const db = getDatabase()
    return db
      .select()
      .from(items)
      .where(eq(items.is_deleted, 0))
      .orderBy(asc(items.sort_order))
      .all()
  }

  getById(id: string): Item | null {
    const db = getDatabase()
    return (
      db
        .select()
        .from(items)
        .where(and(eq(items.id, id), eq(items.is_deleted, 0)))
        .get() ?? null
    )
  }

  create(data: CreateItemInput): Item {
    const db = getDatabase()
    const id = nanoid()
    const newItem = {
      id,
      name: data.name,
      description: data.description ?? null,
      sort_order: generateSortOrder(),
      created_at: createTimestamp(),
      is_deleted: 0,
    }
    db.insert(items).values(newItem).run()
    return newItem as Item
  }

  update(id: string, data: UpdateItemInput): Item | null {
    const db = getDatabase()
    const updates = buildUpdates(data)
    if (Object.keys(updates).length > 0) {
      db.update(items)
        .set(updates)
        .where(and(eq(items.id, id), eq(items.is_deleted, 0)))
        .run()
    }
    return this.getById(id)
  }

  delete(id: string): boolean {
    const db = getDatabase()
    const result = db
      .update(items)
      .set({ is_deleted: 1 })
      .where(and(eq(items.id, id), eq(items.is_deleted, 0)))
      .run()
    return result.changes > 0
  }
}

export default new ItemRepository()
