import { View, Text, ScrollView, TextInput, Image } from "react-native";

const products = [
  {
    id: 1,
    name: "Organic Tomatoes",
    price: "₹40/kg",
    image:
      "https://images.unsplash.com/photo-1592928302636-c83cf1e1f5a5",
  },
  {
    id: 2,
    name: "Fresh Spinach",
    price: "₹25/bunch",
    image:
      "https://images.unsplash.com/photo-1576045057995-568f588f82fb",
  },
  {
    id: 3,
    name: "Natural Turmeric",
    price: "₹120/kg",
    image:
      "https://images.unsplash.com/photo-1615485925600-97237c4fc1ec",
  },
];

export default function Home() {
  return (
    <ScrollView className="flex-1 bg-[#F7F9F4] px-5 pt-14">

      {/* HEADER */}
      <Text className="text-3xl font-bold text-[#2E7D32]">
        🌾 Organic Market
      </Text>

      {/* SEARCH */}
      <TextInput
        placeholder="Search fresh produce..."
        className="bg-white mt-5 p-4 rounded-2xl"
      />

      {/* CATEGORY */}
      <Text className="text-xl font-semibold mt-8 mb-3">
        Categories
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {["Vegetables", "Fruits", "Grains", "Spices"].map((cat) => (
          <View
            key={cat}
            className="bg-[#A5D6A7] px-5 py-3 rounded-full mr-3"
          >
            <Text className="font-medium text-[#1B5E20]">{cat}</Text>
          </View>
        ))}
      </ScrollView>

      {/* PRODUCTS */}
      <Text className="text-xl font-semibold mt-10 mb-4">
        Fresh Harvest 🌱
      </Text>

      {products.map((item) => (
        <View
          key={item.id}
          className="bg-white rounded-2xl mb-5 overflow-hidden shadow-sm"
        >
          <Image
            source={{ uri: item.image }}
            className="w-full h-44"
          />

          <View className="p-4">
            <Text className="text-lg font-semibold">{item.name}</Text>
            <Text className="text-[#2E7D32] mt-1 font-bold">
              {item.price}
            </Text>
          </View>
        </View>
      ))}

      <View className="h-24" />
    </ScrollView>
  );
}