import type { DragEvent } from 'react'
import type { Card as CardType, CardFields } from '../api'
import AutoTextarea from './AutoTextarea'

type Props = {
  card: CardType
  isDragging: boolean
  onDragStart: (e: DragEvent, id: string) => void
  onDragEnd: () => void
  onUpdate: (id: string, fields: CardFields) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export default function CardView({
  card,
  isDragging,
  onDragStart,
  onDragEnd,
  onUpdate,
  onDelete,
}: Props) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, card.id)}
      onDragEnd={onDragEnd}
      className={`card-shadow group relative cursor-grab rounded-2xl border border-white/70 bg-white/75 p-3 backdrop-blur-md transition-all duration-150 hover:-translate-y-0.5 hover:bg-white/90 active:cursor-grabbing ${
        isDragging ? 'scale-[0.98] opacity-40' : ''
      }`}
    >
      <button
        title="Delete card"
        onClick={() => onDelete(card.id)}
        className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-200/70 text-[12px] leading-none text-slate-500 opacity-0 transition-opacity hover:bg-red-200 hover:text-red-600 group-hover:opacity-100"
      >
        ×
      </button>
      <AutoTextarea
        value={card.title}
        placeholder="Title"
        onCommit={(v) => onUpdate(card.id, { title: v })}
        className="w-full pr-5 text-[13px] font-semibold leading-snug text-slate-800 placeholder:font-medium placeholder:text-slate-400"
      />
      <AutoTextarea
        value={card.description}
        placeholder="Add details…"
        onCommit={(v) => onUpdate(card.id, { description: v })}
        className="mt-1.5 w-full text-[12.5px] leading-snug text-slate-600 placeholder:text-slate-400/70"
      />
    </div>
  )
}
