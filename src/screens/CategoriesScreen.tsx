import { router } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import Header from "../components/ui/Header";
import Footer from "../components/ui/Footer"; // ✅ ADDED
import PRODUCTS_JSON from "../data/products.json";

// ─── TYPES (unchanged) ───
export interface TaxPreference {
  tax_specification: string;
  tax_specific_type: string;
  is_non_advol_tax: boolean;
  tax_name_formatted: string;
  tax_type: number;
  tax_groups_details: unknown[];
  tax_name: string;
  tax_percentage: number;
  tax_id: string;
  new_tax_type: string;
}

export interface Product {
  item_id: string;
  name: string;
  item_name: string;
  category_id?: string;
  category_name?: string;
  unit?: string;
  status?: string;
  description?: string;
  brand?: string;
  manufacturer?: string;
  rate: number;
  label_rate?: number;
  tax_percentage?: number;
  item_tax_preferences: TaxPreference[];
  track_inventory?: boolean;
  available_stock?: number;
  actual_available_stock?: number;
  stock_on_hand?: number;
  is_returnable?: boolean;
  sku?: string;
  hsn_or_sac?: string;
  product_type?: string;
  weight_with_unit?: string;
  dimensions_with_unit?: string;
  image_name: string;
  image_document_id: string;
  image_type?: string;
  show_in_storefront?: boolean;
  has_attachment?: boolean;
  created_time?: string;
  last_modified_time?: string;
  tags?: string[];
}

interface CategoryItem {
  id: string;
  item_id: string;
  name: string;
  image: string | null;
}

interface Category {
  id: string;
  title: string;
  items: CategoryItem[];
}

const PRODUCTS_MAP: Record<string, Product> = {};
((PRODUCTS_JSON as { items: Product[] }).items ?? []).forEach((p: Product) => {
  PRODUCTS_MAP[p.item_id] = p;
});

const { width } = Dimensions.get("window");
const CARD_SIZE = (width - 48) / 4;

// ─── DATA (unchanged) ───
const CATEGORIES: Category[] = [
  // 🔥 SAME DATA (unchanged)
];

// ─── Product Card ───
const ProductCard: React.FC<{
  item: CategoryItem;
  onPress: (item: CategoryItem) => void;
}> = ({ item, onPress }) => (
  <TouchableOpacity
    style={styles.card}
    onPress={() => onPress(item)}
    activeOpacity={0.75}
  >
    <View style={styles.cardImageBox}>
      {item.image ? (
        <Image
          source={{ uri: item.image }}
          style={styles.cardImage}
          resizeMode="contain"
        />
      ) : (
        <View style={styles.cardImagePlaceholder} />
      )}
    </View>
    <Text style={styles.cardLabel} numberOfLines={2}>
      {item.name}
    </Text>
  </TouchableOpacity>
);

// ─── Category Section ───
const CategorySection: React.FC<{
  category: Category;
  onProductPress: (item: CategoryItem) => void;
}> = ({ category, onProductPress }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{category.title}</Text>
      <TouchableOpacity>
        <Text style={styles.seeAll}>See All</Text>
      </TouchableOpacity>
    </View>
    <View style={styles.grid}>
      {category.items.map((item) => (
        <ProductCard
          key={item.id}
          item={item}
          onPress={onProductPress}
        />
      ))}
    </View>
  </View>
);

// ─── MAIN SCREEN ───
export default function CategoryScreen(): React.JSX.Element {
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredCategories: Category[] = searchQuery.trim()
    ? CATEGORIES.map((cat) => ({
        ...cat,
        items: cat.items.filter((item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      })).filter((cat) => cat.items.length > 0)
    : CATEGORIES;

  const handleProductPress = (cardItem: CategoryItem): void => {
    router.push(`/product/${cardItem.item_id}` as any);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#196F1B" />

      <Header
        searchPlaceholder='Search "Agnihotra"'
        onSearchPress={() => router.push("/search" as any)}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent} // ✅ FIXED
        showsVerticalScrollIndicator={false}
      >
        {filteredCategories.map((cat) => (
          <CategorySection
            key={cat.id}
            category={cat}
            onProductPress={handleProductPress}
          />
        ))}
      </ScrollView>

      {/* ✅ GLOBAL FOOTER */}
      <Footer />
    </SafeAreaView>
  );
}

// ─── STYLES ───
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },

  scrollView: { flex: 1 },

  // ✅ IMPORTANT (footer spacing)
  scrollContent: {
    paddingTop: 8,
    paddingHorizontal: 12,
    paddingBottom: 130,
  },

  section: { marginBottom: 4, paddingBottom: 12 },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
  },

  seeAll: {
    fontSize: 12,
    color: "#196F1B",
    fontWeight: "600",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  card: {
    width: CARD_SIZE,
    alignItems: "center",
  },

  cardImageBox: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: 12,
    backgroundColor: "#FFF8E7",
    alignItems: "center",
    justifyContent: "center",
  },

  cardImage: {
    width: CARD_SIZE - 8,
    height: CARD_SIZE - 8,
  },

  cardImagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#FFF3CC",
  },

  cardLabel: {
    marginTop: 5,
    fontSize: 11,
    color: "#333",
    textAlign: "center",
    lineHeight: 14,
    paddingHorizontal: 2,
  },
});