import { useEffect, useRef, useState } from 'react'

type Props = {
  value: string
  placeholder: string
  className?: string
  onCommit: (value: string) => void
}

export default function AutoTextarea({ value, placeholder, className, onCommit }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  useEffect(() => {
    if (!editing) setDraft(value)
  }, [value, editing])

  const resize = () => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }

  return (
    <textarea
      ref={ref}
      value={draft}
      placeholder={placeholder}
      draggable={false}
      spellCheck={false}
      onFocus={() => setEditing(true)}
      onChange={(e) => {
        setDraft(e.target.value)
        requestAnimationFrame(resize)
      }}
      onInput={resize}
      onBlur={() => {
        setEditing(false)
        if (draft !== value) onCommit(draft)
      }}
      className={`resize-none overflow-hidden bg-transparent caret-sky-500 outline-none ${className ?? ''}`}
    />
  )
}
