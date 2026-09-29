import { Fragment, useEffect, useState } from 'react'
import type { DragEvent } from 'react'
import type { Column as ColumnType, CardFields } from '../api'
import CardView from './Card'

type Props = {
  column: ColumnType
  draggingId: string | null
  onDragStart: (e: DragEvent, id: string) => void
  onDragEnd: () => void
  onCreateCard: (columnId: string, title: string) => Promise<void>
  onUpdateCard: (id: string, fields: CardFields) => Promise<void>
  onMoveCard: (id: string, toColumnId: string, index: number) => Promise<void>
  onDeleteCard: (id: string) => Promise<void>
}

export default function ColumnView({
  column,
  draggingId,
  onDragStart,
  onDragEnd,
  onCreateCard,
  onUpdateCard,
  onMoveCard,
  onDeleteCard,
}: Props) {
  const [overIndex, setOverIndex] = useState<number | null>(null)
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState('')

  useEffect(() => {
    if (!draggingId) setOverIndex(null)
  }, [draggingId])

  const handleDragOver = (e: DragEvent<HTMLElement>) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    const els = Array.from(e.currentTarget.querySelectorAll('[data-card]'))
    let idx = els.length
    for (let i = 0; i < els.length; i++) {
      const r = els[i].getBoundingClientRect()
      if (e.clientY < r.top + r.height / 2) {
        idx = i
        break
      }
    }
    setOverIndex(idx)
  }

  const handleDrop = async (e: DragEvent<HTMLElement>) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('text/plain')
    const index = overIndex ?? column.cards.length
    setOverIndex(null)
    if (id) await onMoveCard(id, column.id, index)
  }

  const submit = async () => {
    const title = draft.trim()
    if (title) await onCreateCard(column.id, title)
    setDraft('')
    setAdding(false)
  }

  return (
    <section
      onDragOver={handleDragOver}
      onDragLeave={(e: DragEvent<HTMLElement>) => {
        const next = e.relatedTarget as Node | null
        if (next && e.currentTarget.contains(next)) return
        setOverIndex(null)
      }}
      onDrop={handleDrop}
      className="glass card-shadow flex max-h-full w-72 shrink-0 flex-col rounded-3xl border border-white/60"
    >
      <header className="flex items-center justify-between px-4 pb-2 pt-4">
        <h2 className="text-[13px] font-semibold uppercase tracking-wider text-slate-600">
          {column.title}
        </h2>
        <span className="rounded-full bg-white/70 px-2 py-0.5 text-[11px] font-medium text-slate-500 shadow-sm">
          {column.cards.length}
        </span>
      </header>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-2.5 pb-2">
        {column.cards.map((card, i) => (
          <Fragment key={card.id}>
            {overIndex === i && <DropLine />}
            <div data-card>
              <CardView
                card={card}
                isDragging={draggingId === card.id}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onUpdate={onUpdateCard}
                onDelete={onDeleteCard}
              />
            </div>
          </Fragment>
        ))}
        {overIndex === column.cards.length && <DropLine />}
        {overIndex === null && column.cards.length === 0 && (
          <div className="mt-1 flex h-24 items-center justify-center rounded-2xl border border-dashed border-slate-300/70 text-[12px] text-slate-400">
            Drop cards here
          </div>
        )}
      </div>

      <footer className="px-2.5 pb-2.5 pt-1">
        {adding ? (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              void submit()
            }}
          >
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setAdding(false)
                  setDraft('')
                }
              }}
              onBlur={() => void submit()}
              placeholder="Card title"
              className="w-full rounded-xl border border-white/70 bg-white/80 px-3 py-1.5 text-[13px] text-slate-700 shadow-sm outline-none placeholder:text-slate-400"
            />
          </form>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="w-full rounded-xl px-3 py-1.5 text-left text-[13px] font-medium text-slate-500 transition-colors hover:bg-white/60 hover:text-slate-700"
          >
            + Add card
          </button>
        )}
      </footer>
    </section>
  )
}

function DropLine() {
  return <div className="h-1.5 shrink-0 rounded-full bg-sky-400/70" />
}
