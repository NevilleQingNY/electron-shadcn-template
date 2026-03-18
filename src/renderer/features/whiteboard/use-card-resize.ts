import { useCallback, useRef, type PointerEvent, type RefObject } from 'react'
import type { Card } from 'shared/validators'
import {
  CARD_DEFAULT_WIDTH,
  CARD_DEFAULT_HEIGHT,
  CARD_MIN_WIDTH,
  CARD_MIN_HEIGHT,
  computeResizeBounds,
} from './whiteboard-card-utils'

interface ResizeInfo {
  cardId: string
  startPointerX: number
  startPointerY: number
  startWidth: number
  startHeight: number
  maxWidth: number
  maxHeight: number
  element: HTMLElement
}

function clampResizeDelta(
  resize: ResizeInfo,
  clientX: number,
  clientY: number
): { width: number; height: number } {
  const deltaX = clientX - resize.startPointerX
  const deltaY = clientY - resize.startPointerY
  return {
    width: Math.max(
      CARD_MIN_WIDTH,
      Math.min(resize.maxWidth, resize.startWidth + deltaX)
    ),
    height: Math.max(
      CARD_MIN_HEIGHT,
      Math.min(resize.maxHeight, resize.startHeight + deltaY)
    ),
  }
}

export function useCardResize(
  boardRef: RefObject<HTMLDivElement | null>,
  cardsRef: RefObject<Map<string, Card>>,
  setCards: React.Dispatch<React.SetStateAction<Map<string, Card>>>,
  bringToFront: (cardId: string) => void,
  onSizeCommit: (cardId: string, width: number, height: number) => void
) {
  const resizeRef = useRef<ResizeInfo | null>(null)

  const handleResizePointerDown = useCallback(
    (e: PointerEvent, cardId: string, cardElement: HTMLElement) => {
      if (e.button !== 0 || !boardRef.current) return
      cardElement.setPointerCapture(e.pointerId)

      const card = cardsRef.current.get(cardId)
      if (!card) return

      const bounds = computeResizeBounds({
        cardX: card.x,
        cardY: card.y,
        boardWidth: boardRef.current.offsetWidth,
        boardHeight: boardRef.current.offsetHeight,
      })

      resizeRef.current = {
        cardId,
        startPointerX: e.clientX,
        startPointerY: e.clientY,
        startWidth: card.width ?? CARD_DEFAULT_WIDTH,
        startHeight: card.height ?? CARD_DEFAULT_HEIGHT,
        maxWidth: bounds.maxWidth,
        maxHeight: bounds.maxHeight,
        element: cardElement,
      }

      cardElement.style.willChange = 'width, height'
      document.documentElement.setAttribute('data-card-resizing', 'true')
      bringToFront(cardId)
    },
    [boardRef, cardsRef, bringToFront]
  )

  const handleResizePointerMove = useCallback((e: React.PointerEvent) => {
    const resize = resizeRef.current
    if (!resize) return false

    const { width, height } = clampResizeDelta(resize, e.clientX, e.clientY)
    resize.element.style.width = `${width}px`
    resize.element.style.height = `${height}px`
    return true
  }, [])

  const handleResizePointerUp = useCallback(
    (e: React.PointerEvent) => {
      const resize = resizeRef.current
      if (!resize) return false

      const { width, height } = clampResizeDelta(resize, e.clientX, e.clientY)
      resize.element.style.willChange = ''

      setCards(prev => {
        const card = prev.get(resize.cardId)
        if (!card) return prev
        const next = new Map(prev)
        next.set(resize.cardId, { ...card, width, height })
        return next
      })

      onSizeCommit(resize.cardId, width, height)

      document.documentElement.removeAttribute('data-card-resizing')
      resizeRef.current = null
      return true
    },
    [setCards, onSizeCommit]
  )

  return {
    handleResizePointerDown,
    handleResizePointerMove,
    handleResizePointerUp,
  }
}
