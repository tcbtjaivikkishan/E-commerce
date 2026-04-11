import { router, usePathname } from "expo-router";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";

export default function BottomTab() {
  const pathname = usePathname();

  const tabs = [
    { name: "home", icon: "🏠", route: "/home" },
    { name: "cart", icon: "🛒", route: "/cart" },
    { name: "categories", icon: "⬜", route: "/categories" },
    { name: "orders", icon: "📄", route: "/orders" },
  ];

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {tabs.map((tab) => {
          const isActive = pathname === tab.route;

          return (
            <TouchableOpacity
              key={tab.name}
              onPress={() => router.push(tab.route)}
              style={styles.tab}
            >
              <Text
                style={[
                  styles.icon,
                  { color: isActive ? "#0F7B3C" : "#777" },
                ]}
              >
                {tab.icon}
              </Text>

              {/* Active indicator */}
              {isActive && <View style={styles.activeDot} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    alignItems: "center",
  },

  container: {
    flexDirection: "row",
    backgroundColor: "#fff",
    width: "92%",
    borderRadius: 20,
    paddingVertical: 12,
    justifyContent: "space-around",

    // Shadow (important 🔥)
    elevation: 8,
  },

  tab: {
    alignItems: "center",
  },

  icon: {
    fontSize: 26, // 🔥 bigger icons
  },

  activeDot: {
    marginTop: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#0F7B3C",
  },
});