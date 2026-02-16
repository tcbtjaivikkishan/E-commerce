import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Header() {
  return (
    <View className="flex-row justify-between items-center px-4 py-2">
      <Text className="text-green-600 text-xl font-bold">PLANTSCAPE</Text>

      <View className="flex-row gap-3">
        <Ionicons name="notifications-outline" size={22} />
        <Ionicons name="menu-outline" size={22} />
      </View>
    </View>
  );
}
