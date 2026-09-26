import { COLOR_LETTERS, COLOR_ORDER } from './colors';
import { carve, emptyGrid, fillAll, put, toFormation, type Grid } from './formation';
import type { BubbleColor, LevelDef } from '../game/types';

function colorsIn(formation: string[]): BubbleColor[] {
  const used = new Set<BubbleColor>();
  for (const row of formation) {
    for (const letter of row) {
      const color = COLOR_LETTERS[letter];
      if (color) used.add(color);
    }
  }
  return COLOR_ORDER.filter((color) => used.has(color));
}

function make(id: number, name: string, missLimit: number, grid: Grid): LevelDef {
  const formation = toFormation(grid);
  return { id, name, missLimit, formation, colors: colorsIn(formation) };
}

function band(row: number, col: number, letters: string[]) {
  return letters[(Math.floor(col / 2) + row) % letters.length];
}

const level1 = () =>
  make(1, 'Simple horizontal arrangement', 6, fillAll(4, (row, col) => (row < 2 ? 'RRGGBBRR'[col] : 'BBRRGGBB'[col])));

const level2 = () => {
  const grid = emptyGrid(5);
  for (let row = 0; row < 5; row += 1) {
    const inset = Math.max(0, 2 - Math.floor(row / 1.2));
    for (let col = inset; col < 8 - inset; col += 1) put(grid, row, col, 'RGBY'[col % 4]);
  }
  return make(2, 'Small pyramid', 6, grid);
};

const level3 = () =>
  make(
    3,
    'Two color groups',
    6,
    fillAll(4, (_row, col) => (col < 3 ? 'R' : col < 5 ? 'G' : 'B')),
  );

const level4 = () => {
  const grid = emptyGrid(7);
  const mid = 3;
  for (let row = 0; row < 7; row += 1) {
    const span = row <= mid ? row : 6 - row;
    const count = Math.min(8, 2 + span * 2);
    const start = Math.floor((8 - count) / 2);
    for (let col = start; col < start + count; col += 1) put(grid, row, col, 'RGYB'[col % 4]);
  }
  return make(4, 'Diamond pattern', 6, grid);
};

const level5 = () => {
  const grid = fillAll(6, (row, col) => 'RGB'[ (col + row) % 3 ]);
  for (let row = 2; row <= 3; row += 1) {
    carve(grid, row, 3);
    carve(grid, row, 4);
  }
  return make(5, 'Hollow center', 6, grid);
};

const level6 = () => {
  const grid = emptyGrid(6);
  for (let col = 2; col <= 5; col += 1) put(grid, 0, col, 'Y');
  for (let row = 1; row < 6; row += 1) {
    for (let col = 1; col <= 6; col += 1) put(grid, row, col, row < 4 ? 'RGB'[col % 3] : 'YGB'[col % 3]);
  }
  return make(6, 'Large central cluster', 6, grid);
};

const level7 = () => {
  const grid = emptyGrid(6);
  for (let col = 0; col < 8; col += 1) put(grid, 0, col, col < 4 ? 'R' : 'B');
  for (let row = 1; row < 5; row += 1) {
    put(grid, row, 0, 'R');
    put(grid, row, 1, 'G');
    put(grid, row, 6, 'B');
    put(grid, row, 7, 'Y');
  }
  for (let col = 0; col <= 2; col += 1) put(grid, 5, col, 'R');
  for (let col = 5; col <= 7; col += 1) put(grid, 5, col, 'B');
  return make(7, 'Separated color islands', 5, grid);
};

const level8 = () =>
  make(8, 'Symmetrical formation', 5, fillAll(5, (row, col) => 'RGYB'[Math.abs(3 - Math.min(col, 7 - col)) % 4 === 0 ? 0 : (row + col) % 4]));

const level9 = () => {
  const grid = fillAll(5, (row, col) => 'RGBY'[(col + row) % 4]);
  carve(grid, 1, 2);
  carve(grid, 2, 5);
  carve(grid, 3, 1);
  carve(grid, 3, 6);
  return make(9, 'Small openings', 5, grid);
};

const level10 = () => make(10, 'Mixed colors', 5, fillAll(6, (row, col) => 'RGBYP'[(Math.floor(col / 2) + row * 2) % 5]));

const level11 = () => {
  const grid = emptyGrid(9);
  for (let row = 0; row < 9; row += 1) {
    const span = row <= 4 ? row : 8 - row;
    const count = Math.min(8, 2 + span * 2);
    const start = Math.floor((8 - count) / 2);
    for (let col = start; col < start + count; col += 1) put(grid, row, col, 'RGYBP'[ (col + row) % 5 ]);
  }
  return make(11, 'Large diamond', 5, grid);
};

