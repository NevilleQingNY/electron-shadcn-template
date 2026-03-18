export const CARD_DEFAULT_WIDTH = 208
export const CARD_DEFAULT_HEIGHT = 160
export const CARD_MIN_WIDTH = 208
export const CARD_MIN_HEIGHT = 160
export const CARD_MAX_WIDTH = 400
export const CARD_MAX_HEIGHT = 320

export function parseCardContent(content: string): {
  firstLine: string
  restLines: string
} {
  const newlineIndex = content.indexOf('\n')
  if (newlineIndex === -1) return { firstLine: content, restLines: '' }
  return {
    firstLine: content.slice(0, newlineIndex),
    restLines: content.slice(newlineIndex + 1).trimEnd(),
  }
}

export function clampCardSize(
  width: number | undefined,
  height: number | undefined
): { width: number; height: number } {
  return {
    width: Math.max(
      CARD_MIN_WIDTH,
      Math.min(CARD_MAX_WIDTH, width ?? CARD_DEFAULT_WIDTH)
    ),
    height: Math.max(
      CARD_MIN_HEIGHT,
      Math.min(CARD_MAX_HEIGHT, height ?? CARD_DEFAULT_HEIGHT)
    ),
  }
}

export function computeResizeBounds(params: {
  cardX: number
  cardY: number
  boardWidth: number
  boardHeight: number
}): { maxWidth: number; maxHeight: number } {
  const cardLeftPx = (params.cardX / 100) * params.boardWidth
  const cardTopPx = (params.cardY / 100) * params.boardHeight
  return {
    maxWidth: Math.min(CARD_MAX_WIDTH, params.boardWidth - cardLeftPx),
    maxHeight: Math.min(CARD_MAX_HEIGHT, params.boardHeight - cardTopPx),
  }
}
