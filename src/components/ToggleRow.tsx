import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';

export function ToggleRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <Pressable accessibilityRole="switch" accessibilityState={{ checked: value }} style={styles.row} onPress={() => onChange(!value)}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.track, value && styles.trackOn]}>
        <View style={[styles.knob, value && styles.knobOn]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 58,
    borderRadius: 16,
    backgroundColor: '#F7FBFF',
    borderWidth: 1,
    borderColor: theme.line,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    color: theme.ink,
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
  },
  track: {
    width: 52,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#D5DEE8',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  trackOn: {
    backgroundColor: theme.blue,
  },
  knob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  knobOn: {
    alignSelf: 'flex-end',
  },
});
