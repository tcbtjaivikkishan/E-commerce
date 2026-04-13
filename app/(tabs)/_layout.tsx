import { Tabs } from "expo-router";
import { View, Text } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

function TabItem({
  focused,
  icon,
  label,
}: {
  focused: boolean;
  icon: React.ReactNode;
  label: string;
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
          minWidth: 70, // 🔥 keeps pill balanced
        }}
      >
        {icon}

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
              label="Order Again"
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
              label="Order"
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
    </Tabs>
  );
}