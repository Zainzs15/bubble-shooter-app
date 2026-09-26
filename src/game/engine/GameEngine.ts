import { BUBBLE_STYLES } from '../../data/colors';
import { MATCH_MIN, POP_MS, ROW_DROP_MS, SCORING } from '../../config/gameConfig';
import type {
  BoardMetrics,
  Bubble,
  BubbleColor,
  Cell,
  FallingBubble,
  Floater,
  GameEvent,
  HudState,
  LevelDef,
  Particle,
  Phase,
  Trajectory,
} from '../types';
import { findAttachCell } from '../collision/collision';
import { cellKey, cellToPoint, rowHeight } from './grid';
import { loadLevelBubbles } from '../levels/levelLoader';
import { findConnected, findFloating } from '../matching/matching';
import { predictShot, stepShot, type Obstacle, type ShotBody } from '../physics/projectile';
import { computeStars, scoreShot } from '../scoring/scoring';

const ANGLE_MIN = -Math.PI + 0.26;
const ANGLE_MAX = -0.26;

interface Projectile extends ShotBody {
  color: BubbleColor;
}

export class GameEngine {
  bubbles = new Map<string, Bubble>();
  falling: FallingBubble[] = [];
  particles: Particle[] = [];
  floaters: Floater[] = [];
  projectile: Projectile | null = null;
  phase: Phase = 'aiming';
  paused = false;
  score = 0;
  misses = 0;
  combo = 0;
  shots = 0;
  angle = -Math.PI / 2;
  targetAngle = -Math.PI / 2;
  touching = false;
  recoil = 0;
  time = 0;
  current: BubbleColor = 'red';
  next: BubbleColor = 'blue';
  ceilingRow = 0;
  metrics: BoardMetrics;
  level: LevelDef;
  events: GameEvent[] = [];
  hudDirty = true;
  spawnedCount = 0;

  private random: () => number;
  private nextId = 1;
  private palette: BubbleColor[] = ['red'];
  private delay = 0;
  private delayAction: (() => void) | null = null;
  private dropping = false;
  private dropStart = 0;
  private popStart = new Map<number, number>();
  private flyTime = 0;
  private trajectoryCache: { key: string; value: Trajectory } | null = null;

  constructor(level: LevelDef, metrics: BoardMetrics, random: () => number = Math.random) {
    this.level = level;
    this.metrics = metrics;
    this.random = random;
    this.reload();
  }

  setMetrics(metrics: BoardMetrics) {
    this.metrics = metrics;
    this.trajectoryCache = null;
  }

  setPaused(paused: boolean) {
    if (this.phase === 'won' || this.phase === 'lost') return;
    this.paused = paused;
  }

  setAmmo(current: BubbleColor, next: BubbleColor) {
    this.current = current;
    this.next = next;
    this.hudDirty = true;
  }

  consumeEvents(): GameEvent[] {
    const pending = this.events;
    this.events = [];
    return pending;
  }

  getHud(): HudState {
    return {
      score: this.score,
      misses: this.misses,
      missLimit: this.level.missLimit,
      combo: this.combo,
      phase: this.phase,
      current: this.current,
      next: this.next,
      levelId: this.level.id,
      levelName: this.level.name,
    };
  }

  reset() {
    this.paused = false;
    this.reload();
  }

  recover() {
    this.projectile = null;
    this.delayAction = null;
    this.delay = 0;
    this.dropping = false;
    this.popStart.clear();
    if (this.phase !== 'won' && this.phase !== 'lost') this.phase = 'aiming';
    this.hudDirty = true;
  }

  update(dt: number) {
    if (this.paused) return;
    let left = Math.max(0, dt);
    while (left > 0) {
      const step = Math.min(32, left);
      this.tick(step);
      left -= step;
    }
  }

  aimAt(x: number, y: number) {
    if (this.paused || this.phase === 'won' || this.phase === 'lost') return;
    const pivot = this.cannonPivot();
    const dx = x - pivot.x;
    const dy = y - pivot.y;
    if (dy > -10) return;
    let angle = Math.atan2(dy, dx);
    if (angle < ANGLE_MIN) angle = ANGLE_MIN;
    if (angle > ANGLE_MAX) angle = ANGLE_MAX;
    if (Math.abs(angle - this.targetAngle) < 0.006) return;
    this.targetAngle = angle;
    this.touching = true;
    this.trajectoryCache = null;
  }

