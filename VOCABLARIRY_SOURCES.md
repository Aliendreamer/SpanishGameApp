# Spanish ↔ English Vocabulary Data Plan

## 1. Goal

Build a local vocabulary dataset for a React Native Spanish-learning application.

The application should support:

- Spanish → English exercises
- English → Spanish exercises
- Vocabulary progression by CEFR level
- Vocabulary progression by word frequency
- Multiple English meanings for Spanish words
- Spanish lemmas
- Parts of speech
- Example sentences
- Future support for conjugations and word forms
- Offline usage
- Tracking user learning progress separately from dictionary data

The vocabulary database should be generated during development/build time.

The mobile application should NOT need to process the original datasets.

---

# 2. Data Sources

## 2.1 Primary Source — Doozan Spanish Data

Repository:

https://github.com/doozan/spanish_data

Use Doozan as the primary vocabulary source.

Useful data includes:

- Spanish lemmas
- Spanish → English definitions
- Word frequency information
- Word forms
- Parts of speech
- Example sentences
- Spanish/English sentence pairs

Doozan should be considered the main vocabulary source.

Do NOT remove words simply because they do not exist in the CEFR dataset.

---

## 2.2 CEFR Metadata

Repository:

https://github.com/Talhakasikci/cefr-vocabulary-dataset

Use this dataset only to enrich vocabulary with difficulty levels.

Initially supported levels:

- A1
- A2
- B1
- B2

CEFR data should NOT be considered authoritative enough to determine whether a word exists.

Example:

Doozan contains:

    desarrollar

CEFR contains:

    desarrollar → B1

Result:

    desarrollar
    English: develop
    CEFR: B1

If Doozan contains a word but CEFR does not:

    aprovechar

keep the word:

    aprovechar
    English: take advantage of
    CEFR: null

Later these words can be classified separately.

---

# 3. Core Concept — Lemmas

The vocabulary database should primarily operate on lemmas.

A lemma is the dictionary/base form of a word.

Examples:

    como       → comer
    comiendo   → comer
    comimos    → comer

    casas      → casa

    mejores    → bueno

This prevents different grammatical forms from becoming unrelated vocabulary entries.

The main vocabulary entry should therefore represent:

    comer

rather than separately treating:

    como
    comes
    come
    comemos
    coméis
    comen
    comí
    comiste
    comiendo
    ...

as independent vocabulary words.

Word forms can still be stored separately and associated with the lemma.

---

# 4. Processing Architecture

Use a build-time/import pipeline.

Architecture:

    Doozan
       │
       ├── dictionary
       ├── frequency
       ├── forms
       └── sentences
       │
       ▼
    Vocabulary Importer
       │
       ├──────── CEFR dataset
       │
       ▼
    Normalize
       │
       ▼
    Merge
       │
       ▼
    Validate
       │
       ▼
    Rank
       │
       ▼
    vocabulary.json
       │
       OR
       ▼
    vocabulary.db (SQLite)
       │
       ▼
    React Native App

The importer can be implemented with Node.js/TypeScript.

It should be completely separate from the React Native application runtime.

---

# 5. Canonical Vocabulary Model

Recommended internal representation:

    VocabularyEntry
    {
        id
        spanish
        english[]
        partOfSpeech
        gender
        frequency
        frequencyRank
        cefr
        forms[]
        examples[]
    }

Example:

    {
        "id": 152,
        "spanish": "comer",
        "english": [
            "to eat",
            "eat"
        ],
        "partOfSpeech": "verb",
        "gender": null,
        "frequency": 0.00821,
        "frequencyRank": 184,
        "cefr": "A1",
        "forms": [
            "como",
            "comes",
            "come",
            "comemos",
            "comen",
            "comiendo",
            "comido"
        ],
        "examples": [
            {
                "spanish": "Quiero comer.",
                "english": "I want to eat."
            }
        ]
    }

---

# 6. Multiple Meanings

Never assume:

    Spanish word = one English word

Translations are many-to-many.

Example:

    llevar

can mean:

- carry
- take
- bring
- wear
- lead

Therefore:

    "english": [
        "to carry",
        "to take",
        "to bring",
        "to wear"
    ]

should be preferred over:

    "english": "carry"

This becomes particularly important when testing answers.

---

# 7. Parts of Speech

Keep part-of-speech information.

Suggested normalized values:

    noun
    verb
    adjective
    adverb
    pronoun
    preposition
    conjunction
    interjection
    determiner
    numeral
    other

Do not merge entries purely because their spelling is identical.

For example, if the same Spanish spelling represents different grammatical meanings, separate dictionary senses may need to remain distinguishable.

