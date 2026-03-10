export function Logo() {
  return (
    <div className="size-8 rounded-lg border flex items-center justify-center">
      <svg fill="none" height="18" viewBox="0 0 24 24" width="18">
        <path d="M7 14a5 5 0 0 1 10 0" fill="currentColor" />
        <path
          d="M4 14h16"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.5"
        />
        <path
          d="M12 4v3M18 7l-2 2M6 7l2 2"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  )
}
