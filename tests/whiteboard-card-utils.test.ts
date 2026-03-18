import { describe, it, expect } from 'vitest'
import {
  parseCardContent,
  clampCardSize,
  computeResizeBounds,
  CARD_DEFAULT_WIDTH,
  CARD_DEFAULT_HEIGHT,
  CARD_MAX_WIDTH,
  CARD_MAX_HEIGHT,
} from '../src/renderer/features/whiteboard/whiteboard-card-utils'

describe('parseCardContent', () => {
  it('returns full string as firstLine when no newline', () => {
    const parsed = parseCardContent('Hello world')
    expect(parsed.firstLine).toBe('Hello world')
    expect(parsed.restLines).toBe('')
  })

  it('splits on first newline', () => {
    const parsed = parseCardContent('Title\nBody text here')
    expect(parsed.firstLine).toBe('Title')
    expect(parsed.restLines).toBe('Body text here')
  })

  it('handles multiple newlines', () => {
    const parsed = parseCardContent('Title\nLine 2\nLine 3')
    expect(parsed.firstLine).toBe('Title')
    expect(parsed.restLines).toBe('Line 2\nLine 3')
  })

  it('handles empty string', () => {
    const parsed = parseCardContent('')
    expect(parsed.firstLine).toBe('')
    expect(parsed.restLines).toBe('')
  })

  it('handles string with only newline', () => {
    const parsed = parseCardContent('\n')
    expect(parsed.firstLine).toBe('')
    expect(parsed.restLines).toBe('')
  })

  it('handles string with trailing newline', () => {
    const parsed = parseCardContent('Title\n')
    expect(parsed.firstLine).toBe('Title')
    expect(parsed.restLines).toBe('')
  })
})

describe('clampCardSize', () => {
  it('returns defaults when no size provided', () => {
    const clamped = clampCardSize(undefined, undefined)
    expect(clamped.width).toBe(CARD_DEFAULT_WIDTH)
    expect(clamped.height).toBe(CARD_DEFAULT_HEIGHT)
  })

  it('clamps below minimum to default', () => {
    const clamped = clampCardSize(100, 50)
    expect(clamped.width).toBe(CARD_DEFAULT_WIDTH)
    expect(clamped.height).toBe(CARD_DEFAULT_HEIGHT)
  })

  it('clamps above maximum', () => {
    const clamped = clampCardSize(500, 500)
    expect(clamped.width).toBe(CARD_MAX_WIDTH)
    expect(clamped.height).toBe(CARD_MAX_HEIGHT)
  })

  it('preserves valid values', () => {
    const clamped = clampCardSize(300, 250)
    expect(clamped.width).toBe(300)
    expect(clamped.height).toBe(250)
  })

  it('handles edge case at exact min', () => {
    const clamped = clampCardSize(CARD_DEFAULT_WIDTH, CARD_DEFAULT_HEIGHT)
    expect(clamped.width).toBe(CARD_DEFAULT_WIDTH)
    expect(clamped.height).toBe(CARD_DEFAULT_HEIGHT)
  })

  it('handles edge case at exact max', () => {
    const clamped = clampCardSize(CARD_MAX_WIDTH, CARD_MAX_HEIGHT)
    expect(clamped.width).toBe(CARD_MAX_WIDTH)
    expect(clamped.height).toBe(CARD_MAX_HEIGHT)
  })
})

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
