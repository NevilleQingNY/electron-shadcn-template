import { useCallback, useRef, type PointerEvent, type RefObject } from 'react'
import type { Card } from 'shared/validators'

const CLICK_THRESHOLD = 5

interface DragInfo {
  cardId: string
  startPointerX: number
  startPointerY: number
  startCardX: number
  startCardY: number
  element: HTMLElement
  minDeltaX: number
  maxDeltaX: number
  minDeltaY: number
  maxDeltaY: number
  isDragged: boolean
}

export function useCardMove(
  boardRef: RefObject<HTMLDivElement | null>,
  cardsRef: RefObject<Map<string, Card>>,
  setCards: React.Dispatch<React.SetStateAction<Map<string, Card>>>,
  bringToFront: (cardId: string) => void,
  onCardClick: (cardId: string) => void,
  onPositionCommit: (cardId: string, x: number, y: number) => void
) {
  const dragRef = useRef<DragInfo | null>(null)

  const handleMovePointerDown = useCallback(
    (e: PointerEvent, cardId: string, element: HTMLElement) => {
      if (e.button !== 0 || !boardRef.current) return
      element.setPointerCapture(e.pointerId)

      const card = cardsRef.current.get(cardId)
      if (!card) return

      const boardWidth = boardRef.current.offsetWidth
      const boardHeight = boardRef.current.offsetHeight
      const cardWidth = element.offsetWidth
      const cardHeight = element.offsetHeight

      const startPxX = (card.x / 100) * boardWidth
      const startPxY = (card.y / 100) * boardHeight

      dragRef.current = {
        cardId,
        startPointerX: e.clientX,
        startPointerY: e.clientY,
        startCardX: card.x,
        startCardY: card.y,
        element,
        minDeltaX: -startPxX,
        maxDeltaX: boardWidth - cardWidth - startPxX,
        minDeltaY: -startPxY,
        maxDeltaY: boardHeight - cardHeight - startPxY,
        isDragged: false,
      }

      element.style.willChange = 'transform'
      bringToFront(cardId)
    },
    [boardRef, cardsRef, bringToFront]
  )

  const handleMovePointerMove = useCallback((e: React.PointerEvent) => {
    const drag = dragRef.current
    if (!drag) return false

    if (!drag.isDragged) {
      const dx = e.clientX - drag.startPointerX
      const dy = e.clientY - drag.startPointerY
      if (Math.abs(dx) < CLICK_THRESHOLD && Math.abs(dy) < CLICK_THRESHOLD)
        return true
      drag.isDragged = true
    }

    const deltaX = Math.max(
      drag.minDeltaX,
      Math.min(drag.maxDeltaX, e.clientX - drag.startPointerX)
    )
    const deltaY = Math.max(
      drag.minDeltaY,
      Math.min(drag.maxDeltaY, e.clientY - drag.startPointerY)
    )
    drag.element.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0)`
    return true
  }, [])

  const handleMovePointerUp = useCallback(
    (e: React.PointerEvent) => {
      const drag = dragRef.current
      if (!drag || !boardRef.current) return false

      drag.element.style.transform = ''
      drag.element.style.willChange = ''

      // Click detected — not a drag
      if (!drag.isDragged) {
        const cardId = drag.cardId
        dragRef.current = null
        onCardClick(cardId)
        return true
      }

      const boardWidth = boardRef.current.offsetWidth
      const boardHeight = boardRef.current.offsetHeight
      const cardWidth = drag.element.offsetWidth
      const cardHeight = drag.element.offsetHeight

      const maxXPercent = ((boardWidth - cardWidth) / boardWidth) * 100
      const maxYPercent = ((boardHeight - cardHeight) / boardHeight) * 100

      const deltaXPercent =
        ((e.clientX - drag.startPointerX) / boardWidth) * 100
      const deltaYPercent =
        ((e.clientY - drag.startPointerY) / boardHeight) * 100

      const finalX = Math.max(
        0,
        Math.min(maxXPercent, drag.startCardX + deltaXPercent)
      )
      const finalY = Math.max(
        0,
        Math.min(maxYPercent, drag.startCardY + deltaYPercent)
      )

      setCards(prev => {
        const card = prev.get(drag.cardId)
        if (!card) return prev
        const next = new Map(prev)
        next.set(drag.cardId, { ...card, x: finalX, y: finalY })
        return next
      })

      onPositionCommit(drag.cardId, finalX, finalY)

      dragRef.current = null
      return true
    },
    [boardRef, setCards, onCardClick, onPositionCommit]
  )

  return { handleMovePointerDown, handleMovePointerMove, handleMovePointerUp }
}
