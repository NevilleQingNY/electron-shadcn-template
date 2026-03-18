import { useCallback, useEffect, useRef, useState } from 'react'
import { WhiteboardCard, type CardData } from './whiteboard-card'
import { useCardMove } from './use-card-move'
import { useCardResize } from './use-card-resize'
import { useScrollFade } from './use-scroll-fade'

const DEMO_CARDS: CardData[] = [
  {
    id: '1',
    content: 'Project A',
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
    content:
      'Feeling good today\nEnergy 8/10. Slept well, morning walk helped.',
    x: 55,
    y: 8,
    zIndex: 2,
  },
  {
    id: '3',
    content: 'Groceries',
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
    content:
      'Random thought\nWhat if we rethink the onboarding flow? Current one feels too long. Maybe just drop users straight into a blank board.',
    x: 60,
    y: 50,
    zIndex: 4,
  },
]

function buildCardMap(cards: CardData[]): Map<string, CardData> {
  return new Map(cards.map(card => [card.id, card]))
}

export function Whiteboard() {
  const boardRef = useRef<HTMLDivElement>(null)
  const { scrollRef, maskImage, maskComposite, webkitMaskComposite } =
    useScrollFade()
  const [cards, setCards] = useState(() => buildCardMap(DEMO_CARDS))
  const maxZIndexRef = useRef(DEMO_CARDS.length)
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
    setCards(prev => {
      const card = prev.get(cardId)
      if (!card) return prev
      const next = new Map(prev)
      next.set(cardId, { ...card, zIndex: nextZIndex })
      return next
    })
  }, [])

  const { handleMovePointerDown, handleMovePointerMove, handleMovePointerUp } =
    useCardMove(boardRef, cardsRef, setCards, bringToFront)

  const {
    handleResizePointerDown,
    handleResizePointerMove,
    handleResizePointerUp,
  } = useCardResize(boardRef, cardsRef, setCards, bringToFront)

  // Dispatch: resize takes priority over move
  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (handleResizePointerMove(e)) return
      handleMovePointerMove(e)
    },
    [handleResizePointerMove, handleMovePointerMove]
  )

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (handleResizePointerUp(e)) return
      handleMovePointerUp(e)
    },
    [handleResizePointerUp, handleMovePointerUp]
  )

  return (
    <div
      className="h-full w-full overflow-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      ref={scrollRef}
      style={
        {
          maskImage,
          WebkitMaskImage: maskImage,
          maskComposite,
          WebkitMaskComposite: webkitMaskComposite,
        } as React.CSSProperties
      }
    >
      <div
        className="relative h-dvh w-screen bg-amber-50 dark:bg-amber-950/20"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        ref={boardRef}
      >
        {Array.from(cards.values()).map(card => (
          <WhiteboardCard
            card={card}
            key={card.id}
            onPointerDown={handleMovePointerDown}
            onResizePointerDown={handleResizePointerDown}
          />
        ))}
      </div>
    </div>
  )
}
