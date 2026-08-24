import { useState } from 'react'

export default function StagesManager({ stages, onAdd, onRename, onDelete, onReorder }) {
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [error, setError] = useState('')

  async function handleAdd(e) {
    e.preventDefault()
    if (!newName.trim()) return
    try {
      await onAdd(newName.trim())
      setNewName('')
      setError('')
    } catch (err) {
      setError(err.message)
    }
  }

  function startEdit(stage) {
    setEditingId(stage.id)
    setEditingName(stage.name)
  }

  async function commitEdit(id) {
    if (!editingName.trim()) {
      setEditingId(null)
      return
    }
    try {
      await onRename(id, editingName.trim())
      setEditingId(null)
      setError('')
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this stage?')) return
    try {
      await onDelete(id)
      setError('')
    } catch (err) {
      setError(err.message)
    }
  }

  function move(index, dir) {
    const target = index + dir
    if (target < 0 || target >= stages.length) return
    const order = stages.map((s) => s.id)
    ;[order[index], order[target]] = [order[target], order[index]]
    onReorder(order)
  }

  return (
    <div className="stages-panel">
      <p className="stages-hint">
        These are the stages leads move through. Add, rename, reorder, or remove them any time — leads keep their
        stage automatically when you rename one.
      </p>
      {error && <p className="form-error">{error}</p>}

      <ul className="stages-list">
        {stages.map((stage, i) => (
          <li key={stage.id} className="stages-list-item">
            <div className="stages-reorder">
              <button type="button" className="btn-icon" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">
                ↑
              </button>
              <button
                type="button"
                className="btn-icon"
                onClick={() => move(i, 1)}
                disabled={i === stages.length - 1}
                aria-label="Move down"
              >
                ↓
              </button>
            </div>
            {editingId === stage.id ? (
              <input
                type="text"
                value={editingName}
                autoFocus
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={() => commitEdit(stage.id)}
                onKeyDown={(e) => e.key === 'Enter' && commitEdit(stage.id)}
                className="stages-edit-input"
              />
            ) : (
              <span className="stages-name" onClick={() => startEdit(stage)}>
                {stage.name}
              </span>
            )}
            <button type="button" className="btn-link danger" onClick={() => handleDelete(stage.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>

      <form className="stages-add-form" onSubmit={handleAdd}>
        <input
          type="text"
          placeholder="New stage name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <button type="submit" className="btn-secondary">
          Add Stage
        </button>
      </form>
    </div>
  )
}
