import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react'
import { WhiteboardCard, type CardData } from './whiteboard-card'
import { useScrollFade } from './use-scroll-fade'

const DEMO_CARDS: CardData[] = [
  {
    id: '1',
    title: 'Project A',
    items: [
      { text: 'Research', isChecked: true },
      { text: 'Design', isChecked: false },
      { text: 'Prototype', isChecked: false },
    ],
    isPinned: true,
    x: 8,
    y: 10,
    zIndex: 1,
  },
  {
    id: '2',
    title: 'Feeling good today',
    content: 'Energy 8/10. Slept well, morning walk helped.',
    x: 55,
    y: 8,
    zIndex: 2,
  },
  {
    id: '3',
    title: 'Groceries',
    items: [
      { text: 'Milk', isChecked: false },
      { text: 'Eggs', isChecked: false },
      { text: 'Coffee beans', isChecked: true },
    ],
    x: 30,
    y: 45,
    zIndex: 3,
  },
  {
    id: '4',
    title: 'Random thought',
    content:
      'What if we rethink the onboarding flow? Current one feels too long. Maybe just drop users straight into a blank board.',
    x: 60,
    y: 50,
    zIndex: 4,
  },
]

function buildCardMap(cards: CardData[]): Map<string, CardData> {
  return new Map(cards.map((card) => [card.id, card]))
}

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

export function Whiteboard() {
  const boardRef = useRef<HTMLDivElement>(null)
  const { scrollRef, maskImage, maskComposite, webkitMaskComposite } =
    useScrollFade()
  const [cards, setCards] = useState(() => buildCardMap(DEMO_CARDS))
  const maxZIndexRef = useRef(DEMO_CARDS.length)
  const dragRef = useRef<DragInfo | null>(null)
  const cardsRef = useRef(cards)
  cardsRef.current = cards

  // Center the scroll on mount
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({
      left: (el.scrollWidth - el.clientWidth) / 2,
      top: (el.scrollHeight - el.clientHeight) / 2,
    })
  }, [scrollRef])

  const bringToFront = useCallback((cardId: string) => {
    maxZIndexRef.current += 1
    const nextZIndex = maxZIndexRef.current
    setCards((prev) => {
      const card = prev.get(cardId)
      if (!card) return prev
      const next = new Map(prev)
      next.set(cardId, { ...card, zIndex: nextZIndex })
      return next
    })
  }, [])

  const handlePointerDown = useCallback(
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
    [bringToFront]
  )

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const drag = dragRef.current
    if (!drag) return

    const deltaX = Math.max(
      drag.minDeltaX,
      Math.min(drag.maxDeltaX, e.clientX - drag.startPointerX)
    )
    const deltaY = Math.max(
      drag.minDeltaY,
      Math.min(drag.maxDeltaY, e.clientY - drag.startPointerY)
    )
    drag.element.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0)`
  }, [])

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    const drag = dragRef.current
    if (!drag || !boardRef.current) return

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

    setCards((prev) => {
      const card = prev.get(drag.cardId)
      if (!card) return prev
      const next = new Map(prev)
      next.set(drag.cardId, { ...card, x: finalX, y: finalY })
      return next
    })

    dragRef.current = null
  }, [])

  return (
    <div
      className="h-full w-full overflow-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      ref={scrollRef}
      style={{
        maskImage,
        WebkitMaskImage: maskImage,
        maskComposite,
        WebkitMaskComposite: webkitMaskComposite,
      } as React.CSSProperties}
    >
      <div
        className="relative h-dvh w-screen bg-amber-50 dark:bg-amber-950/20"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        ref={boardRef}
      >
        {Array.from(cards.values()).map((card) => (
          <WhiteboardCard
            card={card}
            key={card.id}
            onPointerDown={handlePointerDown}
          />
        ))}
      </div>
    </div>
  )
}
