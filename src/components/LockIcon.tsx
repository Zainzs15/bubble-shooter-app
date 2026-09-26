import { StyleSheet, View } from 'react-native';

export function LockIcon() {
  return (
    <View style={styles.wrap}>
      <View style={styles.shackle} />
      <View style={styles.body} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 18,
    height: 20,
    alignItems: 'center',
  },
  shackle: {
    width: 10,
    height: 8,
    borderWidth: 2,
    borderColor: '#8AA0B8',
    borderBottomWidth: 0,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  body: {
    width: 16,
    height: 11,
    borderRadius: 3,
    backgroundColor: '#8AA0B8',
    marginTop: -1,
  },
});
