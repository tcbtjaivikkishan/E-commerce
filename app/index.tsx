// app/index.tsx
// ─── Boot screen: rehydrate session from SecureStore → route accordingly ─────
import { useEffect, useState } from "react";
import { ActivityIndicator, View, StyleSheet, Image } from "react-native";
import { Redirect } from "expo-router";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../src/features/auth/store/userSlice";
import {
  getAccessToken,
  getRefreshToken,
  getSessionId,
  getUserData,
} from "../src/shared/services/token.service";

type BootStatus = "loading" | "authenticated" | "unauthenticated";

export default function BootScreen() {
  const [status, setStatus] = useState<BootStatus>("loading");
  const dispatch = useDispatch();

  useEffect(() => {
    let cancelled = false;

    async function rehydrate() {
      try {
        const [token, refreshToken, sessionId, user] = await Promise.all([
          getAccessToken(),
          getRefreshToken(),
          getSessionId(),
          getUserData(),
        ]);

        if (cancelled) return;

        // We have a valid session stored locally
        if (token && refreshToken && sessionId && user) {
          // Rehydrate Redux state so the rest of the app knows we're logged in
          dispatch(
            loginSuccess({
              phone: user.mobile_number ?? user.phone ?? "",
              isLoggedIn: true,
              token,
              name: user.name ?? null,
              email: user.email ?? null,
              userId: user._id ?? user.userId ?? null,
              sessionId,
              addresses: user.addresses ?? [],
            })
          );
          setStatus("authenticated");
        } else {
          setStatus("unauthenticated");
        }
      } catch (err) {
        console.warn("[Boot] Failed to rehydrate session:", err);
        if (!cancelled) setStatus("unauthenticated");
      }
    }

    rehydrate();
    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  // Still checking SecureStore — show splash/loader
  if (status === "loading") {
    return (
      <View style={styles.container}>
        <Image
          source={require("@/assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <ActivityIndicator size="large" color="#196F1B" style={styles.loader} />
      </View>
    );
  }

  // Route based on session status
  if (status === "authenticated") {
    return <Redirect href="/(tabs)/home" />;
  }

  return <Redirect href="/login" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 120,
    height: 120,
  },
  loader: {
    marginTop: 24,
  },
});
