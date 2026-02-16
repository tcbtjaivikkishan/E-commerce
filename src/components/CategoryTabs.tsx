import { View, Text, TouchableOpacity } from "react-native";
import { categories } from "../data/mockData";
import { Ionicons } from "@expo/vector-icons";

export default function CategoryTabs() {
  return (
    <View className="flex-row justify-around my-4">
      {categories.map((cat) => (
        <TouchableOpacity key={cat.id} className="items-center">
          <Ionicons name={cat.icon as any} size={22} color="green" />
          <Text className="text-gray-600 mt-1">{cat.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
