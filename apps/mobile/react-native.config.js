// Exclude legacy native modules incompatible with Gradle 9+
// These are used via try/catch in JS and are optional
module.exports = {
  dependencies: {
    'react-native-bluetooth-escpos-printer': {
      platforms: {
        android: null, // exclude from Android autolinking
      },
    },
    'react-native-sunmi-inner-printer': {
      platforms: {
        android: null, // exclude from Android autolinking
      },
    },
  },
};
