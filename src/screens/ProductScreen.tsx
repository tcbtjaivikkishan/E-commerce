import { router, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import {
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { PRODUCTS } from "../constants/data";
import { C } from "../constants/theme";
import { useCart } from "../hooks/useCart";
import { useWishlist } from "../hooks/useWishlist";

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { add, remove, getQty } = useCart();
  const { isWishlisted, toggle } = useWishlist();

  const product = useMemo(() => PRODUCTS.find((p) => p.id === id), [id]);
  const qty = getQty(id ?? "");
  const wishlisted = isWishlisted(id ?? "");

  if (!product) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.errorContainer}>
          <Text style={s.errorText}>Product not found</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={s.backLink}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.green} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backBtnText}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => id && toggle(id)}
          style={s.wishlistBtn}
        >
          <Text style={s.wishlistIcon}>{wishlisted ? "❤️" : "🤍"}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View style={s.imageContainer}>
          <Image source={{ uri: product.image }} style={s.image} />
          {product.tag && (
            <View style={[s.tag, { backgroundColor: C.red }]}>
              <Text style={s.tagText}>{product.tag}</Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={s.content}>
          <Text style={s.category}>{product.category.toUpperCase()}</Text>
          <Text style={s.name}>{product.name}</Text>
          <Text style={s.unit}>{product.unit}</Text>

          <View style={s.priceRow}>
            <Text style={s.price}>₹{product.priceRaw}</Text>
            {product.mrp && (
              <Text style={s.mrp}>₹{product.mrp}</Text>
            )}
            {product.discountPct && (
              <Text style={s.discount}>{product.discountPct}% OFF</Text>
            )}
          </View>

          {product.rating && (
            <View style={s.ratingRow}>
              <Text style={s.rating}>⭐ {product.rating}</Text>
            </View>
          )}

          <View style={s.divider} />

          <Text style={s.sectionTitle}>Description</Text>
          <Text style={s.description}>
            Fresh {product.name.toLowerCase()} delivered straight from local farmers.
            Best quality guaranteed with our 100% satisfaction policy.
          </Text>

          <View style={s.divider} />

          <Text style={s.sectionTitle}>Storage Instructions</Text>
          <Text style={s.description}>
            Store in a cool, dry place. Best consumed within 3-5 days of delivery for optimal freshness.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={s.bottomBar}>
        <View style={s.priceContainer}>
          <Text style={s.priceLabel}>Price</Text>
          <Text style={s.bottomPrice}>₹{product.priceRaw}</Text>
        </View>

        {qty === 0 ? (
          <TouchableOpacity
            style={s.addButton}
            onPress={() => id && add(id)}
          >
            <Text style={s.addButtonText}>Add to Cart</Text>
          </TouchableOpacity>
        ) : (
          <View style={s.stepper}>
            <TouchableOpacity
              style={s.stepperBtn}
              onPress={() => id && remove(id)}
            >
              <Text style={s.stepperText}>−</Text>
            </TouchableOpacity>
            <Text style={s.stepperCount}>{qty}</Text>
            <TouchableOpacity
              style={s.stepperBtn}
              onPress={() => id && add(id)}
            >
              <Text style={s.stepperText}>+</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: C.green,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  backBtnText: {
    fontSize: 24,
    color: "#fff",
  },
  wishlistBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  wishlistIcon: {
    fontSize: 20,
  },
  imageContainer: {
    height: 300,
    backgroundColor: C.gray1,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  tag: {
    position: "absolute",
    top: 16,
    left: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tagText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },
  content: {
    padding: 20,
  },
  category: {
    fontSize: 12,
    color: C.gray4,
    fontWeight: "600",
    letterSpacing: 1,
    marginBottom: 4,
  },
  name: {
    fontSize: 24,
    fontWeight: "800",
    color: C.black,
    marginBottom: 4,
  },
  unit: {
    fontSize: 14,
    color: C.gray5,
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  price: {
    fontSize: 28,
    fontWeight: "800",
    color: C.black,
  },
  mrp: {
    fontSize: 16,
    color: C.gray4,
    textDecorationLine: "line-through",
  },
  discount: {
    fontSize: 14,
    fontWeight: "700",
    color: "#DC2626",
    backgroundColor: "rgba(220,38,38,0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  ratingRow: {
    marginTop: 12,
  },
  rating: {
    fontSize: 16,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: C.gray3,
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: C.black,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: C.gray6,
    lineHeight: 22,
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: C.gray3,
  },
  priceContainer: {},
  priceLabel: {
    fontSize: 12,
    color: C.gray4,
  },
  bottomPrice: {
    fontSize: 22,
    fontWeight: "800",
    color: C.black,
  },
  addButton: {
    backgroundColor: C.green,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.green,
    borderRadius: 12,
    overflow: "hidden",
  },
  stepperBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
  },
  stepperCount: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    minWidth: 40,
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    fontSize: 18,
    color: C.gray6,
    marginBottom: 16,
  },
  backLink: {
    color: C.green,
    fontSize: 16,
    fontWeight: "600",
  },
});
