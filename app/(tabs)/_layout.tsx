import React from "react";
import { Tabs, useRouter, usePathname } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets, SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useAppSelector } from "../../src/shared/hooks/useRedux";
import { selectTotalItems } from "../../src/features/cart/store/cartSlice";

// ─── Colors ───────────────────────────────────────────────────────────────────
const GREEN = "#0F7B3C";
const GREY = "#888888";

// ─── Tab config ───────────────────────────────────────────────────────────────
const TAB_ROUTES = [
  {
    name: "home",
    label: "Home",
    activeIcon: <Ionicons name="home" size={22} color={GREEN} />,
    inactiveIcon: <Ionicons name="home-outline" size={22} color={GREY} />,
  },
  {
    name: "categories",
    label: "Categories",
    activeIcon: <MaterialIcons name="grid-view" size={22} color={GREEN} />,
    inactiveIcon: <MaterialIcons name="grid-view" size={22} color={GREY} />,
  },
  {
    name: "cart",
    label: "Cart",
    activeIcon: <Ionicons name="cart" size={22} color={GREEN} />,
    inactiveIcon: <Ionicons name="cart-outline" size={22} color={GREY} />,
    showBadge: true,
  },
  {
    name: "orders",
    label: "Orders",
    activeIcon: <MaterialIcons name="receipt-long" size={22} color={GREEN} />,
    inactiveIcon: <MaterialIcons name="receipt-long" size={22} color={GREY} />,
  },
];

// ─── Custom Tab Bar ───────────────────────────────────────────────────────────
function CustomTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const cartCount = useAppSelector(selectTotalItems);

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {TAB_ROUTES.map((tab) => {
        const active = pathname === `/${tab.name}` || pathname.startsWith(`/${tab.name}/`);

        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tabItem}
            onPress={() => router.push(`/(tabs)/${tab.name}` as any)}
            activeOpacity={0.75}
          >
            {/* Icon row with optional badge */}
            <View style={styles.iconWrap}>
              {active ? tab.activeIcon : tab.inactiveIcon}
              {tab.showBadge && cartCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {cartCount > 9 ? "9+" : String(cartCount)}
                  </Text>
                </View>
              )}
            </View>

            {/* Label */}
            <Text style={[styles.label, active && styles.labelActive]}>
              {tab.label}
            </Text>

            {/* Active underline dot */}
            <View style={[styles.dot, active && styles.dotActive]} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E0E0E0",
    paddingTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 14,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    gap: 3,
  },
  iconWrap: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -9,
    backgroundColor: "#E53935",
    borderRadius: 9,
    minWidth: 17,
    height: 17,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  badgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "bold",
  },
  label: {
    fontSize: 11,
    fontWeight: "500",
    color: GREY,
  },
  labelActive: {
    color: GREEN,
    fontWeight: "700",
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "transparent",
    marginTop: 1,
  },
  dotActive: {
    backgroundColor: GREEN,
  },
});

// ─── Layout ───────────────────────────────────────────────────────────────────
export default function TabLayout() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Tabs
        tabBar={() => <CustomTabBar />}
        screenOptions={{ headerShown: false }}
      >
        <Tabs.Screen name="home" />
        <Tabs.Screen name="categories" />
        <Tabs.Screen name="cart" />
        <Tabs.Screen name="orders" />
        {/* Hide product detail from tab list */}
        <Tabs.Screen name="product/[id]" options={{ href: null }} />
      </Tabs>
    </SafeAreaView>
  );
}