## 1. Tap tolerance

- [x] 1.1 Test first: a 10 dp release (and 8 dp diagonal) is `'tap'`, 12 dp is not; then raise `TAP_DISTANCE` to 12 in `src/screens/swipe/motion.ts`

## 2. Flip button

- [x] 2.1 Test first: English and Bulgarian string tables have the flip labels ("Show meaning" / "Show word"); add them to `en.ts` and `bg.ts`
- [x] 2.2 Test first: `SwipeCardHandle.flip()` turns the card over and back, and reports each flip through `onFlip`; implement in `swipe-card.tsx`
- [x] 2.3 Test first: the Swipe screen shows the round ↻ button between "Still learning" and "I know it"; pressing "Show meaning" shows the back and relabels it "Show word", pressing again returns to the front; a new card resets it to "Show meaning"; implement in `src/screens/swipe/index.tsx` (as an `icon` option on `SecondaryButton`)

## 3. Tutorial

- [x] 3.1 Test first: How it works' first row reads "Tap the card or ↻" (Bulgarian "Докосни картата или ↻"); update the row titles in `en.ts` and `bg.ts`

## 4. Verify

- [x] 4.1 Run `NODE_USE_ENV_PROXY=1 EXPO_NO_TELEMETRY=1 pnpm check` and fix anything red
