/** Opening the list with an arrow key highlights an edge, not the next option. */
export function nextActiveIndex(
  key: 'ArrowDown' | 'ArrowUp',
  current: number,
  length: number,
  open: boolean,
): number {
  if (length === 0) return 0
  if (!open) return key === 'ArrowDown' ? 0 : length - 1
  return (current + (key === 'ArrowDown' ? 1 : -1) + length) % length
}
