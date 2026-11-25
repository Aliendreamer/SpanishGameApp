# Design

## Context

See proposal.md for motivation. `getDeck` reads every example of the dealt words but keeps the first.
After `card-tap-fix` the card races a pan with a tap. The card is one accessible element, so nothing
inside it is reachable by itself with a screen reader. The longest sentence is 137 characters, the
average 38.

## Goals / Non-Goals

**Goals:** show the other sentences without crowding the card or disturbing flip and swipe.

**Non-Goals:** see proposal.md.

## Decisions

- **One sentence at a time, tap the box for the next.** Three sentences with translations under up to
  three meanings do not fit a small phone, and a scrolling card back would compete with the swipe.
  - *All three listed*: rejected for space. *A scrolling back*: rejected, it fights the drag.
    *A "next" button below the card*: rejected; that row already holds three buttons.
- **The box has its own `Gesture.Tap()`**, with the same distance limit as the card's, and
  `blocksExternalGesture(cardTap)` so a tap on the box never also flips the card. The card's pan is
  untouched, so a drag that starts on the box swipes. With one sentence the box has no gesture and a
  tap there flips, as today.
- **The box takes taps only while the back is showing**; both faces stay mounted for the flip.
- **The index lives in `SwipeCard`**, which mounts fresh per card, so a new card starts at the first
  sentence; flipping back and forth keeps the place. `CardBack` gets the index and the box's gesture.
- **`examples: Example[]`**, at most 3, replaces `example` on `DeckWord`.
- **Accessibility**: an extra `example` action ("Next example" / "Следващ пример") on the card, only
  while flipped and with more than one sentence. "1 / 3" is plain text in both languages.

## Risks / Trade-offs

- [Nested taps could both fire on the device, which Jest can't show] → `blocksExternalGesture`, and
  the phone check below.
- [Sentences differ in length, so the box changes height] → it is anchored to the bottom of the card
  and grows upwards; meanings may shrink, as they do now.
- [Some sentences are above the learner's level] → the import already picks the shortest; unchanged.
