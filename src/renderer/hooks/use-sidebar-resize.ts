import { useState, useCallback, useEffect, useRef } from 'react'

const DEFAULT_WIDTH = 256
const MIN_WIDTH = 200
const MAX_WIDTH = 400

interface UseSidebarResizeOptions {
  storageKey?: string
  defaultWidth?: number
  minWidth?: number
  maxWidth?: number
}

export function useSidebarResize(options: UseSidebarResizeOptions = {}) {
  const {
    storageKey = 'sidebar-width',
    defaultWidth = DEFAULT_WIDTH,
    minWidth = MIN_WIDTH,
    maxWidth = MAX_WIDTH,
  } = options

  const [width, setWidth] = useState(() => {
    const stored = localStorage.getItem(storageKey)
    return stored ? parseInt(stored, 10) : defaultWidth
  })
  const [isDragging, setIsDragging] = useState(false)

  // 使用 ref 存储 width，避免 useCallback 依赖 width
  const widthRef = useRef(width)
  widthRef.current = width

  // 使用 ref 追踪是否正在拖拽，防止重复注册监听器
  const isDraggingRef = useRef(false)

  // 拖拽时禁用 sidebar 的过渡动画
  useEffect(() => {
    if (isDragging) {
      document.documentElement.setAttribute('data-sidebar-resizing', 'true')
    } else {
      document.documentElement.removeAttribute('data-sidebar-resizing')
    }
  }, [isDragging])

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // 防止重复注册监听器
      if (isDraggingRef.current) return

      e.preventDefault()
      setIsDragging(true)
      isDraggingRef.current = true

      const startX = e.clientX
      const startWidth = widthRef.current

      const onMouseMove = (e: MouseEvent) => {
        const delta = e.clientX - startX
        const newWidth = startWidth + delta

        if (newWidth < minWidth) {
          setWidth(minWidth)
        } else if (newWidth > maxWidth) {
          setWidth(maxWidth)
        } else {
          setWidth(newWidth)
        }
      }

      const onMouseUp = () => {
        setIsDragging(false)
        isDraggingRef.current = false
        // 拖拽结束时保存到 localStorage
        localStorage.setItem(storageKey, String(widthRef.current))
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
      }

      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    },
    [minWidth, maxWidth, storageKey]
  )

  return {
    width,
    isDragging,
    handleMouseDown,
    minWidth,
    maxWidth,
  }
}
