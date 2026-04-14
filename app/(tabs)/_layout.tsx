import { Tabs } from "expo-router";
import { View, Text } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useAppSelector } from "../../src/hooks/redux";
import { selectTotalItems } from "../../src/store/cartSlice";

function TabItem({
  focused,
  icon,
  label,
  badge,
}: {
  focused: boolean;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}) {
  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
      }}
    >
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 6,
          paddingHorizontal: 16,
          borderRadius: 25,
          backgroundColor: focused ? "#E8F5E9" : "transparent",
          minWidth: 70,
        }}
      >
        {/* Icon + Badge wrapper */}
        <View style={{ position: "relative", marginBottom: 2 }}>
          {icon}

          {badge != null && badge > 0 && (
            <View
              style={{
                position: "absolute",
                top: -6,
                right: -10,
                backgroundColor: "#E53935",
                borderRadius: 10,
                minWidth: 18,
                height: 18,
                justifyContent: "center",
                alignItems: "center",
                paddingHorizontal: 4,
                borderWidth: 1.5,
                borderColor: "#fff",
                zIndex: 99,
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: "bold",
                }}
              >
                {badge > 9 ? "9+" : badge}
              </Text>
            </View>
          )}
        </View>

        <Text
          style={{
            fontSize: 11,
            marginTop: 2,
            fontWeight: "600",
            textAlign: "center",
            color: focused ? "#0F7B3C" : "#444",
          }}
        >
          {label}
        </Text>
      </View>
    </View>
  );
}

export default function TabLayout() {
  const totalItems = useAppSelector(selectTotalItems);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          bottom: 15,
          left: 15,
          right: 15,
          height: 75,
          backgroundColor: "rgba(255,255,255,0.95)",
          borderRadius: 40,
          borderTopWidth: 0,
          elevation: 10,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 10,
        },
      }}
    >
      {/* HOME */}
      <Tabs.Screen
        name="home"
        options={{
          tabBarLabel: "",
          tabBarIcon: ({ focused }) => (
            <TabItem
              focused={focused}
              label="Home"
              icon={
                <Ionicons
                  name="home"
                  size={22}
                  color={focused ? "#0F7B3C" : "#444"}
                />
              }
            />
          ),
        }}
      />

      {/* CART */}
      <Tabs.Screen
        name="cart"
        options={{
          tabBarLabel: "",
          tabBarIcon: ({ focused }) => (
            <TabItem
              focused={focused}
              label="Cart"
              badge={totalItems}
              icon={
                <Ionicons
                  name="cart-outline"
                  size={22}
                  color={focused ? "#0F7B3C" : "#444"}
                />
              }
            />
          ),
        }}
      />

      {/* CATEGORIES */}
      <Tabs.Screen
        name="categories"
        options={{
          tabBarLabel: "",
          tabBarIcon: ({ focused }) => (
            <TabItem
              focused={focused}
              label="Categories"
              icon={
                <MaterialIcons
                  name="grid-view"
                  size={22}
                  color={focused ? "#0F7B3C" : "#444"}
                />
              }
            />
          ),
        }}
      />

      {/* ORDERS */}
      <Tabs.Screen
        name="orders"
        options={{
          tabBarLabel: "",
          tabBarIcon: ({ focused }) => (
            <TabItem
              focused={focused}
              label="Orders"
              icon={
                <MaterialIcons
                  name="receipt-long"
                  size={22}
                  color={focused ? "#0F7B3C" : "#444"}
                />
              }
            />
          ),
        }}
      />

      {/* ✅ ONLY ADDITION — hides native tab bar on product screen */}
      <Tabs.Screen
        name="product/[id]"
        options={{
          tabBarStyle: { display: "none" },
          tabBarLabel: "",
          tabBarIcon: () => null,
        }}
      />
    </Tabs>
  );
}