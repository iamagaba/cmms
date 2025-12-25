import 'react-native-gesture-handler/jestSetup';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock react-native-keychain
jest.mock('react-native-keychain', () => ({
  setInternetCredentials: jest.fn(() => Promise.resolve()),
  getInternetCredentials: jest.fn(() => Promise.resolve({username: 'test', password: 'test'})),
  resetInternetCredentials: jest.fn(() => Promise.resolve()),
  getSupportedBiometryType: jest.fn(() => Promise.resolve('FaceID')),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Mock react-native-maps
jest.mock('react-native-maps', () => {
  const {View} = require('react-native');
  const MockMapView = (props: any) => View(props);
  const MockMarker = (props: any) => View(props);
  return {
    __esModule: true,
    default: MockMapView,
    Marker: MockMarker,
  };
});

// Silence the warning: Animated: `useNativeDriver` is not supported
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');