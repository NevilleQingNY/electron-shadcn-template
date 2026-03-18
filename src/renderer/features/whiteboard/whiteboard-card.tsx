import { memo } from 'react'
import { Pin } from 'lucide-react'
import { cn } from 'renderer/lib/utils'

export interface CardData {
  id: string
  title: string
  content?: string
  items?: { text: string; isChecked: boolean }[]
  x: number // percentage
  y: number // percentage
  zIndex: number
  isPinned?: boolean
}

export const WhiteboardCard = memo(function WhiteboardCard({
  card,
  onPointerDown,
}: {
  card: CardData
  onPointerDown: (
    e: React.PointerEvent,
    cardId: string,
    element: HTMLElement
  ) => void
}) {
  return (
    <div
      className={cn(
        'absolute w-52 touch-none select-none rounded-lg bg-card p-3 shadow-sm',
        'cursor-grab active:cursor-grabbing',
        'hover:shadow-md'
      )}
      onPointerDown={(e) => onPointerDown(e, card.id, e.currentTarget)}
      // Dynamic positioning requires inline style
      style={{
        left: `${card.x}%`,
        top: `${card.y}%`,
        zIndex: card.zIndex,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-medium leading-tight">{card.title}</h3>
        {card.isPinned && (
          <Pin className="size-3 shrink-0 text-muted-foreground" />
        )}
      </div>

      {card.content && (
        <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
          {card.content}
        </p>
      )}

      {card.items && card.items.length > 0 && (
        <ul className="mt-2 space-y-1">
          {card.items.map((item, itemIndex) => (
            <li
              className="flex items-center gap-1.5 text-xs"
              key={itemIndex}
            >
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
  )
})
