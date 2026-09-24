import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/primary-button';
import { useT } from '@/i18n';
import { colors, fonts, radii, spacing } from '@/theme';

// Required attribution for the bundled data (docs/design/swipe-game-ui/README.md, "Credits bottom
// sheet"; assets/vocabulary/DATA-LICENSE.md). The lines live in the string tables.
export function CreditsSheet({ onClose }: { onClose: () => void }) {
  const t = useT();
  const { bottom } = useSafeAreaInsets();

  return (
    <Modal transparent statusBarTranslucent visible animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        {/* Touch only: screen readers close the sheet with "Close" or the back gesture. */}
        <Pressable testID="credits-backdrop" onPress={onClose} style={styles.backdrop} />
        <View accessibilityViewIsModal style={[styles.sheet, { paddingBottom: 28 + bottom }]}>
          <View style={styles.grabber} />
          <Text accessibilityRole="header" style={styles.title}>
            {t.credits.title}
          </Text>
          <View style={styles.lines}>
            {t.credits.sources.map(({ what, source }) => (
              <Text key={what} style={styles.line}>
                <Text style={styles.what}>{what}</Text> {source}
              </Text>
            ))}
          </View>
          <PrimaryButton label={t.credits.close} onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.scrim,
  },
  sheet: {
    gap: 16,
    paddingTop: 14,
    paddingHorizontal: spacing.onboarding,
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
    backgroundColor: colors.surface,
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.track,
  },
  title: {
    fontFamily: fonts.extraBold,
    fontSize: 24,
    color: colors.ink,
  },
  lines: {
    gap: 12,
  },
  line: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.bodyStrong,
  },
  what: {
    fontFamily: fonts.bold,
  },
});
