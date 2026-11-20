import React, {useEffect, useRef, useState} from "react";
import {ActivityIndicator, Alert, BackHandler, SafeAreaView, StatusBar, Text, View} from "react-native";
import Constants from "expo-constants";
import {WebView} from "react-native-webview";
import mobileAds, {AdEventType, RewardedAd, RewardedAdEventType, TestIds} from "react-native-google-mobile-ads";

const SITE_URL = "https://yung-aires-stream-engine-ai-production.up.railway.app/";
const AD_UNIT_ID = __DEV__ ? TestIds.REWARDED : Constants.expoConfig?.extra?.androidRewardedAdUnitId;

export default function App() {
  const web = useRef(null);
  const adRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("Sign in to earn verified campaign credits.");

  useEffect(() => { mobileAds().initialize().then(() => setReady(true)).catch(() => setMessage("Google Mobile Ads could not initialize.")); }, []);
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (web.current) { web.current.goBack(); return true; }
      return false;
    });
    return () => sub.remove();
  }, []);

  const onWebMessage = async (event) => {
    let data;
    try { data = JSON.parse(event.nativeEvent.data); } catch { return; }
    if (data?.type !== "SHOW_ADMOB_REWARDED") return;
    if (!ready) { setMessage("Ad service is still starting. Try again in a moment."); return; }
    if (!data.customData || !data.userId || String(data.customData).length > 1500) {
      setMessage("The reward session could not be validated. Sign in again."); return;
    }
    if (!AD_UNIT_ID) { setMessage("Production rewarded-ad unit is missing. Configure ADMOB_ANDROID_REWARDED_AD_UNIT_ID in the Android EAS build environment."); return; }
    setMessage("Loading a rewarded ad…");
    const ad = RewardedAd.createForAdRequest(AD_UNIT_ID, {
      requestNonPersonalizedAdsOnly: true,
      serverSideVerificationOptions: {userId: String(data.userId), customData: String(data.customData)}
    });
    adRef.current = ad;
    let earned = false;
    let closed = false;
    let unsubLoaded = () => {};
    let unsubEarned = () => {};
    let unsubClosed = () => {};
    let unsubError = () => {};
    const cleanup = () => { unsubLoaded(); unsubEarned(); unsubClosed(); unsubError(); adRef.current = null; };
    unsubLoaded = ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
      setMessage("Ad ready. Watch to completion to earn campaign credits.");
      ad.show().catch(() => { setMessage("The ad could not be displayed. Please try again."); cleanup(); });
    });
    unsubEarned = ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
      earned = true;
      setMessage("Ad completed. Google is verifying your reward; credits appear after server confirmation.");
    });
    unsubClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
      if (closed) return;
      closed = true;
      setMessage(earned ? "Reward verification pending. Refresh your wallet shortly." : "Ad closed before completion. No credits were earned.");
      cleanup();
      setTimeout(() => web.current?.injectJavaScript("window.location.reload(); true;"), 2500);
    });
    unsubError = ad.addAdEventListener(AdEventType.ERROR, (error) => {
      setMessage("Ad unavailable: " + (error?.message || "Please try again later."));
      cleanup();
    });
    ad.load();
  };

  return (
    <SafeAreaView style={{flex:1,backgroundColor:"#090b14"}}>
      <StatusBar barStyle="light-content" backgroundColor="#090b14" />
      <View style={{paddingHorizontal:14,paddingVertical:8,backgroundColor:"#111827"}}>
        <Text style={{color:"#fff",fontWeight:"800",fontSize:15}}>STREAM ENGINE AI</Text>
        <Text accessibilityLiveRegion="polite" style={{color:"#a5b4fc",fontSize:12,marginTop:3}}>{message}</Text>
      </View>
      {!ready && <View style={{padding:6}}><ActivityIndicator color="#a5b4fc" /></View>}
      <WebView ref={web} source={{uri:SITE_URL}} onMessage={onWebMessage} javaScriptEnabled domStorageEnabled sharedCookiesEnabled thirdPartyCookiesEnabled allowsBackForwardNavigationGestures setSupportMultipleWindows={false} originWhitelist={["https://*"]} onError={() => Alert.alert("Connection issue","Could not load Stream Engine AI. Check your internet connection.")} style={{flex:1,backgroundColor:"#090b14"}} />
    </SafeAreaView>
  );
}
