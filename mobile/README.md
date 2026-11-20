# Stream Engine AI — Android app

This is an Android-only Expo native shell for the existing Stream Engine AI Railway app. It uses Google Mobile Ads rewarded video. The server issues a short-lived, account-bound custom-data token; AdMob calls the Railway SSV endpoint; the server verifies Google's ECDSA signature, timestamp, Android ad-unit/reward configuration, account binding, and unique transaction ID before writing campaign credits. A client-side ad event alone never credits the wallet.

## Development

```bash
cd mobile
npm install
npx expo prebuild
npx expo run:android
```

The development build uses Google's official test rewarded-ad unit. Never use test ads to generate real promotional credits.

## Required configuration

The Railway production environment needs:

- `ADMOB_ANDROID_REWARDED_AD_UNIT_ID` — exact Android rewarded ad unit ID
- `ADMOB_REWARD_ITEM=campaign_credits`
- `ADMOB_REWARD_AMOUNT=10` — must match the reward amount configured in AdMob
- `ADMOB_REWARD_CREDITS=10` — internal campaign credits granted per verified reward

The Android native build also requires `ADMOB_ANDROID_APP_ID` as an EAS build environment variable, because Google's App ID is embedded in the Android manifest at build time. Railway runtime variables are not automatically visible to the EAS build service. Do not substitute the rewarded ad unit ID for the App ID.

Configure the AdMob Android rewarded ad unit's Server-side verification callback URL as:

`https://yung-aires-stream-engine-ai-production.up.railway.app/webhooks/admob/reward`

Set the reward item to `campaign_credits` and amount to `10`, matching the Railway values above.

## Build

Link the Expo project to an EAS project, then set `ADMOB_ANDROID_APP_ID` in the EAS build environment and run:

```bash
npx eas-cli build --platform android --profile production
```

The native ads module does not run inside standard Expo Go; use a development build or prebuilt native app. Android signing/build credentials are required for a distributable APK/AAB. This repository change does not submit a Google Play listing.

Official AdMob SSV guide: https://developers.google.com/admob/android/ssv
