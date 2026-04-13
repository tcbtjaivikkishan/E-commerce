import { router } from "expo-router";

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

const { width } = Dimensions.get("window");

/* 🔹 Images */

const images = [
  require("@/assets/image/product1.png"),

  require("@/assets/image/product2.png"),

  require("@/assets/image/product3.png"),

  require("@/assets/image/product4.png"),

  require("@/assets/image/product5.png"),

  require("@/assets/image/product6.png"),

  require("@/assets/image/product7.png"),

  require("@/assets/image/product8.png"),

  require("@/assets/image/product9.png"),

  require("@/assets/image/product10.png"),

  require("@/assets/image/product11.png"),

  require("@/assets/image/product13.png"),

  require("@/assets/image/product14.png"),

  require("@/assets/image/product15.png"),

  require("@/assets/image/product16.png"),
];

/* 🔹 Animated Row Component */

const ImageRow = ({ images, reverse = false }) => {
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(translateX, {
        toValue: reverse ? width : -width,

        duration: 12000,

        useNativeDriver: true,
      }),
    ).start();
  }, []);

  return (
    <View style={{ height: 110, overflow: "hidden" }}>
      <Animated.View
        style={{
          flexDirection: "row",

          transform: [{ translateX }],
        }}
      >
        {[...images, ...images].map((img, i) => (
          <Image
            key={i}
            source={img}
            style={styles.image}
            resizeMode="contain"
          />
        ))}
      </Animated.View>
    </View>
  );
};

export default function LoginScreen() {
  const [phone, setPhone] = useState("");

  const [otp, setOtp] = useState("");

  const [step, setStep] = useState("phone");

  const handleLogin = () => {
    if (phone.length < 10) {
      Alert.alert("Error", "Enter valid phone number");

      return;
    }

    Alert.alert("OTP Sent", "Use 1234 as OTP");

    setStep("otp");
  };

  const handleVerifyOTP = () => {
    if (otp === "1234") {
      router.replace("/");
    } else {
      Alert.alert("Invalid OTP");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* 🔥 Animated Background */}

      <View style={{ marginTop: 40 }}>
        <ImageRow images={images.slice(0, 4)} reverse={false} />

        <ImageRow images={images.slice(4, 8)} reverse={true} />

        <ImageRow images={images.slice(8, 12)} reverse={false} />

        <ImageRow images={images.slice(0, 4)} reverse={true} />

        {/* Logo */}

        <View style={styles.logo} />
      </View>

      {/* 🔹 Bottom Overlay */}

      <View style={styles.overlay}>
        <Text style={styles.title}>India’s Leading Organic Brand</Text>

        <Text style={styles.subtitle}>Log in or Sign Up</Text>

        {step === "phone" ? (
          <>
            <View style={styles.inputBox}>
              <Text style={styles.countryCode}>+91</Text>

              <TextInput
                placeholder="Enter phone number"
                keyboardType="phone-pad"
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.otpText}>Enter OTP sent to +91 {phone}</Text>

            <TextInput
              placeholder="Enter OTP"
              keyboardType="number-pad"
              style={styles.otpInput}
              value={otp}
              onChangeText={setOtp}
              maxLength={4}
            />

            <TouchableOpacity style={styles.button} onPress={handleVerifyOTP}>
              <Text style={styles.buttonText}>Verify OTP</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setStep("phone")}>
              <Text style={styles.resend}>Change Number</Text>
            </TouchableOpacity>
          </>
        )}

        <Text style={styles.altText}>or login with phone number</Text>
      </View>
    </View>
  );
}

/* 🔹 Styles */

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: "#fff",
  },

  image: {
    width: 90,

    height: 90,

    margin: 8,

    borderRadius: 14,

    backgroundColor: "#f3f4f6",
  },

  overlay: {
    position: "absolute",

    bottom: 0,

    width: "100%",

    backgroundColor: "#fff",

    borderTopLeftRadius: 28,

    borderTopRightRadius: 28,

    padding: 20,

    elevation: 10,
  },

  title: {
    fontSize: 18,

    fontWeight: "700",

    textAlign: "center",
  },

  subtitle: {
    fontSize: 13,

    color: "#777",

    textAlign: "center",

    marginBottom: 16,
  },

  inputBox: {
    flexDirection: "row",

    alignItems: "center",

    borderWidth: 1,

    borderColor: "#ddd",

    borderRadius: 10,

    paddingHorizontal: 12,

    height: 48,

    marginBottom: 14,
  },

  countryCode: {
    fontSize: 16,

    marginRight: 8,
  },

  input: {
    flex: 1,

    fontSize: 16,
  },

  button: {
    backgroundColor: "#166534",

    paddingVertical: 14,

    borderRadius: 10,

    alignItems: "center",
  },

  buttonText: {
    color: "#fff",

    fontSize: 16,

    fontWeight: "600",
  },

  otpText: {
    textAlign: "center",

    marginBottom: 10,

    color: "#444",
  },

  otpInput: {
    borderWidth: 1,

    borderColor: "#ddd",

    borderRadius: 10,

    height: 48,

    textAlign: "center",

    fontSize: 18,

    marginBottom: 14,
  },

  resend: {
    textAlign: "center",

    color: "#16a34a",

    marginTop: 10,
  },

  altText: {
    textAlign: "center",

    fontSize: 12,

    color: "#16a34a",

    marginTop: 10,
  },

  logo: {
    width: 50,

    height: 50,

    backgroundColor: "green",

    alignSelf: "center",

    marginTop: 15,
  },
});
