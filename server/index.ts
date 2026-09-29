import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

type Card = { id: string; title: string; description: string }
type Column = { id: string; title: string; cards: Card[] }
type Board = { columns: Column[] }

const DATA_FILE = join(dirname(fileURLToPath(import.meta.url)), 'data.json')

function seed(): Board {
  return {
    columns: [
      {
        id: 'todo',
        title: 'To Do',
        cards: [
          {
            id: 'seed-1',
            title: 'Audit design system',
            description: 'Collect current components, tokens and typography',
          },
          { id: 'seed-2', title: 'Set up CI', description: '' },
        ],
      },
      {
        id: 'in-progress',
        title: 'In Progress',
        cards: [
          {
            id: 'seed-3',
            title: 'Kanban board',
            description: 'Draggable columns with editable cards',
          },
        ],
      },
      { id: 'review', title: 'Review', cards: [] },
      {
        id: 'done',
        title: 'Done',
        cards: [{ id: 'seed-4', title: 'Kickoff', description: 'Scoping, tooling, environment' }],
      },
    ],
  }
}

function persist(next: Board = board) {
  writeFileSync(DATA_FILE, JSON.stringify(next, null, 2))
}

function load(): Board {
  try {
    return JSON.parse(readFileSync(DATA_FILE, 'utf8')) as Board
  } catch {
    const board = seed()
    persist(board)
    return board
  }
}

let board: Board = load()

const app = new Elysia()
app.use(cors())
  .get('/api/board', () => board)
  .post(
    '/api/cards',
    async ({ body, status }) => {
      const { columnId, title } = (await body) as { columnId: string; title?: string }
      const column = board.columns.find((c) => c.id === columnId)
      if (!column) return status(404, 'column not found')
      const card: Card = {
        id: crypto.randomUUID(),
        title: (title ?? '').trim() || 'Untitled card',
        description: '',
      }
      column.cards.push(card)
      persist()
      return card
    },
  )
  .patch(
    '/api/cards/:id/move',
    async ({ params, body, status }) => {
      const { toColumnId, index } = (await body) as { toColumnId: string; index: number }
      const toColumn = board.columns.find((c) => c.id === toColumnId)
      if (!toColumn) return status(404, 'column not found')
      const fromColumn = board.columns.find((c) => c.cards.some((k) => k.id === params.id))
      const fromIndex = fromColumn?.cards.findIndex((k) => k.id === params.id) ?? -1
      if (fromIndex < 0) return status(404, 'card not found')
      const [card] = fromColumn!.cards.splice(fromIndex)
      let insertAt = index
      if (fromColumn === toColumn && fromIndex < insertAt) insertAt = index - 1
      insertAt = Math.max(0, Math.min(insertAt, toColumn.cards.length))
      toColumn.cards.splice(insertAt, 0, card)
      persist()
      return board
    },
  )
  .patch(
    '/api/cards/:id',
    async ({ params, body, status }) => {
      const card = board.columns.flatMap((c) => c.cards).find((k) => k.id === params.id)
      if (!card) return status(404, 'card not found')
      const fields = (await body) as { title?: string; description?: string }
      if (typeof fields.title === 'string') card.title = fields.title
      if (typeof fields.description === 'string') card.description = fields.description
      persist()
      return card
    },
  )
  .delete(
    '/api/cards/:id',
    ({ params, status }) => {
      const column = board.columns.find((c) => c.cards.some((k) => k.id === params.id))
      if (!column) return status(404, 'card not found')
      column.cards = column.cards.filter((k) => k.id !== params.id)
      persist()
      return { ok: true }
    },
  )

app.listen({ port: 9996, hostname: '0.0.0.0' })
