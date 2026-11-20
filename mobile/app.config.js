const base = require("./app.json");

module.exports = async () => {
  let androidAppId = process.env.ADMOB_ANDROID_APP_ID;
  if (!androidAppId) {
    const response = await fetch("https://yung-aires-stream-engine-ai-production.up.railway.app/api/rewards/admob-config");
    if (!response.ok) throw new Error("Unable to retrieve Android AdMob App ID from Railway.");
    const settings = await response.json();
    androidAppId = settings.androidAppId;
  }
  if (!androidAppId) {
    throw new Error("Missing Railway variable ADMOB_ANDROID_APP_ID. Set it before building the Android app.");
  }
  return {
    ...base,
    expo: {
      ...base.expo,
      plugins: [["react-native-google-mobile-ads", { androidAppId }]]
    }
  };
};