  endAim(shouldFire: boolean) {
    this.touching = false;
    if (shouldFire) this.fire();
  }

  fire() {
    if (this.paused || this.phase !== 'aiming' || this.projectile || this.delayAction) return;
    const speed = this.metrics.shotSpeed;
    const muzzle = this.muzzlePoint();
    this.projectile = {
      x: muzzle.x,
      y: muzzle.y,
      vx: Math.cos(this.angle) * speed,
      vy: Math.sin(this.angle) * speed,
      bounces: 0,
      color: this.current,
    };
    this.current = this.next;
    this.next = this.pickColor();
    this.shots += 1;
    this.recoil = 1;
    this.flyTime = 0;
    this.phase = 'flying';
    this.events.push({ type: 'shoot' });
    this.hudDirty = true;
    this.trajectoryCache = null;
  }

  /** Test hook. Places a bubble and resolves matches the same way a landed shot does. */
  debugLand(row: number, col: number, color: BubbleColor, force = false) {
    if (this.phase !== 'aiming') return;
    if (force) {
      const bubble = this.addBubble(row, col, color);
      if (!bubble) return;
      this.resolveBubble(bubble);
      return;
    }
    this.resolveAt({ row, col }, color);
  }

  cannonPivot() {
    const bob = this.phase === 'aiming' ? Math.sin(this.time / 260) * 1.15 : 0;
    const kick = this.recoil * this.metrics.radius * 0.42;
    return {
      x: this.metrics.cannonX - Math.cos(this.angle) * kick,
      y: this.metrics.cannonY - Math.sin(this.angle) * kick * 0.85 + bob,
    };
  }

  muzzlePoint() {
    const pivot = this.cannonPivot();
    const distance = this.metrics.radius * 2.15;
    return {
      x: pivot.x + Math.cos(this.angle) * distance,
      y: pivot.y + Math.sin(this.angle) * distance,
    };
  }

  visualPosition(row: number, col: number) {
    const point = cellToPoint(row, col, this.metrics, this.ceilingRow);
    if (this.dropping) {
      const progress = Math.min(1, (this.time - this.dropStart) / ROW_DROP_MS);
      point.y += progress * rowHeight(this.metrics.radius);
    }
    return point;
  }

  popProgress(id: number) {
    const started = this.popStart.get(id);
    if (started == null) return null;
    return Math.min(1, (this.time - started) / POP_MS);
  }

  isInDanger() {
    const limit = this.metrics.dangerY;
    for (const bubble of this.bubbles.values()) {
      if (this.popStart.has(bubble.id)) continue;
      const point = this.visualPosition(bubble.row, bubble.col);
      if (point.y + this.metrics.radius * 0.92 >= limit) return true;
    }
    return false;
  }

  getTrajectory(): Trajectory {
    const key = `${Math.round(this.angle * 200)}:${this.bubbles.size}:${this.ceilingRow}:${this.phase}`;
    if (this.trajectoryCache && this.trajectoryCache.key === key) return this.trajectoryCache.value;
    if (this.phase !== 'aiming') {
      const empty = { points: [], ghost: null };
      this.trajectoryCache = { key, value: empty };
      return empty;
    }
    const muzzle = this.muzzlePoint();
    const predicted = predictShot(muzzle, this.angle, this.metrics, this.obstacles());
    const hitCell = predicted.obstacle ? { row: predicted.obstacle.row, col: predicted.obstacle.col } : null;
    const cell = findAttachCell(predicted.end.x, predicted.end.y, hitCell, this.bubbles, this.metrics, this.ceilingRow);
    const ghost = cell ? this.visualPosition(cell.row, cell.col) : null;
    const value = { points: predicted.points, ghost };
    this.trajectoryCache = { key, value };
    return value;
  }

