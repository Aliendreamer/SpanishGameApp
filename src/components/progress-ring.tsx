import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { colors } from '@/theme';

const SIZE = 38;
// The design's ring is a 38 dp disc with a 26 dp hole: a 6 dp stroke.
const STROKE = 6;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

type Props = { value: number; max: number };

// The batch progress ring in the Swipe header: a rose arc over a pale track, from 12 o'clock.
export function ProgressRing({ value, max }: Props) {
  const fraction = max > 0 ? Math.min(1, value / max) : 0;

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max, now: value }}
    >
      <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={colors.track}
          strokeWidth={STROKE}
          fill="none"
        />
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={colors.rose}
          strokeWidth={STROKE}
          fill="none"
          strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
          strokeDashoffset={CIRCUMFERENCE * (1 - fraction)}
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
        />
      </Svg>
    </View>
  );
}
