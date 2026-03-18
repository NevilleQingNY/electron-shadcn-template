import { useEffect, useMemo, useRef, useState } from 'react'

const DEFAULT_FADE_SIZE = 32

interface ScrollState {
  canScrollUp: boolean
  canScrollDown: boolean
  canScrollLeft: boolean
  canScrollRight: boolean
}

export function useScrollFade(fadeSize = DEFAULT_FADE_SIZE) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [scrollState, setScrollState] = useState<ScrollState>({
    canScrollUp: false,
    canScrollDown: false,
    canScrollLeft: false,
    canScrollRight: false,
  })

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const update = () => {
      const { scrollTop, scrollLeft, scrollWidth, scrollHeight, clientWidth, clientHeight } = el
      setScrollState({
        canScrollUp: scrollTop > 1,
        canScrollDown: scrollTop + clientHeight < scrollHeight - 1,
        canScrollLeft: scrollLeft > 1,
        canScrollRight: scrollLeft + clientWidth < scrollWidth - 1,
      })
    }

    update()
    el.addEventListener('scroll', update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(el)

    return () => {
      el.removeEventListener('scroll', update)
      ro.disconnect()
    }
  }, [])

  const maskImage = useMemo(() => {
    const { canScrollUp, canScrollDown, canScrollLeft, canScrollRight } = scrollState
    const hasVerticalFade = canScrollUp || canScrollDown
    const hasHorizontalFade = canScrollLeft || canScrollRight

    if (!hasVerticalFade && !hasHorizontalFade) return undefined

    const masks: string[] = []

    if (hasHorizontalFade) {
      const left = canScrollLeft ? `transparent, black ${fadeSize}px` : 'black 0%'
      const right = canScrollRight ? `black calc(100% - ${fadeSize}px), transparent` : 'black 100%'
      masks.push(`linear-gradient(to right, ${left}, ${right})`)
    }

    if (hasVerticalFade) {
      const top = canScrollUp ? `transparent, black ${fadeSize}px` : 'black 0%'
      const bottom = canScrollDown ? `black calc(100% - ${fadeSize}px), transparent` : 'black 100%'
      masks.push(`linear-gradient(to bottom, ${top}, ${bottom})`)
    }

    if (masks.length === 1) return masks[0]

    return masks.join(', ')
  }, [scrollState, fadeSize])

  const maskComposite = maskImage?.includes(', ') ? 'intersect' : undefined
  const webkitMaskComposite = maskComposite ? 'source-in' : undefined

  return { scrollRef, maskImage, maskComposite, webkitMaskComposite, scrollState }
}
