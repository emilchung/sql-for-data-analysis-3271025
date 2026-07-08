export default function DailyLog({ entries, onDelete }) {
  if (entries.length === 0) {
    return <p className="empty-state">No food logged for this day yet.</p>
  }

  return (
    <ul className="log-list">
      {entries.map((entry) => (
        <li key={entry.id} className="log-entry">
          <div className="log-entry-header">
            <span className="log-entry-time">
              {new Date(entry.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
            </span>
            <span className="log-entry-calories">{entry.totalCalories} kcal</span>
            <button
              type="button"
              className="icon-button"
              aria-label="Delete entry"
              onClick={() => onDelete(entry.id)}
            >
              ✕
            </button>
          </div>
          <div className="log-entry-items">
            {entry.items.map((item) => item.name).join(', ')}
          </div>
        </li>
      ))}
    </ul>
  )
}
