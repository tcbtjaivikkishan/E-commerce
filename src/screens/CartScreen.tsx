import { router } from "expo-router";
import React, { useRef } from "react";
import {
  Animated,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import {
  addItem,
  clearItem,
  removeItem,
  selectCartProducts,
  selectDeliveryFee,
  selectSubtotal,
  selectTotal,
  selectTotalItems,
} from "../store/cartSlice";

/* ─── Empty Cart ─── */
function EmptyCart() {
  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 24,
        }}
      >
        <Image
          source={require("@/assets/images/shopping-cart.png")}
          style={{
            width: 170,
            height: 170,
            marginBottom: 90,
          }}
          resizeMode="contain"
        />

        <Text
          style={{
            fontSize: 20,
            fontWeight: "800",
            color: "#111",
            marginBottom: 8,
          }}
        >
          Empty Cart
        </Text>

        <Text
          style={{
            fontSize: 13,
            color: "#777",
            textAlign: "center",
            marginBottom: 20,
          }}
        >
          There are no items to show up here{"\n"}add items to buy.
        </Text>

        <TouchableOpacity
          style={{
            backgroundColor: "#0F7B3C",
            paddingHorizontal: 28,
            paddingVertical: 14,
            borderRadius: 12,
          }}
          onPress={() => router.push("/home")}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>
            Start Shopping
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ─── Cart Item ─── */
function CartItemRow({ item }: { item: { product: any; qty: number } }) {
  const dispatch = useAppDispatch();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const { product, qty } = item;

  const pulse = () =>
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.96,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 60,
        useNativeDriver: true,
      }),
    ]).start();

  return (
    <Animated.View
      className="bg-white rounded-2xl mb-2.5 flex-row overflow-hidden"
      style={{ transform: [{ scale: scaleAnim }], elevation: 1 }}
    >
      <Image source={{ uri: product.image }} className="w-[90px] h-[90px]" />

      <View className="flex-1 p-3 justify-between">
        <View className="flex-row justify-between">
          <Text className="text-sm font-bold text-[#111]" numberOfLines={2}>
            {product.name}
          </Text>

          <TouchableOpacity onPress={() => dispatch(clearItem(product.id))}>
            <Text>✕</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-between items-center">
          <Text className="font-bold text-[#111]">
            ₹{product.priceRaw * qty}
          </Text>

          <View className="flex-row bg-[#0F7B3C] rounded-xl">
            <TouchableOpacity
              className="px-3 py-1"
              onPress={() => {
                pulse();
                dispatch(removeItem(product.id));
              }}
            >
              <Text className="text-white">−</Text>
            </TouchableOpacity>

            <Text className="text-white px-2">{qty}</Text>

            <TouchableOpacity
              className="px-3 py-1"
              onPress={() => {
                pulse();
                dispatch(addItem(product.id));
              }}
            >
              <Text className="text-white">+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

/* ─── MAIN SCREEN ─── */
export default function CartScreen() {
  const cartItems = useAppSelector(selectCartProducts);
  const totalItems = useAppSelector(selectTotalItems);
  const subtotal = useAppSelector(selectSubtotal);
  const deliveryFee = useAppSelector(selectDeliveryFee);
  const total = useAppSelector(selectTotal);

  const isEmpty = cartItems.length === 0;

  return (
    <SafeAreaView className="flex-1 bg-[#fff]">
      <StatusBar barStyle="light-content" backgroundColor="#0F7B3C" />

      {/* 🔥 HEADER (ADDED BACK HERE) */}
      <View
        style={{
          backgroundColor: "#0F7B3C",
          paddingHorizontal: 18,
          paddingTop: 10,
          paddingBottom: 14,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 12,
          }}
        >
          <View>
            <Text
              style={{ color: "#FFD700", fontSize: 12, fontWeight: "bold" }}
            >
              Jaivik Mart
            </Text>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>
              2–3 days
            </Text>
            <Text style={{ color: "#fff", fontSize: 12 }}>
              HOME - Ranaji, Jabalpur ▼
            </Text>
          </View>

          <TouchableOpacity onPress={() => router.push("/profile")}>
            <Text style={{ fontSize: 18, color: "#fff" }}>👤</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 10,
            paddingHorizontal: 12,
            height: 44,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Text>🔍</Text>
          <TextInput
            placeholder='Search "Aghinotra"'
            style={{ flex: 1, marginLeft: 8 }}
          />
          <Text>🎤</Text>
        </View>
      </View>

      {isEmpty ? (
        <EmptyCart />
      ) : (
        <>
          <ScrollView>
            {cartItems.map((item) => (
              <CartItemRow key={item.product.id} item={item} />
            ))}
          </ScrollView>

          {/* Footer */}
          <View className="absolute bottom-0 left-0 right-0 bg-white flex-row justify-between p-4">
            <Text className="text-lg font-extrabold">₹{total}</Text>

            <TouchableOpacity className="bg-[#0F7B3C] px-5 py-3 rounded-xl">
              <Text className="text-white font-bold">Checkout →</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}
