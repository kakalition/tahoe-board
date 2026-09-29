const API = `${window.location.protocol}//${window.location.hostname}:9996`

export type Card = { id: string; title: string; description: string }
export type Column = { id: string; title: string; cards: Card[] }
export type Board = { columns: Column[] }
export type CardFields = { title?: string; description?: string }

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json' },
  })
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`)
  return (await res.json()) as T
}

export const api = {
  getBoard: () => req<Board>('/api/board'),
  createCard: (columnId: string, title: string) =>
    req<Card>('/api/cards', { method: 'POST', body: JSON.stringify({ columnId, title }) }),
  updateCard: (id: string, fields: CardFields) =>
    req<Card>(`/api/cards/${id}`, { method: 'PATCH', body: JSON.stringify(fields) }),
  moveCard: (id: string, toColumnId: string, index: number) =>
    req<Board>(`/api/cards/${id}/move`, {
      method: 'PATCH',
      body: JSON.stringify({ toColumnId, index }),
    }),
  deleteCard: (id: string) => req<{ ok: true }>(`/api/cards/${id}`, { method: 'DELETE' }),
}
