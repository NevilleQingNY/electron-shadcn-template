export const CARD_DEFAULT_WIDTH = 208
export const CARD_DEFAULT_HEIGHT = 160
export const CARD_MIN_WIDTH = 208
export const CARD_MIN_HEIGHT = 160
export const CARD_MAX_WIDTH = 400
export const CARD_MAX_HEIGHT = 320

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
