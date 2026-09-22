const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const lines = (file) =>
  fs
    .readFileSync(path.join(root, file), 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));
const readJSON = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));

describe('.easignore', () => {
  test('keeps the signing credentials out of cloud uploads', () => {
    expect(lines('.easignore')).toEqual(
      expect.arrayContaining(['credentials.json', 'credentials/']),
    );
  });

  test('repeats .gitignore in order, since EAS uses it instead of .gitignore', () => {
    // Order matters: negations such as !credentials/**/*.jks only apply to earlier rules.
    expect(lines('.easignore').join('\n')).toContain(lines('.gitignore').join('\n'));
  });
});

describe('app config', () => {
  // @expo/config is a dependency of expo, not of the app, so resolve it through expo.
  const { getConfig } = require(
    require.resolve('@expo/config', { paths: [require.resolve('expo/package.json')] }),
  );
  const { exp } = getConfig(root, { skipSDKVersionRequirement: true });
  const plugin = (name) =>
    exp.plugins.find((entry) => (Array.isArray(entry) ? entry[0] : entry) === name);

  test('compiles against and targets Android 16 (API 36)', () => {
    expect(plugin('expo-build-properties')).toEqual([
      'expo-build-properties',
      { android: expect.objectContaining({ compileSdkVersion: 36, targetSdkVersion: 36 }) },
    ]);
  });

  test('includes the development client', () => {
    expect(plugin('expo-dev-client')).toBeDefined();
  });
});

describe('eas.json', () => {
  const read = () => readJSON('eas.json');

  test('lets EAS own the version code', () => {
    expect(read().cli).toEqual(expect.objectContaining({ appVersionSource: 'remote' }));
  });

  test('development is a dev-client APK', () => {
    expect(read().build.development).toEqual(
      expect.objectContaining({ developmentClient: true, android: { buildType: 'apk' } }),
    );
  });

  test('preview is a release APK', () => {
    const { preview } = read().build;
    expect(preview.android).toEqual({ buildType: 'apk' });
    expect(preview.developmentClient).toBeUndefined();
  });

  test('production is an auto-incremented app bundle', () => {
    expect(read().build.production).toEqual(
      expect.objectContaining({ autoIncrement: true, android: { buildType: 'app-bundle' } }),
    );
  });
});

describe('build scripts', () => {
  const { scripts, devDependencies } = readJSON('package.json');

  test('runs a pinned eas-cli through pnpm dlx, not as a project dependency', () => {
    expect(scripts.eas).toMatch(/^pnpm dlx eas-cli@\d+\.\d+\.\d+$/);
    expect(devDependencies['eas-cli']).toBeUndefined();
  });

  test.each([
    ['development', 'apk'],
    ['preview', 'apk'],
    ['production', 'aab'],
  ])('%s builds on EAS, EAS local, and Gradle', (profile, extension) => {
    expect(scripts[`build:${profile}`]).toBe(`pnpm eas build -p android --profile ${profile}`);
    expect(scripts[`build:${profile}:local`]).toBe(
      `pnpm eas build -p android --profile ${profile} --local --output build/${profile}.${extension}`,
    );
    expect(scripts[`build:${profile}:gradle`]).toBe(`scripts/build-gradle.sh ${profile}`);
  });
});

describe('toolchain versions', () => {
  const pkg = readJSON('package.json');
  const eas = readJSON('eas.json');

  test('EAS builds with the same pnpm and Node as local development', () => {
    expect(pkg.packageManager).toMatch(/^pnpm@\d+\.\d+\.\d+(\+sha512\.[0-9a-f]+)?$/);
    expect(eas.build.base).toEqual(
      expect.objectContaining({
        pnpm: pkg.packageManager.replace(/^pnpm@|\+.*$/g, ''),
        node: expect.stringMatching(
          new RegExp(`^${fs.readFileSync(path.join(root, '.nvmrc'), 'utf8').trim()}\\.`),
        ),
      }),
    );
  });

  test.each(['development', 'preview', 'production'])('%s extends the base profile', (profile) => {
    expect(eas.build[profile].extends).toBe('base');
  });

  test('pnpm settings live in pnpm-workspace.yaml, which pnpm 11 still reads', () => {
    expect(pkg.pnpm).toBeUndefined();
    expect(fs.readFileSync(path.join(root, 'pnpm-workspace.yaml'), 'utf8')).toMatch(
      /overrides:\n(\s+#.*\n)*\s+test-renderer: 1\.2\.0/,
    );
  });
});

describe('signing key backup', () => {
  const { execFileSync } = require('child_process');
  const ignoredByGit = (file) => {
    try {
      execFileSync('git', ['check-ignore', '--no-index', '-q', file], { cwd: root });
      return true;
    } catch {
      return false;
    }
  };

  test.each(['credentials.json', 'credentials/android/keystore.jks'])(
    '%s is committed (encrypted), not git-ignored',
    (file) => {
      expect(ignoredByGit(file)).toBe(false);
    },
  );

  test('generated native folders stay ignored', () => {
    expect(ignoredByGit('android/app/build.gradle')).toBe(true);
    expect(ignoredByGit('ios/Podfile')).toBe(true);
  });
});

describe('EAS upload filter', () => {
  // EAS reads .easignore with the same `ignore` package ESLint uses.
  const ignore = require(
    require.resolve('ignore', { paths: [require.resolve('eslint/package.json')] }),
  );
  const easignore = ignore().add(fs.readFileSync(path.join(root, '.easignore'), 'utf8'));

  test.each(['credentials.json', 'credentials/android/keystore.jks'])(
    '%s is never uploaded',
    (file) => {
      expect(easignore.ignores(file)).toBe(true);
    },
  );

  test('app source is uploaded', () => {
    expect(easignore.ignores('src/app/index.tsx')).toBe(false);
  });
});
