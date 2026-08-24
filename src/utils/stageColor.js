const PALETTE = ['#3b82f6', '#f59e0b', '#a855f7', '#22c55e', '#ef4444', '#06b6d4', '#ec4899', '#84cc16']

export function stageColor(name) {
  if (!name) return '#6b7280'
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  return PALETTE[hash % PALETTE.length]
}
