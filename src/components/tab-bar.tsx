import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts, radii } from '@/theme';

type Tab = { name: string; label: string };

type Props = {
  tabs: Tab[];
  active: string;
  onSelect: (name: string) => void;
};

// The app's bottom bar: text-only pills, the active one rose (docs/design/swipe-game-ui/README.md,
// "App shell: bottom nav").
export function TabBar({ tabs, active, onSelect }: Props) {
  const { bottom } = useSafeAreaInsets();

  return (
    <View accessibilityRole="tablist" style={[styles.bar, { paddingBottom: 6 + bottom }]}>
      {tabs.map(({ name, label }) => {
        const selected = name === active;
        return (
          <Pressable
            key={name}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onSelect(name)}
            style={[styles.tab, selected && styles.tabActive]}
          >
            <Text style={[styles.label, selected && styles.labelActive]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    gap: 4,
    paddingTop: 8,
    paddingHorizontal: 10,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.bar,
    borderTopRightRadius: radii.bar,
  },
  tab: {
    flex: 1,
    height: 44,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: colors.rose,
  },
  label: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.textSecondary,
  },
  labelActive: {
    color: colors.surface,
  },
});
