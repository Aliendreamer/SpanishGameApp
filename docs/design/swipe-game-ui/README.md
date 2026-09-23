# Handoff: Swipe Game UI (roadmap step 4, `swipe-game-ui`)

## Overview
The UI for SpanishGameApp: a local-only Android app where you swipe through Spanish vocabulary cards like a dating app. Right = I know it, left = still learning. The design covers onboarding (welcome, username, level, tutorial), the swipe deck with a flip card, the "It's a match!" moment, batch summary, empty state, My words, Progress, Settings and Credits.

The product rules come from `openspec/ROADMAP.md` ("Decisions agreed for step 4"). This design follows them and adds a **username** and a **show tutorial at start** setting. Both are stored in AsyncStorage.

## About the Design Files
`Palabras App.dc.html` is a **design reference built in HTML**. It is a working prototype that shows the intended look and behavior, not production code. Recreate it in the existing Expo SDK 57 + Expo Router + React Native 0.86 + TypeScript codebase, following the repo conventions in `CLAUDE.md`:
- `src/app` holds routes only.
- Screens live in `src/screens/<name>/`.
- Reusable UI lives in `src/components`.
- Tests sit next to the files they test.
- Import via `@/`.

Plan the work as an OpenSpec change (`/opsx:propose swipe-game-ui`) per the repo's developer flow.

`Swipe Directions.dc.html` holds the visual explorations. Option **3a** is the chosen direction; the other options are for reference only.

## Fidelity
**High-fidelity.** Colors, type, radii, spacing and interactions are final. Match them closely using React Native primitives (`View`, `Pressable`, `TextInput`) plus `react-native-gesture-handler` and `react-native-reanimated` for the swipe and flip.

Sizes are in dp. The prototype renders at a 396 dp wide content area (a 412 wide device minus the bezel).

## Screens / Views

### Global
- Background: `#F7D6E0` on every screen.
- Font: **Bricolage Grotesque** (Google Fonts), weights 400/500/600/700/800. Load it with `expo-font` / `@expo-google-fonts/bricolage-grotesque`.
- Text color `#3B1624`.
- Screen padding: 20 dp horizontal in the app, 24 dp in onboarding.
- Primary button: height 56–58, full pill radius, bg `#D6457A`, text `#FFF6F8` 16–17/800. Pressed bg `#C53A6C`.
- Secondary button: same shape, transparent bg, 2 dp border `#3B1624`, text `#3B1624` 16/700.

### Onboarding (first launch only)
Layout: a top row 36 dp tall with step dots on the left and "Back" (15/600, `#9A4F6C`) on the right from step 2 onward. The step content fills the rest, with the primary button pinned to the bottom. Gap 20.

Step dots: 4 dots, height 6, radius 3. The active dot is 28 wide; the others are 8 wide. Done and active dots are `#D6457A`; upcoming dots are `#EFBCCD`. Width animates over 300 ms.

1. **Welcome**
   - Hero: two stacked cards, each 230×300, radius 30. The back card is `#F28BAB`, rotated −9°, shifted −30 x. The front card is 3a-style (see Swipe card), rotated 5°, shifted +18 x, with the word "hola" at 52/800.
   - Title: "Learn Spanish one swipe at a time", 36/800, line-height 1.05, letter-spacing −0.02em.
   - Body: "See a Spanish word, tap for the English meaning, and swipe to sort it.", 17/400, color `#7A3D55`.
   - Button: "Get started".
2. **Username**
   - Title: "What should we call you?" (32/800).
   - Body: "Pick a username. It stays on this phone."
   - TextInput: height 58, radius 18, bg `#FFF6F8`, text 18/600, placeholder "Username" (`#A8708A`), autofocus, maxLength 20.
   - Below the field: an error on the left (13/500, `#B8325F`) and a counter "n / 20" on the right (`#9A4F6C`).
   - **Validation:** trimmed length ≥ 2. If invalid, the field gets a 2 dp border `#B8325F` and the message "Use at least 2 characters".
   - Button: "Continue", shown at 50% opacity until valid. Pressing Continue or the Enter key submits. The username is saved to AsyncStorage on Continue.
3. **Pick your level**
   - Title: "Pick your level".
   - Body: "You can change this any time in Settings."
   - 4 radio cards, gap 10, padding 16×18, radius 22:
     - Selected: bg `#FFF6F8` with a 2 dp border `#D6457A`.
     - Unselected: bg `rgba(255,246,248,.45)` with no border.
     - Radio: 22 dp ring, 2 dp border `#D6457A`, 10 dp inner dot.
     - Label 17/700; sub-line 14/400 `#8A4A62`.
   - The options:
     - Beginner — "A1 + A2 · 1,142 words"
     - Intermediate — "B1 · 1,316 words"
     - Advanced — "B2 · 1,603 words"
     - Full — "Everything · 19,171 words"
   - Word counts come from `assets/vocabulary/vocabulary-stats.json` `byLevel` / `totalWords`. Compute them; don't hardcode.
   - Checkbox: "Include lower levels" (22 dp box, radius 7). It's disabled at 40% opacity when Full is selected.
   - Button: "Continue".
