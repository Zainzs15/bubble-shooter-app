export type BubbleColor =
  | 'red'
  | 'blue'
  | 'green'
  | 'yellow'
  | 'purple'
  | 'orange'
  | 'cyan'
  | 'pink';

export interface Cell {
  row: number;
  col: number;
}

export interface Bubble {
  id: number;
  row: number;
  col: number;
  color: BubbleColor;
}

export interface LevelDef {
  id: number;
  name: string;
  colors: BubbleColor[];
  missLimit: number;
  formation: string[];
}

export interface BoardMetrics {
  width: number;
  height: number;
  cols: number;
  radius: number;
  originX: number;
  originY: number;
  left: number;
  right: number;
  top: number;
  dangerY: number;
  cannonX: number;
  cannonY: number;
  shotSpeed: number;
  nextX: number;
  nextY: number;
}

export type Phase = 'aiming' | 'flying' | 'resolving' | 'won' | 'lost';

export interface HudState {
  score: number;
  misses: number;
  missLimit: number;
  combo: number;
  phase: Phase;
  current: BubbleColor;
  next: BubbleColor;
  levelId: number;
  levelName: string;
}

export type GameEvent =
  | { type: 'shoot' }
  | { type: 'attach' }
  | { type: 'pop'; count: number }
  | { type: 'drop'; count: number }
  | { type: 'combo'; combo: number }
  | { type: 'row' }
  | { type: 'win'; score: number; stars: number }
  | { type: 'lose'; score: number };

export interface FallingBubble {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  spin: number;
  color: BubbleColor;
  life: number;
  bounce: number;
  trail: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

export interface Floater {
  id: number;
  text: string;
  x: number;
  y: number;
  life: number;
  maxLife: number;
  kind: 'score' | 'combo' | 'big';
}

export interface Trajectory {
  points: { x: number; y: number }[];
  ghost: { x: number; y: number } | null;
}
