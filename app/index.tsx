import { View, Text, Image, ScrollView, Pressable } from "react-native";
import { router } from "expo-router";

export default function Landing() {
  return (
    <ScrollView className="flex-1 bg-[#F7F9F4]">
      
      {/* HERO SECTION */}
      <View className="items-center px-6 pt-16">
        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6",
          }}
          className="w-full h-72 rounded-3xl"
        />

        <Text className="text-4xl font-bold text-[#2E7D32] mt-6 text-center">
          Fresh From Farmers 🌾
        </Text>

        <Text className="text-gray-600 text-center mt-3 text-base">
          Organic produce directly from FPOs & local farmers to your home.
        </Text>

        <Pressable
          onPress={() => router.push("/home")}
          className="bg-[#2E7D32] px-10 py-4 rounded-full mt-8"
        >
          <Text className="text-white text-lg font-semibold">
            Explore Products
          </Text>
        </Pressable>
      </View>

      {/* TRUST SECTION */}
      <View className="mt-14 px-6">
        <Text className="text-2xl font-bold text-[#2E7D32] mb-6">
          Why Choose Us?
        </Text>

        <View className="space-y-4">
          <View className="bg-white p-5 rounded-2xl shadow-sm">
            <Text className="font-semibold text-lg">
              🌱 100% Organic Farming
            </Text>
            <Text className="text-gray-500 mt-1">
              Chemical-free produce sourced directly from verified farmers.
            </Text>
          </View>

          <View className="bg-white p-5 rounded-2xl shadow-sm">
            <Text className="font-semibold text-lg">
              🤝 Support Local FPOs
            </Text>
            <Text className="text-gray-500 mt-1">
              Empower farmer producer organizations across India.
            </Text>
          </View>

          <View className="bg-white p-5 rounded-2xl shadow-sm">
            <Text className="font-semibold text-lg">
              🚚 Farm to Home Delivery
            </Text>
            <Text className="text-gray-500 mt-1">
              Fresh harvest delivered directly to your doorstep.
            </Text>
          </View>
        </View>
      </View>

      <View className="h-20" />
    </ScrollView>
  );
}