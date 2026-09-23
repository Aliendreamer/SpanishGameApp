import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { colors } from '@/theme';

type Props = {
  count: number;
  // Zero-based index of the current step.
  active: number;
};

const ACTIVE_WIDTH = 28;
const DOT_WIDTH = 8;

// Onboarding progress: the current step's dot widens, done and current dots are rose.
export function StepDots({ count, active }: Props) {
  return (
    <View accessible accessibilityLabel={`Step ${active + 1} of ${count}`} style={styles.row}>
      {Array.from({ length: count }, (_, index) => (
        <Dot key={index} isActive={index === active} isReached={index <= active} />
      ))}
    </View>
  );
}

function Dot({ isActive, isReached }: { isActive: boolean; isReached: boolean }) {
  return (
    <Animated.View
      testID="step-dot"
      style={[
        styles.dot,
        {
          width: isActive ? ACTIVE_WIDTH : DOT_WIDTH,
          backgroundColor: isReached ? colors.rose : colors.track,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    // Reanimated CSS transition: width changes animate over 300 ms.
    transitionProperty: 'width',
    transitionDuration: 300,
  },
});
