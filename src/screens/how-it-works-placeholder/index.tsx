import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/theme';

// Stands in for onboarding step 4 until the How it works screen is built.
export function HowItWorksPlaceholder() {
  return (
    <View style={styles.content}>
      <Text style={styles.text}>How it works — coming next</Text>
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
