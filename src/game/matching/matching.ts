import type { Bubble, BubbleColor, Cell } from '../types';
import { cellKey, getNeighborCells } from '../engine/grid';

export function findConnected(bubbles: Map<string, Bubble>, start: Cell, color: BubbleColor): Bubble[] {
  const origin = bubbles.get(cellKey(start.row, start.col));
  if (!origin || origin.color !== color) return [];

  const seen = new Set<string>();
  const stack: Bubble[] = [origin];
  const group: Bubble[] = [];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;
    const key = cellKey(current.row, current.col);
    if (seen.has(key)) continue;
    seen.add(key);
    group.push(current);

    for (const neighbor of getNeighborCells(current.row, current.col)) {
      const next = bubbles.get(cellKey(neighbor.row, neighbor.col));
      if (next && next.color === color && !seen.has(cellKey(next.row, next.col))) {
        stack.push(next);
      }
    }
  }

  return group;
}

/** Bubbles that cannot reach the ceiling row by walking through neighbors. */
export function findFloating(bubbles: Map<string, Bubble>, ceilingRow: number): Bubble[] {
  const anchored = new Set<string>();
  const stack: Bubble[] = [];

  for (const bubble of bubbles.values()) {
    if (bubble.row === ceilingRow) stack.push(bubble);
  }

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;
    const key = cellKey(current.row, current.col);
    if (anchored.has(key)) continue;
    anchored.add(key);
    for (const neighbor of getNeighborCells(current.row, current.col)) {
      const next = bubbles.get(cellKey(neighbor.row, neighbor.col));
      if (next && !anchored.has(cellKey(next.row, next.col))) stack.push(next);
    }
  }

  const floating: Bubble[] = [];
  for (const bubble of bubbles.values()) {
    if (!anchored.has(cellKey(bubble.row, bubble.col))) floating.push(bubble);
  }
  return floating;
}
