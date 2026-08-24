export default function StageCell({ lead, stages, onSave }) {
  return (
    <select
      className="inline-select"
      value={lead.stage_id ?? ''}
      onChange={(e) => onSave({ ...lead, stage_id: e.target.value ? Number(e.target.value) : null })}
    >
      <option value="">No stage</option>
      {stages.map((s) => (
        <option key={s.id} value={s.id}>
          {s.name}
        </option>
      ))}
    </select>
  )
}
