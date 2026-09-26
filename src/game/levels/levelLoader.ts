import { GRID_COLS } from '../../config/gameConfig';
import { COLOR_LETTERS, COLOR_ORDER } from '../../data/colors';
import type { Bubble, BubbleColor, LevelDef } from '../types';
import { cellKey } from '../engine/grid';

const FALLBACK: string[] = ['RRGGBBRR', 'RRGGBBRR', 'BBRRGGBB'];

export interface LoadedLevel {
  bubbles: Bubble[];
  colors: BubbleColor[];
}

export function loadLevelBubbles(level: LevelDef): LoadedLevel {
  const bubbles: Bubble[] = [];
  const seen = new Set<string>();
  const used = new Set<BubbleColor>();
  let nextId = 1;
  const formation = Array.isArray(level.formation) && level.formation.length > 0 ? level.formation : FALLBACK;

  formation.forEach((rowText, row) => {
    const source = typeof rowText === 'string' ? rowText : '';
    for (let col = 0; col < GRID_COLS; col += 1) {
      const letter = source[col];
      const color = letter ? COLOR_LETTERS[letter] : undefined;
      if (!color) continue;
      const key = cellKey(row, col);
      if (seen.has(key)) continue;
      seen.add(key);
      used.add(color);
      bubbles.push({ id: nextId, row, col, color });
      nextId += 1;
    }
  });

  if (bubbles.length === 0) {
    return loadLevelBubbles({ ...level, formation: FALLBACK, colors: ['red', 'blue', 'green'] });
  }

  const preferred = COLOR_ORDER.filter((color) => used.has(color));
  const extras = (level.colors ?? []).filter((color) => preferred.includes(color) || used.has(color));
  const colors = preferred.length > 0 ? preferred : extras;
  return { bubbles, colors: colors.length > 0 ? colors : ['red'] };
}
