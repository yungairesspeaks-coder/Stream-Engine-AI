const base = require("./app.json");
module.exports = { ...base, expo: { ...base.expo, plugins: [["react-native-google-mobile-ads", { androidAppId: process.env.ADMOB_ANDROID_APP_ID || "ca-app-pub-3940256099942544~3347511713" }]] } };
