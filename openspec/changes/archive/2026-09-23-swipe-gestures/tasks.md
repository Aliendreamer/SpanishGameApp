## 1. Setup

- [x] 1.1 Install and pin `react-native-gesture-handler`; add its Jest setup
- [x] 1.2 Root layout wraps the app in `GestureHandlerRootView` (test)

## 2. Drag rules

- [x] 2.1 Failing tests: release outcome (tap, know, learn, spring back), stamp opacities, rotation; implement `src/screens/swipe/motion.ts`

## 3. Card

- [x] 3.1 Failing tests: `SwipeCard` — a tap flips; a long right or left drag answers; a short drag answers nothing; `answer()` through the ref answers once; implement with Pan, fly-out, stamps, 3D flip
- [x] 3.2 Swipe screen uses `SwipeCard` (keyed by word) and drives it from the buttons; existing screen tests stay green

## 4. Verify

- [x] 4.1 Gates and Android bundle

## 5. From review

- [x] 5.1 Card keyed per answer, so a word that comes straight back remounts (part 3 re-queues)
- [x] 5.2 Failing tests: a long vertical drag is not a tap; a cancelled drag springs back; fix `releaseOutcome` and `onEnd`