---

# 8. Noun Gender

Store grammatical gender where available.

Example:

    {
        "spanish": "casa",
        "partOfSpeech": "noun",
        "gender": "f"
    }

Possible values:

    m
    f
    null

Potential future extension:

    m/f

for nouns where both forms are valid.

The UI can later display:

    la casa

instead of only:

    casa

This makes the vocabulary more useful for actually learning Spanish.

---

# 9. Frequency

Frequency should come primarily from Doozan.

Store both:

    frequency
    frequencyRank

Example:

    frequencyRank: 1

means an extremely common word.

Frequency ranking is important because CEFR alone should not determine learning order.

Two B1 words can have dramatically different usefulness.

The application should prefer frequently used vocabulary.

---

# 10. CEFR Mapping

Supported initial values:

    A1
    A2
    B1
    B2
    null

Do NOT invent a CEFR level when one cannot be matched confidently.

Example:

    {
        "spanish": "xyz",
        "cefr": null
    }

is better than assigning an unreliable level.

Later we can introduce:

    C1
    C2

from another reliable source or our own classification process.

---

# 11. Matching CEFR to Doozan

The primary matching key should be:

    normalized lemma + part of speech

Example:

    comer + verb

Avoid matching only by text when possible.

Normalization should include:

- Unicode normalization
- lowercase comparison
- whitespace trimming

Do NOT remove Spanish accents.

These are different:

    si
    sí

and:

    el
    él

Accent marks are linguistically significant.

---

# 12. CEFR Conflicts

If multiple CEFR records match a lemma, use part of speech to disambiguate.

Do not silently choose one when meanings are clearly different.

Maintain a processing report:

    matched
    unmatched
    ambiguous
    conflicting

Example:

    CEFR IMPORT

    Total:       8,000
    Matched:     7,120
    Unmatched:     640
    Ambiguous:     190
    Conflicting:    50

This makes dataset quality measurable.

---

# 13. Example Sentences

Attach example sentences from Doozan where possible.

Structure:

    examples: [
        {
            spanish: "...",
            english: "..."
        }
    ]

Prefer examples containing the vocabulary lemma or one of its forms.

Initially limit examples per vocabulary entry.

Recommended:

    1–3 examples

There is little reason to ship dozens of examples per word in the first version.

---

# 14. Word Forms

Word forms should reference their lemma.

Conceptually:

    comer
      ├── como
      ├── comes
      ├── come
      ├── comemos
      ├── comen
      ├── comí
      ├── comía
      ├── comiendo
      └── comido

This allows future exercises such as:

    What is the infinitive of "comiendo"?

    comer

or:

    Complete:

    Yo ___ una manzana.

    como

For V1, forms can simply be metadata.

---

# 15. Vocabulary Learning Order

Recommended ordering:

    A1
      ↓
    A2
      ↓
    B1
      ↓
    B2
      ↓
    Unknown CEFR

Inside each group:

    frequencyRank ASC

Therefore:

    A1 most frequent
    A1 less frequent
    ...
    A2 most frequent
    ...
    B1
    ...
    B2
    ...
    unclassified vocabulary by frequency

This combines pedagogical difficulty with real-world usefulness.

---

# 16. Spanish → English Mode

Question:

    casa

Possible accepted answers:

    house
    home

The application should check against all accepted translations.

Conceptually:

    answers = word.english

Do not require only the first English translation.

---

# 17. English → Spanish Mode

This direction requires more care.

English:

    know

could correspond to:

    saber
    conocer

Therefore the application must eventually support multiple valid Spanish answers.

The dictionary model should not assume translation is reversible 1:1.

For simple V1 exercises, the app can present enough context to identify the intended word.

Example:

    to know a fact

Answer:

    saber

versus:

    to know a person

Answer:

    conocer

---

# 18. Dataset Storage

For initial development:

    vocabulary.json

is acceptable.

Example:

    assets/
        vocabulary.json

However, for a large vocabulary database, SQLite is preferable.

Recommended eventual architecture:

    assets/
        vocabulary.db

Benefits:

- indexed queries
- fast filtering
- random vocabulary selection
- CEFR filtering
- frequency filtering
- progress joins
- less memory usage
- no need to load one enormous JSON file

---

# 19. Recommended SQLite Schema

## vocabulary

    id
    spanish
    part_of_speech
    gender
    frequency
    frequency_rank
    cefr

## translations

    id
    vocabulary_id
    english
    priority

## word_forms

    id
    vocabulary_id
    form
    form_type

## examples

    id
    vocabulary_id
    spanish
    english

