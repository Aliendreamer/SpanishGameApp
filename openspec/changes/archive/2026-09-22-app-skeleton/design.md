## Context

Empty repo apart from agent tooling, OpenSpec, and `VOCABLARIRY_SOURCES.md`. The machine is
WSL2 with Node 24 and pnpm 10; there is no JDK or Android SDK, so development runs through
**Expo Go** on the user's Android phone until step 2 adds native builds. Current Expo SDK is 57.

## Goals / Non-Goals

**Goals:**

- A minimal Expo Router app that opens in Expo Go on Android and shows one placeholder screen.
- Folder layout ready for the game UI (step 4) without further restructuring.
- Gates that `developer-flow` can discover and run: `typecheck`, `lint`, `format:check`, `test`,
  `check:pins`, `expo:doctor`, and `check` (all of them).
- Reproducible installs: exact versions, committed lockfile, pinned Node version.

**Non-Goals:**

- Native builds, `eas.json`, signing (step 2).
- Vocabulary data or the import tool (step 3).
- Any game screens, theme, or design system (step 4).
- CI pipelines — gates are local scripts for now.

## Decisions

**Scaffold with `create-expo-app` (default template), then strip the demo.**
The default template already wires TypeScript, Expo Router, `src/app`, and the `@/*` alias for
SDK 57. Alternative — `blank-typescript` plus adding Expo Router by hand — reproduces the same setup
with more room for mistakes. The repo root is not empty, so the app is generated in a scratch
directory with `pnpm create expo-app --template default --no-agents-md` and its files moved in.
`--no-agents-md` is required: without it the generator writes its own `CLAUDE.md`, `AGENTS.md`,
and `.claude/settings.json` over ours. The one useful thing that output carries — a pointer to the
docs for the project's SDK version — is added to our `CLAUDE.md` by hand. The template's example
tabs, components, and reset script are deleted, not kept "for reference".

**Expo guidance comes from the official sources.** Version-specific decisions are checked against
the Expo MCP docs tools (`search_documentation` / `read_documentation`, SDK 57 pages) and the
official Expo skills plugin; both are enabled for this repo, and the read-only docs tools are
pre-approved in `.claude/settings.json`.

**Layout per Expo's project-structure guidance.**

```text
src/
  app/          routes only — _layout.tsx, index.tsx (placeholder)
  components/   reusable UI (empty for now)
  screens/      screen bodies rendered by routes
  hooks/        reusable hooks
  utils/        standalone helpers, tests colocated
assets/         icon, splash
```

Empty folders carry a `.gitkeep` so the structure exists before step 4 fills it. Tests sit next to
the file they test (`index.test.tsx`), not in `__tests__/`.

**Android only.** `app.json` sets `platforms: ["android"]` and
`android.package: "com.aliendreamer.spanishgameapp"` (the package ID is permanent once published —
change it at review time if needed). iOS and web config from the template are removed.

**pnpm with a hoisted node_modules.** pnpm is already installed. `create-expo-app` with pnpm writes
`nodeLinker: hoisted` to `pnpm-workspace.yaml`; we keep that default. SDK 54+ also supports
isolated installs, but hoisted is the path Expo generates and tests. Alternative — npm — works but
gives a slower, larger install for no benefit here.

**Exact versions.** `.npmrc` sets `save-exact=true`; after scaffolding, every `^`/`~` in
`package.json` is replaced by the installed version. Expo packages are added with
`npx expo install` so they match SDK 57. `.nvmrc` pins Node 24.

**Gates.**

| Script | Tool |
|---|---|
| `typecheck` | `tsc --noEmit`, `strict: true` |
| `lint` | `expo lint` — flat config from `eslint-config-expo` + `eslint-config-prettier` (turns off rules that fight Prettier; Prettier itself runs once, in `format:check`) |
| `format` / `format:check` | `prettier --write .` / `prettier --check .`, scoped by `.prettierignore` |
| `test` | Jest (`jest-expo` preset, pnpm `transformIgnorePatterns` from the Expo docs) + `@testing-library/react-native` |
| `check:pins` | `scripts/check-pins.js` — fails on any non-exact version; `expo install` / `expo lint` write `~`/`^` regardless of `.npmrc` |
| `expo:doctor` | `expo-doctor` (not `doctor`: `pnpm doctor` is a pnpm built-in that shadows scripts) |
| `check` | runs all of the above in sequence, failing on the first error |

**First test drives the placeholder.** A render test for the index route asserts the app title is
shown; it is written and seen failing before the placeholder screen exists (TDD).

**Repo tooling that waited for `package.json`.** After the scaffold: install the
`audit-package-version` skill, add the Prettier PostToolUse hook to `.claude/settings.json`, and
add a Commands section to `CLAUDE.md` with the real scripts.

**Transitive pin via `pnpm.overrides`.** `@testing-library/react-native` 14 pulls `test-renderer`
1.3.0, which needs React 19.3; React Native 0.86 ships 19.2.3. `pnpm.overrides` pins
`test-renderer` to 1.2.0 (React 19.2-compatible) without listing it as a direct dependency. Remove
the override once React Native moves to React 19.3.

## Risks / Trade-offs

- [Phone can't reach the dev server from WSL2] → `pnpm start` runs `expo start --tunnel` (a
  third-party relay; development only). `@expo/ngrok` is a pinned devDependency, otherwise Expo
  installs it on first use with npm, outside pnpm.
- [Sandbox blocks package downloads] → the sandbox already allows the npm registry; if Expo's
  own endpoints are needed during install, surface the blocked host rather than bypass it.
- [Template differs from what this design expects on SDK 57] → follow the template's actual
  layout where it disagrees, and note the difference in the task.
- [`expo-doctor` needs network] → if blocked in the sandbox, run it outside and record the result;
  it stays in `check`.
