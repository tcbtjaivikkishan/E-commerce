import { loginSuccess } from "@/src/features/auth/store/userSlice";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  Keyboard,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";
import { sendOtp, verifyOtp } from "../services/auth.service";
import { useOtpAutoRead } from "../hooks/useOtpAutoRead";

const { width } = Dimensions.get("window");

const SCALE = width / 375;
const CARD_W = Math.round(110 * SCALE);
const CARD_H = Math.round(121 * SCALE);
const CARD_GAP = Math.round(8 * SCALE);
const ITEM_WIDTH = CARD_W + CARD_GAP;

const images = [
  require("@/assets/images/product1.png"),
  require("@/assets/images/product2.png"),
  require("@/assets/images/product3.png"),
  require("@/assets/images/product4.png"),
  require("@/assets/images/product5.png"),
  require("@/assets/images/product6.png"),
  require("@/assets/images/product7.png"),
  require("@/assets/images/product8.png"),
  require("@/assets/images/product9.png"),
  require("@/assets/images/product10.png"),
  require("@/assets/images/product11.png"),
  require("@/assets/images/product13.png"),
  require("@/assets/images/product14.png"),
  require("@/assets/images/product15.png"),

];

// ─── Image Row ────────────────────────────────────────────────────────────────
const ImageRow = ({
  rowImages,
  reverse = false,
  rowOpacity = 1,
}: {
  rowImages: any[];
  reverse?: boolean;
  rowOpacity?: number;
}) => {
  const totalWidth = rowImages.length * ITEM_WIDTH;
  const translateX = useRef(
    new Animated.Value(reverse ? -totalWidth : 0)
  ).current;

  useEffect(() => {
    const animate = () => {
      translateX.setValue(reverse ? -totalWidth : 0);
      Animated.timing(translateX, {
        toValue: reverse ? 0 : -totalWidth,
        duration: 15000,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) animate();
      });
    };
    animate();
  }, []);

  const tripled = [...rowImages, ...rowImages, ...rowImages];

  return (
    <View style={{ height: CARD_H + CARD_GAP, overflow: "hidden", opacity: rowOpacity }}>
      <Animated.View style={{ flexDirection: "row", transform: [{ translateX }] }}>
        {tripled.map((img, i) => (
          <View
            key={i}
            style={{
              width: CARD_W,
              height: CARD_H,
              marginRight: CARD_GAP,
              marginVertical: CARD_GAP / 2,
              borderRadius: Math.round(25 * SCALE),
              backgroundColor: "#F7F9FA",
              alignItems: "center",
              justifyContent: "center",
              padding: 10,
            }}
          >
            <Image
              source={img}
              style={{ width: Math.round(63 * SCALE), height: Math.round(95 * SCALE) }}
              resizeMode="contain"
            />
          </View>
        ))}
      </Animated.View>
    </View>
  );
};

// Web only: remove autofill outline globally
if (typeof document !== "undefined") {
  const s = document.createElement("style");
  s.textContent = `input { outline: none !important; background: transparent !important; }`;
  document.head.appendChild(s);
}

// ─── Screen ───────────────────────────────────────────────────────────────────
const RESEND_COOLDOWN_SEC = 30;

