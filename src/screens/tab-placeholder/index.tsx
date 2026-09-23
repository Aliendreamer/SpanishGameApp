import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, fonts } from '@/theme';

// Stands in for a tab until its screen is built.
export function TabPlaceholder({ title }: { title: string }) {
  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <Text style={styles.text}>{`${title} — coming next`}</Text>
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
