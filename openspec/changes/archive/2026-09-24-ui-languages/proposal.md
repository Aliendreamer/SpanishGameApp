## Why

The user wants the app's interface in Bulgarian as well as English, chosen in Settings. The
vocabulary stays Spanish → English (the data sources have no Bulgarian meanings), so only the
app's own text is translated. Agreed: UI only; the app starts in English; plain and simple.

## What Changes

- **Two UI languages**, English (default) and Bulgarian. Every piece of app text — onboarding,
  tutorial, Swipe, batch summary, empty state, match overlay, Words, Progress, Settings, credits,
  error screen, tab bar, level, word-type and part-of-speech names, accessibility labels — comes
  from one string table per language.
- **Not translated**: Spanish words, English meanings and example translations (data), and the
  "Hola, {name}" greeting (Spanish on purpose).
- **Settings → LANGUAGE** (first section): "English" and "Български". The change applies at once
  on every screen and is saved on the phone (AsyncStorage, next to the username), so the app opens
  in it next time.
- **Numbers and plurals** follow the language: "19,171 words" / "19 171 думи", "1 дума" / "2 думи".
- **Copy fix**: How it works' "It comes back a few cards later." no longer matches the one-pass
  batches; it becomes "You can practise it at the end of the batch."

## Capabilities

### New Capabilities

- `ui-language`: the language setting and the translated interface.

### Modified Capabilities

- `settings`: the LANGUAGE section.
- `launch-routing`: the launch preferences include the language.
- `onboarding`: How it works' swipe-left line.

## Impact

- New: `src/i18n/` (string tables `en.ts`, `bg.ts`, `useT()`, language context).
- Changed: every screen and component with text; `src/storage/prefs.ts` (language); root layout
  (provides the language); `src/vocabulary/levels.ts` (labels move to the string tables).
