import { memo } from 'react'
import { Pin } from 'lucide-react'
import { cn } from 'renderer/lib/utils'
import type { Card } from 'shared/validators'
import { WhiteboardCardEditor } from './whiteboard-card-editor'
import {
  CARD_DEFAULT_WIDTH,
  CARD_DEFAULT_HEIGHT,
} from './whiteboard-card-utils'
import { useScrollFade } from './use-scroll-fade'

export const WhiteboardCard = memo(function WhiteboardCard({
  card,
  isSelected,
  isEditing,
  onPointerDown,
  onResizePointerDown,
  onContentCommit,
}: {
  card: Card
  isSelected: boolean
  isEditing: boolean
  onPointerDown: (
    e: React.PointerEvent,
    cardId: string,
    element: HTMLElement
  ) => void
  onResizePointerDown: (
    e: React.PointerEvent,
    cardId: string,
    cardElement: HTMLElement
  ) => void
  onContentCommit: (cardId: string, content: string) => void
}) {
  const { scrollRef: cardScrollRef, maskImage, maskComposite, webkitMaskComposite } =
    useScrollFade(16)

  return (
    <div
      className={cn(
        'group/card absolute touch-none select-none rounded-lg bg-card shadow-sm',
        'flex flex-col',
        isEditing ? 'cursor-text' : 'cursor-grab active:cursor-grabbing',
        'hover:shadow-md',
        isSelected && 'ring-2 ring-primary'
      )}
      onPointerDown={e => {
        if (isEditing) return
        onPointerDown(e, card.id, e.currentTarget)
      }}
      style={{
        left: `${card.x}%`,
        top: `${card.y}%`,
        zIndex: card.z_index,
        width: card.width ?? CARD_DEFAULT_WIDTH,
        height: card.height ?? CARD_DEFAULT_HEIGHT,
      }}
    >
      {/* Pin indicator */}
      {card.is_pinned === 1 && (
        <Pin className="absolute top-2 right-2 size-3 text-muted-foreground" />
      )}

      {/* Scrollable content area */}
      <div
        className="card-scroll flex-1 overflow-y-auto p-3"
        ref={cardScrollRef}
        style={{
          maskImage,
          WebkitMaskImage: maskImage,
          maskComposite,
          WebkitMaskComposite: webkitMaskComposite,
        } as React.CSSProperties}
      >
        <WhiteboardCardEditor
          content={card.content}
          isEditable={isEditing}
          onCommit={content => onContentCommit(card.id, content)}
        />
      </div>

      {/* Resize handle */}
      <div
        className={cn(
          'absolute right-0 bottom-0 size-4 cursor-se-resize',
          'flex items-end justify-end p-0.5',
          'opacity-0 transition-opacity',
          'group-hover/card:opacity-40 hover:!opacity-80'
        )}
        onPointerDown={e => {
          e.stopPropagation()
          const cardElement = e.currentTarget.parentElement as HTMLElement
          onResizePointerDown(e, card.id, cardElement)
        }}
      >
        <svg className="size-2.5" viewBox="0 0 10 10">
          <circle className="fill-muted-foreground" cx="8" cy="2" r="1" />
          <circle className="fill-muted-foreground" cx="8" cy="8" r="1" />
          <circle className="fill-muted-foreground" cx="2" cy="8" r="1" />
        </svg>
      </div>
    </div>
  )
})
