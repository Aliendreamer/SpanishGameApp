## 1. Scaffold

- [x] 1.1 Generate the app in the scratchpad: `pnpm create expo-app SpanishGameApp --template default --no-agents-md` (SDK 57); confirm no `CLAUDE.md`, `AGENTS.md`, or `.claude/` was produced
- [x] 1.2 Move the generated files into the repo root without overwriting existing files; merge the template's `.gitignore` entries into ours
- [x] 1.3 Add `.nvmrc` (Node 24) and `.npmrc` with `save-exact=true` — note: SDK 57's generator wrote no `pnpm-workspace.yaml`, so pnpm's default isolated install is used (supported since SDK 54). Generating needed `EXPO_NO_TELEMETRY=1` — telemetry writes `~/.expo`, which the sandbox blocks
- [x] 1.4 Replace every `^`/`~` in `package.json` with the installed version; `pnpm install` and confirm the lockfile is unchanged apart from the specifiers

## 2. Test gate first (TDD)

- [x] 2.1 Install `jest-expo`, `jest`, `@types/jest`, `@testing-library/react-native` with `pnpm expo install --dev`; set the `jest-expo` preset and the pnpm `transformIgnorePatterns`; add `"jest"` to tsconfig `types`
- [x] 2.2 Write `src/screens/home/index.test.tsx` asserting the `Home` screen shows "SpanishGameApp" (tests stay out of routes-only `src/app`); run it and see it fail (no `Home` yet)
- [x] 2.3 Create `src/screens/home/index.tsx` rendering the title; make `src/app/index.tsx` render `<Home />`; see the test pass

## 3. Strip the template

- [x] 3.1 Delete the template's demo tabs, example components, hooks, constants, and the `reset-project` script; leave `src/app/_layout.tsx` and `src/app/index.tsx` only
- [x] 3.2 Create `src/components`, `src/hooks`, `src/utils` with `.gitkeep`
- [x] 3.3 Set `app.json`: name/slug `SpanishGameApp`, `platforms: ["android"]`, `android.package: "com.aliendreamer.spanishgameapp"`; remove iOS and web config
- [x] 3.4 Remove dependencies only the deleted demo used (`pnpm expo install --check` / `expo-doctor` to confirm nothing required was dropped); re-run tests

## 4. Remaining gates

- [x] 4.1 Run `pnpm expo lint` to generate the flat ESLint config; add `prettier`, `eslint-config-prettier`, `eslint-plugin-prettier` and wire `eslint-plugin-prettier/recommended`; add `.prettierrc`
- [x] 4.2 Add scripts: `typecheck` (`tsc --noEmit`), `lint`, `format`, `format:check`, `test` (`jest`, not watch), `check:pins` (`scripts/check-pins.js`, test-first), `expo:doctor` (`expo-doctor`; `pnpm doctor` is a pnpm built-in), `check` (all, fail-fast)
- [x] 4.3 Confirm `strict: true` and the `@/*` alias in `tsconfig.json`
- [x] 4.4 Prove `check` fails: introduce a type error, see `pnpm check` exit non-zero, revert
- [x] 4.5 Run `pnpm check` on the final tree — all green, output shown (agent runs it with `NODE_USE_ENV_PROXY=1 EXPO_NO_TELEMETRY=1`; 21/21 doctor checks pass)

## 5. Repo tooling and docs

- [x] 5.1 Install `audit-package-version` (`npx -y @aliendreamer/ai-skills add audit-package-version --agent claude --project --yes`) and run it — no ranges reported
- [x] 5.2 Add the Prettier PostToolUse hook to `.claude/settings.json` (setup-flow 2.3); pre-approve the Expo MCP read-only docs tools (`search_documentation`, `read_documentation`)
- [x] 5.3 Update `CLAUDE.md`: replace "Project status" with a Commands section (the real scripts, running one test with `pnpm test -- <path>`) and a pointer to the SDK 57 docs; update `openspec/config.yaml` `context:` with the stack

## 6. Verify

- [x] 6.1 `pnpm start`, open in Expo Go on the user's Android phone; user confirmed the placeholder screen shows. `start` now runs `expo start --tunnel`, with `@expo/ngrok` pinned as a devDependency so Expo does not install it with npm
