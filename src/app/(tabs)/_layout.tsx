import { Tabs } from 'expo-router';
import { useState } from 'react';

import { TabBar } from '@/components/tab-bar';
import { DeckRefreshContext } from '@/state/deck-refresh';
import { colors } from '@/theme';

// Route names and labels, in bar order.
const TABS = [
  { name: 'swipe', label: 'Swipe' },
  { name: 'words', label: 'Words' },
  { name: 'progress', label: 'Progress' },
  { name: 'settings', label: 'Settings' },
];

export default function TabsLayout() {
  // Settings bumps this to make the Swipe tab deal again (see deck-refresh.ts).
  const [version, setVersion] = useState(0);
  const invalidate = () => setVersion((current) => current + 1);

  return (
    <DeckRefreshContext value={{ version, invalidate }}>
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
    </DeckRefreshContext>
  );
}
