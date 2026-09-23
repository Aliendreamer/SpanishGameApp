## 1. Storage

- [x] 1.1 Failing test: `clearSwipes` empties the swipe log and leaves settings alone; implement

## 2. Components

- [x] 2.1 Failing tests: section label/card, switch row (toggles, disabled state), link row; implement
- [x] 2.2 Failing tests: credits sheet shows the three lines and closes from "Close" and the backdrop; implement

## 3. Settings screen

- [x] 3.1 Failing tests: current values; username save on submit/blur and the invalid note; tutorial switch; level radios; batch switches and Full disabling; View tutorial; Credits; two-tap reset and "Progress reset"; implement `src/screens/settings/`

## 4. Routes

- [x] 4.1 Failing route tests: level change re-deals the Swipe tab; reset clears the log and re-deals; username and tutorial saved; View tutorial opens the tutorial with the saved checkbox; wire the Settings route, the deck refresh context, and the tutorial's fresh prefs
- [x] 4.2 Gates and Android bundle

## 5. From review

- [x] 5.1 Failing test (cards dealt for the new settings): key the Swipe screen by the version its deck was dealt for
- [x] 5.2 Failing test: overlapping `saveSettings` calls all land (single UPDATE of the given columns)
- [x] 5.3 Failing test: a failed reset shows "Reset failed. Tap to try again" and retries
- [x] 5.4 Regression test: a tutorial choice made in the tutorial shows back in Settings (already holds: finishing the tutorial remounts the tabs)
