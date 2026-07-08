import { useEffect, useState } from 'react'
import PhotoCapture from './components/PhotoCapture'
import AnalysisResult from './components/AnalysisResult'
import DailyLog from './components/DailyLog'
import { addEntry, deleteEntry, getEntriesForDate, todayDateString } from './db'
import './App.css'

export default function App() {
  const [selectedDate, setSelectedDate] = useState(todayDateString())
  const [entries, setEntries] = useState([])
  const [pendingResult, setPendingResult] = useState(null)

  useEffect(() => {
    refreshEntries(selectedDate)
  }, [selectedDate])

  async function refreshEntries(date) {
    const dayEntries = await getEntriesForDate(date)
    setEntries(dayEntries)
  }

  async function handleSave(entryData) {
    await addEntry({ date: selectedDate, ...entryData })
    setPendingResult(null)
    refreshEntries(selectedDate)
  }

  async function handleDelete(id) {
    await deleteEntry(id)
    refreshEntries(selectedDate)
  }

  const dailyTotal = entries.reduce((sum, e) => sum + e.totalCalories, 0)
  const isToday = selectedDate === todayDateString()

  return (
    <div className="app">
      <header className="app-header">
        <h1>Calorie Snap</h1>
        <input
          type="date"
          value={selectedDate}
          max={todayDateString()}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </header>

      <div className="daily-total-card">
        <span className="daily-total-label">
          {isToday ? "Today's total" : `Total for ${selectedDate}`}
        </span>
        <span className="daily-total-value">{dailyTotal} kcal</span>
      </div>

      {!pendingResult && <PhotoCapture onAnalyzed={setPendingResult} />}

      {pendingResult && (
        <AnalysisResult
          result={pendingResult}
          onSave={handleSave}
          onDiscard={() => setPendingResult(null)}
        />
      )}

      <section>
        <h2>Log</h2>
        <DailyLog entries={entries} onDelete={handleDelete} />
      </section>
    </div>
  )
}
