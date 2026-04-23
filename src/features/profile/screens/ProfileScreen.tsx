import { router } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { C } from "../../../core/theme";
import { useAppDispatch, useAppSelector } from "../../../shared/hooks/useRedux";
import { logoutUser } from "../../auth/services/auth.service";
import { logout, updateProfile } from "../../auth/store/userSlice";
import { updateUserProfile } from "../services/user.api";

const MENU_SECTIONS = [
  {
    title: "My Activity",
    items: [
      { icon: "📦", label: "My Orders", badge: null, route: "/orders" },
      { icon: "❤️", label: "Wishlist", badge: null, route: "/wishlist" },
      { icon: "⭐", label: "Reviews & Ratings", badge: null, route: null },
    ],
  },
  {
    title: "Account Settings",
    items: [
      { icon: "📍", label: "Saved Addresses", badge: null, route: null },
      { icon: "💳", label: "Payment Methods", badge: null, route: null },
      { icon: "🔔", label: "Notifications", badge: null, route: null },
    ],
  },
  {
    title: "Support",
    items: [
      { icon: "💬", label: "Help & Support", badge: null, route: null },
      { icon: "📄", label: "Terms & Privacy", badge: null, route: null },
    ],
  },
];

export default function ProfileScreen() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(user.name || "");
  const [editEmail, setEditEmail] = useState(user.email || "");
  const [saving, setSaving] = useState(false);

  const handleLogout = useCallback(async () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await logoutUser();
          dispatch(logout());
          router.replace("/home" as any);
        },
      },
    ]);
  }, [dispatch]);

  const handleSaveProfile = useCallback(async () => {
    if (!user.userId) return;
    setSaving(true);
    try {
      const updates: { name?: string; email?: string } = {};
      if (editName.trim() !== (user.name || "")) updates.name = editName.trim();
      if (editEmail.trim() !== (user.email || "")) updates.email = editEmail.trim();
      if (Object.keys(updates).length > 0) {
        await updateUserProfile(user.userId, updates);
        dispatch(updateProfile(updates));
      }
      setEditing(false);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }, [dispatch, user.userId, user.name, user.email, editName, editEmail]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.green} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.settingsBtn}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.avatarRing}>
            <View style={styles.avatarInner}>
              <Text style={styles.avatarEmoji}>👤</Text>
            </View>
            {user.isLoggedIn && (
              <View style={styles.avatarBadge}>
                <Text style={styles.avatarBadgeText}>✓</Text>
              </View>
            )}
          </View>

          {user.isLoggedIn ? (
            <>
              {editing ? (
                <View style={styles.editForm}>
                  <TextInput
                    style={styles.editInput}
                    placeholder="Your Name"
                    placeholderTextColor="#999"
                    value={editName}
                    onChangeText={setEditName}
                  />
                  <TextInput
                    style={styles.editInput}
                    placeholder="Email (optional)"
                    placeholderTextColor="#999"
                    value={editEmail}
                    onChangeText={setEditEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  <View style={styles.editActions}>
                    <TouchableOpacity
                      style={styles.cancelEditBtn}
                      onPress={() => setEditing(false)}
                    >
                      <Text style={styles.cancelEditText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.saveEditBtn, saving && { opacity: 0.6 }]}
                      onPress={handleSaveProfile}
                      disabled={saving}
                    >
                      <Text style={styles.saveEditText}>
                        {saving ? "Saving..." : "Save"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <>
                  <Text style={styles.guestName}>
                    {user.name || "User"}
                  </Text>
                  <Text style={styles.guestSubtitle}>
                    +91 {user.phone}
                    {user.email ? `\n${user.email}` : ""}
                  </Text>
                  <TouchableOpacity
                    style={styles.editProfileBtn}
                    onPress={() => {
                      setEditName(user.name || "");
                      setEditEmail(user.email || "");
                      setEditing(true);
                    }}
                  >
                    <Text style={styles.editProfileText}>Edit Profile</Text>
                  </TouchableOpacity>
                </>
              )}
            </>
          ) : (
            <>
              <Text style={styles.guestName}>Guest User</Text>
              <Text style={styles.guestSubtitle}>
                Sign in to get personalised deals & track orders
              </Text>
              <View style={styles.authRow}>
                <TouchableOpacity
                  style={styles.loginBtn}
                  onPress={() => router.push("/auth/login")}
                >
                  <Text style={styles.loginBtnText}>Sign In</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.signupBtn}
                  onPress={() => router.push("/auth/signup")}
                >
                  <Text style={styles.signupBtnText}>Create Account</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        {/* Stats Strip */}
        <View style={styles.statsStrip}>
          {[
            { value: String(user.addresses?.length || 0), label: "Addresses" },
            { value: "0", label: "Wishlist" },
            { value: "0", label: "Orders" },
          ].map((stat, i) => (
            <View
              key={i}
              style={[styles.statItem, i < 2 && styles.statBorder]}
            >
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Menu Sections */}
        {MENU_SECTIONS.map((section, sIdx) => (
          <View key={sIdx} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.menuCard}>
              {section.items.map((item, iIdx) => (
                <TouchableOpacity
                  key={iIdx}
                  style={[
                    styles.menuRow,
                    iIdx < section.items.length - 1 && styles.menuRowBorder,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => {
                    if (item.route) router.push(item.route as any);
                  }}
                >
                  <View style={styles.menuLeft}>
                    <View style={styles.menuIconBox}>
                      <Text style={styles.menuIcon}>{item.icon}</Text>
                    </View>
                    <Text style={styles.menuLabel}>{item.label}</Text>
                  </View>
                  <View style={styles.menuRight}>
                    {item.badge && (
                      <View style={styles.badgePill}>
                        <Text style={styles.badgeText}>{item.badge}</Text>
                      </View>
                    )}
                    <Text style={styles.chevron}>›</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Logout */}
        {user.isLoggedIn && (
          <TouchableOpacity
            style={styles.logoutBtn}
            activeOpacity={0.8}
            onPress={handleLogout}
          >
            <Text style={styles.logoutIcon}>🚪</Text>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.version}>App Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F4F6F9",
  },

  /* ── Header ── */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: C.green,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  backArrow: { fontSize: 22, color: "#fff", lineHeight: 26 },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#fff" },
  settingsBtn: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  settingsIcon: { fontSize: 20 },

  /* ── Scroll ── */
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },

  /* ── Hero Card ── */
  heroCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 4,
  },
  avatarRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: C.green,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  avatarInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#EDF7F0",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarEmoji: { fontSize: 36 },
  avatarBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: C.green,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  avatarBadgeText: { color: "#fff", fontSize: 14, lineHeight: 18 },
  guestName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1A1A2E",
    marginBottom: 6,
  },
  guestSubtitle: {
    fontSize: 13,
    color: "#888",
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  authRow: { flexDirection: "row", gap: 12, width: "100%" },
  loginBtn: {
    flex: 1,
    backgroundColor: C.green,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  loginBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  signupBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: C.green,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  signupBtnText: { color: C.green, fontSize: 15, fontWeight: "700" },

  /* ── Edit Profile ── */
  editProfileBtn: {
    borderWidth: 1.5,
    borderColor: C.green,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  editProfileText: { color: C.green, fontWeight: "600", fontSize: 14 },
  editForm: { width: "100%", marginTop: 8 },
  editInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: "#333",
    marginBottom: 10,
    backgroundColor: "#FAFAFA",
  },
  editActions: { flexDirection: "row", gap: 10, marginTop: 4 },
  cancelEditBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  cancelEditText: { color: "#666", fontWeight: "600" },
  saveEditBtn: {
    flex: 1,
    backgroundColor: C.green,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  saveEditText: { color: "#fff", fontWeight: "700" },

  /* ── Stats Strip ── */
  statsStrip: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: { flex: 1, alignItems: "center" },
  statBorder: {
    borderRightWidth: 1,
    borderRightColor: "#EFEFEF",
  },
  statValue: { fontSize: 20, fontWeight: "800", color: "#1A1A2E" },
  statLabel: {
    fontSize: 11,
    color: "#999",
    marginTop: 2,
    fontWeight: "500",
  },

  /* ── Sections ── */
  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#999",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 10,
    marginLeft: 4,
  },
  menuCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  menuRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F2",
  },
  menuLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  menuIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#EDF7F0",
    alignItems: "center",
    justifyContent: "center",
  },
  menuIcon: { fontSize: 20 },
  menuLabel: { fontSize: 15, color: "#1A1A2E", fontWeight: "500" },
  menuRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  badgePill: {
    backgroundColor: C.green,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 22,
    alignItems: "center",
  },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  chevron: { fontSize: 22, color: "#CCC", lineHeight: 26 },

  /* ── Logout ── */
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginHorizontal: 16,
    marginTop: 28,
    paddingVertical: 15,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#FFDDDD",
    backgroundColor: "#FFF5F5",
  },
  logoutIcon: { fontSize: 18 },
  logoutText: { fontSize: 15, fontWeight: "700", color: "#E53935" },

  /* ── Footer ── */
  version: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 12,
    color: "#BBB",
    fontWeight: "500",
  },
});
