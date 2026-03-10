import { cn } from 'renderer/lib/utils'

interface SidebarResizeHandleProps {
  onMouseDown: (e: React.MouseEvent) => void
  isDragging: boolean
  width: number
}

export function SidebarResizeHandle({
  onMouseDown,
  isDragging,
  width,
}: SidebarResizeHandleProps) {
  return (
    <div
      className={cn(
        'fixed top-12 z-20 h-[calc(100%-48px)] w-5 cursor-col-resize',
        'hidden md:block',
        'group'
      )}
      onMouseDown={onMouseDown}
      style={{ left: width - 10 }}
    >
      {/* Divider line: always present, thickens on hover/drag */}
      <div
        className={cn(
          'pointer-events-none absolute left-1/2 top-0 h-full -translate-x-1/2',
          'w-px bg-transparent',
          !isDragging && 'transition-all duration-150 ease-out',
          !isDragging && 'group-hover:w-0.5 group-hover:bg-border',
          isDragging && 'w-0.5 bg-border'
        )}
      />
    </div>
  )
}
