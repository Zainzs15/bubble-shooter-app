import { GRID_COLS } from '../../config/gameConfig';
import type { BoardMetrics, Cell } from '../types';

export function cellKey(row: number, col: number): string {
  return `${row}:${col}`;
}

export function isOddRow(row: number): boolean {
  return (row & 1) === 1;
}

export function rowHeight(radius: number): number {
  return radius * Math.sqrt(3);
}

export function inBounds(row: number, col: number, ceilingRow: number, cols = GRID_COLS): boolean {
  return col >= 0 && col < cols && row >= ceilingRow;
}

export function getNeighborCells(row: number, col: number): Cell[] {
  const deltas = isOddRow(row)
    ? [
        [0, -1],
        [0, 1],
        [-1, 0],
        [-1, 1],
        [1, 0],
        [1, 1],
      ]
    : [
        [0, -1],
        [0, 1],
        [-1, -1],
        [-1, 0],
        [1, -1],
        [1, 0],
      ];
  return deltas.map(([dr, dc]) => ({ row: row + dr, col: col + dc }));
}

export function cellToPoint(
  row: number,
  col: number,
  metrics: BoardMetrics,
  ceilingRow: number,
): { x: number; y: number } {
  const diameter = metrics.radius * 2;
  const visualRow = row - ceilingRow;
  const x = metrics.originX + col * diameter + (isOddRow(row) ? metrics.radius : 0) + metrics.radius;
  const y = metrics.originY + visualRow * rowHeight(metrics.radius) + metrics.radius;
  return { x, y };
}
