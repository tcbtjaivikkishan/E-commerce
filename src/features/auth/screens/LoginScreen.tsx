import { loginSuccess } from "@/src/features/auth/store/userSlice";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch } from "react-redux";
import { sendOtp, verifyOtp } from "../services/auth.service";

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
export default function LoginScreen() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();
  const params = useLocalSearchParams<{ redirect?: string }>();

  const ROW_H = CARD_H + CARD_GAP;

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

  const handleVerifyOTP = async () => {
    if (otp.length < 6) {
      Alert.alert("Error", "Enter the 6-digit OTP");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await verifyOtp(phone, otp);
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
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* 4 scrolling rows */}
      <View>
        <ImageRow rowImages={images.slice(0, 5)} reverse={false} rowOpacity={1} />
        <ImageRow rowImages={images.slice(5, 10)} reverse={true} rowOpacity={1} />
        <ImageRow rowImages={images.slice(10, 15)} reverse={false} rowOpacity={1} />
        <ImageRow rowImages={images.slice(0, 5)} reverse={true} rowOpacity={0.75} />
      </View>

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

      {/* Bottom sheet */}
      <View style={styles.sheet}>
        <View style={styles.logoWrapper}>
          <View style={styles.logo} />
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
          </>
        ) : (
          <>
            <Text style={styles.otpHint}>Enter OTP sent to +91 {phone}</Text>
            <TextInput
              placeholder="- - - - - -"
              placeholderTextColor="#bbb"
              keyboardType="numeric"
              style={styles.otpInput}
              value={otp}
              onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, ""))}
              maxLength={6}
              autoComplete="off"
              autoCorrect={false}
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

            <TouchableOpacity onPress={() => { setStep("phone"); setOtp(""); setError(null); }}>
              <Text style={styles.changeNumber}>Change Number</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
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
    marginTop: -26,
  },
  logo: {
    width: 50,
    height: 50,
    backgroundColor: "#196F1B",
    borderRadius: 5,
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 28,
    paddingBottom: 32,
    flex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
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
    textAlign: "center",
    color: "#196F1B",
    marginTop: 12,
    fontSize: 14,
    fontWeight: "500",
  },
  altText: {
    textAlign: "center",
    fontSize: 12,
    color: "#196F1B",
    marginTop: 14,
  },
});
