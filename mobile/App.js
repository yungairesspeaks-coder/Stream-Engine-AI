import React, {useEffect, useRef, useState} from "react";
import {ActivityIndicator, Alert, BackHandler, Linking, SafeAreaView, StatusBar, Text, View} from "react-native";
import {WebView} from "react-native-webview";
import mobileAds, {AdEventType, RewardedAd, RewardedAdEventType, TestIds} from "react-native-google-mobile-ads";

const SITE_URL = "https://yung-aires-stream-engine-ai-production.up.railway.app/";
const USE_TEST_ADS = __DEV__ || process.env.EXPO_PUBLIC_ADMOB_TEST_ADS === "true";

export default function App() {
  const web = useRef(null);
  const adRef = useRef(null);
  const webLoaded = useRef(false);
  const pendingSpotifyReturn = useRef(false);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("Sign in to earn verified campaign credits.");

  useEffect(() => { mobileAds().initialize().then(() => setReady(true)).catch(() => setMessage("Google Mobile Ads could not initialize.")); }, []);
  useEffect(() => {
    const handleUrl = (url) => {
      if (!url || !url.startsWith("streamengineai://spotify-ads-connected")) return;
      const connected = url.includes("status=connected");
      setMessage(connected ? "Spotify Ads connected. Refreshing your workspace…" : "Spotify Ads connection failed. Check your Spotify Ads app setup and try again.");
      if (webLoaded.current) web.current?.injectJavaScript("window.location.replace('/?spotify_ads="+(connected?"connected":"error")+"'); true;");
      else pendingSpotifyReturn.current = true;
    };
    const sub = Linking.addEventListener("url", ({url}) => handleUrl(url));
    Linking.getInitialURL().then(handleUrl).catch(() => {});
    return () => sub.remove();
  }, []);
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
    const isTestMode = USE_TEST_ADS && data.testMode === true;
    if ((USE_TEST_ADS && !isTestMode) || (!USE_TEST_ADS && data.testMode)) {
      setMessage("Ad request mode does not match this app build."); return;
    }
    if (!isTestMode && (!data.customData || !data.userId || String(data.customData).length > 1500)) {
      setMessage("The reward session could not be validated. Sign in again."); return;
    }
    let adUnitId = TestIds.REWARDED;
    if (!USE_TEST_ADS) {
      try {
        const response = await fetch(SITE_URL + "api/rewards/admob-config");
        const config = await response.json();
        if (!response.ok || !config.enabled || !config.androidRewardedAdUnitId) throw new Error("Production AdMob rewarded unit is not configured in Railway.");
        adUnitId = config.androidRewardedAdUnitId;
      } catch (error) { setMessage(error.message || "AdMob configuration unavailable."); web.current?.injectJavaScript("window.location.reload(); true;"); return; }
    }
    setMessage("Loading a rewarded ad…");
    const ad = RewardedAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: true,
      ...(isTestMode ? {} : {serverSideVerificationOptions: {userId: String(data.userId), customData: String(data.customData)}})
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
      setMessage(isTestMode ? "Test ad completed. Preview ads do not issue campaign credits." : "Ad completed. Google is verifying your reward; credits appear after server confirmation.");
    });
    unsubClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
      if (closed) return;
      closed = true;
      setMessage(isTestMode ? (earned ? "Test ad completed. No credits are issued in preview." : "Test ad closed before completion.") : (earned ? "Reward verification pending. Refresh your wallet shortly." : "Ad closed before completion. No credits were earned."));
      cleanup();
      setTimeout(() => web.current?.injectJavaScript("window.location.reload(); true;"), 2500);
    });
    unsubError = ad.addAdEventListener(AdEventType.ERROR, (error) => {
      setMessage("Ad unavailable: " + (error?.message || "Please try again later."));
      cleanup();
      web.current?.injectJavaScript("window.location.reload(); true;");
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
      <WebView ref={web} source={{uri:SITE_URL}} onShouldStartLoadWithRequest={(request) => { if (request.url.startsWith("https://accounts.spotify.com/authorize")) { Linking.openURL(request.url).catch(() => setMessage("Could not open Spotify sign-in in your browser.")); return false; } return true; }} onLoadEnd={() => { webLoaded.current = true; web.current?.injectJavaScript("window.STREAM_ENGINE_ADMOB_TEST_MODE = "+(USE_TEST_ADS?"true":"false")+"; true;"); if (pendingSpotifyReturn.current) { pendingSpotifyReturn.current = false; web.current?.injectJavaScript("window.location.replace('/?spotify_ads=connected'); true;"); } }} onMessage={onWebMessage} javaScriptEnabled domStorageEnabled sharedCookiesEnabled thirdPartyCookiesEnabled allowsBackForwardNavigationGestures setSupportMultipleWindows={false} originWhitelist={["https://*"]} onError={() => Alert.alert("Connection issue","Could not load Stream Engine AI. Check your internet connection.")} style={{flex:1,backgroundColor:"#090b14"}} />
    </SafeAreaView>
  );
}
