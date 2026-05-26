import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { upsertProductData } from "../../cart/store/cartSlice";
import { useAppDispatch } from "../../../shared/hooks/useRedux";
import {
  getProductImage,
  getProductPrice,
  getProductVariants,
  type ProductVariantOption,
} from "../utils/productVariants";

type Props = {
  visible: boolean;
  product: any | null;
  getQty: (id: string) => number;
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
  onClose: () => void;
};

export default function VariantPickerModal({
  visible,
  product,
  getQty,
  onAdd,
  onRemove,
  onClose,
}: Props) {
  const dispatch = useAppDispatch();
  const variants = product ? getProductVariants(product) : [];
  const fallbackImage = getProductImage(product);
  const fallbackPrice = getProductPrice(product);
  const productName = product?.name || product?.item_name || "Product";

  const saveVariantForCart = (variant: ProductVariantOption) => {
    dispatch(upsertProductData({
      id: variant.cartId,
      name: productName,
      priceRaw: variant.price || fallbackPrice,
      unit: variant.unit || variant.name,
      image: variant.image || fallbackImage || "https://via.placeholder.com/150",
    }));
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={styles.sheetWrap}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.85}>
            <Ionicons name="close" size={26} color="#fff" />
          </TouchableOpacity>

          <View style={styles.sheet}>
            <Text style={styles.title} numberOfLines={2}>
              {product?.name || product?.item_name || "Choose option"}
            </Text>

            <ScrollView
              showsVerticalScrollIndicator
              contentContainerStyle={styles.listContent}
            >
              {variants.map((variant) => (
                <VariantRow
                  key={variant.id}
                  variant={variant}
                  fallbackImage={fallbackImage}
                  fallbackPrice={fallbackPrice}
                  qty={getQty(variant.cartId)}
                  onAdd={() => {
                    saveVariantForCart(variant);
                    onAdd(variant.cartId);
                  }}
                  onRemove={() => onRemove(variant.cartId)}
                />
              ))}
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function VariantRow({
  variant,
  fallbackImage,
  fallbackPrice,
  qty,
  onAdd,
  onRemove,
}: {
  variant: ProductVariantOption;
  fallbackImage: string | null;
  fallbackPrice: number;
  qty: number;
  onAdd: () => void;
  onRemove: () => void;
}) {
  const image = variant.image || fallbackImage;
  const price = variant.price || fallbackPrice;

  return (
    <View style={styles.variantRow}>
      {image ? (
        <Image source={{ uri: image }} style={styles.variantImage} resizeMode="contain" />
      ) : (
        <View style={styles.variantImagePlaceholder}>
          <Ionicons name="leaf-outline" size={22} color="#196F1B" />
        </View>
      )}

      <View style={styles.variantInfo}>
        <Text style={styles.variantUnit} numberOfLines={1}>
          {variant.unit || variant.name}
        </Text>
      </View>

      <Text style={styles.variantPrice}>{"\u20B9"}{price}</Text>

      {qty === 0 ? (
        <TouchableOpacity style={styles.addBtn} onPress={onAdd} activeOpacity={0.85}>
          <Text style={styles.addBtnText}>ADD</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.stepper}>
          <TouchableOpacity style={styles.stepBtn} onPress={onRemove}>
            <Text style={styles.stepText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.stepQty}>{qty}</Text>
          <TouchableOpacity style={styles.stepBtn} onPress={onAdd}>
            <Text style={styles.stepText}>+</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const GREEN = "#196F1B";

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.66)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  sheetWrap: {
    width: "100%",
    maxWidth: 610,
    alignItems: "center",
  },
  closeBtn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "rgba(0,0,0,0.72)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  sheet: {
    width: "100%",
    maxHeight: 360,
    borderRadius: 16,
    backgroundColor: "#F5F6FA",
    padding: 16,
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "800",
    color: "#22252A",
    marginBottom: 14,
  },
  listContent: {
    gap: 14,
  },
  variantRow: {
    minHeight: 86,
    borderRadius: 12,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  variantImage: {
    width: 54,
    height: 62,
    marginRight: 14,
  },
  variantImagePlaceholder: {
    width: 54,
    height: 62,
    borderRadius: 8,
    backgroundColor: "#EAF6EF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  variantInfo: {
    flex: 1,
    minWidth: 54,
  },
  variantUnit: {
    fontSize: 14,
    color: "#555",
    fontWeight: "500",
  },
  variantPrice: {
    width: 62,
    fontSize: 15,
    fontWeight: "800",
    color: "#111",
    textAlign: "left",
  },
  addBtn: {
    minWidth: 84,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: GREEN,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnText: {
    color: GREEN,
    fontSize: 14,
    fontWeight: "800",
  },
  stepper: {
    minWidth: 84,
    height: 40,
    borderRadius: 8,
    backgroundColor: GREEN,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    overflow: "hidden",
  },
  stepBtn: {
    width: 28,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  stepText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "800",
  },
  stepQty: {
    minWidth: 24,
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
    textAlign: "center",
  },
});
