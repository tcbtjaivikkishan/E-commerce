import React, { useRef, useEffect, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  Linking,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useSelector } from "react-redux";

// ─── Constants ────────────────────────────────────────────────────────────────
const { width, height } = Dimensions.get("window");
const CARD_GAP = 16;
const CARD_SIZE = (width - 48 - CARD_GAP) / 2; // 2 cards per row with padding
const GREEN_PRIMARY = "#196F1B";
const GREEN_DARK = "#0F5A14";
const GREEN_LIGHT = "#E8F5E9";
const GOLD = "#FFB700";

// ─── Card Data ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  {
    id: "products",
    title: "TCBT Products",
    subtitle: "Organic & Natural",
    image: require("@/assets/images/tcbt_products.jpg"),
    gradient: ["#1B5E20", "#2E7D32"] as const,
    iconBg: "#E8F5E9",
    icon: "leaf" as const,
    iconType: "ionicons" as const,
  },
  {
    id: "education",
    title: "TCBT Education",
    subtitle: "Learn & Grow",
    image: require("@/assets/images/tcbt_education.jpg"),
    gradient: ["#0D47A1", "#1565C0"] as const,
    iconBg: "#E3F2FD",
    icon: "school" as const,
    iconType: "ionicons" as const,
  },
  {
    id: "food",
    title: "TCBT Food",
    subtitle: "Pure & Fresh",
    image: require("@/assets/images/tcbt_food.jpg"),
    gradient: ["#E65100", "#F57C00"] as const,
    iconBg: "#FFF3E0",
    icon: "restaurant" as const,
    iconType: "ionicons" as const,
  },
  {
    id: "pgs",
    title: "TCBT PGS",
    subtitle: "Certified Organic",
    image: require("@/assets/images/tcbt_pgs.jpg"),
    gradient: ["#4A148C", "#7B1FA2"] as const,
    iconBg: "#F3E5F5",
    icon: "verified" as const,
    iconType: "material" as const,
  },
];

// ─── Drawer Menu Items ────────────────────────────────────────────────────────
const MENU_ITEMS = [
  { label: "Home", icon: "home-outline", route: "/(tabs)/home" },
  { label: "Categories", icon: "grid-outline", route: "/(tabs)/categories" },
  { label: "My Orders", icon: "receipt-outline", route: "/(tabs)/orders" },
  { label: "My Cart", icon: "cart-outline", route: "/(tabs)/cart" },
  { label: "My Profile", icon: "person-outline", route: "/profile" },
  { label: "Wishlist", icon: "heart-outline", route: "/wishlist" },
];

