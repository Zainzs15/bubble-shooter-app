import { audio } from '../audio/SoundManager';
import { pulse } from './haptics';

export const feedback = {
  vibration: true,
};

export function confirmTap(kind: 'light' | 'medium' | 'success' | 'error' = 'light') {
  audio.play('button');
  void pulse(kind, feedback.vibration);
}
