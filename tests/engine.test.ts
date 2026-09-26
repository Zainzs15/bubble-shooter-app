import assert from 'node:assert/strict';
import test from 'node:test';
import { LEVELS } from '../src/data/levels';
import { GameEngine } from '../src/game/engine/GameEngine';
import { cellToPoint, getNeighborCells, rowHeight } from '../src/game/engine/grid';
import { loadLevelBubbles } from '../src/game/levels/levelLoader';
import { findFloating } from '../src/game/matching/matching';
import { stepShot } from '../src/game/physics/projectile';
import { scoreShot } from '../src/game/scoring/scoring';
import type { Bubble, LevelDef } from '../src/game/types';
import { cellKey } from '../src/game/engine/grid';
import { computeBoardMetrics } from '../src/utils/layout';

const metrics = computeBoardMetrics(390, 844, 40, 20, 6);

test('neighbor spacing matches the bubble diameter', () => {
  const a = cellToPoint(0, 0, metrics, 0);
  const b = cellToPoint(1, 0, metrics, 0);
  const distance = Math.hypot(a.x - b.x, a.y - b.y);
  assert.ok(Math.abs(distance - metrics.radius * 2) < 0.01);
  assert.ok(Math.abs(b.y - a.y - rowHeight(metrics.radius)) < 0.01);
  const neighbors = getNeighborCells(0, 1).map((cell) => `${cell.row}:${cell.col}`);
  assert.ok(neighbors.includes('1:0'));
  assert.ok(neighbors.includes('1:1'));
});

test('score uses the central config', () => {
  const scored = scoreShot({ matched: 8, floating: 12, combo: 3, clearedBoard: false });
  assert.equal(scored.matchPoints, 80);
  assert.equal(scored.floatPoints, 180);
  assert.equal(scored.comboBonus, 100);
  assert.ok(scored.total >= 360);
});

test('thirty unique connected levels', () => {
  assert.equal(LEVELS.length, 30);
  const seen = new Set<string>();
  for (const level of LEVELS) {
    const signature = level.formation.join('|');
    assert.equal(seen.has(signature), false, `duplicate formation on level ${level.id}`);
    seen.add(signature);
    const loaded = loadLevelBubbles(level);
    assert.ok(loaded.bubbles.length >= 12, `level ${level.id} is too small`);
    assert.ok(level.formation.length <= 11, `level ${level.id} is too tall`);
    const map = new Map<string, Bubble>();
    for (const bubble of loaded.bubbles) map.set(cellKey(bubble.row, bubble.col), bubble);
    assert.equal(findFloating(map, 0).length, 0, `level ${level.id} has floating bubbles`);
    assert.ok(level.colors.length >= 2);
  }
  assert.ok(LEVELS[0].colors.length <= 3);
  assert.ok(LEVELS[29].colors.length >= 6);
});

test('levels fit above the danger line on small and large screens', () => {
  for (const size of [
    [320, 640, 24, 16],
    [390, 844, 48, 34],
    [800, 1280, 24, 20],
  ] as const) {
    for (const level of LEVELS) {
      const board = computeBoardMetrics(size[0], size[1], size[2], size[3], level.formation.length);
      const engine = new GameEngine(level, board, () => 0);
      assert.equal(engine.isInDanger(), false, `level ${level.id} starts in danger at ${size[0]}x${size[1]}`);
      assert.ok(board.cannonY < board.height);
      assert.ok(board.dangerY < board.cannonY - board.radius);
      assert.ok(board.left >= -1 && board.right <= board.width + 1);
    }
  }
});

test('matching three bubbles clears the board and scores a win', () => {
  const level: LevelDef = {
    id: 99,
    name: 'win',
    colors: ['red'],
    missLimit: 5,
    formation: ['RR......'],
  };
  const engine = new GameEngine(level, metrics, () => 0);
  engine.debugLand(0, 2, 'red');
  engine.update(250);
  assert.equal(engine.phase, 'won');
  assert.equal(engine.bubbles.size, 0);
  assert.equal(engine.score, 530);
  const events = engine.consumeEvents();
  assert.ok(events.some((event) => event.type === 'win' && event.stars >= 1));
});

