import { useCallback, useEffect, useRef, useState } from 'react'
import type { Card } from 'shared/validators'
import { WhiteboardCard } from './whiteboard-card'
import { useCardMove } from './use-card-move'
import { useCardResize } from './use-card-resize'
import { useScrollFade } from './use-scroll-fade'

function buildCardMap(cardList: Card[]): Map<string, Card> {
  return new Map(cardList.map(card => [card.id, card]))
}

const DOUBLE_CLICK_INTERVAL = 300

export function Whiteboard() {
  const boardRef = useRef<HTMLDivElement>(null)
  const { scrollRef, maskImage, maskComposite, webkitMaskComposite } =
    useScrollFade()
  const [cards, setCards] = useState<Map<string, Card>>(() => new Map())
  const maxZIndexRef = useRef(0)
  const cardsRef = useRef(cards)
  cardsRef.current = cards

  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const [editingCardId, setEditingCardId] = useState<string | null>(null)
  const lastClickRef = useRef<{ cardId: string; time: number } | null>(null)
  const lastBoardClickRef = useRef<number>(0)

  // Load cards from database on mount
  useEffect(() => {
    window.api.card.getAll().then(loadedCards => {
      setCards(buildCardMap(loadedCards))
      const maxZ = loadedCards.reduce(
        (max, card) => Math.max(max, card.z_index),
        0
      )
      maxZIndexRef.current = maxZ
    }).catch(console.error)
  }, [])

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
      next.set(cardId, { ...card, z_index: nextZIndex })
      return next
    })
    window.api.card.update(cardId, { z_index: nextZIndex }).catch(console.error)
  }, [])

  const handleCardClick = useCallback((cardId: string) => {
    const now = Date.now()
    const last = lastClickRef.current

    if (
      last &&
      last.cardId === cardId &&
      now - last.time < DOUBLE_CLICK_INTERVAL
    ) {
      lastClickRef.current = null
      setEditingCardId(cardId)
      setSelectedCardId(cardId)
      return
    }

    lastClickRef.current = { cardId, time: now }
    setSelectedCardId(cardId)
    setEditingCardId(null)
  }, [])

  const handleContentCommit = useCallback((cardId: string, content: string) => {
    setEditingCardId(null)
    const card = cardsRef.current.get(cardId)
    if (!card || card.content === content) return
    setCards(prev => {
      const prevCard = prev.get(cardId)
      if (!prevCard) return prev
      const next = new Map(prev)
      next.set(cardId, { ...prevCard, content })
      return next
    })
    window.api.card.update(cardId, { content }).catch(console.error)
  }, [])

  const handlePositionCommit = useCallback(
    (cardId: string, x: number, y: number) => {
      window.api.card.update(cardId, { x, y }).catch(console.error)
    },
    []
  )

  const handleSizeCommit = useCallback(
    (cardId: string, width: number, height: number) => {
      window.api.card.update(cardId, { width, height }).catch(console.error)
    },
    []
  )

  const handleDeleteCard = useCallback((cardId: string) => {
    setCards(prev => {
      const next = new Map(prev)
      next.delete(cardId)
      return next
    })
    setSelectedCardId(null)
    window.api.card.delete(cardId).catch(console.error)
  }, [])

  const handleCreateCard = useCallback(async (x: number, y: number) => {
    maxZIndexRef.current += 1
    try {
      const newCard = await window.api.card.create({
        content: '',
        x,
        y,
        z_index: maxZIndexRef.current,
      })
      setCards(prev => {
        const next = new Map(prev)
        next.set(newCard.id, newCard)
        return next
      })
      setSelectedCardId(newCard.id)
      setEditingCardId(newCard.id)
    } catch (error) {
      console.error(error)
    }
  }, [])

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (editingCardId) {
          // Blur the active editor — triggers onBlur -> onCommit
          if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur()
          }
        } else if (selectedCardId) {
          setSelectedCardId(null)
        }
        return
      }

      // Don't intercept keys when focus is in an input/textarea/contenteditable
      const target = e.target as HTMLElement
      const isInputFocused =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      if (isInputFocused) return

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedCardId) {
          handleDeleteCard(selectedCardId)
        }
        return
      }

      if (e.key === 'Enter' && selectedCardId && !editingCardId) {
        e.preventDefault()
        setEditingCardId(selectedCardId)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedCardId, editingCardId, handleDeleteCard])

  const { handleMovePointerDown, handleMovePointerMove, handleMovePointerUp } =
    useCardMove(
      boardRef,
      cardsRef,
      setCards,
      bringToFront,
      handleCardClick,
      handlePositionCommit
    )

  const {
    handleResizePointerDown,
    handleResizePointerMove,
    handleResizePointerUp,
  } = useCardResize(
    boardRef,
    cardsRef,
    setCards,
    bringToFront,
    handleSizeCommit
  )

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

  // Click on blank area deselects; double-click creates card
  const handleBoardPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.target !== boardRef.current) return

      const now = Date.now()
      const lastTime = lastBoardClickRef.current

      setSelectedCardId(null)
      setEditingCardId(null)

      if (now - lastTime < DOUBLE_CLICK_INTERVAL && boardRef.current) {
        lastBoardClickRef.current = 0
        const rect = boardRef.current.getBoundingClientRect()
        const xPercent = ((e.clientX - rect.left) / rect.width) * 100
        const yPercent = ((e.clientY - rect.top) / rect.height) * 100
        handleCreateCard(xPercent, yPercent)
      } else {
        lastBoardClickRef.current = now
      }
    },
    [handleCreateCard]
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
        onPointerDown={handleBoardPointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        ref={boardRef}
      >
        {Array.from(cards.values()).map(card => (
          <WhiteboardCard
            card={card}
            isEditing={editingCardId === card.id}
            isSelected={selectedCardId === card.id}
            key={card.id}
            onContentCommit={handleContentCommit}
            onPointerDown={handleMovePointerDown}
            onResizePointerDown={handleResizePointerDown}
          />
        ))}
      </div>
    </div>
  )
}
