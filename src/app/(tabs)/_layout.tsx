import { Tabs } from 'expo-router';
import { useState } from 'react';

import { TabBar } from '@/components/tab-bar';
import { useT } from '@/i18n';
import { DeckRefreshContext } from '@/state/deck-refresh';
import { colors } from '@/theme';

// Route names, in bar order; each is also its label's key.
const TABS = ['swipe', 'words', 'progress', 'settings'] as const;

export default function TabsLayout() {
  const t = useT();
  // Settings bumps this to make the Swipe tab deal again (see deck-refresh.ts).
  const [version, setVersion] = useState(0);
  const invalidate = () => setVersion((current) => current + 1);

  return (
    <DeckRefreshContext value={{ version, invalidate }}>
      <Tabs
        screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.background } }}
        tabBar={({ state, navigateToTab }) => (
          <TabBar
            tabs={TABS.map((name) => ({ name, label: t.tabs[name] }))}
            active={state.routes[state.index].name}
            // The tab bar switches tabs by route key, not by name.
            onSelect={(name) => {
              const route = state.routes.find((candidate) => candidate.name === name);
              if (route) navigateToTab(route.key);
            }}
          />
        )}
      >
        {TABS.map((name) => (
          <Tabs.Screen key={name} name={name} />
        ))}
      </Tabs>
    </DeckRefreshContext>
  );
}
