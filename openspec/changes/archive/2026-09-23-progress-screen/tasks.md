## 1. Rules and data

- [x] 1.1 Failing tests: `dayNumber`, `streakLength` (today, from yesterday, broken, empty), `weekMarks` (Monday-first, future days open); implement `src/progress/stats.ts`
- [x] 1.2 Failing tests: `getProgressStats` — swipe days, swipes today, words known, known per level (dictionary-joined); implement `src/storage/progress-stats.ts`

## 2. Screen

- [x] 2.1 Failing tests: title, streak number and note (both cases), week marks, tiles, level rows with bars; implement `src/screens/progress/`

## 3. Route and verify

- [x] 3.1 Failing route test: after a swipe, Progress shows 1 swipe today, a 1-day streak, and the known word; wire the route with refresh on focus; remove the tab placeholder
- [x] 3.2 Gates and Android bundle

## 4. From review

- [x] 4.1 One `CEFR_LEVELS` list (type derived from it); one grouped query for days played and today's count
