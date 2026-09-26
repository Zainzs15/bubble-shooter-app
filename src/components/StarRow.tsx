import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';

export function StarRow({ stars, size = 14 }: { stars: number; size?: number }) {
  return (
    <View style={styles.row}>
      {[1, 2, 3].map((index) => (
        <Text key={index} style={{ fontSize: size, color: index <= stars ? theme.gold : '#D5DEE8' }}>
          ★
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 2,
  },
});
