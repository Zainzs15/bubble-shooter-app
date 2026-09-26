import { Component, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';

interface Props {
  children: ReactNode;
}

interface State {
  failed: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { failed: true, message: error?.message || 'Unknown error' };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <View style={styles.wrap}>
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.body}>{this.state.message || 'The board was reset so you can keep playing.'}</Text>
        <Pressable style={styles.button} onPress={() => this.setState({ failed: false })}>
          <Text style={styles.buttonText}>Continue</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
    gap: 12,
  },
  title: {
    fontSize: 24,
    color: theme.ink,
    fontWeight: '800',
  },
  body: {
    color: theme.muted,
    textAlign: 'center',
    fontSize: 16,
  },
  button: {
    marginTop: 8,
    backgroundColor: theme.blue,
    borderRadius: 16,
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
