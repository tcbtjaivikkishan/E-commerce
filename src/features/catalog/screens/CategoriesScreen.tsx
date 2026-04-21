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

import Header from "../../../shared/components/Header";

// ─── Data Types ───────────────────────────────────────────────────────────────
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

const { width } = Dimensions.get("window");
const CARD_SIZE = (width - 48) / 4;

// ─── Category Data ────────────────────────────────────────────────────────────
const CATEGORIES: Category[] = [
  {
    id: "insecticides",
    title: "Insecticides & Pesticides",
    items: [
      { id: "1", item_id: "2876968000000037729", name: "BPH Niyanthak", image: "https://cdn2.zohoecommerce.com/product-images/cropped-WhatsApp_Image_2025-11-21_at_18.30.34_0c99d6c0-removebg-preview-min.png/2876968000000741236/800x800?storefront_domain=products.tcbtjaivikkisan.com" },
      { id: "2", item_id: "2876968000000039073", name: "Amritdhara", image: "https://cdn2.zohoecommerce.com/product-images/product_2-3_ratio-removebg-preview.png/2876968000000716231/800x800?storefront_domain=products.tcbtjaivikkisan.com" },
      { id: "3", item_id: "2876968000000042263", name: "Rajat Jal", image: "https://cdn2.zohoecommerce.com/product-images/cropped-WhatsApp_Image_2025-11-21_at_18.30.47_941ad884-removebg-preview-min.png/2876968000000767090/800x800?storefront_domain=products.tcbtjaivikkisan.com" },
      { id: "4", item_id: "2876968000000039563", name: "Swarn Jal", image: "https://cdn2.zohoecommerce.com/product-images/cropped-swarn_jal_padded_less-removebg-preview-min.png/2876968000000767578/800x800?storefront_domain=products.tcbtjaivikkisan.com" },
      { id: "5", item_id: "2876968000000033955", name: "Red Verm Niyantrak", image: "https://cdn2.zohoecommerce.com/product-images/cropped-WhatsApp_Image_2025-11-21_at_18.30.47_e5f9b043-removebg-preview-min.png/2876968000000767326/800x800?storefront_domain=products.tcbtjaivikkisan.com" },
      { id: "6", item_id: "2876968000000037095", name: "Tricho Fafund", image: "https://cdn2.zohoecommerce.com/product-images/cropped-WhatsApp_Image_2025-11-21_at_18.30.49_ea8e3c85-removebg-preview-min.png/2876968000000767210/800x800?storefront_domain=products.tcbtjaivikkisan.com" },
      { id: "7", item_id: "2876968000000037025", name: "Verti Kit Bhakshan", image: "https://cdn2.zohoecommerce.com/product-images/cropped-WhatsApp_Image_2025-11-21_at_18.30.50_00f3448d-removebg-preview-min.png/2876968000000767170/800x800?storefront_domain=products.tcbtjaivikkisan.com" },
      { id: "8", item_id: "2876968000000039703", name: "Vaayaro Aushadh", image: "https://cdn2.zohoecommerce.com/product-images/cropped-WhatsApp_Image_2025-11-21_at_18.30.50_a9310833-removebg-preview-min.png/2876968000000767130/800x800?storefront_domain=products.tcbtjaivikkisan.com" },
    ],
  },
  {
    id: "fertilizers",
    title: "Fertilizers & Bio Fertilizers",
    items: [
      { id: "9",  item_id: "2876968000000312015", name: "Praan Shakti Bhasm", image: "https://cdn2.zohoecommerce.com/product-images/cropped-WhatsApp_Image_2025-11-21_at_18.30.45_1edcd52f-removebg-preview-min.png/2876968000000767400/800x800?storefront_domain=products.tcbtjaivikkisan.com" },
      { id: "10", item_id: "2876968000000037799", name: "Bhu Shakti Bhasm", image: "https://cdn2.zohoecommerce.com/product-images/600x600 (1) (1).png/2876968000000900030/800x800?storefront_domain=products.tcbtjaivikkisan.com" },
      { id: "11", item_id: "2876968000000037165", name: "Carbon Charger", image: "https://cdn2.zohoecommerce.com/product-images/carbon_charger.png/2876968000000716191/800x800?storefront_domain=products.tcbtjaivikkisan.com" },
      { id: "12", item_id: "2876968000000037449", name: "Capsule Culture Kit", image: "https://cdn2.zohoecommerce.com/product-images/cropped-WhatsApp_Image_2025-11-21_at_18.30.36_00869187-removebg-preview-min.png/2876968000000741356/800x800?storefront_domain=products.tcbtjaivikkisan.com" },
      { id: "13", item_id: "2876968000000039983", name: "Bhumiraja 4kg", image: null },
      { id: "14", item_id: "2876968000000033454", name: "PROM 50kg", image: "https://cdn2.zohoecommerce.com/product-images/cropped-prom_bag_padded-removebg-preview-min.png/2876968000000767768/800x800?storefront_domain=products.tcbtjaivikkisan.com" },
      { id: "15", item_id: "2876968000000037239", name: "Fafund Rodhi Bhasm", image: "https://cdn2.zohoecommerce.com/product-images/cropped-WhatsApp_Image_2025-11-21_at_18.30.36_e6effd64-removebg-preview-min.png/2876968000000741316/800x800?storefront_domain=products.tcbtjaivikkisan.com" },
      { id: "16", item_id: "2876968000000037659", name: "Superpal Poshak", image: "https://cdn2.zohoecommerce.com/product-images/cropped-WhatsApp_Image_2025-11-21_at_18.30.48_11e4ff61-removebg-preview-min.png/2876968000000767250/800x800?storefront_domain=products.tcbtjaivikkisan.com" },
    ],
  },
  {
    id: "micronutrients",
    title: "Micronutrients",
    items: [
      { id: "17", item_id: "2876968000000955190", name: "Sulphur Chelated", image: "https://cdn2.zohoecommerce.com/product-images/WhatsApp_Image_2025-12-04_at_16.50.04_2123f643-removebg-preview-min.png/2876968000000954209/800x800?storefront_domain=products.tcbtjaivikkisan.com" },
      { id: "18", item_id: "2876968000000955165", name: "Zinc Chelated", image: "https://cdn2.zohoecommerce.com/product-images/WhatsApp_Image_2025-12-04_at_16.43.22_fa9996a2-removebg-preview-min.png/2876968000000954349/800x800?storefront_domain=products.tcbtjaivikkisan.com" },
      { id: "19", item_id: "2876968000000033885", name: "Calci Four 1kg", image: "https://cdn2.zohoecommerce.com/product-images/cropped-WhatsApp_Image_2025-11-21_at_18.30.35_f4d57228-removebg-preview-min.png/2876968000000741276/800x800?storefront_domain=products.tcbtjaivikkisan.com" },
      { id: "20", item_id: "2876968000000033675", name: "Suhaga Bhasm", image: "https://cdn2.zohoecommerce.com/product-images/cropped-WhatsApp_Image_2025-11-21_at_18.30.48_cd821a13-removebg-preview-min.png/2876968000000767286/800x800?storefront_domain=products.tcbtjaivikkisan.com" },
    ],
  },
  {
    id: "macronutrients",
    title: "Macronutrients",
    items: [
      { id: "21", item_id: "2876968000000327980", name: "Rock Phosphate 25kg", image: "https://cdn2.zohoecommerce.com/product-images/cropped-rock_phosphate_bag_padded-removebg-preview-min.png/2876968000000767858/800x800?storefront_domain=products.tcbtjaivikkisan.com" },
      { id: "22", item_id: "2876968000000327901", name: "Calcium Magnesium 25kg", image: "https://cdn2.zohoecommerce.com/product-images/cropped-bag_padded__1_-removebg-preview-min.png/2876968000000767734/800x800?storefront_domain=products.tcbtjaivikkisan.com" },
      { id: "23", item_id: "2876968000000037589", name: "Anu Bhasm 1kg", image: "https://cdn2.zohoecommerce.com/product-images/800x800.png/2876968000000801054/800x800?storefront_domain=products.tcbtjaivikkisan.com" },
      { id: "24", item_id: "2876968000000947131", name: "Bhu-Nirvishi Bhasm", image: "https://cdn2.zohoecommerce.com/product-images/WhatsApp_Image_2025-12-04_at_16.38.44_bdd4dd9d-removebg-preview-min.png/2876968000000954020/800x800?storefront_domain=products.tcbtjaivikkisan.com" },
    ],
  },
  {
    id: "catalysts",
    title: "Catalysts & Growth Promoters",
    items: [
      { id: "25", item_id: "2876968000000372071", name: "Agnihotra Kit", image: "https://cdn2.zohoecommerce.com/product-images/cropped-800x800_1500_sq__2_-removebg-preview-min.png/2876968000000767672/800x800?storefront_domain=products.tcbtjaivikkisan.com" },
      { id: "26", item_id: "2876968000000039773", name: "Rah Pushparisht", image: "https://cdn2.zohoecommerce.com/product-images/cropped-WhatsApp_Image_2025-11-21_at_18.30.46_545af669-removebg-preview-min.png/2876968000000767436/800x800?storefront_domain=products.tcbtjaivikkisan.com" },
      { id: "27", item_id: "2876968000000038009", name: "Laxmi Pushpa 500ml", image: "https://cdn2.zohoecommerce.com/product-images/cropped-WhatsApp_Image_2025-11-21_at_18.30.42_f8b7be6c-removebg-preview-min.png/2876968000000741396/800x800?storefront_domain=products.tcbtjaivikkisan.com" },
      { id: "28", item_id: "2876968000000646011", name: "Venturi Tool", image: "https://cdn2.zohoecommerce.com/product-images/600x600-removebg-preview.png/2876968000001010235/800x800?storefront_domain=products.tcbtjaivikkisan.com" },
    ],
  },
  {
    id: "kits",
    title: "Kits & Combos",
    items: [
      { id: "29", item_id: "2876968000000037449", name: "Capsule Culture Kit", image: "https://cdn2.zohoecommerce.com/product-images/cropped-WhatsApp_Image_2025-11-21_at_18.30.36_00869187-removebg-preview-min.png/2876968000000741356/800x800?storefront_domain=products.tcbtjaivikkisan.com" },
      { id: "30", item_id: "2876968000000372202", name: "TCBT Book Set", image: "https://cdn2.zohoecommerce.com/product-images/cropped-book_cover_padded-removebg-preview-min.png/2876968000000767886/800x800?storefront_domain=products.tcbtjaivikkisan.com" },
      { id: "31", item_id: "2876968000000397063", name: "Kisan Panchang", image: "https://cdn2.zohoecommerce.com/product-images/800x800-removebg-preview.png/2876968000000976544/800x800?storefront_domain=products.tcbtjaivikkisan.com" },
      { id: "32", item_id: "2876968000000372071", name: "Agnihotra Kit", image: "https://cdn2.zohoecommerce.com/product-images/cropped-800x800_1500_sq__2_-removebg-preview-min.png/2876968000000767672/800x800?storefront_domain=products.tcbtjaivikkisan.com" },
    ],
  },
];