4. **How it works** (this is also the Tutorial screen, see below)
   - Title: "How it works".
   - 3 rows, each bg `#FFF6F8`, radius 22, padding 18, with a 48 dp icon tile (radius 14):
     - "1" on `#F7D6DF` / `#D6457A` — "Tap the card" / "It flips to show the English meaning and an example."
     - "→" on `#5F7A3A` — "Swipe right if you know it" / "The word leaves this batch."
     - "←" on `#3B1624` — "Swipe left if you're still learning" / "It comes back a few cards later."
   - Checkbox: "Show this screen when the app starts". It is bound to `showTutorial` (default **true**).
   - Button: "Start swiping". It marks onboarding done and deals the first batch.

### Tutorial screen (later launches)
- On every launch after onboarding: if `showTutorial` is true, open the "How it works" screen first. It has no dots and no Back.
- A small line "Hola, {username}" (15/600, `#9A4F6C`) sits above the title.
- "Start swiping" goes to the Swipe tab.
- It can also be opened from Settings with "View tutorial now".

### App shell: bottom nav
- Bar: bg `#FFF6F8`, top radius 24, padding 8×10.
- 4 equal pills, height 44: **Swipe · Words · Progress · Settings**.
- Active pill: bg `#D6457A`, text `#FFF6F8`. Inactive: transparent, text `#8A4A62`. Text 14/700.
- Text only, no icons (by design).

### Swipe tab
- **Header** (padding 14/20/4):
  - Left column (flex 1, minWidth 0): level line 13/500 `#9A4F6C`, e.g. "Beginner · A1, A2", then "Hola, {username}" at 24/800, one line, ellipsized.
  - Right: progress text "known / batchSize" (15/600) and a 38 dp progress ring (track `#EFBCCD`, fill `#D6457A`, 26 dp inner hole in the background color).
- **Card area:** flex 1, margin 16 top / 14 sides.
  - Behind the card: a next-card hint, bg `#F28BAB`, radius 36, rotated −3°, scaled 0.96. It is shown only when more than one card is left.
- **Swipe card, front** (the 3a "Framed" style):
  - bg `#D6457A`, radius 36, padding 14.
  - Shadow `0 24 44 -20 rgba(140,30,70,.55)`, which is elevation ~12 on Android.
  - Inner frame: 1.5 dp border `rgba(255,246,248,.55)`, radius 26.
  - A centered 300 dp circle `#E2638F` sits behind the text.
  - Top: CEFR level, 12/600, letter-spacing 0.14em, `#FBD0DD`.
  - Article (nouns only): 26/600 `#FBD0DD`.
  - Lemma: 72/800, line-height 0.95, letter-spacing −0.02em, `#FFF6F8`, centered. Use 54 when the lemma is longer than 9 characters.
  - Bottom: "Tap to see the meaning", 14/500 `#F7C4D4`.
- **Swipe card, back:**
  - bg `#FFF6F8`, 2 dp border `#D6457A`, radius 36, padding 32×28.
  - Row: article + lemma at 26/800 `#D6457A`, plus a part-of-speech chip (12/600, bg `#F7D6DF`, text `#8F3355`, pill).
  - Up to 3 meanings at 36/800, line-height 1.05, gap 12.
  - Bottom: an example box (bg `#F7D6DF`, radius 22, padding 18×20) with the Spanish sentence at 18/600 and the English at 14/400 `#8A4A62`.
  - Use the first Tatoeba example; the roadmap says show 1.
- **Swipe stamps:** they fade in with drag distance (opacity = |dx| / 90, clamped to 1).
  - "I know it" at top-left: pill bg `#5F7A3A`.
  - "Still learning" at top-right: pill bg `#3B1624`.
  - Both use text 18/800 `#FFF6F8`, padding 8×16, inset 30/26.
- **Buttons row:** a 2-column grid, gap 12, padding 20/20/14. "Still learning" is secondary; "I know it" is primary.
- **Batch summary** (when the batch is empty):
  - Title "Batch done" (38/800).
  - Body "You know all {n} words in this batch."
  - Two stat tiles (bg `#FFF6F8`, radius 22): "{x} known on the first swipe" and "{y} took a few tries".
  - Buttons: "Continue with the next batch" (primary) and "Change settings" (secondary, goes to the Settings tab).
- **Empty state** (no words match the filters):
  - Title "No words match your settings".
  - Body "You already know every word at this level. Try another level, or include known words."
  - Button "Open settings".

