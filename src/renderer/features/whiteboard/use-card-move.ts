import { useCallback, useRef, type PointerEvent, type RefObject } from 'react'
import type { CardData } from './whiteboard-card'

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
}

export function useCardMove(
  boardRef: RefObject<HTMLDivElement | null>,
  cardsRef: RefObject<Map<string, CardData>>,
  setCards: React.Dispatch<React.SetStateAction<Map<string, CardData>>>,
  bringToFront: (cardId: string) => void
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
      }

      element.style.willChange = 'transform'
      bringToFront(cardId)
    },
    [boardRef, cardsRef, bringToFront]
  )

  const handleMovePointerMove = useCallback((e: React.PointerEvent) => {
    const drag = dragRef.current
    if (!drag) return false

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

      drag.element.style.transform = ''
      drag.element.style.willChange = ''

      setCards(prev => {
        const card = prev.get(drag.cardId)
        if (!card) return prev
        const next = new Map(prev)
        next.set(drag.cardId, { ...card, x: finalX, y: finalY })
        return next
      })

      dragRef.current = null
      return true
    },
    [boardRef, setCards]
  )

  return { handleMovePointerDown, handleMovePointerMove, handleMovePointerUp }
}
