import { describe, it, expect } from 'vitest'
import {
  computeResizeBounds,
  CARD_MAX_WIDTH,
  CARD_MAX_HEIGHT,
} from '../src/renderer/features/whiteboard/whiteboard-card-utils'

describe('computeResizeBounds', () => {
  it('returns max card size when card is at origin with large board', () => {
    const bounds = computeResizeBounds({
      cardX: 0,
      cardY: 0,
      boardWidth: 1000,
      boardHeight: 800,
    })
    expect(bounds.maxWidth).toBe(CARD_MAX_WIDTH)
    expect(bounds.maxHeight).toBe(CARD_MAX_HEIGHT)
  })

  it('constrains to board edge when card is near right/bottom', () => {
    const bounds = computeResizeBounds({
      cardX: 90,
      cardY: 85,
      boardWidth: 1000,
      boardHeight: 800,
    })
    // cardLeftPx = 900, remaining = 100
    expect(bounds.maxWidth).toBe(100)
    // cardTopPx = 680, remaining = 120
    expect(bounds.maxHeight).toBe(120)
  })

  it('returns full max when board is much larger than max card size', () => {
    const bounds = computeResizeBounds({
      cardX: 10,
      cardY: 10,
      boardWidth: 2000,
      boardHeight: 2000,
    })
    expect(bounds.maxWidth).toBe(CARD_MAX_WIDTH)
    expect(bounds.maxHeight).toBe(CARD_MAX_HEIGHT)
  })
})
