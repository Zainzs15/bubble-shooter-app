import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { LEVEL_COUNT } from '../config/gameConfig';
import { audio } from '../audio/SoundManager';
import { feedback } from '../utils/feedback';

const STORAGE_KEY = 'bubble-shooter-save-v1';

export interface LevelRecord {
  stars: number;
  best: number;
}

export interface Settings {
  sound: boolean;
  music: boolean;
  vibration: boolean;
}

interface SaveData {
  unlocked: number;
  records: Record<string, LevelRecord>;
  settings: Settings;
}

const defaultSettings: Settings = { sound: true, music: true, vibration: true };

const defaultSave = (): SaveData => ({
  unlocked: 1,
  records: {},
  settings: defaultSettings,
});

interface ProgressValue {
  ready: boolean;
  unlocked: number;
  records: Record<string, LevelRecord>;
  settings: Settings;
  recordWin: (levelId: number, score: number, stars: number) => void;
  recordScore: (levelId: number, score: number) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  resetProgress: () => void;
}

const ProgressContext = createContext<ProgressValue | null>(null);

function applyAudio(settings: Settings) {
  audio.soundEnabled = settings.sound;
  audio.musicEnabled = settings.music;
  feedback.vibration = settings.vibration;
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [save, setSave] = useState<SaveData>(defaultSave);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!mounted) return;
        if (!raw) return;
        const parsed = JSON.parse(raw) as Partial<SaveData>;
        const next: SaveData = {
          unlocked: clampLevel(parsed.unlocked ?? 1),
          records: parsed.records && typeof parsed.records === 'object' ? parsed.records : {},
          settings: { ...defaultSettings, ...parsed.settings },
        };
        applyAudio(next.settings);
        setSave(next);
      })
      .catch(() => undefined)
      .finally(() => {
        if (mounted) setReady(true);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const persist = useCallback((next: SaveData) => {
    applyAudio(next.settings);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => undefined);
  }, []);

  const recordWin = useCallback(
    (levelId: number, score: number, stars: number) => {
      setSave((prev) => {
        const key = String(levelId);
        const previous = prev.records[key];
        const next: SaveData = {
          ...prev,
          unlocked: Math.max(prev.unlocked, Math.min(LEVEL_COUNT, levelId + 1)),
          records: {
            ...prev.records,
            [key]: {
              stars: Math.max(previous?.stars ?? 0, stars),
              best: Math.max(previous?.best ?? 0, score),
            },
          },
        };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const recordScore = useCallback(
    (levelId: number, score: number) => {
      setSave((prev) => {
        const key = String(levelId);
        const previous = prev.records[key];
        const next: SaveData = {
          ...prev,
          records: {
            ...prev.records,
            [key]: {
              stars: previous?.stars ?? 0,
              best: Math.max(previous?.best ?? 0, score),
            },
          },
        };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const updateSettings = useCallback(
    (patch: Partial<Settings>) => {
      setSave((prev) => {
        const next = { ...prev, settings: { ...prev.settings, ...patch } };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const resetProgress = useCallback(() => {
    setSave((prev) => {
      const next = { ...defaultSave(), settings: prev.settings };
      persist(next);
      return next;
    });
  }, [persist]);

  const value = useMemo<ProgressValue>(
    () => ({
      ready,
      unlocked: save.unlocked,
      records: save.records,
      settings: save.settings,
      recordWin,
      recordScore,
      updateSettings,
      resetProgress,
    }),
    [ready, recordScore, recordWin, resetProgress, save, updateSettings],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const value = useContext(ProgressContext);
  if (!value) throw new Error('Progress is unavailable');
  return value;
}

function clampLevel(value: number) {
  if (!Number.isFinite(value)) return 1;
  return Math.max(1, Math.min(LEVEL_COUNT, Math.floor(value)));
}
