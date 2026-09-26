import type { BubbleColor } from '../game/types';

export interface BubbleStyle {
  base: string;
  light: string;
  mid: string;
  dark: string;
  deep: string;
}

export const BUBBLE_STYLES: Record<BubbleColor, BubbleStyle> = {
  red: { base: '#FF3B3B', light: '#FFE4E4', mid: '#FF6A6A', dark: '#D01212', deep: '#8E1010' },
  blue: { base: '#2F6BFF', light: '#E7EFFF', mid: '#5C8CFF', dark: '#1A3FBF', deep: '#10246E' },
  green: { base: '#22C55E', light: '#E7FFF0', mid: '#4ADE80', dark: '#128A3E', deep: '#0B5C28' },
  yellow: { base: '#FFC400', light: '#FFF7D6', mid: '#FFD84A', dark: '#E09A00', deep: '#8A5A00' },
  purple: { base: '#8B5CF6', light: '#F4EAFF', mid: '#A78BFA', dark: '#6D28D9', deep: '#3B1578' },
  orange: { base: '#FF7A18', light: '#FFE9D4', mid: '#FF9A3C', dark: '#E25800', deep: '#8A3200' },
  cyan: { base: '#14C8D8', light: '#E6FCFF', mid: '#5EE7F0', dark: '#0E8E9C', deep: '#085860' },
  pink: { base: '#FF4F93', light: '#FFE6F1', mid: '#FF7AB0', dark: '#DB2777', deep: '#831843' },
};

export const COLOR_LETTERS: Record<string, BubbleColor> = {
  R: 'red',
  B: 'blue',
  G: 'green',
  Y: 'yellow',
  P: 'purple',
  O: 'orange',
  C: 'cyan',
  K: 'pink',
};

export const COLOR_ORDER: BubbleColor[] = [
  'red',
  'blue',
  'green',
  'yellow',
  'purple',
  'orange',
  'cyan',
  'pink',
];
