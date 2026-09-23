// Reanimated 4 runs animations on worklets, whose native module does not exist under Jest: use
// the libraries' own mocks.
jest.mock('react-native-worklets', () => require('react-native-worklets/src/mock'));
require('react-native-reanimated').setUpTests();

// AsyncStorage's official in-memory mock; tests clear it in beforeEach where they read it back.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