  private tick(dt: number) {
    this.time += dt;
    this.recoil *= Math.exp(-dt / 70);
    if (this.recoil < 0.01) this.recoil = 0;
    const blend = 1 - Math.exp(-dt / 42);
    this.angle += (this.targetAngle - this.angle) * blend;
    this.animateEffects(dt);

    if (this.phase === 'won' || this.phase === 'lost') return;

    const pending = this.delayAction;
    if (this.phase === 'flying' && this.projectile) this.advanceProjectile(dt);
    if (pending && this.delayAction === pending) {
      this.delay -= dt;
      if (this.delay <= 0) {
        this.delayAction = null;
        this.delay = 0;
        pending();
      }
    }
  }

  private advanceProjectile(dt: number) {
    const shot = this.projectile;
    if (!shot) return;
    this.flyTime += dt;
    const outcome = stepShot(shot, dt, this.metrics, this.obstacles());
    if (outcome.type === 'hit' || this.flyTime > 2400) {
      const hit = outcome.type === 'hit' ? outcome.obstacle : null;
      this.projectile = null;
      this.events.push({ type: 'attach' });
      const cell = findAttachCell(
        shot.x,
        shot.y,
        hit ? { row: hit.row, col: hit.col } : null,
        this.bubbles,
        this.metrics,
        this.ceilingRow,
      );
      if (!cell) {
        this.registerMiss();
        return;
      }
      this.resolveAt(cell, shot.color);
    }
  }

  private resolveAt(cell: Cell, color: BubbleColor) {
    let target: Cell | null = cell;
    const key = cellKey(cell.row, cell.col);
    if (this.bubbles.has(key)) {
      target = findAttachCell(
        this.visualPosition(cell.row, cell.col).x,
        this.visualPosition(cell.row, cell.col).y,
        cell,
        this.bubbles,
        this.metrics,
        this.ceilingRow,
      );
    }
    if (!target) {
      this.registerMiss();
      return;
    }
    const bubble = this.addBubble(target.row, target.col, color);
    if (!bubble) {
      this.registerMiss();
      return;
    }
    this.resolveBubble(bubble);
  }

  private resolveBubble(bubble: Bubble) {
    const group = findConnected(this.bubbles, bubble, bubble.color);
    if (group.length >= MATCH_MIN) {
      this.phase = 'resolving';
      for (const item of group) this.popStart.set(item.id, this.time);
      this.delay = POP_MS;
      this.delayAction = () => this.finishPop(group);
      this.trajectoryCache = null;
      return;
    }
    this.registerMiss();
  }

  private finishPop(group: Bubble[]) {
    let x = 0;
    let y = 0;
    for (const bubble of group) {
      const point = this.visualPosition(bubble.row, bubble.col);
      x += point.x;
      y += point.y;
      this.bubbles.delete(cellKey(bubble.row, bubble.col));
      this.popStart.delete(bubble.id);
      this.spawnPopParticles(point.x, point.y, bubble.color, group.length);
    }
    const count = Math.max(1, group.length);
    x /= count;
    y /= count;

    const floating = findFloating(this.bubbles, this.ceilingRow);
    for (const bubble of floating) {
      const point = this.visualPosition(bubble.row, bubble.col);
      this.bubbles.delete(cellKey(bubble.row, bubble.col));
      this.spawnFalling(point.x, point.y, bubble.color);
    }

    this.combo += 1;
    const cleared = this.bubbles.size === 0;
    const gained = scoreShot({
      matched: group.length,
      floating: floating.length,
      combo: this.combo,
      clearedBoard: cleared,
    });
    this.score += gained.total;
    this.pushFloater(`+${gained.total}`, x, y, 'score');
    if (this.combo >= 2) {
      this.pushFloater(`COMBO x${this.combo}!`, x, y + this.metrics.radius * 1.3, 'combo');
      this.events.push({ type: 'combo', combo: this.combo });
    }
    if (floating.length >= SCORING.bigDropCount) {
      this.pushFloater('BIG DROP!', x, y + this.metrics.radius * 2.4, 'big');
    }

    this.events.push({ type: 'pop', count: group.length });
    if (floating.length > 0) this.events.push({ type: 'drop', count: floating.length });
    this.hudDirty = true;
    this.trajectoryCache = null;

    if (cleared) {
      this.win();
      return;
    }
    if (this.isInDanger()) {
      this.lose();
      return;
    }
    this.refreshShooter();
    this.phase = 'aiming';
  }

