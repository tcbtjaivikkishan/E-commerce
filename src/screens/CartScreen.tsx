// src/screens/CartScreen.tsx — NativeWind v4 (className only, no StyleSheet)
import { router } from "expo-router";
import { useRef } from "react";
import {
  Animated,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
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

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyCart() {
  return (
    <View className="flex-1 items-center justify-center px-10 pb-16">
      <Text className="text-7xl mb-5">🛒</Text>
      <Text className="text-[22px] font-extrabold text-[#111] mb-2.5 text-center">
        Your cart is empty
      </Text>
      <Text className="text-sm text-[#999] text-center leading-[21px] mb-7">
        Add fresh organic products and farm inputs to get started
      </Text>
      <TouchableOpacity
        className="bg-[#0F7B3C] px-8 py-4 rounded-2xl"
        style={{ elevation: 6 }}
        onPress={() => router.push("/home")}
      >
        <Text className="text-white text-base font-extrabold">Browse Products</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Cart Item Row ────────────────────────────────────────────────────────────

function CartItemRow({ item }: { item: { product: any; qty: number } }) {
  const dispatch = useAppDispatch();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const { product, qty } = item;

  const pulse = () =>
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.96, duration: 60, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 60, useNativeDriver: true }),
    ]).start();

  return (
    <Animated.View
      className="bg-white rounded-2xl mb-2.5 flex-row overflow-hidden"
      style={{ transform: [{ scale: scaleAnim }], elevation: 1 }}
    >
      {/* Product image */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => router.push(`/product/${product.id}`)}
      >
        <Image
          source={{ uri: product.image }}
          className="w-[90px] h-[90px] bg-[#F5F5F5]"
          resizeMode="cover"
        />
      </TouchableOpacity>

      {/* Info */}
      <View className="flex-1 p-3 justify-between">
        {/* Top row: name + remove */}
        <View className="flex-row items-start gap-1.5 mb-2">
          <TouchableOpacity
            className="flex-1"
            activeOpacity={0.85}
            onPress={() => router.push(`/product/${product.id}`)}
          >
            <Text className="text-sm font-bold text-[#111] leading-[19px]" numberOfLines={2}>
              {product.name}
            </Text>
            <Text className="text-[11px] text-[#999] mt-0.5">{product.unit}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-6 h-6 rounded-full bg-[#F5F5F5] items-center justify-center mt-0.5"
            onPress={() => dispatch(clearItem(product.id))}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text className="text-[11px] text-[#888] font-bold">✕</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom row: price + stepper */}
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-base font-extrabold text-[#111]">
              ₹{product.priceRaw * qty}
            </Text>
            {qty > 1 && (
              <Text className="text-[11px] text-[#AAA] mt-px">
                ₹{product.priceRaw} × {qty}
              </Text>
            )}
          </View>

          {/* Stepper */}
          <View className="flex-row items-center bg-[#0F7B3C] rounded-xl overflow-hidden">
            <TouchableOpacity
              className="w-[30px] h-[30px] items-center justify-center"
              onPress={() => { pulse(); dispatch(removeItem(product.id)); }}
            >
              <Text className="text-white text-lg font-bold">−</Text>
            </TouchableOpacity>
            <Text className="text-white text-[13px] font-extrabold min-w-[22px] text-center">
              {qty}
            </Text>
            <TouchableOpacity
              className="w-[30px] h-[30px] items-center justify-center"
              onPress={() => { pulse(); dispatch(addItem(product.id)); }}
            >
              <Text className="text-white text-lg font-bold">+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

// ─── Free Delivery Progress ───────────────────────────────────────────────────

function SavingsChip({ subtotal }: { subtotal: number }) {
  const threshold = 500;
  const remaining = threshold - subtotal;
  const progressPct = Math.min((subtotal / threshold) * 100, 100);
  const unlocked = subtotal >= threshold;

  return (
    <View
      className="bg-white rounded-2xl p-3.5 flex-row items-center gap-3 border border-[#E8F5EE]"
      style={{ elevation: 2 }}
    >
      <Text className="text-[22px]">{unlocked ? "🎉" : "🚚"}</Text>
      {unlocked ? (
        <Text className="text-[13px] text-[#555] flex-1">
          You've unlocked{" "}
          <Text className="font-extrabold text-[#0F7B3C]">FREE delivery!</Text>
        </Text>
      ) : (
        <View className="flex-1">
          <Text className="text-[13px] text-[#555]">
            Add{" "}
            <Text className="font-extrabold text-[#0F7B3C]">₹{remaining}</Text>{" "}
            more for free delivery
          </Text>
          {/* Progress bar */}
          <View className="h-1 bg-[#EFEFEF] rounded-sm mt-1.5 overflow-hidden">
            <View
              className="h-full bg-[#0F7B3C] rounded-sm"
              style={{ width: `${progressPct}%` }}
            />
          </View>
        </View>
      )}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function CartScreen() {
  const cartItems   = useAppSelector(selectCartProducts);
  const totalItems  = useAppSelector(selectTotalItems);
  const subtotal    = useAppSelector(selectSubtotal);
  const deliveryFee = useAppSelector(selectDeliveryFee);
  const total       = useAppSelector(selectTotal);

  const isEmpty = cartItems.length === 0;

  return (
    <SafeAreaView className="flex-1 bg-[#F5F5F5]">
      <StatusBar barStyle="light-content" backgroundColor="#0F7B3C" />

      {/* ─── Header ─── */}
      <View className="bg-[#0F7B3C] px-[18px] pt-2.5 pb-4 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2.5">
          <Text className="text-[22px] font-extrabold text-white tracking-tight">
            My Cart
          </Text>
          {totalItems > 0 && (
            <View className="bg-white/20 rounded-full px-2.5 py-0.5">
              <Text className="text-white text-xs font-bold">
                {totalItems} item{totalItems > 1 ? "s" : ""}
              </Text>
            </View>
          )}
        </View>
        {!isEmpty && (
          <TouchableOpacity
            className="border border-white/60 rounded-full px-3.5 py-1.5"
            onPress={() => router.push("/home")}
          >
            <Text className="text-white text-[13px] font-bold">+ Add more</Text>
          </TouchableOpacity>
        )}
      </View>

      {isEmpty ? (
        <EmptyCart />
      ) : (
        <>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>

            {/* Free delivery chip */}
            <View className="mt-3 px-4">
              <SavingsChip subtotal={subtotal} />
            </View>

            {/* Delivery info strip */}
            <View className="flex-row items-center gap-2 bg-[#FFFBEA] mx-4 mt-2.5 px-3.5 py-2.5 rounded-xl border border-[#FEF3C7]">
              <Text className="text-base">⚡</Text>
              <Text className="text-xs text-[#78350F] flex-1">
                Delivery in{" "}
                <Text className="font-extrabold">30 minutes</Text>{" "}
                · HOME – Arera Colony, Bhopal
              </Text>
            </View>

            {/* Items */}
            <View className="mt-3 px-4">
              <Text className="text-[13px] font-bold text-[#888] uppercase tracking-widest mb-2.5">
                Items in cart
              </Text>
              {cartItems.map((item) => (
                <CartItemRow key={item.product.id} item={item} />
              ))}
            </View>

            {/* Bill Details */}
            <View className="mt-3 px-4">
              <Text className="text-[13px] font-bold text-[#888] uppercase tracking-widest mb-2.5">
                Bill Details
              </Text>
              <View className="bg-white rounded-2xl p-4" style={{ elevation: 1 }}>
                {/* Item total */}
                <View className="flex-row items-center justify-between py-2">
                  <Text className="text-sm text-[#555]">Item Total</Text>
                  <Text className="text-sm font-bold text-[#111]">₹{subtotal}</Text>
                </View>

                {/* Delivery fee */}
                <View className="flex-row items-center justify-between py-2">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-sm text-[#555]">Delivery Fee</Text>
                    {deliveryFee === 0 && (
                      <View className="bg-[#E8F5EE] rounded px-1.5 py-0.5">
                        <Text className="text-[10px] font-extrabold text-[#0F7B3C] tracking-wide">
                          FREE
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text className={`text-sm font-bold ${deliveryFee === 0 ? "text-[#0F7B3C]" : "text-[#111]"}`}>
                    ₹{deliveryFee}
                  </Text>
                </View>

                {/* Platform fee */}
                <View className="flex-row items-center justify-between py-2">
                  <Text className="text-sm text-[#555]">Platform Fee</Text>
                  <Text className="text-sm font-bold text-[#0F7B3C]">FREE</Text>
                </View>

                {/* Divider */}
                <View className="h-px bg-[#F0F0F0] my-1" />

                {/* To pay */}
                <View className="flex-row items-center justify-between py-2">
                  <Text className="text-base font-extrabold text-[#111]">To Pay</Text>
                  <Text className="text-lg font-extrabold text-[#0F7B3C]">₹{total}</Text>
                </View>
              </View>
            </View>

            {/* Cancellation policy */}
            <View className="mx-4 mt-3 bg-[#FAFAFA] rounded-xl p-3.5 border border-[#EFEFEF]">
              <Text className="text-[12px] font-bold text-[#888] uppercase tracking-wide mb-1">
                Cancellation Policy
              </Text>
              <Text className="text-[12px] text-[#AAA] leading-[17px]">
                Orders can be cancelled within 60 seconds of placing. After that, a cancellation fee may apply.
              </Text>
            </View>

            <View className="h-32" />
          </ScrollView>

          {/* ─── Checkout Bar ─── */}
          <View
            className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#EFEFEF] flex-row items-center px-4 pt-3.5 pb-7 gap-3.5"
            style={{ elevation: 12 }}
          >
            <View className="flex-1">
              <Text className="text-xl font-extrabold text-[#111]">₹{total}</Text>
              <Text className="text-[11px] text-[#999] mt-0.5">
                {totalItems} item{totalItems > 1 ? "s" : ""} ·{" "}
                {deliveryFee === 0 ? "Free delivery" : `₹${deliveryFee} delivery`}
              </Text>
            </View>
            <TouchableOpacity
              className="bg-[#0F7B3C] rounded-2xl px-5 py-4 flex-row items-center gap-2"
              style={{ elevation: 6 }}
              activeOpacity={0.85}
            >
              <Text className="text-white text-[15px] font-extrabold">
                Proceed to Checkout
              </Text>
              <Text className="text-white text-lg font-bold">→</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}