This is preferable to storing everything as serialized JSON inside SQLite.

---

# 20. User Progress Must Be Separate

Do NOT modify dictionary entries to represent user progress.

Dictionary data:

    vocabulary
    translations
    examples
    forms

User data:

    user_vocabulary_progress

Example:

    vocabulary_id
    seen_count
    correct_count
    incorrect_count
    streak
    mastery
    last_seen
    next_review

This allows the dictionary database to be regenerated without destroying learning progress.

---

# 21. Future Spaced Repetition

Design progress storage so that spaced repetition can be added later.

Possible fields:

    vocabulary_id
    repetitions
    correct_count
    incorrect_count
    difficulty
    interval
    last_review
    next_review

Later the application can implement:

- SM-2
- FSRS
- another spaced-repetition algorithm

This does not need to be implemented during the vocabulary-import phase.

---

# 22. Import Pipeline

Create a separate project/script:

    tools/
        vocabulary-import/

Suggested structure:

    vocabulary-import/
        src/
            loaders/
                doozan.ts
                cefr.ts

            normalization/
                spanish.ts
                english.ts

            merge/
                vocabulary.ts
                cefr.ts
                sentences.ts

            validation/
                validate.ts

            output/
                json.ts
                sqlite.ts

            index.ts

---

# 23. Pipeline Steps

## Step 1 — Download Sources

Download/pin specific versions of:

    Doozan spanish_data
    CEFR vocabulary dataset

Do not automatically depend on the latest upstream data during every mobile build.

Pin versions so builds are reproducible.

---

## Step 2 — Parse Doozan

Extract:

- lemmas
- definitions/translations
- POS
- frequency
- forms
- sentences

Convert them into an intermediate internal model.

---

## Step 3 — Normalize

Normalize Spanish keys.

Example:

    " Comer " → "comer"

But preserve linguistically meaningful characters:

    á
    é
    í
    ó
    ú
    ü
    ñ

Never normalize:

    él

into:

    el

---

## Step 4 — Merge Dictionary Entries

Combine compatible dictionary records.

Deduplicate identical English translations.

Example:

Input:

    comer → eat
    comer → to eat
    comer → eat

Output:

    comer → [
        "eat",
        "to eat"
    ]

---

## Step 5 — Attach Frequency

Map Doozan frequency information to each lemma.

Generate:

    frequencyRank

where useful.

---

## Step 6 — Attach CEFR

Attempt:

    lemma + POS

matching first.

If that fails, optionally attempt controlled fallback matching.

Record every fallback match so it can be inspected.

---

## Step 7 — Attach Forms

Associate inflected forms with their lemma.

Deduplicate forms.

---

## Step 8 — Attach Examples

Associate sentence pairs with vocabulary.

Limit the number included in the mobile dataset.

Prefer short, clear examples where possible.

---

## Step 9 — Validate

Validation should detect:

- missing Spanish lemma
- missing English translation
- invalid CEFR
- invalid POS
- duplicate entries
- duplicate translations
- invalid Unicode
- suspicious CEFR mappings
- words without frequency data
- words without examples

Not all warnings need to reject an entry.

---

## Step 10 — Generate Statistics

Produce:

    vocabulary-stats.json

Example:

    {
        "totalWords": 23142,
        "A1": 842,
        "A2": 1311,
        "B1": 2240,
        "B2": 3170,
        "unclassified": 15579,
        "withExamples": 18920,
        "withFrequency": 22481
    }

Also produce a human-readable import report.

---

## Step 11 — Generate Mobile Database

Final output:

    vocabulary.db

Optionally also generate:

    vocabulary.json

for debugging.

The JSON version is useful for inspecting data during development even if production uses SQLite.

---

# 24. Dataset Versioning

Store metadata with the generated database.

Example:

    dataset_version: 1
    generated_at: 2026-09-22
    doozan_version: <git commit>
    cefr_version: <git commit>

This makes vocabulary changes reproducible and debuggable.

---

# 25. App Architecture

Keep three concerns separate.

    ┌─────────────────────┐
    │ Vocabulary Database │
    │                     │
    │ words               │
    │ translations        │
    │ examples            │
    │ forms               │
    └──────────┬──────────┘
               │
               ▼
    ┌─────────────────────┐
    │ Learning Engine     │
    │                     │
    │ select word         │
    │ generate question   │
    │ check answer        │
    │ difficulty          │
    └──────────┬──────────┘
               │
               ▼
    ┌─────────────────────┐
    │ User Progress       │
    │                     │
    │ mastery             │
    │ history             │
    │ review scheduling   │
    └─────────────────────┘

