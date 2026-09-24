import { formatNumber, plural } from '@/i18n/format';

const number = (count: number) => formatNumber(count, 'en');
const words = (count: number) => plural(count, 'word', 'words');

// Every text the app shows, in English: the source every other language is typed against.
// Texts with values are functions, so each language places the values itself.
export const en = {
  common: {
    continue: 'Continue',
    back: 'Back',
    stepOf: (step: number, count: number) => `Step ${step} of ${count}`,
    number,
    words: (count: number) => `${number(count)} ${words(count)}`,
    everything: 'Everything',
    username: 'Username',
    includeLower: 'Include lower levels',
  },
  tabs: {
    swipe: 'Swipe',
    words: 'Words',
    progress: 'Progress',
    settings: 'Settings',
  },
  welcome: {
    title: 'Learn Spanish one swipe at a time',
    body: 'See a Spanish word, tap for the English meaning, and swipe to sort it.',
    getStarted: 'Get started',
  },
  username: {
    title: 'What should we call you?',
    body: 'Pick a username. It stays on this phone.',
    tooShort: (min: number) => `Use at least ${min} characters`,
  },
  level: {
    title: 'Pick your level',
    body: 'You can change this any time in Settings.',
  },
  levels: {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
    full: 'Full',
  },
  wordTypes: {
    all: 'All words',
    noun: 'Nouns',
    verb: 'Verbs',
    adjective: 'Adjectives',
  },
  partOfSpeech: {
    noun: 'noun',
    verb: 'verb',
    adjective: 'adjective',
    adverb: 'adverb',
    pronoun: 'pronoun',
    preposition: 'preposition',
    conjunction: 'conjunction',
    determiner: 'determiner',
    interjection: 'interjection',
    numeral: 'numeral',
    other: 'other',
  },
  howItWorks: {
    title: 'How it works',
    // Tap, swipe right, swipe left: in the order the screen shows them.
    rows: [
      { title: 'Tap the card', body: 'It flips to show the English meaning and an example.' },
      { title: 'Swipe right if you know it', body: 'The word leaves this batch.' },
      {
        title: "Swipe left if you're still learning",
        body: 'You can practise it at the end of the batch.',
      },
    ],
    showAtStart: 'Show this screen when the app starts',
    start: 'Start swiping',
  },
  swipe: {
    tapHint: 'Tap to see the meaning',
    know: 'I know it',
    learn: 'Still learning',
    saveFailed: "Couldn't save your last answer.",
    cardLabel: (word: string) => `Card: ${word}`,
    showsMeaning: 'Shows the meaning',
    showsWord: 'Shows the word',
  },
  summary: {
    title: 'Batch done',
    known: (known: number, size: number) =>
      `You know ${known} of ${size} ${words(size)} in this batch.`,
    knownTile: 'known',
    learningTile: 'still learning',
    next: 'Next batch',
    practise: (count: number) => `Practise the ${count} still learning`,
    changeSettings: 'Change settings',
  },
  empty: {
    title: 'No words match your settings',
    body: "You've already swiped every word for these settings. Try another level or word type, or include known words.",
    openSettings: 'Open settings',
  },
  match: {
    title: "It's a match!",
    line: 'You were still learning this one. Now you know it.',
    keepSwiping: 'Keep swiping',
  },
  words: {
    title: 'My words',
    lists: {
      known: { label: 'Known', empty: 'Words you swipe right on show up here.' },
      learning: {
        label: 'Still learning',
        empty: 'Words you swipe left on show up here until you know them.',
      },
    },
    search: 'Search Spanish or English',
    noMatch: 'No words match your search.',
  },
  progress: {
    title: 'Progress',
    // The number stands above the label; English says "day streak" for any count.
    streak: (_days: number) => 'day streak',
    // Monday first, as the week strip shows it.
    weekdays: [
      { letter: 'M', name: 'Monday' },
      { letter: 'T', name: 'Tuesday' },
      { letter: 'W', name: 'Wednesday' },
      { letter: 'T', name: 'Thursday' },
      { letter: 'F', name: 'Friday' },
      { letter: 'S', name: 'Saturday' },
      { letter: 'S', name: 'Sunday' },
    ],
    day: (name: string, played: boolean) => `${name}: ${played ? 'played' : 'not played'}`,
    doneToday: "Today's done. See you tomorrow.",
    keepStreak: 'Swipe one card today to keep your streak.',
    swipesToday: (count: number) => plural(count, 'swipe today', 'swipes today'),
    wordsKnown: (count: number) => plural(count, 'word known', 'words known'),
    byLevel: 'Known by level',
    levelKnown: (level: string) => `${level} known`,
    levelCount: (known: number, total: number) => `${number(known)} of ${number(total)}`,
  },
  settings: {
    title: 'Settings',
    language: 'Language',
    profile: 'Profile',
    nameSaved: 'Saved on this phone',
    nameRule: (min: number, max: number) => `Use ${min}–${max} characters`,
    tutorial: 'Tutorial',
    showTutorial: 'Show tutorial at start',
    showTutorialDetail: 'Open "How it works" each time the app starts',
    viewTutorial: 'View tutorial now',
    level: 'Level',
    wordType: 'Word type',
    batch: 'Batch',
    lowerDetail: 'Mix in easier words',
    lowerNotWithFull: 'Not used with Full',
    includeKnown: 'Include known words',
    includeKnownDetail: 'Review words you already know',
    about: 'About',
    credits: 'Credits',
    reset: {
      idle: 'Reset progress',
      armed: 'Tap again to reset',
      done: 'Progress reset',
      failed: 'Reset failed. Tap to try again',
    },
  },
  credits: {
    title: 'Credits',
    sources: [
      { what: 'Vocabulary', source: 'from Wiktionary via Doozan, CC BY-SA.' },
      { what: 'Example sentences', source: 'from Tatoeba, CC BY, with per-sentence attribution.' },
      { what: 'Levels', source: 'from a CEFR word list, free for personal and educational use.' },
    ],
    close: 'Close',
  },
  startupError: {
    title: 'Something went wrong',
    body: 'The app couldn’t open its data on this phone. Close the app and open it again.',
  },
};

// The shape every language fills in.
export type Strings = typeof en;
