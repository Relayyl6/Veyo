// Web/server-safe stub for MapScreen.
// The real implementation lives in MapScreen.native.tsx and is resolved
// automatically by Metro on iOS/Android. This file is only ever bundled
// by the web/server bundler — it is never shown to real users.
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function VeyoMapScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Map is not available on this platform.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0b1528',
  },
  text: {
    color: '#ffffff',
    fontSize: 16,
  },
});
