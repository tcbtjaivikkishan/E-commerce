import { Tabs } from "expo-router";
import { View } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useAppSelector } from "../../src/hooks/redux";
import { selectTotalItems } from "../../src/store/cartSlice";

/* 🔥 Cart Icon with Badge */
function CartIcon({ color }: { color: string }) {
  const totalItems = useAppSelector(selectTotalItems);

  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Ionicons name="cart-outline" size={24} color={color} />

      {totalItems > 0 && (
        <View
          style={{
            position: "absolute",
            top: -4,
            right: -8,
            backgroundColor: "#DC2626",
            borderRadius: 10,
            minWidth: 18,
            height: 18,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 4,
            borderWidth: 1.5,
            borderColor: "#fff",
          }}
        >
          <Ionicons name="ellipse" size={0} color="transparent" />
        </View>
      )}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,

        /* 🔥 FOOTER STYLE (MATCH YOUR IMAGE) */
        tabBarStyle: {
          position: "absolute",
          height: 70,
          backgroundColor: "#fff",
          borderTopWidth: 0,
          borderRadius: 25,
          marginHorizontal: 10,
          marginBottom: 10,
          elevation: 10,
        },
      }}
    >
      {/* 🏠 HOME */}
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={26}
              color={focused ? "#0F7B3C" : "#444"}
            />
          ),
        }}
      />

      {/* 🛒 CART */}
      <Tabs.Screen
        name="cart"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "cart" : "cart-outline"}
              size={26}
              color={focused ? "#0F7B3C" : "#444"}
            />
          ),
        }}
      />

      {/* ⬜ CATEGORIES (grid icon) */}
      <Tabs.Screen
        name="categories"
        options={{
          tabBarIcon: ({ focused }) => (
            <MaterialIcons
              name="grid-view"
              size={26}
              color={focused ? "#0F7B3C" : "#444"}
            />
          ),
        }}
      />

      {/* 📦 ORDERS (printer-like icon) */}
      <Tabs.Screen
        name="orders"
        options={{
          tabBarIcon: ({ focused }) => (
            <MaterialIcons
              name="receipt-long"
              size={26}
              color={focused ? "#0F7B3C" : "#444"}
            />
          ),
        }}
      />
    </Tabs>
  );
}