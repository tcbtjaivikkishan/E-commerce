import { View, FlatList } from "react-native";
import { useSelector } from "react-redux";

import Header from "../src/components/Header";
import PromoCard from "../src/components/PromoCard";
import CategoryTabs from "../src/components/CategoryTabs";
import ProductCard from "../src/components/ProductCard";
import BottomNav from "../src/components/BottomNav";

export default function Home() {
  const products = useSelector((state: any) => state.products.list);

  return (
    <View className="flex-1 bg-white pt-10">
      <Header />
      <PromoCard />
      <CategoryTabs />

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ProductCard item={item} />}
      />

      <BottomNav />
    </View>
  );
}
