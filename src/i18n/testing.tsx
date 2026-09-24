import type { ReactNode } from 'react';

import { LanguageProvider } from '@/i18n';

// Test wrapper: renders a screen in Bulgarian (`render(<Screen />, { wrapper: InBulgarian })`).
export function InBulgarian({ children }: { children: ReactNode }) {
  return <LanguageProvider initial="bg">{children}</LanguageProvider>;
}
