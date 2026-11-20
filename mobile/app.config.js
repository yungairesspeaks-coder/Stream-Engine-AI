const base = require("./app.json").expo;

module.exports = {
  ...base,
  plugins: [
    ...(base.plugins || []).filter((plugin) =>
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
};
