const { findUnpinned } = require('./check-pins');

describe('findUnpinned', () => {
  test('accepts exact versions', () => {
    const pkg = { dependencies: { expo: '57.0.24' }, devDependencies: { jest: '29.7.0' } };

    expect(findUnpinned(pkg)).toEqual([]);
  });

  test('flags ranges, wildcards, and tags in both dependency groups', () => {
    const pkg = {
      dependencies: { a: '^1.0.0', b: '~2.1.0', c: '>=3', d: '*' },
      devDependencies: { e: 'latest', f: '1.x', g: '1.0.0 - 2.0.0' },
    };

    expect(findUnpinned(pkg)).toEqual([
      'dependencies.a: ^1.0.0',
      'dependencies.b: ~2.1.0',
      'dependencies.c: >=3',
      'dependencies.d: *',
      'devDependencies.e: latest',
      'devDependencies.f: 1.x',
      'devDependencies.g: 1.0.0 - 2.0.0',
    ]);
  });

  test('accepts exact prerelease versions', () => {
    expect(findUnpinned({ dependencies: { a: '14.0.0-rc.3' } })).toEqual([]);
  });
});
