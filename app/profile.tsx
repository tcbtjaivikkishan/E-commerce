// app/profile.tsx — matches Figma screen_15
import { router } from "expo-router";
import { useCallback } from "react";
import {
  Alert,
  SafeAreaView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { logoutUser } from "../src/features/auth/services/auth.service";
import { RESET_APP } from "../src/store/resetAction";
import { useAppDispatch, useAppSelector } from "../src/shared/hooks/useRedux";

const GREEN = "#196F1B";

export default function ProfileScreen() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);

  const handleLogout = useCallback(() => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await logoutUser();
          dispatch(RESET_APP());
          router.replace("/login" as any);
        },
      },
    ]);
  }, [dispatch]);

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message:
          "Check out Jaivik Mart — Natural farming products! Download now: https://play.google.com/store/apps/details?id=com.tcbt.jaivikmart",
      });
    } catch (_) { }
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={GREEN} />

      {/* ── Green Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <View style={styles.avatarCircle}>
          <Text style={styles.avatarIcon}>👤</Text>
        </View>

        <Text style={styles.headerName}>Your account</Text>
        <Text style={styles.headerPhone}>
          {user.phone || "Not logged in"}
        </Text>
      </View>

      {/* ── Content ── */}
      <View style={styles.content}>
        {/* Section 1: Your information */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your information</Text>

          <MenuItem
            title="Address book"
            onPress={() => router.push("/address-book" as any)}
          />
          <MenuItem
            title="Your wishlist"
            onPress={() => router.push("/wishlist" as any)}
          />
          <MenuItem
            title="Your orders"
            onPress={() => router.push("/(tabs)/orders" as any)}
          />
        </View>

        {/* Section 2: Other information */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Other information</Text>

          <MenuItem
            title="Log out"
            onPress={user.isLoggedIn ? handleLogout : undefined}
          />
          <MenuItem title="Share the app" onPress={handleShare} />
          <MenuItem
            title="Notification preferences"
            onPress={() => Alert.alert("Coming Soon", "Notification preferences will be available in a future update.")}
          />
        </View>

        {/* Footer branding */}
        <View style={styles.footer}>
          <Text style={styles.brand}>TCBT</Text>
          <Text style={styles.version}>v10.01.0</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

/* ── Menu Item Component ── */
function MenuItem({
  title,
  onPress,
}: {
  title: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.menuItem}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <Text style={styles.menuText}>{title}</Text>
      <Text style={styles.menuArrow}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F2F2F2" },

  /* ── Header ── */
  header: {
    backgroundColor: GREEN,
    paddingTop: 48,
    paddingBottom: 28,
    alignItems: "center",
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  backBtn: {
    position: "absolute",
    left: 16,
    top: 48,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  backArrow: { color: "#fff", fontSize: 22, lineHeight: 24 },

  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarIcon: { fontSize: 32 },

  headerName: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
  },
  headerPhone: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    marginTop: 4,
  },

  /* ── Content ── */
  content: { flex: 1, padding: 16 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },

  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  menuText: { fontSize: 14, color: "#333" },
  menuArrow: { fontSize: 18, color: "#999" },

  /* ── Footer ── */
  footer: { alignItems: "center", marginTop: 24 },
  brand: {
    fontSize: 36,
    color: "#CCC",
    fontWeight: "800",
    letterSpacing: 4,
  },
  version: { fontSize: 12, color: "#BBB", marginTop: 2 },
});