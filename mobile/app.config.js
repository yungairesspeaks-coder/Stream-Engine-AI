const base = require("./app.json");
const plugins = (base.expo.plugins || []).filter(p => !(Array.isArray(p) && p[0] === "react-native-google-mobile-ads"));
plugins.push(["react-native-google-mobile-ads", {
  androidAppId: process.env.ADMOB_ANDROID_APP_ID || "ca-app-pub-3940256099942544~3347511713",
  iosAppId: process.env.ADMOB_IOS_APP_ID || "ca-app-pub-3940256099942544~1458002511"
}]);
module.exports = { ...base, expo: { ...base.expo, plugins } };