  private registerMiss() {
    this.combo = 0;
    this.misses += 1;
    this.hudDirty = true;
    this.trajectoryCache = null;
    if (this.isInDanger()) {
      this.lose();
      return;
    }
    if (this.misses >= Math.max(1, this.level.missLimit)) {
      this.startRowDrop();
      return;
    }
    this.refreshShooter();
    this.phase = 'aiming';
  }

  private startRowDrop() {
    const newRow = this.ceilingRow - 1;
    const colors = this.rowColors(this.shots + this.score);
    for (let col = 0; col < this.metrics.cols; col += 1) this.addBubble(newRow, col, colors[col]);
    this.misses = 0;
    this.dropping = true;
    this.dropStart = this.time;
    this.phase = 'resolving';
    this.delay = ROW_DROP_MS;
    this.delayAction = () => this.finishRowDrop();
    this.events.push({ type: 'row' });
    this.hudDirty = true;
    this.trajectoryCache = null;
  }

  private finishRowDrop() {
    this.ceilingRow -= 1;
    this.dropping = false;
    if (this.isInDanger()) {
      this.lose();
      return;
    }
    this.refreshShooter();
    this.phase = 'aiming';
    this.hudDirty = true;
  }

  private win() {
    this.phase = 'won';
    this.projectile = null;
    const stars = computeStars(this.score, this.spawnedCount);
    this.events.push({ type: 'win', score: this.score, stars });
    this.hudDirty = true;
  }

  private lose() {
    this.phase = 'lost';
    this.projectile = null;
    this.delayAction = null;
    this.events.push({ type: 'lose', score: this.score });
    this.hudDirty = true;
  }

  private reload() {
    this.bubbles.clear();
    this.falling = [];
    this.particles = [];
    this.floaters = [];
    this.projectile = null;
    this.popStart.clear();
    this.delayAction = null;
    this.delay = 0;
    this.dropping = false;
    this.score = 0;
    this.misses = 0;
    this.combo = 0;
    this.shots = 0;
    this.angle = -Math.PI / 2;
    this.targetAngle = -Math.PI / 2;
    this.recoil = 0;
    this.flyTime = 0;
    this.ceilingRow = 0;
    this.phase = 'aiming';
    this.trajectoryCache = null;
    const loaded = loadLevelBubbles(this.level);
    this.palette = loaded.colors;
    this.spawnedCount = loaded.bubbles.length;
    this.nextId = 1;
    for (const bubble of loaded.bubbles) {
      const copy = { ...bubble };
      this.bubbles.set(cellKey(copy.row, copy.col), copy);
      this.nextId = Math.max(this.nextId, copy.id + 1);
    }
    this.current = this.pickColor();
    this.next = this.pickColor();
    this.hudDirty = true;
  }

  private addBubble(row: number, col: number, color: BubbleColor) {
    if (col < 0 || col >= this.metrics.cols) return null;
    const key = cellKey(row, col);
    if (this.bubbles.has(key)) return null;
    const bubble: Bubble = { id: this.nextId, row, col, color };
    this.nextId += 1;
    this.bubbles.set(key, bubble);
    this.spawnedCount += 1;
    return bubble;
  }

  private refreshShooter() {
    const present = new Set<BubbleColor>();
    for (const bubble of this.bubbles.values()) present.add(bubble.color);
    if (!present.has(this.current)) this.current = this.pickColor();
    if (!present.has(this.next)) this.next = this.pickColor();
    this.hudDirty = true;
  }

  private pickColor() {
    const counts = new Map<BubbleColor, number>();
    for (const bubble of this.bubbles.values()) counts.set(bubble.color, (counts.get(bubble.color) ?? 0) + 1);
    const present = [...counts.keys()];
    const pool = present.length > 0 ? present.filter((color) => (counts.get(color) ?? 0) >= 2) : [];
    const source = pool.length > 0 ? pool : present.length > 0 ? present : this.palette;
    if (source.length === 0) return this.palette[0] ?? 'red';
    const index = Math.min(source.length - 1, Math.floor(this.random() * source.length));
    return source[index];
  }