### "It's a match!" overlay
- **Trigger:** a right swipe on a word whose previous swipe was left (i.e. it was in "still learning").
- Layout: full-screen bg `#D6457A`, content vertically centered, gap 30, padding 24.
  - Title "It's a match!", 46/800, `#FFF6F8`.
  - Sub-line "You were still learning this one. Now you know it." (16, `#FDE3EB`).
  - Card: 250 wide, bg `#FFF6F8`, radius 30, padding 26×24. It shows the article (or part of speech if there's no article) at 18/600 `#D6457A`, the lemma at 44/800, and the meanings joined by ", " at 16/500 `#8A4A62`.
  - Button "Keep swiping" (bg `#FFF6F8`, text `#D6457A`).
- **Animation:**
  - Overlay: opacity 0→1 over 350 ms.
  - Card: rotate 8° / scale 0.6 → rotate −4° / scale 1 over 500 ms, easing `cubic-bezier(.2,1.4,.4,1)` (overshoot). A Reanimated spring works too.

### Words tab ("My words")
- Title "My words" (28/800).
- Segmented pills, height 40: "Known · n" and "Still learning · n".
  - Active: bg `#3B1624`, text `#FFF6F8`. Inactive: bg `#FFF6F8`.
- Search TextInput: height 48, radius 16, bg `#FFF6F8`, placeholder "Search Spanish or English". It matches the lemma with its article and the English meanings, case-insensitive.
- List (FlatList), row gap 8. Each row: bg `#FFF6F8`, radius 18, padding 14×16.
  - Left: the word with its article (18/700) and the meanings joined, on one ellipsized line (14/400 `#8A4A62`).
  - Right: a CEFR chip.
- Empty text:
  - Known tab: "Words you swipe right on show up here."
  - Still learning tab: "Words you swipe left on show up here until you know them."
  - No search results: "No words match your search."

### Progress tab
- Title "Progress".
- **Streak card:** bg `#D6457A`, radius 28, padding 22.
  - The number at 64/800, followed by "day streak" at 18/600 `#FBD0DD`.
  - A 7-column week row (M T W T F S S). Each day is a 32 dp circle: filled `#FFF6F8` when done, a 2 dp `#F7A8C0` outline when not.
  - Note (14, `#FDE3EB`): "Today's done. See you tomorrow." once today has at least 1 swipe, otherwise "Swipe one card today to keep your streak."
- **Two tiles:** "swipes today" and "words known" (36/800).
- **"Known by level" card:**
  - Rows A1–B2, each with the label and "{known} of {total}".
  - Under each row, an 8 dp bar: track `#F7D6DF`, fill `#D6457A`.
- The roadmap lists streaks as "Later". Build this tab now or behind a flag. All values come from the swipe log.

### Settings tab
The screen is a scroll view. Section labels are 13/700, letter-spacing 0.08em, `#9A4F6C`. Section cards are bg `#FFF6F8`, radius 22, with rows divided by 1 dp `#F7D6DF`.
1. **PROFILE:** a "Username" TextInput (height 48, radius 14, bg `#F7D6DF`).
   - It saves on blur or Enter when valid (2–20 chars, trimmed).
   - Note: "Saved on this phone" (`#8A4A62`), or "Use 2–20 characters" (`#B8325F`) when invalid.
2. **TUTORIAL:**
   - Switch row: "Show tutorial at start" with sub-line 'Open "How it works" each time the app starts'.
   - Link row: "View tutorial now ›".
3. **LEVEL:** the same 4 options as onboarding, as radio rows (the radio sits on the right).
4. **BATCH:** two switches.
   - "Include lower levels" / "Mix in easier words". Disabled at 45% opacity for Full, with the sub-line "Not used with Full".
   - "Include known words" / "Review words you already know".
5. **ABOUT:**
   - "Credits ›" opens a bottom sheet.
   - "Reset progress" (`#B8325F`). The first tap changes the label to "Tap again to reset"; the second tap clears progress and settings and returns to onboarding.

Switch style: 52×32 track (on `#D6457A`, off `#EFBCCD`), 24 dp knob `#FFF6F8`, 200 ms slide. On Android you can use the RN `Switch` with these track and thumb colors instead.

Changing the level or a batch toggle re-deals the current batch.

### Credits bottom sheet
- Backdrop `rgba(59,22,36,.45)`. Sheet bg `#FFF6F8`, top radius 28, a 40×4 grabber `#EFBCCD`.
- Title "Credits".
- Lines (15/400 `#5A2A3E`):
  - "**Vocabulary** from Wiktionary via Doozan, CC BY-SA."
  - "**Example sentences** from Tatoeba, CC BY, with per-sentence attribution."
  - "**Levels** from a CEFR word list, free for personal and educational use."
- Button "Close".
- Tapping the backdrop also closes the sheet.

## Interactions & Behavior
- **Swipe gesture:**
  - The card follows the finger: translateX = dx, rotate = dx / 20 degrees.
  - Release with |dx| > 90 commits the swipe.
  - Release with |dx| < 6 counts as a tap and flips the card.
  - Anything else springs back over 300 ms, easing `cubic-bezier(.2,.7,.3,1)`.
- **Commit animation:** the card flies to translateX ±560 / rotate ±24° over 300 ms; the next card appears after 280 ms.
- **Flip:** rotateY 0↔180° over 450 ms, easing `cubic-bezier(.3,.7,.3,1)`, using two faces with `backfaceVisibility: 'hidden'`. A new card always starts front-side up.
- **Buttons:** ✓/✗ run the same commit as a swipe (per the roadmap).
- **Queue rules (roadmap):**
  - A batch holds up to 100 words, filtered by level, "include lower levels" and "include known words".
  - Order: CEFR level, then frequency rank ascending; words with no CEFR level go last.
  - Right swipe removes the card.
  - Left swipe re-inserts it about 4 cards later (index `min(3, remaining)`).
  - When the batch is empty, show the summary; Continue deals the next batch.
- **Known** = the word's most recent swipe was right. Log every swipe (word, direction, time) to `progress.db`.
- **Errors (roadmap):**
  - Bad data → a full-screen error.
  - A failed swipe save → a non-blocking banner.
  - No matching words → the empty state.

## State Management
**AsyncStorage** holds the lightweight user prefs, as the user requested:
- `username: string` — 2–20 chars, trimmed.
- `showTutorial: boolean` — default `true`.
- `onboardingDone: boolean`

**progress.db** (SQLite, per the roadmap) holds:
- the swipe log, keyed `lemma|pos`
- the settings: `level` (`beginner|intermediate|advanced|full`), `includeLower` (default true), `includeKnown` (default false)

These two can move between stores if you prefer, but the username and tutorial flag must be in AsyncStorage.

**Derived values:**
- `known` set: last swipe right
- `learning` set: last swipe left
- streak days and today's swipe count
- known count per CEFR level

**Session state (in memory):**
- `batch` (queue of word keys), `batchSize`, `batchKnown`
- `retried` set (words swiped left at least once in this batch)
- `flipped`, `dragX`
- `match` (the word key for the overlay)

**Launch routing:**
- `!onboardingDone` → onboarding.
- Otherwise, `showTutorial` → Tutorial, then the Swipe tab.
- Otherwise → the Swipe tab.

## Design Tokens
**Colors**
- Background `#F7D6E0`
- Rose (primary) `#D6457A`; pressed `#C53A6C`
- Rose light (next card, onboarding hero) `#F28BAB`
- Card circle `#E2638F`
- Surface / cream `#FFF6F8`
- Chip / soft `#F7D6DF`
- Track `#EFBCCD`
- Ink `#3B1624`
- Body muted `#7A3D55`
- Secondary text `#8A4A62`
- Labels `#9A4F6C`
- Chip text `#8F3355`
- Error / destructive `#B8325F`
- Know (olive) `#5F7A3A`
- On-rose light text `#FBD0DD`, `#F7C4D4`, `#FDE3EB`
- Placeholder `#A8708A`

**Type** (Bricolage Grotesque): 72/54 lemma · 64 streak · 46 match · 36–38 display · 32 onboarding titles · 28 tab titles · 24–26 headers · 16–18 body · 13–15 secondary · 11–12 chips/caps.

**Radii:** 36 card · 30 hero/match card · 28 streak card/sheet · 22 section cards · 18 list rows/inputs · 14–16 small inputs/tiles · 7 checkbox · pill (999) buttons and chips.

**Spacing:** 4 · 8 · 10 · 12 · 14 · 16 · 18 · 20 · 22 · 24 · 28 · 30.

**Shadow:** card `0 24 44 -20 rgba(140,30,70,.55)`; match card `0 24 44 -18 rgba(80,10,40,.5)`.

## Assets
- No images. All shapes are Views: circles, rounded rects and borders.
- Arrow glyphs "→ ←" and ticks "✓" are plain text characters.
- Font: Bricolage Grotesque (Google Fonts, OFL).
- The app icon and splash are already in `assets/images/`. Their current splash color `#208AEF` may need updating to `#D6457A` to match.

## Files
- `screenshots/` — one PNG per screen, 01–12 in flow order (onboarding → swipe front/back → match → words → progress → settings → credits → tutorial on launch).
- `Palabras App.dc.html` — the full interactive prototype. Open it in a browser. It uses 20 sample words, a demo streak seeded at 6 days, and `hola`, `gracias`, `agua` pre-marked as known.
- `Swipe Directions.dc.html` — the explorations (3a is chosen).
- `android-frame.jsx` — the device frame used by the prototypes (presentation only; don't port it).
- `support.js` — the runtime the prototype files need to open in a browser.
