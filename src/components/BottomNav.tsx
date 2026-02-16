import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function BottomNav() {
  return (
    <View className="flex-row justify-around py-3 border-t border-gray-200">
      <Ionicons name="home" size={24} color="green" />
      <Ionicons name="heart-outline" size={24} />
      <Ionicons name="cart-outline" size={24} />
      <Ionicons name="person-outline" size={24} />
    </View>
  );
}
