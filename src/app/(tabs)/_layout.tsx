import { Tabs } from 'expo-router';

import { TabBar } from '@/components/tab-bar';
import { colors } from '@/theme';

// Route names and labels, in bar order.
const TABS = [
  { name: 'swipe', label: 'Swipe' },
  { name: 'words', label: 'Words' },
  { name: 'progress', label: 'Progress' },
  { name: 'settings', label: 'Settings' },
];

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.background } }}
      tabBar={({ state, navigation }) => (
        <TabBar
          tabs={TABS}
          active={state.routes[state.index].name}
          onSelect={(name) => navigation.navigate(name)}
        />
      )}
    >
      {TABS.map(({ name }) => (
        <Tabs.Screen key={name} name={name} />
      ))}
    </Tabs>
  );
}
