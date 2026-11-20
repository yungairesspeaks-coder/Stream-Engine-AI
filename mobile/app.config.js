module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...(config.extra || {}),
    eas: {
      ...(config.extra?.eas || {}),
      projectId: "fe885d49-2229-46f4-9f5f-a29bed5fa2d6"
    }
  },
  plugins: [
    ...(config.plugins || []).filter((plugin) =>
      (Array.isArray(plugin) ? plugin[0] : plugin) !== "react-native-google-mobile-ads"
    ),
    [
      "react-native-google-mobile-ads",
      {
        androidAppId:
          process.env.ADMOB_ANDROID_APP_ID ||
          "ca-app-pub-8508936047453780~9669009320"
      }
    ]
  ]
});
