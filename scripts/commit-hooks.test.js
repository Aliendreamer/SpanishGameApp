const { spawnSync } = require('child_process');
const path = require('path');

const { root, lines, readJSON } = require('./test-utils');

// Runs the real commitlint CLI with the repo's config, as the commit-msg hook does.
const commitlint = (message) =>
  spawnSync(path.join(root, 'node_modules/.bin/commitlint'), [], {
    cwd: root,
    input: message,
    encoding: 'utf8',
  });

describe('commit-msg hook', () => {
  test('runs commitlint on the message file', () => {
    expect(lines('.husky/commit-msg')).toEqual(['pnpm exec commitlint --edit "$1"']);
  });

  // Each case spawns the CLI (~0.6 s) and the suite runs on every commit, so keep these few: they
  // prove the config is loaded, not the Conventional Commits preset itself.
  test('accepts a Conventional Commit with scope and body', () => {
    expect(
      commitlint('feat(vocabulary-import): build vocabulary database\n\n- Add the tool').status,
    ).toBe(0);
  });

  test.each(['update stuff', 'Feat: add x'])('rejects %p', (message) => {
    // Exactly 1: commitlint's "problems found" code, not a missing binary or a crash.
    expect(commitlint(message).status).toBe(1);
  });
});

describe('pre-commit hook', () => {
  test('fixes staged files, then typechecks and tests the whole project', () => {
    expect(lines('.husky/pre-commit')).toEqual([
      'pnpm exec lint-staged',
      'pnpm typecheck',
      'pnpm test',
    ]);
  });

  test('lints and formats staged code, and formats other supported files', () => {
    expect(readJSON('package.json')['lint-staged']).toEqual({
      '*.{js,jsx,ts,tsx}': ['eslint --fix', 'prettier --write'],
      '!(*.{js,jsx,ts,tsx})': 'prettier --write --ignore-unknown',
    });
  });

  test('hooks are installed on pnpm install', () => {
    expect(readJSON('package.json').scripts.prepare).toBe('husky');
  });
});
