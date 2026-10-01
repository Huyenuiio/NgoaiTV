/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

jest.mock(
  'react-native-orientation-locker',
  () => ({
    lockToPortrait: jest.fn(),
    lockToLandscape: jest.fn(),
    unlockAllOrientations: jest.fn(),
  }),
  { virtual: true },
);

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
