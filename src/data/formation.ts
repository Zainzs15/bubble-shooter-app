import { GRID_COLS } from '../config/gameConfig';
import { getNeighborCells } from '../game/engine/grid';

export type Grid = string[][];

export function emptyGrid(rows: number): Grid {
  return Array.from({ length: rows }, () => Array.from({ length: GRID_COLS }, () => '.'));
}

export function isFormationConnected(grid: Grid): boolean {
  let total = 0;
  const seen = new Set<string>();
  const stack: { row: number; col: number }[] = [];

  for (let col = 0; col < GRID_COLS; col += 1) {
    if (grid[0]?.[col] && grid[0][col] !== '.') stack.push({ row: 0, col });
  }

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;
    if (current.row < 0 || current.col < 0 || current.col >= GRID_COLS || current.row >= grid.length) continue;
    const letter = grid[current.row][current.col];
    if (!letter || letter === '.') continue;
    const key = `${current.row}:${current.col}`;
    if (seen.has(key)) continue;
    seen.add(key);
    for (const neighbor of getNeighborCells(current.row, current.col)) stack.push(neighbor);
  }

  for (const row of grid) {
    for (const cell of row) if (cell !== '.') total += 1;
  }
  return seen.size === total;
}

export function put(grid: Grid, row: number, col: number, letter: string) {
  if (row < 0 || col < 0 || col >= GRID_COLS || row >= grid.length) return;
  if (!letter || letter === '.') return;
  grid[row][col] = letter;
  if (!isFormationConnected(grid)) grid[row][col] = '.';
}

export function carve(grid: Grid, row: number, col: number) {
  if (!grid[row]?.[col] || grid[row][col] === '.') return;
  const previous = grid[row][col];
  grid[row][col] = '.';
  if (!isFormationConnected(grid)) grid[row][col] = previous;
}

export function fillAll(rows: number, colorAt: (row: number, col: number) => string): Grid {
  const grid = emptyGrid(rows);
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < GRID_COLS; col += 1) put(grid, row, col, colorAt(row, col));
  }
  return grid;
}

export function toFormation(grid: Grid): string[] {
  const rows = grid.map((row) => row.join(''));
  while (rows.length > 0 && /^\.+$/.test(rows[rows.length - 1])) rows.pop();
  return rows;
}
