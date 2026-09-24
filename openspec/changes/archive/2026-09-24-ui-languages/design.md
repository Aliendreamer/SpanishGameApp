## Context

Every screen hardcodes its English text: JSX text, `label` props, accessibility labels, and the
level / word-type labels in `src/vocabulary/levels.ts`. The vocabulary is Spanish → English data
and stays that way. Launch preferences (username, `onboardingDone`, `showTutorial`) are read from
AsyncStorage before the splash hides and shared through `LaunchContext`. Screens are
presentational; routes own storage. Most screen tests assert English text.

## Goals / Non-Goals

**Goals:**

- English and Bulgarian for all app text, switched in Settings, applied at once, remembered on the
  phone.
- A missing or misspelled Bulgarian key fails `pnpm typecheck`.
- Counts and plurals read naturally in both languages.

**Non-Goals:**

- Translating vocabulary data (Spanish words, English meanings, example translations).
- Following the phone's language, right-to-left, or more languages (the design leaves room, but
  none is planned).
- An i18n library.

## Decisions

### 1. Two typed string tables, no library

`src/i18n/en.ts` exports `en`, the source of truth. `src/i18n/bg.ts` exports
`bg: Strings`, where `Strings` is `en`'s shape with every string literal widened to `string`.
Plain text is a string; text with values is a function, e.g.
`batchKnown: (known: number, size: number) => string`. Keys are grouped by screen
(`welcome`, `swipe`, `summary`, `settings`, …) plus shared groups (`levels`, `wordTypes`,
`partOfSpeech`, `common`).

- Functions instead of `{name}` placeholders: TypeScript checks the arguments and each language
  places them freely, with no template parser.
- Alternatives: i18next / expo-localization + i18n-js. They add dependencies and runtime key
  lookup, and give no compile-time check that Bulgarian has every key. Rejected for two languages.

### 2. Plurals and numbers

- `plural(n, one, other)` in `src/i18n/format.ts`: `n === 1 ? one : other`. English and Bulgarian
  both have exactly these two forms for whole numbers ("1 дума", "2 думи", "0 думи").
- `formatNumber(n, language)` wraps `toLocaleString` with `en-US` or `bg-BG`: "1,142" / "1142",
  "19,171" / "19 171" (Bulgarian groups from five digits on).
  Hermes ships `Intl` on Android.
- Bulgarian counted nouns use the plural for any number but 1. Adjective agreement
  ("1 позната дума" / "5 познати думи") is handled inside the table's functions.

### 3. Language state

- `Language = 'en' | 'bg'`. The pref lives in `src/storage/prefs.ts` as a `language` key.
  Missing or unknown values read as `'en'`.
- `getLaunchPrefs` also returns `language`, so the first frame is already in the right language
  (no flash of English).
- The root layout keeps the language in state and provides `LanguageContext`
  (`{ language, setLanguage }`). `setLanguage` updates state at once, then saves. If the save
  fails, the change still applies for this session.
- `useT()` returns the table for the current language; `useLanguage()` returns the context.
- The context's default value is English with a no-op setter, so tests that render a screen
  without the provider keep working and stay in English.

### 4. Screens read strings from `useT()`

- Presentational screens call `useT()` themselves rather than taking strings as props, to keep
  prop lists unchanged.
- The tab bar gets its labels from `useT()` in `(tabs)/_layout.tsx`.
- `src/vocabulary/levels.ts` keeps ids, CEFR bands, and counts but drops labels. Labels come from
  `t.levels[id]` / `t.wordTypes[id]`. Details are built with the table's count function.
  `levelLine(settings, t)` takes the table.
- Part-of-speech chips: `t.partOfSpeech[pos]`, falling back to the raw value for an unknown one.

### 5. Settings UI

- A LANGUAGE section comes first, with two radio rows: "English" and "Български".
- Each language's name is written in that language and never translated, so a user who picked
  the wrong one can find their way back.
- Choosing a language calls `setLanguage`; it does not re-deal the Swipe deck (no deck setting
  changed).

### 6. Tests

- `src/i18n/strings.test.ts`:
  - `bg` has every key of `en`, recursively;
  - no string is empty;
  - every function returns a non-empty string for 0, 1, and 5.