const level12 = () => {
  const grid = emptyGrid(7);
  for (let col = 0; col < 8; col += 1) put(grid, 0, col, 'P');
  for (let row = 1; row < 6; row += 1) {
    for (let col = 0; col <= 2; col += 1) put(grid, row, col, 'RGB'[row % 3]);
    for (let col = 5; col <= 7; col += 1) put(grid, row, col, 'YBP'[row % 3]);
  }
  for (let col = 2; col <= 5; col += 1) put(grid, 6, col, 'O');
  return make(12, 'Twin clusters', 5, grid);
};

const level13 = () => {
  const grid = emptyGrid(8);
  for (let col = 0; col < 8; col += 1) put(grid, 0, col, 'B');
  for (let row = 1; row < 6; row += 1) {
    put(grid, row, 1, 'R');
    put(grid, row, 6, 'G');
  }
  for (let col = 0; col <= 3; col += 1) put(grid, 6, col, 'RYG'[col % 3]);
  for (let col = 4; col <= 7; col += 1) put(grid, 6, col, 'GBY'[col % 3]);
  for (let col = 1; col <= 6; col += 1) put(grid, 7, col, 'Y');
  return make(13, 'Hanging formations', 5, grid);
};

const level14 = () => {
  const grid = emptyGrid(8);
  for (let col = 0; col < 8; col += 1) put(grid, 0, col, 'RGBYPO'[col % 6]);
  for (let row = 1; row < 8; row += 1) {
    put(grid, row, 3, 'RBG'[row % 3]);
    put(grid, row, 4, 'YPO'[row % 3]);
    if (row % 2 === 0) {
      put(grid, row, 2, 'G');
      put(grid, row, 5, 'B');
    }
  }
  return make(14, 'Narrow central path', 5, grid);
};

const level15 = () => make(15, 'Large multi-color formation', 5, fillAll(7, (row, col) => 'RGBYPO'[(Math.floor(col / 3) + row) % 6]));

const level16 = () => {
  const grid = emptyGrid(7);
  for (let row = 0; row < 7; row += 1) {
    const width = row < 3 ? 5 + row : 8 - (row - 3);
    for (let col = 0; col < width && col < 8; col += 1) put(grid, row, col, 'RGBYP'[(col + row * 2) % 5]);
  }
  return make(16, 'Asymmetrical structure', 5, grid);
};

const level17 = () => {
  const grid = emptyGrid(7);
  for (let col = 0; col < 8; col += 1) put(grid, 0, col, 'O');
  for (let row = 1; row <= 3; row += 1) {
    put(grid, row, 0, 'R');
    put(grid, row, 3, 'G');
    put(grid, row, 4, 'B');
    put(grid, row, 7, 'Y');
  }
  for (let col = 0; col <= 1; col += 1) put(grid, 4, col, 'R');
  for (let col = 3; col <= 4; col += 1) put(grid, 4, col, 'P');
  for (let col = 6; col <= 7; col += 1) put(grid, 4, col, 'Y');
  for (let row = 5; row <= 6; row += 1) {
    put(grid, row, 0, 'R');
    put(grid, row, 1, 'G');
    put(grid, row, 3, 'B');
    put(grid, row, 4, 'P');
    put(grid, row, 6, 'O');
    put(grid, row, 7, 'Y');
  }
  return make(17, 'Multiple isolated sections', 5, grid);
};

const level18 = () => {
  const grid = emptyGrid(7);
  for (let col = 0; col < 8; col += 1) put(grid, 3, col, 'R');
  for (let row = 0; row < 7; row += 1) {
    put(grid, row, 3, 'B');
    put(grid, row, 4, 'G');
  }
  for (let col = 1; col <= 6; col += 1) {
    put(grid, 0, col, 'Y');
    put(grid, 6, col, 'P');
  }
  return make(18, 'Cross formation', 4, grid);
};

