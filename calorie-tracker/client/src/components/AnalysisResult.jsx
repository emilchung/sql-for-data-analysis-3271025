import { useMemo, useState } from 'react'

function initItems(items) {
  return items.map((item) => ({
    ...item,
    included: true,
    manualCalories: item.totalCalories == null ? '' : null,
  }))
}

function itemCalories(item) {
  if (item.caloriesPer100g != null) return item.totalCalories
  const manual = Number(item.manualCalories)
  return Number.isFinite(manual) ? manual : 0
}

export default function AnalysisResult({ result, onSave, onDiscard }) {
  const [items, setItems] = useState(() => initItems(result.items))

  const total = useMemo(
    () => items.filter((i) => i.included).reduce((sum, i) => sum + itemCalories(i), 0),
    [items]
  )

  function updateItem(index, changes) {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item
        const next = { ...item, ...changes }
        if (next.caloriesPer100g != null && 'estimatedGrams' in changes) {
          next.totalCalories = Math.round((next.caloriesPer100g / 100) * next.estimatedGrams)
        }
        return next
      })
    )
  }

  function handleSave() {
    const includedItems = items.filter((i) => i.included)
    onSave({
      items: includedItems.map((i) => ({
        name: i.name,
        notes: i.notes,
        estimatedGrams: i.estimatedGrams,
        matchedName: i.matchedName,
        calories: itemCalories(i),
      })),
      totalCalories: total,
    })
  }

  if (items.length === 0) {
    return (
      <div className="card">
        <p>No food items were recognized in that photo. Try another angle or better lighting.</p>
        <button type="button" className="secondary-button" onClick={onDiscard}>
          Dismiss
        </button>
      </div>
    )
  }

  return (
    <div className="card result-card">
      <h3>Identified items</h3>
      <ul className="item-list">
        {items.map((item, index) => (
          <li key={index} className={`item-row ${item.included ? '' : 'item-row-excluded'}`}>
            <label className="item-checkbox">
              <input
                type="checkbox"
                checked={item.included}
                onChange={(e) => updateItem(index, { included: e.target.checked })}
              />
            </label>
            <div className="item-details">
              <div className="item-name">{item.name}</div>
              {item.notes && <div className="item-notes">{item.notes}</div>}
              <div className="item-controls">
                <label>
                  grams
                  <input
                    type="number"
                    min="0"
                    value={item.estimatedGrams}
                    onChange={(e) => updateItem(index, { estimatedGrams: Number(e.target.value) })}
                  />
                </label>
                {item.caloriesPer100g == null && (
                  <label>
                    calories (no DB match, enter manually)
                    <input
                      type="number"
                      min="0"
                      placeholder="kcal"
                      value={item.manualCalories}
                      onChange={(e) => updateItem(index, { manualCalories: e.target.value })}
                    />
                  </label>
                )}
              </div>
            </div>
            <div className="item-calories">{itemCalories(item)} kcal</div>
          </li>
        ))}
      </ul>

      <div className="result-total">Total: {total} kcal</div>

      <div className="result-actions">
        <button type="button" className="secondary-button" onClick={onDiscard}>
          Discard
        </button>
        <button type="button" className="primary-button" onClick={handleSave}>
          Save to log
        </button>
      </div>
    </div>
  )
}
