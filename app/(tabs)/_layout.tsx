import { Tabs } from "expo-router";
import { Text, View } from "react-native";
import { useAppSelector } from "../../src/hooks/redux";
import { selectTotalItems } from "../../src/store/cartSlice";

function CartIcon() {
  const totalItems = useAppSelector(selectTotalItems);
  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontSize: 22 }}>🛒</Text>
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
          <Text style={{ color: "#fff", fontSize: 10, fontWeight: "800" }}>
            {totalItems > 99 ? "99+" : totalItems}
          </Text>
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
        tabBarActiveTintColor: "#0F7B3C",
        tabBarInactiveTintColor: "#9A9A9A",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#EFEFEF",
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontSize: 22 }}>🏠</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarIcon: ({ color }) => (
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontSize: 22 }}>🛒</Text>
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
