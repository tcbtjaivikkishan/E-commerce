import { View, Text } from "react-native";

export default function OrdersScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F5F5F5" }}>

      {/* Header */}
      <View
        style={{
          backgroundColor: "#0F7B3C",
          paddingHorizontal: 18,
          paddingTop: 10,
          paddingBottom: 14,
        }}
      >
        <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold" }}>
          My Orders
        </Text>
      </View>

      {/* Content */}
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 16, color: "#777" }}>
          No orders yet
        </Text>
      </View>
    </View>
  );
}