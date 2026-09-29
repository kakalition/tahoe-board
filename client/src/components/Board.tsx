import { useState } from 'react'
import type { DragEvent } from 'react'
import type { Board as BoardType, CardFields } from '../api'
import ColumnView from './Column'

type Props = {
  board: BoardType
  onCreateCard: (columnId: string, title: string) => Promise<void>
  onUpdateCard: (id: string, fields: CardFields) => Promise<void>
  onMoveCard: (id: string, toColumnId: string, index: number) => Promise<void>
  onDeleteCard: (id: string) => Promise<void>
}

export default function BoardView({
  board,
  onCreateCard,
  onUpdateCard,
  onMoveCard,
  onDeleteCard,
}: Props) {
  const [draggingId, setDraggingId] = useState<string | null>(null)

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex items-center gap-3 px-5 pb-1 pt-4">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        </div>
        <h1 className="text-[13px] font-medium tracking-tight text-slate-600">Projects</h1>
      </header>

      <main className="min-h-0 flex-1 overflow-x-auto px-3 pb-3 pt-2">
        <div className="flex h-full items-stretch gap-4 pb-1">
          {board.columns.map((column) => (
            <ColumnView
              key={column.id}
              column={column}
              draggingId={draggingId}
              onDragStart={(e: DragEvent, id: string) => {
                e.dataTransfer.effectAllowed = 'move'
                e.dataTransfer.setData('text/plain', id)
                setDraggingId(id)
              }}
              onDragEnd={() => setDraggingId(null)}
              onCreateCard={onCreateCard}
              onUpdateCard={onUpdateCard}
              onMoveCard={onMoveCard}
              onDeleteCard={onDeleteCard}
            />
          ))}
        </div>
      </main>
    </div>
  )
}