export default function LoginScreen() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoDetecting, setAutoDetecting] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const dispatch = useDispatch();
  const params = useLocalSearchParams<{ redirect?: string }>();
  const verifyingRef = useRef(false);
  const otpInputRef = useRef<TextInput>(null);

  const ROW_H = CARD_H + CARD_GAP;

  // ── Auto-verify helper (shared by manual + auto-read) ────────────────────
  const doVerify = useCallback(
    async (code: string) => {
      if (verifyingRef.current || code.length < 6) return;
      verifyingRef.current = true;
      setLoading(true);
      setError(null);
      try {
        const response = await verifyOtp(phone, code);
        const { user, access_token, session_id } = response;

        dispatch(
          loginSuccess({
            phone: user.mobile_number,
            isLoggedIn: true,
            token: access_token,
            name: user.name,
            email: user.email,
            userId: user._id,
            sessionId: session_id,
            addresses: user.addresses,
          })
        );

        const redirect = (params.redirect as string) || "/home";
        router.replace(redirect as any);
      } catch (err: any) {
        const msg = err?.message || "Invalid OTP";
        Alert.alert("Verification Failed", msg);
        setError(msg);
      } finally {
        setLoading(false);
        verifyingRef.current = false;
      }
    },
    [phone, dispatch, params.redirect]
  );

  // ── Auto-OTP detection (Android SMS Retriever / iOS oneTimeCode) ─────────
  useOtpAutoRead({
    enabled: step === "otp",
    onOtpReceived: (code) => {
      setOtp(code);
      setAutoDetecting(false);
      // Auto-submit the detected OTP
      doVerify(code);
    },
  });

  // ── Resend countdown timer ───────────────────────────────────────────────
  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setInterval(() => {
      setResendTimer((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [resendTimer]);

  // Show auto-detecting state when OTP step starts (Android only)
  useEffect(() => {
    if (step === "otp" && Platform.OS === "android") {
      setAutoDetecting(true);
    } else {
      setAutoDetecting(false);
    }
  }, [step]);

  // ── Blinkit-style keyboard animation ─────────────────────────────────────
  const sheetTranslateY = useRef(new Animated.Value(0)).current;
  const imageRowsOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const onShow = Keyboard.addListener("keyboardDidShow", (e) => {
      const kbHeight = e.endCoordinates.height;
      Animated.parallel([
        Animated.timing(sheetTranslateY, {
          toValue: -kbHeight,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(imageRowsOpacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    });

    const onHide = Keyboard.addListener("keyboardDidHide", () => {
      Animated.parallel([
        Animated.timing(sheetTranslateY, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(imageRowsOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    });

    return () => {
      onShow.remove();
      onHide.remove();
    };
  }, []);

  const handleSendOtp = async () => {
    if (phone.length < 10) {
      Alert.alert("Error", "Enter a valid 10-digit phone number");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await sendOtp(phone);
      Alert.alert("OTP Sent", "Please check your phone for the OTP");
      setStep("otp");
      setResendTimer(RESEND_COOLDOWN_SEC);
    } catch (err: any) {
      const msg = err?.message || "Failed to send OTP";
      if (msg.toLowerCase().includes("rate") || msg.toLowerCase().includes("limit")) {
        Alert.alert("Too Many Requests", "Please wait before requesting another OTP");
      } else {
        Alert.alert("Error", msg);
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    setError(null);
    try {
      await sendOtp(phone);
      setResendTimer(RESEND_COOLDOWN_SEC);
      setOtp("");
      if (Platform.OS === "android") setAutoDetecting(true);
    } catch (err: any) {
      const msg = err?.message || "Failed to resend OTP";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length < 6) {
      Alert.alert("Error", "Enter the 6-digit OTP");
      return;
    }
    doVerify(otp);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* 3 scrolling rows — fades out smoothly when keyboard opens */}
      <Animated.View style={{ opacity: imageRowsOpacity }}>
        <ImageRow rowImages={images.slice(0, 5)} reverse={false} rowOpacity={1} />
        <ImageRow rowImages={images.slice(5, 10)} reverse={true} rowOpacity={1} />
        <ImageRow rowImages={images.slice(10, 15)} reverse={false} rowOpacity={1} />
      </Animated.View>

      {/* Fade gradient */}
      <LinearGradient
        colors={["transparent", "rgba(255,255,255,0.6)", "#ffffff"]}
        locations={[0, 0.5, 1]}
        style={{
          position: "absolute",
          top: ROW_H * 2,
          left: 0,
          right: 0,
          height: ROW_H * 2 + 10,
        }}
        pointerEvents="none"
      />

      {/* Bottom sheet — slides up exactly by keyboard height */}
      <Animated.View
        style={[
          styles.sheet,
          { transform: [{ translateY: sheetTranslateY }] },
        ]}
      >
        <View style={styles.logoWrapper}>
          <Image
            source={require("@/assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>India's Leading Organic Brand</Text>
        <Text style={styles.subtitle}>Log In or Sign Up</Text>

        {step === "phone" ? (
          <>
            <View style={styles.inputRow}>
              <Text style={styles.countryCode}>+91</Text>
              <TextInput
                placeholder="Enter phone number"
                placeholderTextColor="#bbb"
                keyboardType="numeric"
                style={styles.input}
                value={phone}
                onChangeText={(text) => setPhone(text.replace(/[^0-9]/g, ""))}
                maxLength={10}
                autoComplete="off"
                autoCorrect={false}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSendOtp}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Text style={styles.buttonText}>
                {loading ? "Sending..." : "Login"}
              </Text>
            </TouchableOpacity>

            <Text style={styles.termsText}>
              By continuing you agree to our{" "}
              <Text style={styles.termsLink}>Terms of Service</Text>
              {" "}and{" "}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.otpHint}>Enter OTP sent to +91 {phone}</Text>

            {/* Auto-detecting indicator (Android only) */}
            {autoDetecting && (
              <View style={styles.autoDetectBanner}>
                <Text style={styles.autoDetectText}>⏳ Waiting to auto-detect OTP…</Text>
              </View>
            )}

            <TextInput
              ref={otpInputRef}
              placeholder="- - - - - -"
              placeholderTextColor="#bbb"
              keyboardType="numeric"
              style={styles.otpInput}
              value={otp}
              onChangeText={(text) => {
                const cleaned = text.replace(/[^0-9]/g, "");
                setOtp(cleaned);
                // Auto-submit when 6 digits entered manually
                if (cleaned.length === 6) {
                  setAutoDetecting(false);
                  doVerify(cleaned);
                }
              }}
              maxLength={6}
              // iOS: enables "From Messages" auto-fill suggestion in keyboard bar
              textContentType="oneTimeCode"
              // Android: enables native SMS OTP auto-fill
              autoComplete={Platform.OS === "android" ? "sms-otp" : "one-time-code"}
              autoCorrect={false}
              autoFocus
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleVerifyOTP}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Text style={styles.buttonText}>
                {loading ? "Verifying..." : "Verify OTP"}
              </Text>
            </TouchableOpacity>

            {/* Resend + Change Number row */}
            <View style={styles.otpActionsRow}>
              <TouchableOpacity
                onPress={handleResendOtp}
                disabled={resendTimer > 0}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.resendText,
                  resendTimer > 0 && styles.resendTextDisabled,
                ]}>
                  {resendTimer > 0
                    ? `Resend OTP in ${resendTimer}s`
                    : "Resend OTP"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => { setStep("phone"); setOtp(""); setError(null); setAutoDetecting(false); }}>
                <Text style={styles.changeNumber}>Change Number</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  logoWrapper: {
    alignItems: "center",
    marginBottom: 14,
  },
  logo: {
    width: 90,
    height: 90,
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 32,
    flex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 0,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    color: "#000000",
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: "#999",
    textAlign: "center",
    marginTop: 2,
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#196F1B",
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 45,
    marginBottom: 14,
    backgroundColor: "#fff",
  },
  countryCode: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#111",
    backgroundColor: "transparent",
  },
  button: {
    backgroundColor: "#196F1B",
    height: 45,
    borderRadius: 10,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: "#5a9e5c",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  otpHint: {
    textAlign: "center",
    fontSize: 14,
    color: "#555",
    marginBottom: 14,
  },
  otpInput: {
    borderWidth: 1,
    borderColor: "#196F1B",
    borderRadius: 10,
    height: 50,
    textAlign: "center",
    fontSize: 28,
    letterSpacing: 12,
    marginBottom: 14,
    color: "#111",
    backgroundColor: "transparent",
  },
  changeNumber: {
    color: "#196F1B",
    fontSize: 14,
    fontWeight: "500",
  },
  altText: {
    textAlign: "center",
    fontSize: 12,
    color: "#196F1B",
    marginTop: 14,
  },
  termsText: {
    textAlign: "center",
    fontSize: 11,
    color: "#999",
    marginTop: 12,
    lineHeight: 16,
    paddingHorizontal: 8,
  },
  termsLink: {
    color: "#196F1B",
    fontWeight: "600",
  },
  autoDetectBanner: {
    backgroundColor: "#E8F5E9",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
    alignItems: "center",
  },
  autoDetectText: {
    color: "#2E7D32",
    fontSize: 12,
    fontWeight: "500",
  },
  otpActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
    paddingHorizontal: 4,
  },
  resendText: {
    color: "#196F1B",
    fontSize: 14,
    fontWeight: "500",
  },
  resendTextDisabled: {
    color: "#999",
  },
});
