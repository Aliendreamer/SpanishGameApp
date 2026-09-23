// Reanimated 4 runs animations on worklets, whose native module does not exist under Jest: use
// the libraries' own mocks.
jest.mock('react-native-worklets', () => require('react-native-worklets/src/mock'));
require('react-native-reanimated').setUpTests();
