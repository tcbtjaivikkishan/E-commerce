// src/features/auth/screens/CompleteProfileScreen.tsx
// ─── First-time user: collect full name after OTP login ─────────────────────
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppDispatch, useAppSelector } from "../../../shared/hooks/useRedux";
import { updateProfile } from "../store/userSlice";
import { updateUserProfile } from "../../profile/services/user.api";

const GREEN = "#196F1B";

export default function CompleteProfileScreen() {
  const dispatch = useAppDispatch();
  const userId = useAppSelector((state) => state.user.userId);
  const [fullName, setFullName] = useState("");
  const [saving, setSaving] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 6,
      tension: 50,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handleContinue = async () => {
    const trimmed = fullName.trim();
    if (!trimmed) {
      Alert.alert("Required", "Please enter your full name");
      return;
    }
    if (trimmed.length < 2) {
      Alert.alert("Invalid", "Name must be at least 2 characters");
      return;
    }

    Keyboard.dismiss();
    setSaving(true);

    try {
      // Save to backend
      if (userId) {
        await updateUserProfile(userId, { name: trimmed });
      }
      // Update Redux state
      dispatch(updateProfile({ name: trimmed }));
      // Navigate to landing
      router.replace("/landing" as any);
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Failed to save name. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          {/* Logo + Illustration */}
          <Animated.View
            style={[
              styles.topSection,
              {
                opacity: scaleAnim,
                transform: [
                  {
                    translateY: scaleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Image
              source={require("@/assets/images/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.emoji}>👋</Text>
            <Text style={styles.title}>Welcome!</Text>
            <Text style={styles.subtitle}>
              Let's get to know you. What should we call you?
            </Text>
          </Animated.View>

          {/* Input Section */}
          <Animated.View
            style={[
              styles.inputSection,
              {
                opacity: scaleAnim,
                transform: [
                  {
                    translateY: scaleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor="#999"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              autoCorrect={false}
              autoFocus
              maxLength={50}
              returnKeyType="done"
              onSubmitEditing={handleContinue}
            />
          </Animated.View>

          {/* Spacer */}
          <View style={styles.flex} />

          {/* Continue Button */}
          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={[styles.button, saving && styles.buttonDisabled]}
              onPress={handleContinue}
              disabled={saving}
              activeOpacity={0.85}
            >
              <Text style={styles.buttonText}>
                {saving ? "Saving..." : "Continue"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  topSection: {
    alignItems: "center",
    paddingTop: 48,
    paddingBottom: 8,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 24,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1A1A1A",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: "#777",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  inputSection: {
    marginTop: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    borderWidth: 1.5,
    borderColor: GREEN,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#111",
    backgroundColor: "#FAFAFA",
  },
  bottomBar: {
    paddingVertical: 20,
  },
  button: {
    backgroundColor: GREEN,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: "#5a9e5c",
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
