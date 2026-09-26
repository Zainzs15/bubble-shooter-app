import { useEffect } from 'react';
import { audio, SOUND_SOURCES, type SoundName } from './SoundManager';

export function useSoundSetup() {
  useEffect(() => {
    const entries = Object.entries(SOUND_SOURCES).filter((entry) => entry[1] != null);
    if (entries.length === 0) return undefined;
    let cancelled = false;
    const players: { remove?: () => void }[] = [];

    import('expo-audio')
      .then((module) => {
        if (cancelled) return;
        const create = (module as { createAudioPlayer?: (source: number) => { play: () => void; seekTo: (n: number) => void; remove: () => void } }).createAudioPlayer;
        if (!create) return;
        for (const [name, source] of entries) {
          if (source == null) continue;
          const player = create(source);
          audio.register(name as SoundName, player);
          players.push(player);
        }
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
      players.forEach((player) => player.remove?.());
    };
  }, []);
}
