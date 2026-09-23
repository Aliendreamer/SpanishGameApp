## 1. Rules

- [x] 1.1 Failing tests: queue — one pass, "Still learning" recorded not re-queued, summary numbers; implement
- [x] 1.2 Failing tests: `getDeck` leaves out every swiped word unless known words are included; implement
- [x] 1.3 Failing tests: `logSwipe` returns the previous swipe's direction and time; implement

## 2. Screen

- [x] 2.1 Failing tests: summary text, tiles, "Next batch", "Practise the {y} still learning" (hidden when 0), "Change settings"; implement
- [x] 2.2 Failing tests: Swipe screen — no re-queue, summary after one pass, practise round of the missed words; implement

## 3. Route and docs

- [x] 3.1 Failing route tests: match only for a miss from before the current batch; next batch leaves out swiped words; wire the batch start time
- [x] 3.2 Update the roadmap's session rule
- [x] 3.3 Gates and Android bundle

## 4. From review

- [x] 4.1 Failing test: "Next batch" waits for the last answer's save, so a just-answered word can't be dealt again
