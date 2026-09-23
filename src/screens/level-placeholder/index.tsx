import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/theme';

// Stands in for onboarding step 3 until the Level screen is built.
export function LevelPlaceholder() {
  return (
    <View style={styles.content}>
      <Text style={styles.text}>Level — coming next</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.label,
  },
});
