export type SoundName =
  | 'shoot'
  | 'attach'
  | 'pop'
  | 'popMulti'
  | 'drop'
  | 'combo'
  | 'win'
  | 'button'
  | 'lose'
  | 'row';

interface Player {
  play: () => void;
  seekTo?: (seconds: number) => void;
}

/**
 * Optional sound registry.
 * Drop audio files into assets/sounds and register a player from a screen effect.
 * Playback is skipped entirely when sound is off or no player is registered.
 */
class SoundManager {
  soundEnabled = true;
  musicEnabled = true;
  private players: Partial<Record<SoundName, Player>> = {};

  register(name: SoundName, player: Player) {
    this.players[name] = player;
  }

  play(name: SoundName) {
    if (!this.soundEnabled) return;
    const player = this.players[name];
    if (!player) return;
    try {
      player.seekTo?.(0);
      player.play();
    } catch {
      // A missing or broken clip must never stop gameplay.
    }
  }
}

export const audio = new SoundManager();

/** Map these keys to require('../../assets/sounds/name.mp3') when you add files. */
export const SOUND_SOURCES: Partial<Record<SoundName, number>> = {};
