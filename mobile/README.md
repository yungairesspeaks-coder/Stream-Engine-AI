# Stream Engine AI — Android app

Android-only Expo native shell for the Stream Engine AI Railway app. It uses Google Mobile Ads rewarded video. The server issues a short-lived, account-bound custom-data token; AdMob calls the Railway SSV endpoint; the server verifies Google's ECDSA signature, timestamp, Android ad-unit/reward configuration, account binding, and unique transaction ID before writing campaign credits. A client-side ad event alone never credits the wallet.

## EAS project setup (one time)

From this directory, with access to the Expo account that owns this app:

```bash
npm install
npx eas-cli@latest login
npx eas-cli@latest project:init
npx expo-doctor
```

The project initialization step links the app to an EAS project and writes its EAS project ID into the Expo config. Do not invent or manually reuse another app's EAS project ID.

## Build profiles

- `npm run build:android:preview` creates an installable internal-test APK.
- `npm run build:android` creates the production Android App Bundle (AAB).
- `npm run build:android:development` creates a development-client APK.

Production builds embed the AdMob Android App ID configured in `mobile/app.config.js`. The production app fetches the rewarded-ad unit from the public Railway config endpoint at runtime. The app ID is public configuration; never put Spotify client secrets, JWT secrets, or other server secrets in the mobile bundle.

## Rewarded ads

The Railway production environment needs:

- `ADMOB_ANDROID_APP_ID` — configured for the native Android manifest
- `ADMOB_ANDROID_REWARDED_AD_UNIT_ID` — exact Android rewarded ad unit ID
- `ADMOB_REWARD_ITEM=campaign_credits`
- `ADMOB_REWARD_AMOUNT=10` — must match the reward amount configured in AdMob
- `ADMOB_REWARD_CREDITS=10` — internal campaign credits granted per verified reward

Configure the AdMob Android rewarded ad unit's Server-side verification callback URL as:

`https://yung-aires-stream-engine-ai-production.up.railway.app/webhooks/admob/reward`

Set the reward item to `campaign_credits` and amount to `10`, matching the Railway values above.

The development app uses Google's official test rewarded-ad unit. Test ads never generate real promotional credits. For a production verification test, install a signed preview/production build on a physical Android device, use an AdMob-approved test device/test ad configuration first, and confirm that the Google SSV callback creates exactly one ledger credit. Replaying the same transaction must not add credits twice.

## Important limits

The native ads module does not run inside standard Expo Go; use an EAS development, preview, or production build. EAS account login and project linking are required before a cloud build can run. Android signing/build credentials are required for a distributable APK/AAB. This setup does not submit a Google Play listing.

Official AdMob SSV guide: https://developers.google.com/admob/android/ssv
