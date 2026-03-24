/** @type {Detox.DetoxConfig} */
module.exports = {
  testRunner: {
    args: {
      config: 'e2e/jest.config.js',
      testEnvironment: 'node',
    },
    jest: {
      setupTimeout: 120000,
    },
  },
  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/RAOS.app',
      build:
        'xcodebuild -workspace ios/RAOS.xcworkspace -scheme RAOS -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build',
    },
    'ios.release': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Release-iphonesimulator/RAOS.app',
      build:
        'xcodebuild -workspace ios/RAOS.xcworkspace -scheme RAOS -configuration Release -sdk iphonesimulator -derivedDataPath ios/build',
    },
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 16',
      },
    },
  },
  configurations: {
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.debug',
    },
    'ios.sim.release': {
      device: 'simulator',
      app: 'ios.release',
    },
  },
};