The dictionary should know nothing about the learner.

The learning engine should decide what vocabulary to show.

---

# 26. Initial Learning Algorithm

For V1, keep selection simple.

User selects:

    A1

Candidate vocabulary:

    WHERE cefr = 'A1'

Order primarily by:

    frequency_rank

Then gradually introduce new words.

Example progression:

    first 100 A1 words
    next 100 A1 words
    ...
    A2
    B1
    B2

Later replace this with spaced repetition.

---

# 27. Exercise Types

The data model should allow several exercises without changing the dictionary.

## Spanish → English

    casa

    ?

    house

## English → Spanish

    house

    ?

    casa

## Multiple Choice

    comer

    A. sleep
    B. eat
    C. walk
    D. drink

## Sentence Recognition

    Quiero comer.

    What does "comer" mean?

## Fill the Word

    Quiero ___ una pizza.

    comer

## Lemma Recognition

    comiendo

    Base form?

    comer

These can all use the same vocabulary database.

---

# 28. Important Data Quality Rules

## Never assume translation is 1:1

Bad:

    llevar = carry

Better:

    llevar = [
        carry,
        take,
        bring,
        wear
    ]

## Never remove accents

Bad:

    sí → si

## Keep lemma and forms separate

Bad:

    como
    comes
    comemos

as three unrelated vocabulary words.

Good:

    comer
      ├── como
      ├── comes
      └── comemos

## Do not trust CEFR blindly

CEFR is enrichment metadata.

Doozan remains the main vocabulary dataset.

## Keep user state outside dictionary data

The vocabulary dataset should be replaceable/upgradable.

---

# 29. V1 Scope

V1 should contain:

- Doozan vocabulary
- English translations
- lemmas
- parts of speech
- frequency
- frequency ranking
- CEFR A1–B2 enrichment
- noun gender where available
- basic word forms
- 1–3 example sentences where available
- SQLite output
- JSON debug output
- import statistics
- Spanish → English mode
- English → Spanish mode
- basic user progress

Do NOT overcomplicate V1 with:

- AI-generated translations
- automatic C1/C2 classification
- complete conjugation generation
- pronunciation scoring
- speech recognition
- complex NLP
- automatic sentence generation

Those can be added after the core vocabulary loop works.

---

# 30. Phase 2

After V1 works:

- FSRS spaced repetition
- C1/C2 vocabulary
- verb conjugation exercises
- article/gender exercises
- synonyms
- antonyms
- pronunciation/audio
- listening exercises
- contextual translations
- phrase vocabulary
- idioms
- user-created vocabulary
- custom vocabulary packs
- cloud progress synchronization

---

# 31. Recommended Final Data Flow

    Doozan
       │
       ├──────────────┐
       │              │
       ▼              │
    Vocabulary        │
    Translation       │
    Frequency         │
    Forms             │
    Sentences         │
       │              │
       ▼              │
    Normalize         │
       │              │
       │       CEFR Dataset
       │              │
       └──────┬───────┘
              ▼
            Merge
              │
              ▼
           Validate
              │
              ▼
            Rank
              │
              ▼
        ┌─────────────┐
        │             │
        ▼             ▼
    vocabulary.db  vocabulary.json
        │
        ▼
    React Native
        │
        ├── Spanish → English
        ├── English → Spanish
        ├── CEFR progression
        ├── frequency progression
        └── user progress / SRS

---

# 32. Implementation Order

1. Clone/pin Doozan dataset.
2. Inspect exact source file formats.
3. Build Doozan parser.
4. Produce normalized vocabulary entries.
5. Add translations.
6. Add POS.
7. Add frequency/rank.
8. Add forms.
9. Import CEFR dataset.
10. Implement lemma + POS CEFR matching.
11. Generate matching/conflict report.
12. Add sentence examples.
13. Add validation.
14. Generate `vocabulary.json`.
15. Inspect dataset manually.
16. Generate `vocabulary.db`.
17. Integrate SQLite into React Native.
18. Implement Spanish → English.
19. Implement English → Spanish.
20. Add progress tracking.
21. Add frequency/CEFR progression.
22. Add spaced repetition later.

---

# 33. Core Principle

The final system should treat vocabulary as:

    Spanish lexical concept
          │
          ├── lemma
          ├── grammatical information
          ├── word forms
          ├── English meanings
          ├── frequency
          ├── CEFR difficulty
          └── examples

rather than treating vocabulary as:

    "Spanish string" = "English string"

That distinction will prevent a large number of problems once the application grows beyond basic flashcards.