import React, {useEffect, useRef, useState} from "react";
import {ActivityIndicator, Alert, BackHandler, SafeAreaView, StatusBar, Text, View} from "react-native";
import {WebView} from "react-native-webview";
import mobileAds, {AdEventType, RewardedAd, RewardedAdEventType, TestIds} from "react-native-google-mobile-ads";

const SITE_URL = "https://yung-aires-stream-engine-ai-production.up.railway.app/";
const AD_UNIT_ID = TestIds.REWARDED;

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
    setMessage("Checking rewarded ad configuration…");
    let adUnitId = AD_UNIT_ID;
    if (!__DEV__) {
      try {
        const configResponse = await fetch(SITE_URL + "api/rewards/admob-config");
        if (!configResponse.ok) throw new Error("AdMob is not configured on the server.");
        const config = await configResponse.json();
        adUnitId = config.androidRewardedAdUnitId;
        if (!adUnitId) throw new Error("Android rewarded ad unit ID is missing in Railway variables.");
      } catch (error) { setMessage(error.message || "AdMob configuration unavailable."); return; }
    }
    setMessage("Loading a rewarded ad…");
    const ad = RewardedAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: true,
      serverSideVerificationOptions: {userId: String(data.userId), customData: String(data.customData)}
    });
    adRef.current = ad;
    let earned = false;
    const unsubLoaded = ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
      setMessage("Ad ready. Watch to completion to earn campaign credits.");
      ad.show().catch(() => setMessage("The ad could not be displayed. Please try again."));
    });
    const unsubEarned = ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
      earned = true;
      setMessage("Ad completed. Google is verifying your reward; credits appear after server confirmation.");
    });
    const unsubClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
      setMessage(earned ? "Reward verification pending. Refresh your wallet shortly." : "Ad closed before completion. No credits were earned.");
      unsubLoaded(); unsubEarned(); unsubClosed();
      setTimeout(() => web.current?.injectJavaScript("window.location.reload(); true;"), 2500);
      adRef.current = null;
    });
    const unsubError = ad.addAdEventListener(AdEventType.ERROR, (error) => {
      setMessage("Ad unavailable: " + (error?.message || "Please try again later."));
      unsubLoaded(); unsubEarned(); unsubClosed(); unsubError(); adRef.current = null;
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
      <WebView
        ref={web}
        source={{uri:SITE_URL}}
        onMessage={onWebMessage}
        javaScriptEnabled
        domStorageEnabled
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        allowsBackForwardNavigationGestures
        setSupportMultipleWindows={false}
        originWhitelist={["https://*"]}
        onError={() => Alert.alert("Connection issue","Could not load Stream Engine AI. Check your internet connection.")}
        style={{flex:1,backgroundColor:"#090b14"}}
      />
    </SafeAreaView>
  );
}
