import { View, Text, Image } from "react-native";

export default function PromoCard() {
  return (
    <View className="mx-4 rounded-2xl bg-orange-100 p-4 flex-row items-center">
      <Image
        source={{
          uri: "https://images.unsplash.com/photo-1545249390-6bdfa286032f",
        }}
        className="w-28 h-28 rounded-xl"
      />

      <View className="ml-4 flex-1">
        <Text className="text-xl font-bold">Exclusive Offer</Text>
        <Text className="text-gray-600 mt-1">
          Get your 1st plant @ 60% off
        </Text>
      </View>
    </View>
  );
}
