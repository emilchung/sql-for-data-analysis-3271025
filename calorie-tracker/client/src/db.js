import { openDB } from 'idb'

const DB_NAME = 'calorie-snap'
const STORE_NAME = 'entries'

const dbPromise = openDB(DB_NAME, 1, {
  upgrade(db) {
    const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
    store.createIndex('date', 'date')
  },
})

export function todayDateString() {
  const now = new Date()
  const offset = now.getTimezoneOffset()
  const local = new Date(now.getTime() - offset * 60 * 1000)
  return local.toISOString().slice(0, 10)
}

export async function addEntry(entry) {
  const db = await dbPromise
  const record = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...entry,
  }
  await db.add(STORE_NAME, record)
  return record
}

export async function deleteEntry(id) {
  const db = await dbPromise
  await db.delete(STORE_NAME, id)
}

export async function getEntriesForDate(date) {
  const db = await dbPromise
  const entries = await db.getAllFromIndex(STORE_NAME, 'date', date)
  return entries.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

export async function getAllEntries() {
  const db = await dbPromise
  return db.getAll(STORE_NAME)
}

export async function getDailyTotals() {
  const entries = await getAllEntries()
  const totals = new Map()
  for (const entry of entries) {
    totals.set(entry.date, (totals.get(entry.date) ?? 0) + entry.totalCalories)
  }
  return [...totals.entries()]
    .map(([date, totalCalories]) => ({ date, totalCalories }))
    .sort((a, b) => b.date.localeCompare(a.date))
}
