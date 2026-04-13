import { useState } from "react";
import {
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
const CARD_SIZE = (width - 48) / 4;

// ─── Category Data from CSV (google_product_category mapped) ─────────────────
const CATEGORIES = [
  {
    id: "insecticides",
    title: "Insecticides & Pesticides",
    items: [
      {
        id: "1",
        name: "BPH Niyanthak",
        image:
          "https://cdn2.zohoecommerce.com/product-images/cropped-WhatsApp_Image_2025-11-21_at_18.30.34_0c99d6c0-removebg-preview-min.png/2876968000000741236/800x800?storefront_domain=products.tcbtjaivikkisan.com",
      },
      {
        id: "2",
        name: "Amritdhara",
        image:
          "https://cdn2.zohoecommerce.com/product-images/product_2-3_ratio-removebg-preview.png/2876968000000716231/800x800?storefront_domain=products.tcbtjaivikkisan.com",
      },
      {
        id: "3",
        name: "Rajat Jal",
        image:
          "https://cdn2.zohoecommerce.com/product-images/cropped-WhatsApp_Image_2025-11-21_at_18.30.47_941ad884-removebg-preview-min.png/2876968000000767090/800x800?storefront_domain=products.tcbtjaivikkisan.com",
      },
      {
        id: "4",
        name: "Swarn Jal",
        image:
          "https://cdn2.zohoecommerce.com/product-images/cropped-swarn_jal_padded_less-removebg-preview-min.png/2876968000000767578/800x800?storefront_domain=products.tcbtjaivikkisan.com",
      },
      {
        id: "5",
        name: "Red Verm Niyantrak",
        image:
          "https://cdn2.zohoecommerce.com/product-images/cropped-WhatsApp_Image_2025-11-21_at_18.30.47_e5f9b043-removebg-preview-min.png/2876968000000767326/800x800?storefront_domain=products.tcbtjaivikkisan.com",
      },
      {
        id: "6",
        name: "Tricho Fafund",
        image:
          "https://cdn2.zohoecommerce.com/product-images/cropped-WhatsApp_Image_2025-11-21_at_18.30.49_ea8e3c85-removebg-preview-min.png/2876968000000767210/800x800?storefront_domain=products.tcbtjaivikkisan.com",
      },
      {
        id: "7",
        name: "Verti Kit Bhakshan",
        image:
          "https://cdn2.zohoecommerce.com/product-images/cropped-WhatsApp_Image_2025-11-21_at_18.30.50_00f3448d-removebg-preview-min.png/2876968000000767170/800x800?storefront_domain=products.tcbtjaivikkisan.com",
      },
      {
        id: "8",
        name: "Vaayaro Aushadh",
        image:
          "https://cdn2.zohoecommerce.com/product-images/cropped-WhatsApp_Image_2025-11-21_at_18.30.50_a9310833-removebg-preview-min.png/2876968000000767130/800x800?storefront_domain=products.tcbtjaivikkisan.com",
      },
    ],
  },
  {
    id: "fertilizers",
    title: "Fertilizers & Bio Fertilizers",
    items: [
      {
        id: "9",
        name: "Praan Shakti Bhasm",
        image:
          "https://cdn2.zohoecommerce.com/product-images/cropped-WhatsApp_Image_2025-11-21_at_18.30.45_1edcd52f-removebg-preview-min.png/2876968000000767400/800x800?storefront_domain=products.tcbtjaivikkisan.com",
      },
      {
        id: "10",
        name: "Bhu Shakti Bhasm",
        image:
          "https://cdn2.zohoecommerce.com/product-images/600x600 (1) (1).png/2876968000000900030/800x800?storefront_domain=products.tcbtjaivikkisan.com",
      },
      {
        id: "11",
        name: "Carbon Charger",
        image:
          "https://cdn2.zohoecommerce.com/product-images/carbon_charger.png/2876968000000716191/800x800?storefront_domain=products.tcbtjaivikkisan.com",
      },
      {
        id: "12",
        name: "Capsule Culture Kit",
        image:
          "https://cdn2.zohoecommerce.com/product-images/cropped-WhatsApp_Image_2025-11-21_at_18.30.36_00869187-removebg-preview-min.png/2876968000000741356/800x800?storefront_domain=products.tcbtjaivikkisan.com",
      },
      {
        id: "13",
        name: "Bhumiraja 4kg",
        image: null,
      },
      {
        id: "14",
        name: "PROM 50kg",
        image:
          "https://cdn2.zohoecommerce.com/product-images/cropped-prom_bag_padded-removebg-preview-min.png/2876968000000767768/800x800?storefront_domain=products.tcbtjaivikkisan.com",
      },
      {
        id: "15",
        name: "Fafund Rodhi Bhasm",
        image:
          "https://cdn2.zohoecommerce.com/product-images/cropped-WhatsApp_Image_2025-11-21_at_18.30.36_e6effd64-removebg-preview-min.png/2876968000000741316/800x800?storefront_domain=products.tcbtjaivikkisan.com",
      },
      {
        id: "16",
        name: "Superpal Poshak",
        image:
          "https://cdn2.zohoecommerce.com/product-images/cropped-WhatsApp_Image_2025-11-21_at_18.30.48_11e4ff61-removebg-preview-min.png/2876968000000767250/800x800?storefront_domain=products.tcbtjaivikkisan.com",
      },
    ],
  },
  {
    id: "micronutrients",
    title: "Micronutrients",
    items: [
      {
        id: "17",
        name: "Sulphur Chelated",
        image:
          "https://cdn2.zohoecommerce.com/product-images/WhatsApp_Image_2025-12-04_at_16.50.04_2123f643-removebg-preview-min.png/2876968000000954209/800x800?storefront_domain=products.tcbtjaivikkisan.com",
      },
      {
        id: "18",
        name: "Zinc Chelated",
        image:
          "https://cdn2.zohoecommerce.com/product-images/WhatsApp_Image_2025-12-04_at_16.43.22_fa9996a2-removebg-preview-min.png/2876968000000954349/800x800?storefront_domain=products.tcbtjaivikkisan.com",
      },
      {
        id: "19",
        name: "Calci Four 1kg",
        image:
          "https://cdn2.zohoecommerce.com/product-images/cropped-WhatsApp_Image_2025-11-21_at_18.30.35_f4d57228-removebg-preview-min.png/2876968000000741276/800x800?storefront_domain=products.tcbtjaivikkisan.com",
      },
      {
        id: "20",
        name: "Suhaga Bhasm",
        image:
          "https://cdn2.zohoecommerce.com/product-images/cropped-WhatsApp_Image_2025-11-21_at_18.30.48_cd821a13-removebg-preview-min.png/2876968000000767286/800x800?storefront_domain=products.tcbtjaivikkisan.com",
      },
    ],
  },
  {
    id: "macronutrients",
    title: "Macronutrients",
    items: [
      {
        id: "21",
        name: "Rock Phosphate 25kg",
        image:
          "https://cdn2.zohoecommerce.com/product-images/cropped-rock_phosphate_bag_padded-removebg-preview-min.png/2876968000000767858/800x800?storefront_domain=products.tcbtjaivikkisan.com",
      },
      {
        id: "22",
        name: "Calcium Magnesium 25kg",
        image:
          "https://cdn2.zohoecommerce.com/product-images/cropped-bag_padded__1_-removebg-preview-min.png/2876968000000767734/800x800?storefront_domain=products.tcbtjaivikkisan.com",
      },
      {
        id: "23",
        name: "Anu Bhasm 1kg",
        image:
          "https://cdn2.zohoecommerce.com/product-images/800x800.png/2876968000000801054/800x800?storefront_domain=products.tcbtjaivikkisan.com",
      },
      {
        id: "24",
        name: "Bhu-Nirvishi Bhasm",
        image:
          "https://cdn2.zohoecommerce.com/product-images/WhatsApp_Image_2025-12-04_at_16.38.44_bdd4dd9d-removebg-preview-min.png/2876968000000954020/800x800?storefront_domain=products.tcbtjaivikkisan.com",
      },
    ],
  },
  {
    id: "catalysts",
    title: "Catalysts & Growth Promoters",
    items: [
      {
        id: "25",
        name: "Agnihotra Kit",
        image:
          "https://cdn2.zohoecommerce.com/product-images/cropped-800x800_1500_sq__2_-removebg-preview-min.png/2876968000000767672/800x800?storefront_domain=products.tcbtjaivikkisan.com",
      },
      {
        id: "26",
        name: "Rah Pushparisht",
        image:
          "https://cdn2.zohoecommerce.com/product-images/cropped-WhatsApp_Image_2025-11-21_at_18.30.46_545af669-removebg-preview-min.png/2876968000000767436/800x800?storefront_domain=products.tcbtjaivikkisan.com",
      },
      {
        id: "27",
        name: "Laxmi Pushpa 500ml",
        image:
          "https://cdn2.zohoecommerce.com/product-images/cropped-WhatsApp_Image_2025-11-21_at_18.30.42_f8b7be6c-removebg-preview-min.png/2876968000000741396/800x800?storefront_domain=products.tcbtjaivikkisan.com",
      },
      {
        id: "28",
        name: "Venturi Tool",
        image:
          "https://cdn2.zohoecommerce.com/product-images/600x600-removebg-preview.png/2876968000001010235/800x800?storefront_domain=products.tcbtjaivikkisan.com",
      },
    ],
  },
  {
    id: "kits",
    title: "Kits & Combos",
    items: [
      {
        id: "29",
        name: "Capsule Culture Kit",
        image:
          "https://cdn2.zohoecommerce.com/product-images/cropped-WhatsApp_Image_2025-11-21_at_18.30.36_00869187-removebg-preview-min.png/2876968000000741356/800x800?storefront_domain=products.tcbtjaivikkisan.com",
      },
      {
        id: "30",
        name: "TCBT Book Set",
        image:
          "https://cdn2.zohoecommerce.com/product-images/cropped-book_cover_padded-removebg-preview-min.png/2876968000000767886/800x800?storefront_domain=products.tcbtjaivikkisan.com",
      },
      {
        id: "31",
        name: "Kisan Panchang",
        image:
          "https://cdn2.zohoecommerce.com/product-images/800x800-removebg-preview.png/2876968000000976544/800x800?storefront_domain=products.tcbtjaivikkisan.com",
      },
      {
        id: "32",
        name: "Agnihotra Kit",
        image:
          "https://cdn2.zohoecommerce.com/product-images/cropped-800x800_1500_sq__2_-removebg-preview-min.png/2876968000000767672/800x800?storefront_domain=products.tcbtjaivikkisan.com",
      },
    ],
  },
];

// ─── Product Card ─────────────────────────────────────────────────────────────
const ProductCard = ({ item, onPress }) => (
  <TouchableOpacity
    style={styles.card}
    onPress={() => onPress?.(item)}
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

// ─── Category Section ─────────────────────────────────────────────────────────
const CategorySection = ({ category, onProductPress }) => (
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
export default function CategoryScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = searchQuery.trim()
    ? CATEGORIES.map((cat) => ({
        ...cat,
        items: cat.items.filter((item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      })).filter((cat) => cat.items.length > 0)
    : CATEGORIES;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#2E7D32" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerBrand}>
            <Text style={styles.brandName}>Jaivik Mart</Text>
            <View style={styles.deliveryRow}>
              <Text style={styles.deliveryTime}>2–3 days</Text>
            </View>
            <TouchableOpacity style={styles.locationRow}>
              <Text style={styles.locationLabel}>HOME</Text>
              <Text style={styles.locationSep}> – </Text>
              <Text style={styles.locationText}>Ranjhi, Jabalpur</Text>
              <Text style={styles.dropdownArrow}> ▾</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.avatarBtn}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarIcon}>👤</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ── Search Bar ── */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder='Search "Agnihotra"'
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          <TouchableOpacity style={styles.micBtn}>
            <Text style={styles.micIcon}>🎤</Text>
          </TouchableOpacity>
        </View>
      </View>

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
            onProductPress={(item) => {
              // navigation.navigate('ProductDetail', { product: item })
              console.log("Pressed:", item.name);
            }}
          />
        ))}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F5F0",
  },

  // Header
  header: {
    backgroundColor: "#2E7D32",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  headerBrand: {
    flex: 1,
  },
  brandName: {
    color: "#FFD54F",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  deliveryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 1,
  },
  deliveryTime: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  locationLabel: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    opacity: 0.9,
  },
  locationSep: {
    color: "#FFFFFF",
    fontSize: 12,
    opacity: 0.6,
  },
  locationText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
    opacity: 0.9,
  },
  dropdownArrow: {
    color: "#FFFFFF",
    fontSize: 11,
    opacity: 0.8,
  },
  avatarBtn: {
    marginTop: 2,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.35)",
  },
  avatarIcon: {
    fontSize: 18,
  },

  // Search
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
    opacity: 0.6,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#222",
    paddingVertical: 0,
  },
  micBtn: {
    padding: 4,
  },
  micIcon: {
    fontSize: 18,
    opacity: 0.65,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
    paddingHorizontal: 12,
  },

  // Section
  section: {
    marginBottom: 4,
    paddingBottom: 12,
  },
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
  seeAll: {
    fontSize: 12,
    color: "#2E7D32",
    fontWeight: "600",
  },

  // Grid
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  // Card
  card: {
    width: CARD_SIZE,
    alignItems: "center",
  },
  cardImageBox: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: 12,
    backgroundColor: "#FFF8E7",
    overflow: "hidden",
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