// ─── Animated Card Component ──────────────────────────────────────────────────
function CategoryCard({
  item,
  index,
  onPress,
}: {
  item: (typeof CATEGORIES)[0];
  index: number;
  onPress: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay: 200 + index * 120,
      friction: 6,
      tension: 60,
      useNativeDriver: true,
    }).start();
  }, [index, scaleAnim]);

  const handlePressIn = () => {
    Animated.spring(pressAnim, {
      toValue: 0.95,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressAnim, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.cardOuter,
        {
          opacity: scaleAnim,
          transform: [
            { scale: Animated.multiply(scaleAnim, pressAnim) },
            {
              translateY: scaleAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [40, 0],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        {/* Card Image */}
        <View style={styles.cardImageWrap}>
          <Image source={item.image} style={styles.cardImage} resizeMode="cover" />
          {/* Overlay gradient */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.55)"]}
            style={styles.cardOverlay}
          />
        </View>

        {/* Icon badge */}
        <View style={[styles.iconBadge, { backgroundColor: item.iconBg }]}>
          {item.iconType === "material" ? (
            <MaterialIcons
              name={item.icon as any}
              size={20}
              color={item.gradient[0]}
            />
          ) : (
            <Ionicons
              name={item.icon as any}
              size={20}
              color={item.gradient[0]}
            />
          )}
        </View>

        {/* Card text content at bottom */}
        <View style={styles.cardTextWrap}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
        </View>

        {/* Arrow indicator */}
        <View style={styles.arrowWrap}>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Main Landing Screen ──────────────────────────────────────────────────────
export default function LandingScreen() {
  const insets = useSafeAreaInsets();
  const [menuVisible, setMenuVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-width * 0.75)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;
  const isLoggedIn = useSelector((state: any) => state.user?.isLoggedIn);

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [headerAnim]);

  const openMenu = () => {
    setMenuVisible(true);
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 65,
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeMenu = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -width * 0.75,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => setMenuVisible(false));
  };

  const handleCardPress = (id: string) => {
    switch (id) {
      case "products":
        router.push("/(tabs)/home" as any);
        break;
      case "education":
        router.push({
          pathname: "/zoho-form",
          params: {
            url: "https://forms.zohopublic.in/tcbtjaivikkisan1/form/LearnOrganicFarming/formperma/BvAhyL6jdGoyyx3enkffbqJEyHbjeKL19hCMKzCSqDA",
            title: "TCBT Education",
          },
        } as any);
        break;
      case "food":
        Alert.alert(
          "Coming Soon 🚀",
          "TCBT Food is coming soon! Stay tuned for pure & fresh organic food products.",
          [{ text: "OK", style: "default" }]
        );
        break;
      case "pgs":
        router.push({
          pathname: "/zoho-form",
          params: {
            url: "https://forms.zohopublic.in/tcbtjaivikkisan1/form/Untitled/formperma/IDiOfDF-G9ijNrO64fjAMkBHIFWBnwSIJyv321Oz3Zs",
            title: "TCBT PGS",
          },
        } as any);
        break;
    }
  };

  const handleMenuPress = (route: string) => {
    closeMenu();
    setTimeout(() => {
      router.push(route as any);
    }, 300);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={GREEN_PRIMARY} />

      {/* ── Header ── */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerAnim,
            transform: [
              {
                translateY: headerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={[GREEN_PRIMARY, GREEN_DARK]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          {/* Menu Button */}
          <TouchableOpacity
            style={styles.menuBtn}
            onPress={openMenu}
            activeOpacity={0.7}
          >
            <Ionicons name="menu" size={26} color="#fff" />
          </TouchableOpacity>

          {/* Brand */}
          <View style={styles.headerCenter}>
            <Image
              source={require("@/assets/images/logo.png")}
              style={styles.headerLogo}
              resizeMode="contain"
            />
          </View>

          {/* Profile */}
          <TouchableOpacity
            style={styles.profileBtn}
            onPress={() => router.push("/profile")}
            activeOpacity={0.7}
          >
            <Image
              source={require("@/assets/icons/user_1.png")}
              style={styles.profileIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>

      {/* ── Body ── */}
      <LinearGradient
        colors={["#F8FFF8", "#E8F5E9", "#F1F8E9"]}
        style={styles.body}
      >
        <ScrollView
          style={styles.bodyScroll}
          contentContainerStyle={styles.bodyScrollContent}
          showsVerticalScrollIndicator={false}
        >
        {/* Welcome text */}
        <View style={styles.welcomeWrap}>
          <Text style={styles.welcomeLabel}>Welcome to</Text>
          <Text style={styles.welcomeTitle}>
            TCBT <Text style={styles.welcomeHighlight}>Jaivik Kisan</Text>
          </Text>
          <Text style={styles.welcomeSubtext}>
            Explore our world of organic living
          </Text>
        </View>

        {/* ── Meeting Banner ── */}
        <TouchableOpacity
          style={styles.meetingBanner}
          activeOpacity={0.85}
          onPress={() => Linking.openURL("https://meeting.zoho.in/vtnx-gyl-hjt")}
        >
          <View style={styles.meetingTop}>
            <View style={styles.meetingBadge}>
              <Ionicons name="videocam" size={12} color="#196F1B" />
              <Text style={styles.meetingBadgeText}>Quick Access</Text>
            </View>
            <Text style={styles.meetingTitle}>Join the Zoho Meeting</Text>
            <Text style={styles.meetingDesc}>
              Panchmahabhut aur krishi charcha ke liye live meeting mein join karein.
            </Text>
          </View>
          <View style={styles.meetingBottom}>
            <View style={styles.meetingJoinTextWrap}>
              <Text style={styles.meetingJoinLabel}>Join Meeting</Text>
            </View>
            <View style={styles.meetingJoinBtn}>
              <Ionicons name="open-outline" size={18} color="#fff" />
            </View>
          </View>
        </TouchableOpacity>

        {/* 2×2 Grid */}
        <View style={styles.gridContainer}>
          <View style={styles.gridRow}>
            {CATEGORIES.slice(0, 2).map((cat, i) => (
              <CategoryCard
                key={cat.id}
                item={cat}
                index={i}
                onPress={() => handleCardPress(cat.id)}
              />
            ))}
          </View>
          <View style={styles.gridRow}>
            {CATEGORIES.slice(2, 4).map((cat, i) => (
              <CategoryCard
                key={cat.id}
                item={cat}
                index={i + 2}
                onPress={() => handleCardPress(cat.id)}
              />
            ))}
          </View>
        </View>

        {/* Bottom tagline */}
        <View style={styles.taglineWrap}>
          <View style={styles.taglineDivider} />
          <Text style={styles.taglineText}>🌿 Pure • Organic • Sustainable</Text>
          <View style={styles.taglineDivider} />
        </View>
        </ScrollView>
      </LinearGradient>

      {/* ── Side Drawer Menu (Modal) ── */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="none"
        onRequestClose={closeMenu}
      >
        <View style={styles.drawerOverlay}>
          {/* Backdrop */}
          <Animated.View
            style={[
              styles.drawerBackdrop,
              { opacity: backdropAnim },
            ]}
          >
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              onPress={closeMenu}
              activeOpacity={1}
            />
          </Animated.View>

          {/* Drawer panel */}
          <Animated.View
            style={[
              styles.drawerPanel,
              { transform: [{ translateX: slideAnim }], paddingTop: insets.top },
            ]}
          >
            {/* Drawer header */}
            <LinearGradient
              colors={[GREEN_PRIMARY, GREEN_DARK]}
              style={styles.drawerHeader}
            >
              <Image
                source={require("@/assets/images/logo.png")}
                style={styles.drawerLogo}
                resizeMode="contain"
              />
              <Text style={styles.drawerBrand}>TCBT Jaivik Kisan</Text>
              <Text style={styles.drawerBrandSub}>Fully Organic Products</Text>
            </LinearGradient>

            {/* Menu items */}
            <ScrollView
              style={styles.drawerBody}
              showsVerticalScrollIndicator={false}
            >
              {MENU_ITEMS.map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.drawerItem}
                  onPress={() => handleMenuPress(item.route)}
                  activeOpacity={0.6}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={22}
                    color={GREEN_PRIMARY}
                  />
                  <Text style={styles.drawerItemText}>{item.label}</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color="#ccc"
                    style={{ marginLeft: "auto" }}
                  />
                </TouchableOpacity>
              ))}

              <View style={styles.drawerDivider} />

              {/* App info */}
              <View style={styles.drawerFooter}>
                <Text style={styles.drawerFooterText}>
                  TCBT Jaivik Kisan v2.0
                </Text>
                <Text style={styles.drawerFooterSub}>
                  100% Organic • Made in India 🇮🇳
                </Text>
              </View>
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GREEN_PRIMARY,
  },

  // ── Header ──
  header: {
    zIndex: 10,
  },
  headerGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerLogo: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  profileBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  profileIcon: {
    width: 18,
    height: 20,
  },

  // ── Body ──
  body: {
    flex: 1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -2,
  },
  bodyScroll: {
    flex: 1,
  },
  bodyScrollContent: {
    paddingTop: 18,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },

  // ── Meeting Banner ──
  meetingBanner: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#C8E6C9",
    overflow: "hidden",
    marginBottom: 18,
    elevation: 4,
    shadowColor: "#196F1B",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  meetingTop: {
    padding: 14,
    paddingBottom: 12,
  },
  meetingBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#E8F5E9",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 8,
  },
  meetingBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#196F1B",
    letterSpacing: 0.3,
  },
  meetingTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  meetingDesc: {
    fontSize: 12,
    color: "#666",
    lineHeight: 17,
  },
  meetingBottom: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#E8F5E9",
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  meetingJoinTextWrap: {
    flex: 1,
  },
  meetingJoinLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#196F1B",
  },
  meetingJoinSub: {
    fontSize: 11,
    color: "#999",
    marginTop: 1,
  },
  meetingJoinBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#196F1B",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },

  // ── Welcome ──
  welcomeWrap: {
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  welcomeLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    letterSpacing: 0.5,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: GREEN_PRIMARY,
    letterSpacing: -0.5,
    marginTop: 2,
  },
  welcomeHighlight: {
    color: GOLD,
  },
  welcomeSubtext: {
    fontSize: 13,
    color: "#888",
    marginTop: 4,
    letterSpacing: 0.2,
  },

  // ── Grid ──
  gridContainer: {
    flex: 1,
    gap: CARD_GAP,
  },
  gridRow: {
    flexDirection: "row",
    gap: CARD_GAP,
  },

  // ── Card ──
  cardOuter: {
    flex: 1,
  },
  card: {
    width: "100%",
    height: CARD_SIZE + 20,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  cardImageWrap: {
    ...StyleSheet.absoluteFillObject,
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  iconBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTextWrap: {
    position: "absolute",
    bottom: 14,
    left: 14,
    right: 40,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.2,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  cardSubtitle: {
    fontSize: 11,
    fontWeight: "500",
    color: "rgba(255,255,255,0.85)",
    marginTop: 2,
    letterSpacing: 0.3,
  },
  arrowWrap: {
    position: "absolute",
    bottom: 14,
    right: 14,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Tagline ──
  taglineWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    gap: 12,
  },
  taglineDivider: {
    flex: 1,
    height: 1,
    backgroundColor: "#C8E6C9",
  },
  taglineText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    letterSpacing: 0.5,
  },

  // ── Drawer ──
  drawerOverlay: {
    flex: 1,
    flexDirection: "row",
  },
  drawerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  drawerPanel: {
    width: width * 0.75,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 20,
  },
  drawerHeader: {
    paddingTop: 24,
    paddingBottom: 24,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  drawerLogo: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  drawerBrand: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.3,
  },
  drawerBrandSub: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginTop: 4,
  },
  drawerBody: {
    flex: 1,
    paddingTop: 8,
  },
  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    gap: 14,
  },
  drawerItemText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  drawerDivider: {
    height: 1,
    backgroundColor: "#eee",
    marginHorizontal: 20,
    marginVertical: 8,
  },
  drawerFooter: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  drawerFooterText: {
    fontSize: 12,
    color: "#999",
    fontWeight: "500",
  },
  drawerFooterSub: {
    fontSize: 11,
    color: "#bbb",
    marginTop: 4,
  },
});
