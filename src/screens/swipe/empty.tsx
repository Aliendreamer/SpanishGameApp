import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { colors, fonts } from '@/theme';

// Nothing left to deal for these settings (docs/design/swipe-game-ui/README.md, "Empty state").
export function EmptyDeck({ onOpenSettings }: { onOpenSettings: () => void }) {
  return (
    <View style={styles.screen}>
      <Text accessibilityRole="header" style={styles.title}>
        No words match your settings
      </Text>
      <Text style={styles.body}>
        {
          "You've already swiped every word for these settings. Try another level or word type, or include known words."
        }
      </Text>
      <PrimaryButton label="Open settings" onPress={onOpenSettings} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    gap: 18,
    paddingHorizontal: 28,
    paddingBottom: 24,
  },
  title: {
    fontFamily: fonts.extraBold,
    fontSize: 30,
    lineHeight: 33,
    letterSpacing: -0.6,
    color: colors.ink,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 23,
    color: colors.bodyMuted,
  },
});