// ─── Product Card ─────────────────────────────────────────────────────────────
const ProductCard: React.FC<{ item: CategoryItem; onPress: (item: CategoryItem) => void }> = ({ item, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={() => onPress(item)} activeOpacity={0.75}>
    <View style={styles.cardImageBox}>
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.cardImage} resizeMode="contain" />
      ) : (
        <View style={styles.cardImagePlaceholder} />
      )}
    </View>
    <Text style={styles.cardLabel} numberOfLines={2}>{item.name}</Text>
  </TouchableOpacity>
);

// ─── Category Section ─────────────────────────────────────────────────────────
const CategorySection: React.FC<{ category: Category; onProductPress: (item: CategoryItem) => void }> = ({ category, onProductPress }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{category.title}</Text>
      <TouchableOpacity>
        <Text style={styles.seeAll}>See All</Text>
      </TouchableOpacity>
    </View>
    <View style={styles.grid}>
      {category.items.map((item) => (
        <ProductCard key={item.id} item={item} onPress={onProductPress} />
      ))}
    </View>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function CategoryScreen(): React.JSX.Element {
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredCategories: Category[] = searchQuery.trim()
    ? CATEGORIES.map((cat) => ({
        ...cat,
        items: cat.items.filter((item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      })).filter((cat) => cat.items.length > 0)
    : CATEGORIES;

  const handleProductPress = (cardItem: CategoryItem): void => {
    router.push(`/product/${cardItem.item_id}` as any);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#196F1B" />

      {/* ── Shared Header — replaces old inline header ── */}
      <Header
        searchPlaceholder='Search "Agnihotra"'
        onSearchPress={() => router.push("/search" as any)}
      />

      {/* ── Category Scroll ── */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredCategories.map((cat) => (
          <CategorySection
            key={cat.id}
            category={cat}
            onProductPress={handleProductPress}
          />
        ))}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },

  scrollView: { flex: 1 },
  scrollContent: { paddingTop: 8, paddingHorizontal: 12 },

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
    letterSpacing: 0.1,
  },
  seeAll: { fontSize: 12, color: "#196F1B", fontWeight: "600" },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  card: { width: CARD_SIZE, alignItems: "center" },
  cardImageBox: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: 12,
    backgroundColor: "#FFF8E7",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  cardImage: { width: CARD_SIZE - 8, height: CARD_SIZE - 8 },
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