  private rowColors(seed: number) {
    const source = this.palette.length > 0 ? this.palette : (['red'] as BubbleColor[]);
    const colors: BubbleColor[] = [];
    let index = Math.abs(seed) % source.length;
    let run = 2 + (Math.abs(seed) % 2);
    for (let col = 0; col < this.metrics.cols; col += 1) {
      colors.push(source[index % source.length]);
      run -= 1;
      if (run <= 0) {
        index += 1;
        run = 2 + ((Math.abs(seed) + col) % 2);
      }
    }
    return colors;
  }

  private obstacles(): Obstacle[] {
    const list: Obstacle[] = [];
    for (const bubble of this.bubbles.values()) {
      const point = this.visualPosition(bubble.row, bubble.col);
      list.push({ id: bubble.id, x: point.x, y: point.y, row: bubble.row, col: bubble.col });
    }
    return list;
  }

  private spawnPopParticles(x: number, y: number, color: BubbleColor, groupSize: number) {
    const amount = groupSize >= 8 ? 8 : 6;
    const style = BUBBLE_STYLES[color];
    for (let i = 0; i < amount && this.particles.length < 64; i += 1) {
      const angle = this.random() * Math.PI * 2;
      const speed = 50 + this.random() * 120;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 40,
        life: 280 + this.random() * 140,
        maxLife: 420,
        size: this.metrics.radius * (0.12 + this.random() * 0.12),
        color: i % 3 === 0 ? '#FFFFFF' : style.mid,
      });
    }
  }

  private spawnFalling(x: number, y: number, color: BubbleColor) {
    this.falling.push({
      id: this.nextId,
      x,
      y,
      vx: (this.random() - 0.5) * 90,
      vy: 30 + this.random() * 70,
      rot: this.random() * Math.PI,
      spin: (this.random() - 0.5) * 6,
      color,
      life: 1100,
      bounce: 0,
      trail: 0,
    });
    this.nextId += 1;
  }

  private pushFloater(text: string, x: number, y: number, kind: Floater['kind']) {
    this.floaters.push({ id: this.nextId, text, x, y, life: 900, maxLife: 900, kind });
    this.nextId += 1;
    if (this.floaters.length > 6) this.floaters.shift();
  }

  private animateEffects(dt: number) {
    const seconds = dt / 1000;
    for (let i = this.particles.length - 1; i >= 0; i -= 1) {
      const particle = this.particles[i];
      particle.life -= dt;
      particle.x += particle.vx * seconds;
      particle.y += particle.vy * seconds;
      particle.vy += 280 * seconds;
      if (particle.life <= 0) this.particles.splice(i, 1);
    }

    const trailBudget = this.falling.length <= 8;
    for (let i = this.falling.length - 1; i >= 0; i -= 1) {
      const bubble = this.falling[i];
      bubble.vy += 2600 * seconds;
      bubble.x += bubble.vx * seconds;
      bubble.y += bubble.vy * seconds;
      bubble.rot += bubble.spin * seconds;
      bubble.life -= dt;
      const floor = this.metrics.height - this.metrics.radius * 0.4;
      if (bubble.y > floor && bubble.vy > 0 && bubble.bounce < 1) {
        bubble.y = floor;
        bubble.vy *= -0.28;
        bubble.vx *= 0.7;
        bubble.bounce += 1;
      }
      if (trailBudget) {
        bubble.trail += dt;
        if (bubble.trail > 70 && this.particles.length < 64) {
          bubble.trail = 0;
          this.particles.push({
            x: bubble.x,
            y: bubble.y,
            vx: 0,
            vy: -20,
            life: 180,
            maxLife: 180,
            size: this.metrics.radius * 0.1,
            color: BUBBLE_STYLES[bubble.color].light,
          });
        }
      }
      if (bubble.life <= 0 || bubble.y > this.metrics.height + 80) this.falling.splice(i, 1);
    }

    for (let i = this.floaters.length - 1; i >= 0; i -= 1) {
      const floater = this.floaters[i];
      floater.life -= dt;
      floater.y -= dt * 0.028;
      if (floater.life <= 0) this.floaters.splice(i, 1);
    }
  }
}