- `format.test.ts` covers `plural` and `formatNumber`.
- `prefs.test.ts`: the language round-trips, and it defaults to English.
- Settings screen test: tapping "Български" calls `onLanguageChange('bg')`.
- A route-level test: choosing Bulgarian in Settings switches the tab labels and the Settings
  title, and relaunching reads Bulgarian.
- Existing screen tests stay in English and unchanged, apart from the How it works copy fix.
- One Bulgarian render per screen group (onboarding, Swipe, summary, Words, Progress) guards
  against a hardcoded string slipping through.

## Risks / Trade-offs

- [A new hardcoded English string slips in later] → The Bulgarian render tests catch the screens
  they cover. The review checklist greps for JSX text outside `src/i18n`.
- [Bulgarian text is longer and overflows buttons or tab pills] → Check every screen on the phone
  in Bulgarian during manual verification. Shorten the copy rather than shrink the fonts.
- [Hermes `Intl` differs from Node in the thousands separator (narrow no-break space)] → Tests
  assert with a regex on digits, not the exact separator. Check on the phone.
- [The translation quality is mine] → The full table below is for the user's review before
  implementing.

## Bulgarian text (for review)

`{n}` is a number. `·` is the existing separator.

| Where | English | Български |
| --- | --- | --- |
| Welcome | Learn Spanish one swipe at a time | Учи испански с всяко плъзгане |
| Welcome | See a Spanish word, tap for the English meaning, and swipe to sort it. | Виж испанска дума, докосни я за значението на английски и я плъзни, за да я сортираш. |
| Welcome | Get started | Започни |
| Shell | Back | Назад |
| Shell (a11y) | Step {n} of {m} | Стъпка {n} от {m} |
| Username | What should we call you? | Как да те наричаме? |
| Username | Pick a username. It stays on this phone. | Избери потребителско име. То остава само на този телефон. |
| Username / Settings | Username | Потребителско име |
| Username | Use at least {n} characters | Поне {n} знака |
| Common | Continue | Продължи |
| Level | Pick your level | Избери ниво |
| Level | You can change this any time in Settings. | Можеш да го смениш по всяко време в Настройки. |
| Level / Settings | Include lower levels | Включи по-ниските нива |
| Levels | Beginner · A1 + A2 · {n} words | Начинаещ · A1 + A2 · {n} думи |
| Levels | Intermediate | Средно напреднал |
| Levels | Advanced | Напреднал |
| Levels | Full · Everything · {n} words | Пълен · Всичко · {n} думи |
| Counts | 1 word / {n} words | 1 дума / {n} думи |
| How it works | How it works | Как работи |
| How it works | Tap the card | Докосни картата |
| How it works | It flips to show the English meaning and an example. | Обръща се и показва значението на английски и пример. |
| How it works | Swipe right if you know it | Плъзни надясно, ако я знаеш |
| How it works | The word leaves this batch. | Думата излиза от тази серия. |
| How it works | Swipe left if you're still learning | Плъзни наляво, ако още я учиш |
| How it works | You can practise it at the end of the batch. *(new, replaces "It comes back a few cards later.")* | Можеш да я упражниш в края на серията. |
| How it works | Show this screen when the app starts | Показвай този екран при стартиране |
| How it works | Start swiping | Започни да плъзгаш |
| Swipe | Hola / Hola, {name} | *(stays Spanish)* |
| Swipe | Tap to see the meaning | Докосни за значението |
| Swipe | I know it | Знам я |
| Swipe | Still learning | Още я уча |
| Swipe | Couldn't save your last answer. | Последният отговор не се запази. |
| Swipe (a11y) | Card: {word} | Карта: {word} |
| Swipe (a11y) | Shows the meaning / Shows the word | Показва значението / Показва думата |
| Summary | Batch done | Серията е готова |
| Summary | You know {k} of {n} words in this batch. | Знаеш {k} от {n} думи в тази серия. *(1 → "от 1 дума")* |
| Summary | known / still learning | познати / за учене |
| Summary | Next batch | Следваща серия |
| Summary | Practise the {n} still learning | Упражни думите за учене ({n}) |
| Summary | Change settings | Промени настройките |
| Empty | No words match your settings | Няма думи за тези настройки |
| Empty | You've already swiped every word for these settings. Try another level or word type, or include known words. | Всички думи за тези настройки вече са сортирани. Опитай друго ниво или вид думи, или включи познатите думи. |
| Empty | Open settings | Отвори настройките |
| Match | It's a match! | Имаме съвпадение! |
| Match | You were still learning this one. Now you know it. | Тази дума още я учеше. Вече я знаеш. |
| Match | Keep swiping | Продължи |
| Tabs | Swipe · Words · Progress · Settings | Карти · Думи · Напредък · Настройки |
| Words | My words | Моите думи |
| Words | Known · {n} / Still learning · {n} | Познати · {n} / За учене · {n} |
| Words | Search Spanish or English | Търси на испански или английски |
| Words | Words you swipe right on show up here. | Думите, които плъзнеш надясно, се появяват тук. |
| Words | Words you swipe left on show up here until you know them. | Думите, които плъзнеш наляво, стоят тук, докато ги научиш. |
| Words | No words match your search. | Няма думи за това търсене. |
| Progress | Progress | Напредък |
| Progress | {n} day streak | {n} ден поред / {n} дни поред |
| Progress | M T W T F S S | П В С Ч П С Н |
| Progress (a11y) | Monday … Sunday: played / not played | Понеделник … Неделя: играно / неиграно |
| Progress | Today's done. See you tomorrow. | Днешният ден е отметнат. До утре! |
| Progress | Swipe one card today to keep your streak. | Плъзни поне една карта днес, за да запазиш поредицата. |
| Progress | swipes today | плъзгане днес / плъзгания днес |
| Progress | words known | позната дума / познати думи |
| Progress | Known by level | Познати по ниво |
| Progress (a11y) | {level} known | {level} познати |
| Settings | Settings | Настройки |
| Settings | LANGUAGE *(new)* | ЕЗИК |
| Settings | English / Български | *(always in their own language)* |
| Settings | PROFILE | ПРОФИЛ |
| Settings | Saved on this phone / Use 2–20 characters | Запазено на този телефон / От 2 до 20 знака |
| Settings | TUTORIAL | ОБУЧЕНИЕ |
| Settings | Show tutorial at start | Показвай обучението при старт |
| Settings | Open "How it works" each time the app starts | Отваря „Как работи“ при всяко стартиране |
| Settings | View tutorial now | Виж обучението сега |
| Settings | LEVEL | НИВО |
| Settings | WORD TYPE | ВИД ДУМИ |
| Word types | All words · Nouns · Verbs · Adjectives | Всички думи · Съществителни · Глаголи · Прилагателни |
| Settings | BATCH | СЕРИЯ |
| Settings | Mix in easier words / Not used with Full | Добавя по-лесни думи / Не важи за „Пълен“ |
| Settings | Include known words | Включи познатите думи |
| Settings | Review words you already know | Преговор на думите, които вече знаеш |
| Settings | ABOUT | ЗА ПРИЛОЖЕНИЕТО |
| Settings | Credits | Източници |
| Settings | Reset progress | Нулирай напредъка |
| Settings | Tap again to reset | Докосни пак, за да нулираш |
| Settings | Progress reset | Напредъкът е нулиран |
| Settings | Reset failed. Tap to try again | Нулирането не успя. Докосни, за да опиташ пак |
| Credits | Vocabulary — from Wiktionary via Doozan, CC BY-SA. | Речник — от Wiktionary чрез Doozan, CC BY-SA. |
| Credits | Example sentences — from Tatoeba, CC BY, with per-sentence attribution. | Примерни изречения — от Tatoeba, CC BY, с автор за всяко изречение. |
| Credits | Levels — from a CEFR word list, free for personal and educational use. | Нива — от списък с думи по CEFR, свободен за лична и учебна употреба. |
| Credits | Close | Затвори |
| Card chip | noun · verb · adjective · adverb · pronoun · preposition · conjunction · determiner · interjection · numeral · other | съществително · глагол · прилагателно · наречие · местоимение · предлог · съюз · определител · междуметие · числително · друго |
| Error | Something went wrong | Нещо се обърка |
| Error | The app couldn't open its data on this phone. Close the app and open it again. | Приложението не успя да отвори данните си на този телефон. Затвори го и го отвори отново. |

Notes on choices to check:

- "batch" is translated as "серия".
- Texts avoid gendered past forms: "сортирани" instead of "си плъзнал/а", and "Днешният ден е
  отметнат" instead of "готов/а си".
- "Full" is translated as "Пълен" (the full dictionary).
- The Swipe tab is "Карти", since "Плъзгане" reads oddly as a tab name.