test('unsupported bubbles fall after the anchor group pops', () => {
  const level: LevelDef = {
    id: 98,
    name: 'drop',
    colors: ['green', 'red'],
    missLimit: 5,
    formation: ['GGG.....', 'RR......'],
  };
  const engine = new GameEngine(level, metrics, () => 0);
  engine.debugLand(0, 3, 'green');
  engine.update(250);
  assert.equal(engine.phase, 'won');
  assert.equal(engine.score, 570);
  assert.ok(engine.consumeEvents().some((event) => event.type === 'drop'));
});

test('consecutive matches raise the combo', () => {
  const level: LevelDef = {
    id: 97,
    name: 'combo',
    colors: ['red', 'blue'],
    missLimit: 6,
    formation: ['RRRRBBBB', 'RRRRBBBB'],
  };
  const engine = new GameEngine(level, metrics, () => 0);
  engine.debugLand(2, 0, 'red');
  engine.update(250);
  assert.equal(engine.combo, 1);
  engine.debugLand(2, 5, 'blue');
  engine.update(250);
  assert.equal(engine.combo, 2);
  assert.ok(engine.score > 100);
});

test('misses add a ceiling row and then reset', () => {
  const level: LevelDef = {
    id: 96,
    name: 'miss',
    colors: ['red', 'blue'],
    missLimit: 2,
    formation: ['RR......'],
  };
  const engine = new GameEngine(level, metrics, () => 0);
  engine.debugLand(0, 7, 'blue');
  assert.equal(engine.misses, 1);
  engine.debugLand(0, 5, 'blue');
  assert.equal(engine.phase, 'resolving');
  engine.update(400);
  assert.equal(engine.ceilingRow, -1);
  assert.equal(engine.misses, 0);
  assert.ok(engine.bubbles.size > 4);
  assert.equal(engine.phase, 'aiming');
});

test('crossing the danger line ends the game', () => {
  const level: LevelDef = {
    id: 95,
    name: 'danger',
    colors: ['red'],
    missLimit: 8,
    formation: ['R.......'],
  };
  const engine = new GameEngine(level, metrics, () => 0);
  let row = 0;
  while (row < 40) {
    const point = engine.visualPosition(row, 3);
    if (point.y + metrics.radius * 0.92 >= metrics.dangerY) break;
    row += 1;
  }
  engine.debugLand(row, 3, 'blue', true);
  assert.equal(engine.phase, 'lost');
  assert.ok(engine.consumeEvents().some((event) => event.type === 'lose'));
});

test('shots bounce off side walls and stay inside the board', () => {
  const shot = {
    x: metrics.left + metrics.radius + 1,
    y: metrics.cannonY - 40,
    vx: -metrics.shotSpeed,
    vy: -metrics.shotSpeed * 0.2,
    bounces: 0,
  };
  const outcome = stepShot(shot, 40, metrics, []);
  assert.equal(outcome.type, 'fly');
  assert.ok(shot.vx > 0);
  assert.ok(shot.x >= metrics.left + metrics.radius - 0.1);

  const level: LevelDef = {
    id: 94,
    name: 'bank',
    colors: ['red'],
    missLimit: 5,
    formation: ['...RR...'],
  };
  const engine = new GameEngine(level, metrics, () => 0);
  engine.aimAt(metrics.left, metrics.cannonY - 120);
  for (let i = 0; i < 8; i += 1) engine.update(16);
  const trajectory = engine.getTrajectory();
  assert.ok(trajectory.points.length >= 3);
  assert.ok(trajectory.points.some((point) => point.x <= metrics.left + metrics.radius + 2));
  engine.fire();
  for (let i = 0; i < 200 && engine.phase === 'flying'; i += 1) engine.update(16);
  assert.notEqual(engine.phase, 'flying');
  assert.equal(engine.projectile, null);
});
