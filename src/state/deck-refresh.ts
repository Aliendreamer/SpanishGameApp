import { createContext } from 'react';

// Tells the Swipe tab to deal again: Settings bumps `version` after a change to the level, the
// batch options, or the progress, and the Swipe route reloads when it changes. Provided by the tabs
// layout.
export type DeckRefresh = { version: number; invalidate: () => void };

export const DeckRefreshContext = createContext<DeckRefresh>({ version: 0, invalidate: () => {} });
