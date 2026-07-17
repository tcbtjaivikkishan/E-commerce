import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";

const GREEN_PRIMARY = "#196F1B";

// JS injected into the page to strip heavy non-essential elements and speed up render
const INJECTED_JS = `
(function() {
  // Hide Zoho branding bar / footer to reduce paint time
  var style = document.createElement('style');
  style.textContent = \`
    .zf-powered, .zf-termsContainer, .zf-tempContDiv .zf-descriptionDetails,
    .zf-tempContDiv .zf-prgBar { display: none !important; }
    body { -webkit-overflow-scrolling: touch; }
  \`;
  document.head.appendChild(style);

  // Signal React Native when DOM is interactive (faster than onLoadEnd)
  window.ReactNativeWebView.postMessage('DOM_READY');
})();
true;
`;

export default function ZohoFormScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ url: string; title: string }>();
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const webViewRef = useRef<WebView>(null);

  const url =
    params.url ||
    "https://forms.zohopublic.in/tcbtjaivikkisan1/form/LearnOrganicFarming/formperma/BvAhyL6jdGoyyx3enkffbqJEyHbjeKL19hCMKzCSqDA";
  const title = params.title || "TCBT Education";

  const hideLoader = () => {
    if (!loading) return;
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setLoading(false));
  };

  const handleMessage = (event: any) => {
    if (event.nativeEvent.data === "DOM_READY") {
      hideLoader();
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={GREEN_PRIMARY} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => webViewRef.current?.reload()}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* WebView */}
      <View style={styles.webViewWrap}>
        <WebView
          ref={webViewRef}
          source={{ uri: url }}
          style={styles.webView}
          onLoadEnd={hideLoader}
          onMessage={handleMessage}
          // ── Performance optimizations ──
          javaScriptEnabled
          domStorageEnabled
          cacheEnabled
          cacheMode="LOAD_CACHE_ELSE_NETWORK"
          thirdPartyCookiesEnabled
          allowsInlineMediaPlayback
          injectedJavaScript={INJECTED_JS}
          // Android-specific speed boosts
          androidLayerType="hardware"
          setSupportMultipleWindows={false}
          overScrollMode="never"
          // iOS-specific
          allowsBackForwardNavigationGestures
          contentMode="mobile"
          // Reduce initial white flash
          {...(Platform.OS === "android" && {
            androidHardwareAccelerationDisabled: false,
          })}
        />
        {loading && (
          <Animated.View style={[styles.loaderOverlay, { opacity: fadeAnim }]}>
            <View style={styles.loaderCard}>
              <ActivityIndicator size="large" color={GREEN_PRIMARY} />
              <Text style={styles.loaderText}>Loading form...</Text>
              <Text style={styles.loaderHint}>
                This may take a moment on slower connections
              </Text>
            </View>
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GREEN_PRIMARY,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: GREEN_PRIMARY,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },
  webViewWrap: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
  },
  webView: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#f9fdf9",
    alignItems: "center",
    justifyContent: "center",
  },
  loaderCard: {
    alignItems: "center",
    padding: 32,
  },
  loaderText: {
    marginTop: 16,
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  loaderHint: {
    marginTop: 6,
    fontSize: 12,
    color: "#999",
  },
});
