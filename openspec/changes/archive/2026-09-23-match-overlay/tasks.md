## 1. Detecting a match

- [x] 1.1 Failing tests: `logSwipe` returns the previous latest direction (null for a first swipe); implement

## 2. Overlay

- [x] 2.1 Failing test: `PrimaryButton` light tone; implement
- [x] 2.2 Failing tests: `MatchOverlay` shows the title, line, article or part of speech, lemma, meanings, and closes on "Keep swiping"; implement with entering animations
- [x] 2.3 Failing tests: the Swipe screen shows the overlay when an answer resolves as a match, not otherwise; implement

## 3. Route and verify

- [x] 3.1 Failing route test: Still learning then I know it on the same word shows the overlay; the route reports matches from the log
- [x] 3.2 Gates and Android bundle

## 4. From review

- [x] 4.1 Failing test: two saves at the same time both land; `logSwipe` drops its transaction (inserts, then reads the row before)
- [x] 4.2 Route tests share one helper for "first word answered Still learning earlier"
