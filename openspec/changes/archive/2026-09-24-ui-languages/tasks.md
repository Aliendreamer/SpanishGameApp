## 1. Foundations

- [x] 1.1 `src/i18n/format.ts`: test first, then `plural(n, one, other)` and
      `formatNumber(n, language)` ("1,142" / digits grouped for `bg-BG`)
- [x] 1.2 `src/storage/prefs.ts`: test first — `getLanguage`/`saveLanguage` round-trip, missing or
      unknown value reads `'en'`, and `getLaunchPrefs` returns `language`
- [x] 1.3 `src/i18n/en.ts` with the full English table (grouped by screen, functions for texts
      with values), the `Strings` type, and `src/i18n/bg.ts` typed as `Strings`, with the reviewed
      Bulgarian texts from `design.md`
- [x] 1.4 `src/i18n/strings.test.ts`: `bg` has every `en` key recursively, no empty strings, and
      every function returns text for 0, 1, and 5
- [x] 1.5 `src/i18n/index.tsx`: `LanguageContext` (default English, no-op setter), `useT()`,
      `useLanguage()`; test that `useT()` follows the provider's language

## 2. Root wiring

- [x] 2.1 Root layout: hold the language from the launch prefs in state and provide
      `LanguageContext`; `setLanguage` updates state, then saves. Test: the launch prefs'
      language reaches the first screen (Welcome in Bulgarian)
- [x] 2.2 `(tabs)/_layout.tsx`: tab labels from `useT()`; test the Bulgarian tab names

## 3. Screens (each: Bulgarian render test first, then swap the hardcoded text for `useT()`)

- [x] 3.1 Welcome, onboarding shell (Back), step dots (a11y), startup error
- [x] 3.2 Username and Level screens; `levels.ts` drops labels, level and word-type labels and
      details come from the table, `levelLine(settings, t)`; update `levels.test.ts`
- [x] 3.3 How it works, with the new English swipe-left line ("You can practise it at the end of
      the batch.") and the updated English test
- [x] 3.4 Swipe screen, card front/back (hint, part-of-speech chip with raw-value fallback),
      swipe card stamps and a11y label/hint, save-failed banner; "Hola" stays Spanish
- [x] 3.5 Batch summary, empty state, match overlay
- [x] 3.6 Words screen (title, pills with counts, search, empty lists)
- [x] 3.7 Progress screen (streak with plural, weekday letters and a11y names, notes, tiles with
      plurals and grouped numbers, Known by level)
- [x] 3.8 Settings screen texts and credits sheet

## 4. Language setting

- [x] 4.1 Settings screen: LANGUAGE section first with "English" / "Български" radio rows and
      `language` / `onLanguageChange` props; test the selection and the callback
- [x] 4.2 Settings route: wire to `useLanguage()`, no deck refresh. Route test in
      `src/__tests__/app`: tapping "Български" turns the title into "Настройки" and the tabs
      into Bulgarian, and the saved pref is `'bg'`

## 5. Finish

- [x] 5.1 Search `src` for leftover JSX text or English `label` literals outside `src/i18n`
      and move any that remain
- [x] 5.2 `/simplify`, then code review; fix findings
- [x] 5.3 `NODE_USE_ENV_PROXY=1 EXPO_NO_TELEMETRY=1 pnpm check` green
- [x] 5.4 User checks every screen in Bulgarian on the phone (text fits buttons and tab pills)
