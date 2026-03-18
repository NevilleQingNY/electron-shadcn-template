/**
 * Card Repository - Whiteboard card CRUD
 */
import { eq, and, asc } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { getDatabase } from '../index'
import { cards } from 'shared/schema'
import type { Card } from 'shared/schema'
import type { CreateCardInput, UpdateCardInput } from 'shared/validators'
import { createTimestamp, buildUpdates } from '../utils'

class CardRepository {
  getAll(): Card[] {
    const db = getDatabase()
    return db
      .select()
      .from(cards)
      .where(eq(cards.is_deleted, 0))
      .orderBy(asc(cards.created_at))
      .all()
  }

  create(data: CreateCardInput): Card {
    const db = getDatabase()
    const id = nanoid()
    const newCard = {
      id,
      content: data.content ?? '',
      x: data.x,
      y: data.y,
      width: data.width ?? null,
      height: data.height ?? null,
      z_index: data.z_index,
      is_pinned: data.is_pinned ?? 0,
      created_at: createTimestamp(),
      is_deleted: 0,
    }
    db.insert(cards).values(newCard).run()
    return newCard as Card
  }

  update(id: string, data: UpdateCardInput): Card | null {
    const db = getDatabase()
    const updates = buildUpdates(data)
    if (Object.keys(updates).length > 0) {
      db.update(cards)
        .set(updates)
        .where(and(eq(cards.id, id), eq(cards.is_deleted, 0)))
        .run()
    }
    return this.getById(id)
  }

  delete(id: string): boolean {
    const db = getDatabase()
    const result = db
      .update(cards)
      .set({ is_deleted: 1 })
      .where(and(eq(cards.id, id), eq(cards.is_deleted, 0)))
      .run()
    return result.changes > 0
  }

  private getById(id: string): Card | null {
    const db = getDatabase()
    return (
      db
        .select()
        .from(cards)
        .where(and(eq(cards.id, id), eq(cards.is_deleted, 0)))
        .get() ?? null
    )
  }
}

export default new CardRepository()
