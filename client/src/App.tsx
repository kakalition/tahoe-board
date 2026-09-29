import { useCallback, useEffect, useState } from 'react'
import type { Board } from './api'
import { api } from './api'
import BoardView from './components/Board'

export default function App() {
  const [board, setBoard] = useState<Board | null>(null)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(() => {
    api
      .getBoard()
      .then(setBoard)
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : 'Failed to load board'),
      )
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="glass card-shadow flex flex-col items-center gap-3 rounded-2xl border border-white/70 px-8 py-6">
          <p className="text-[14px] font-medium text-slate-600">{error}</p>
          <button
            onClick={refresh}
            className="rounded-full bg-sky-500/90 px-4 py-1.5 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-sky-500"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!board) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="glass card-shadow rounded-2xl border border-white/70 px-6 py-4 text-[13px] font-medium text-slate-500">
          Loading board…
        </div>
      </div>
    )
  }

  return (
    <div className="h-full p-3 sm:p-6">
      <div className="glass-strong card-shadow mx-auto flex h-full max-w-[1500px] flex-col overflow-hidden rounded-[28px] border border-white/70">
        <BoardView
          board={board}
          onCreateCard={async (columnId, title) => {
            await api.createCard(columnId, title)
            refresh()
          }}
          onUpdateCard={async (id, fields) => {
            await api.updateCard(id, fields)
            refresh()
          }}
          onMoveCard={async (id, toColumnId, index) => {
            await api.moveCard(id, toColumnId, index)
            refresh()
          }}
          onDeleteCard={async (id) => {
            await api.deleteCard(id)
            refresh()
          }}
        />
      </div>
    </div>
  )
}