const level19 = () => {
  const grid = emptyGrid(8);
  const letters = 'RGBYPO';
  for (let col = 0; col < 8; col += 1) put(grid, 0, col, letters[col % 6]);
  const ring = [
    [1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [1, 6],
    [2, 6], [3, 6], [4, 6], [5, 6],
    [5, 5], [5, 4], [5, 3], [5, 2], [5, 1],
    [4, 1], [3, 1], [2, 1],
    [2, 2], [2, 3], [2, 4], [2, 5],
    [3, 5], [4, 5], [4, 4], [4, 3], [3, 3],
  ];
  ring.forEach(([row, col], index) => put(grid, row, col, letters[index % letters.length]));
  return make(19, 'Spiral-inspired formation', 4, grid);
};

const level20 = () => make(20, 'Complex mixed-color formation', 4, fillAll(8, (row, col) => 'RGBYPO'[(Math.floor(col / 2) + row) % 6]));

const level21 = () => make(21, 'Large ceiling coverage', 4, fillAll(8, (row, col) => (row < 2 ? 'RGBYPOCR'[col] : 'RGBYPO'[(col + row) % 6])));

const level22 = () => {
  const grid = emptyGrid(9);
  for (let col = 0; col < 8; col += 1) put(grid, 0, col, 'P');
  for (let row = 1; row <= 4; row += 1) {
    put(grid, row, 1, 'R');
    put(grid, row, 4, 'B');
    put(grid, row, 6, 'G');
  }
  for (let col = 0; col <= 2; col += 1) {
    put(grid, 5, col, 'R');
    put(grid, 6, col, 'Y');
  }
  for (let col = 3; col <= 5; col += 1) {
    put(grid, 5, col, 'B');
    put(grid, 6, col, 'O');
  }
  for (let col = 5; col <= 7; col += 1) {
    put(grid, 5, col, 'G');
    put(grid, 6, col, 'C');
  }
  return make(22, 'Multiple weak support points', 4, grid);
};

const level23 = () => {
  const grid = emptyGrid(8);
  for (let col = 0; col < 8; col += 1) put(grid, 0, col, 'RYGBO'[col % 5]);
  carve(grid, 0, 3);
  carve(grid, 0, 4);
  for (let row = 1; row < 8; row += 1) {
    put(grid, row, 0, 'R');
    put(grid, row, 1, row % 2 === 0 ? 'Y' : 'R');
    put(grid, row, 6, row % 2 === 0 ? 'B' : 'G');
    put(grid, row, 7, 'G');
  }
  return make(23, 'Difficult bank-shot formation', 4, grid);
};

const level24 = () => {
  const grid = emptyGrid(9);
  for (let col = 0; col < 8; col += 1) put(grid, 0, col, 'C');
  for (let row = 1; row <= 3; row += 1) {
    put(grid, row, 2, 'O');
    put(grid, row, 5, 'P');
  }
  for (let row = 4; row <= 6; row += 1) {
    for (let col = 0; col <= 3; col += 1) put(grid, row, col, 'RGBY'[col % 4]);
    for (let col = 4; col <= 7; col += 1) put(grid, row, col, 'POCR'[col % 4]);
  }
  for (let col = 1; col <= 6; col += 1) put(grid, 7, col, 'Y');
  return make(24, 'Large hanging clusters', 4, grid);
};

const level25 = () => make(25, 'Advanced multi-color formation', 4, fillAll(8, (row, col) => 'RGBYPOK'[(Math.floor(col / 2) + row * 3) % 7]));

const level26 = () => {
  const grid = emptyGrid(9);
  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 8; col += 1) put(grid, row, col, 'RGBYPO'[(col + row) % 6]);
  }
  for (let row = 3; row < 8; row += 1) {
    put(grid, row, 0, 'R');
    put(grid, row, 1, 'G');
    put(grid, row, 6, 'B');
    put(grid, row, 7, 'Y');
  }
  for (let col = 0; col <= 2; col += 1) put(grid, 8, col, 'P');
  for (let col = 5; col <= 7; col += 1) put(grid, 8, col, 'O');
  return make(26, 'Very limited direct shots', 4, grid);
};

const level27 = () => {
  const grid = fillAll(8, (row, col) => {
    const mirror = Math.min(col, 7 - col);
    return 'RYGBOC'[ (mirror + row) % 6 ];
  });
  carve(grid, 3, 3);
  carve(grid, 3, 4);
  carve(grid, 4, 3);
  carve(grid, 4, 4);
  return make(27, 'Complex symmetrical puzzle', 4, grid);
};

const level28 = () => {
  const grid = emptyGrid(9);
  for (let row = 0; row < 9; row += 1) {
    const start = row < 5 ? 0 : row - 4;
    for (let col = start; col < 8; col += 1) put(grid, row, col, 'RGBYPOK'[(col * 2 + row) % 7]);
  }
  return make(28, 'Large asymmetric puzzle', 4, grid);
};

const level29 = () => make(29, 'High-density formation', 4, fillAll(9, (row, col) => 'RGBYPOCK'[(Math.floor(col / 3) + row) % 8]));

const level30 = () => {
  const grid = fillAll(10, (row, col) => 'RGBYPOCK'[(Math.floor((col + row) / 2)) % 8]);
  carve(grid, 4, 3);
  carve(grid, 4, 4);
  carve(grid, 5, 2);
  carve(grid, 5, 5);
  carve(grid, 8, 3);
  carve(grid, 8, 4);
  return make(30, 'Final challenge', 4, grid);
};

export const LEVELS: LevelDef[] = [
  level1(),
  level2(),
  level3(),
  level4(),
  level5(),
  level6(),
  level7(),
  level8(),
  level9(),
  level10(),
  level11(),
  level12(),
  level13(),
  level14(),
  level15(),
  level16(),
  level17(),
  level18(),
  level19(),
  level20(),
  level21(),
  level22(),
  level23(),
  level24(),
  level25(),
  level26(),
  level27(),
  level28(),
  level29(),
  level30(),
];

export function getLevel(id: number): LevelDef {
  const found = LEVELS.find((level) => level.id === id);
  return found ?? LEVELS[0];
}
