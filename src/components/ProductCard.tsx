import { View, Text, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ProductCard({ item }: any) {
  return (
    <View className="mx-5 mb-4 rounded-3xl bg-[#DCEFE4] p-4 flex-row items-center relative overflow-hidden">

      {/* Circular background shape on right */}
      <View className="absolute right-[-30] w-32 h-32 bg-[#CBE5D5] rounded-full" />

      <Image
        source={{ uri: item.image }}
        className="w-20 h-20 rounded-2xl z-10"
      />

      <View className="ml-4 flex-1 z-10">
        <Text className="font-semibold text-base">{item.name}</Text>
        <Text className="text-gray-500 text-sm mt-1">
          {item.family}
        </Text>
        <Text className="font-bold mt-2">₹ {item.price}</Text>
      </View>

      <TouchableOpacity className="bg-green-300 w-10 h-10 rounded-full items-center justify-center z-10">
        <Ionicons name="add" size={20} />
      </TouchableOpacity>
    </View>
  );
}
