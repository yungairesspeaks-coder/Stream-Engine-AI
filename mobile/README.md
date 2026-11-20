# Stream Engine AI — Android &  shell

This Expo native shell loads the existing Railway app and provides native Google Mobile Ads rewarded video. The server issues a short-lived, account-bound custom-data token; AdMob calls the Railway SSV endpoint; the server verifies Google's ECDSA signature, timestamp, ad-unit/reward configuration, account binding, and unique transaction ID before writing campaign credits. Client-side reward events never credit the wallet.

## Development

```bash
cd mobile
npm install
npx expo prebuild\nnpx expo run:android\n# On macOS with Xcode installed:\nnpx expo run:
```

The app uses Google's official test rewarded-ad unit while running in development. Test ads must remain enabled during development.

## Production configuration

Set these EAS environment variables before production builds:

- `ADMOB_ANDROID_APP_ID` — your Android AdMob App ID
- - `EXPO_PUBLIC_ADMOB_ANDROID_REWARDED_ID` — Android rewarded ad unit ID
- `EXPO_PUBLIC_ADMOB_IOS_REWARDED_ID` —  rewarded ad unit ID

Set the EAS build variables `ADMOB_ANDROID_APP_ID` and `ADMOB_IOS_APP_ID` to your real AdMob App IDs before production builds. The config plugin uses Google's sample test App IDs only as development defaults. Configure each AdMob rewarded ad unit's Server-side verification callback URL to:

`https://yung-aires-stream-engine-ai-production.up.railway.app/webhooks/admob/reward`

The ad unit reward item must be `campaign_credits` and reward amount must match Railway `ADMOB_REWARD_AMOUNT` (default 10). The amount of internal credits per completion is `ADMOB_REWARD_CREDITS` (default 10). Set Railway variables `ADMOB_ANDROID_REWARDED_AD_UNIT_ID` (the exact Android rewarded ad unit ID), `ADMOB_REWARD_ITEM=campaign_credits`, `ADMOB_REWARD_AMOUNT=10`, and `ADMOB_REWARD_CREDITS=10`.

AdMob SSV callbacks are verified against Google's published verifier keys. Do not grant credits based on the native client event alone. See Google's official SSV guide: https://developers.google.com/admob/android/next-gen/ssv

## Build

```bash
npx eas-cli build --platform android --profile production
npx eas-cli build --platform  --profile production
```

The native ads module does not run inside standard Expo Go; use a development build or prebuilt native app. An Apple Developer account and macOS/Xcode are required for  device builds and distribution. An Android package/signing setup and Google Play developer account are required to publish on Google Play. This repository change does not itself submit either store listing.
