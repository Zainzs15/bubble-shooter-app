import { GRID_COLS } from '../../config/gameConfig';
import type { BoardMetrics, Bubble, Cell } from '../types';
import { cellKey, cellToPoint, getNeighborCells, inBounds, rowHeight } from '../engine/grid';

export function findAttachCell(
  x: number,
  y: number,
  hit: Cell | null,
  bubbles: Map<string, Bubble>,
  metrics: BoardMetrics,
  ceilingRow: number,
): Cell | null {
  const radius = metrics.radius;
  const candidates: Cell[] = [];
  const seen = new Set<string>();

  const add = (cell: Cell) => {
    const key = cellKey(cell.row, cell.col);
    if (seen.has(key)) return;
    if (!inBounds(cell.row, cell.col, ceilingRow, metrics.cols || GRID_COLS)) return;
    if (bubbles.has(key)) return;
    seen.add(key);
    candidates.push(cell);
  };

  const consider = (cell: Cell) => {
    for (const neighbor of getNeighborCells(cell.row, cell.col)) add(neighbor);
  };

  if (hit) consider(hit);

  const near = radius * 3.35;
  for (const bubble of bubbles.values()) {
    const point = cellToPoint(bubble.row, bubble.col, metrics, ceilingRow);
    const dx = point.x - x;
    const dy = point.y - y;
    if (dx * dx + dy * dy <= near * near) consider(bubble);
  }

  if (y <= metrics.originY + rowHeight(radius) * 1.4) {
    for (let col = 0; col < metrics.cols; col += 1) add({ row: ceilingRow, col });
  }

  const pick = (maxDist: number): Cell | null => {
    let best: Cell | null = null;
    let bestDist = maxDist * maxDist;
    for (const cell of candidates) {
      const point = cellToPoint(cell.row, cell.col, metrics, ceilingRow);
      const dist = (point.x - x) ** 2 + (point.y - y) ** 2;
      if (dist < bestDist) {
        bestDist = dist;
        best = cell;
      }
    }
    return best;
  };

  return pick(radius * 2.5) ?? pick(radius * 3.7) ?? pick(radius * 6.2);
}
