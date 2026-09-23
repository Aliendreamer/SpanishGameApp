import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, fonts } from '@/theme';

// Stands in for the Swipe screen until the deck is built.
export function SwipePlaceholder() {
  return (
    <SafeAreaView style={styles.screen}>
      <Text style={styles.text}>Swipe — coming next</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.label,
  },
});
