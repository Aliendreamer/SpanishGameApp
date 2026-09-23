import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radii, spacing } from '@/theme';

type LevelProgress = { level: string; known: number; total: number };

type Props = {
  streak: number;
  // Monday to Sunday of this week: whether each day has a swipe.
  week: boolean[];
  doneToday: boolean;
  swipesToday: number;
  wordsKnown: number;
  byLevel: LevelProgress[];
};

const WEEKDAYS = [
  ['M', 'Monday'],
  ['T', 'Tuesday'],
  ['W', 'Wednesday'],
  ['T', 'Thursday'],
  ['F', 'Friday'],
  ['S', 'Saturday'],
  ['S', 'Sunday'],
];

const count = (n: number) => n.toLocaleString('en-US');

// The Progress tab (docs/design/swipe-game-ui/README.md, "Progress tab").
export function Progress({ streak, week, doneToday, swipesToday, wordsKnown, byLevel }: Props) {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text accessibilityRole="header" style={styles.title}>
        Progress
      </Text>

      <View style={styles.streakCard}>
        <View style={styles.streakLine}>
          <Text style={styles.streakNumber}>{streak}</Text>
          <Text style={styles.streakLabel}>day streak</Text>
        </View>
        <View style={styles.week}>
          {WEEKDAYS.map(([letter, name], index) => (
            <View
              key={name}
              accessible
              accessibilityLabel={`${name}: ${week[index] ? 'played' : 'not played'}`}
              style={styles.day}
            >
              <View style={[styles.dayDot, week[index] && styles.dayDotDone]} />
              <Text style={styles.dayLetter}>{letter}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.streakNote}>
          {doneToday
            ? "Today's done. See you tomorrow."
            : 'Swipe one card today to keep your streak.'}
        </Text>
      </View>

      <View style={styles.tiles}>
        <View style={styles.tile}>
          <Text style={styles.tileNumber}>{count(swipesToday)}</Text>
          <Text style={styles.tileLabel}>swipes today</Text>
        </View>
        <View style={styles.tile}>
          <Text style={styles.tileNumber}>{count(wordsKnown)}</Text>
          <Text style={styles.tileLabel}>words known</Text>
        </View>
      </View>

      <View style={styles.levels}>
        <Text style={styles.levelsTitle}>Known by level</Text>
        {byLevel.map(({ level, known, total }) => {
          // At least a sliver once a word is known, so a first word shows (as in the design).
          const percent = known > 0 ? Math.max(2, (known / Math.max(total, 1)) * 100) : 0;
          return (
            <View key={level} style={styles.level}>
              <View style={styles.levelLine}>
                <Text style={styles.levelName}>{level}</Text>
                <Text style={styles.levelCount}>{`${count(known)} of ${count(total)}`}</Text>
              </View>
              <View
                accessible
                accessibilityRole="progressbar"
                accessibilityLabel={`${level} known`}
                accessibilityValue={{ min: 0, max: total, now: known }}
                style={styles.bar}
              >
                <View style={[styles.barFill, { width: `${percent}%` }]} />
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 14,
    paddingTop: 14,
    paddingHorizontal: spacing.screen,
    paddingBottom: 16,
  },
  title: {
    fontFamily: fonts.extraBold,
    fontSize: 28,
    letterSpacing: -0.3,
    color: colors.ink,
  },
  streakCard: {
    gap: 18,
    padding: 22,
    borderRadius: radii.sheet,
    backgroundColor: colors.rose,
  },
  streakLine: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
  },
  streakNumber: {
    fontFamily: fonts.extraBold,
    fontSize: 64,
    lineHeight: 66,
    color: colors.surface,
  },
  streakLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.onRose,
  },
  week: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  day: {
    alignItems: 'center',
    gap: 6,
  },
  dayDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.onRoseOutline,
  },
  dayDotDone: {
    borderColor: colors.surface,
    backgroundColor: colors.surface,
  },
  dayLetter: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.onRose,
  },
  streakNote: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.onRoseSoft,
  },
  tiles: {
    flexDirection: 'row',
    gap: 12,
  },
  tile: {
    flex: 1,
    gap: 4,
    padding: 18,
    borderRadius: radii.section,
    backgroundColor: colors.surface,
  },
  tileNumber: {
    fontFamily: fonts.extraBold,
    fontSize: 36,
    lineHeight: 38,
    color: colors.ink,
  },
  tileLabel: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textSecondary,
  },
  levels: {
    gap: 14,
    padding: 18,
    borderRadius: radii.section,
    backgroundColor: colors.surface,
  },
  levelsTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.ink,
  },
  level: {
    gap: 6,
  },
  levelLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  levelName: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.ink,
  },
  levelCount: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textSecondary,
  },
  bar: {
    height: 8,
    overflow: 'hidden',
    borderRadius: 4,
    backgroundColor: colors.soft,
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: colors.rose,
  },
});
