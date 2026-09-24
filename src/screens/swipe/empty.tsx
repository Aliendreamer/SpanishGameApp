import { StyleSheet, Text, View } from 'react-native';

import { useT } from '@/i18n';
import { PrimaryButton } from '@/components/primary-button';
import { colors, fonts } from '@/theme';

// Nothing left to deal for these settings (docs/design/swipe-game-ui/README.md, "Empty state").
export function EmptyDeck({ onOpenSettings }: { onOpenSettings: () => void }) {
  const t = useT();

  return (
    <View style={styles.screen}>
      <Text accessibilityRole="header" style={styles.title}>
        {t.empty.title}
      </Text>
      <Text style={styles.body}>{t.empty.body}</Text>
      <PrimaryButton label={t.empty.openSettings} onPress={onOpenSettings} />
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
