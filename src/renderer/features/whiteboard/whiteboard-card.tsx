import { memo } from 'react'
import { Pin } from 'lucide-react'
import { cn } from 'renderer/lib/utils'
import {
  parseCardContent,
  CARD_DEFAULT_WIDTH,
  CARD_DEFAULT_HEIGHT,
} from './whiteboard-card-utils'

export interface CardData {
  id: string
  content: string
  items?: { text: string; isChecked: boolean }[]
  x: number // percentage
  y: number // percentage
  width?: number // pixels
  height?: number // pixels
  zIndex: number
  isPinned?: boolean
}

export const WhiteboardCard = memo(function WhiteboardCard({
  card,
  onPointerDown,
  onResizePointerDown,
}: {
  card: CardData
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
}) {
  const { firstLine, restLines } = parseCardContent(card.content)

  return (
    <div
      className={cn(
        'group/card absolute touch-none select-none rounded-lg bg-card shadow-sm',
        'flex flex-col',
        'cursor-grab active:cursor-grabbing',
        'hover:shadow-md'
      )}
      onPointerDown={e => onPointerDown(e, card.id, e.currentTarget)}
      style={{
        left: `${card.x}%`,
        top: `${card.y}%`,
        zIndex: card.zIndex,
        width: card.width ?? CARD_DEFAULT_WIDTH,
        height: card.height ?? CARD_DEFAULT_HEIGHT,
      }}
    >
      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto p-3 [scrollbar-width:thin]">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-medium leading-tight">{firstLine}</span>
          {card.isPinned && (
            <Pin className="size-3 shrink-0 text-muted-foreground" />
          )}
        </div>

        {restLines && (
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap">
            {restLines}
          </p>
        )}

        {card.items && card.items.length > 0 && (
          <ul className="mt-2 space-y-1">
            {card.items.map((item, itemIndex) => (
              <li className="flex items-center gap-1.5 text-xs" key={itemIndex}>
                <span className={item.isChecked ? 'text-muted-foreground' : ''}>
                  {item.isChecked ? '☑' : '☐'}
                </span>
                <span
                  className={cn(
                    item.isChecked && 'text-muted-foreground line-through'
                  )}
                >
                  {item.text}
                </span>
              </li>
            ))}
          </ul>
        )}
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
