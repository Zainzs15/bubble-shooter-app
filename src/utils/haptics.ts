import * as Haptics from 'expo-haptics';

export async function pulse(kind: 'light' | 'medium' | 'success' | 'error', enabled: boolean) {
  if (!enabled) return;
  try {
    if (kind === 'success') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return;
    }
    if (kind === 'error') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    await Haptics.impactAsync(
      kind === 'medium' ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light,
    );
  } catch {
    // Web and some Android devices do not expose haptics.
  }
}
