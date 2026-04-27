import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SvgXml } from "react-native-svg";

import { useAppDispatch, useAppSelector } from "../../../shared/hooks/useRedux";
import { useOrder } from "../../checkout/hooks/useOrder";
import {
  calculateShippingRate,
  type ShippingRateResponse,
} from "../../checkout/services/shipping.api";
import { openCheckout, pollPaymentStatus } from "../../checkout/services/zoho-payments";
import { setTempAddress, setTempAddressId } from "../../checkout/store/orderSlice";
import { fetchCart } from "../services/cart.api";
import {
  addItem,
  removeItem,
  selectCartItems,
  selectCartProducts,
  selectSubtotal,
  updateItemAsync,
} from "../store/cartSlice";

// ─── IMAGE HELPER ─────────────────────────────────────────────────────────────
const getImage = (p: any) =>
  p?.image_url ||
  p?.image ||
  (p?.image_name && p?.image_document_id
    ? `https://cdn2.zohoecommerce.com/product-images/${p.image_name}/${p.image_document_id}/800x800?storefront_domain=products.tcbtjaivikkisan.com`
    : "https://via.placeholder.com/150");

// ─── SVG ICONS ───────────────────────────────────────────────────────────────
const BACK_ICON = `<svg width="28" height="28" viewBox="0 0 28 28" fill="none">
  <circle cx="14" cy="14" r="13" stroke="#1E1E1E" stroke-width="1.5"/>
  <path d="M15.5 9.5L11 14L15.5 18.5" stroke="#1E1E1E" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const CLOCK_ICON = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none">
  <circle cx="9" cy="9" r="8" stroke="#333" stroke-width="1.4"/>
  <path d="M9 5V9.5L12 11.5" stroke="#333" stroke-width="1.4" stroke-linecap="round"/>
</svg>`;

const BOX_ICON = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none">
  <rect x="1.5" y="4.5" width="15" height="12" rx="1.5" stroke="#333" stroke-width="1.4"/>
  <path d="M1.5 8h15" stroke="#333" stroke-width="1.4"/>
  <path d="M6 1.5v3M12 1.5v3" stroke="#333" stroke-width="1.4" stroke-linecap="round"/>
</svg>`;

const PIN_ICON = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
  <path d="M7 1C4.79 1 3 2.79 3 5c0 3 4 8 4 8s4-5 4-8c0-2.21-1.79-4-4-4Z" stroke="#555" stroke-width="1.3"/>
  <circle cx="7" cy="5" r="1.5" stroke="#555" stroke-width="1.3"/>
</svg>`;

const HOME_ICON = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none">
  <path d="M2 8L9 2L16 8V16H11V12H7V16H2V8Z" stroke="#333" stroke-width="1.4" stroke-linejoin="round"/>
</svg>`;



// ─── ADDRESS BOTTOM SHEET ────────────────────────────────────────────────────
function AddressBottomSheet({
  visible,
  addresses,
  selectedIdx,
  onSelect,
  onClose,
  onPlaceOrder,
  isProcessing,
  userPhone,
}: {
  visible: boolean;
  addresses: any[];
  selectedIdx: number;
  onSelect: (idx: number) => void;
  onClose: () => void;
  onPlaceOrder: () => void;
  isProcessing?: boolean;
  userPhone?: string | null;
}) {

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {/* Dark backdrop — tap to close */}
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      />

      <View style={styles.sheet}>
        {/* Drag handle */}
        <View style={styles.sheetHandle} />

        {/* Header row: title + ✕ close */}
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Select delivery location</Text>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.sheetCloseBtn}
          >
            <Text style={styles.sheetCloseText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={{ maxHeight: 300 }}
          showsVerticalScrollIndicator={false}
        >
          {addresses.map((addr: any, idx: number) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.addrCard,
                selectedIdx === idx && styles.addrCardSelected,
              ]}
              onPress={() => onSelect(idx)}
              activeOpacity={0.8}
            >
              <View style={styles.addrIconBox}>
                <SvgXml xml={HOME_ICON} width={18} height={18} />
              </View>

              <View style={styles.addrTextBlock}>
                <Text style={styles.addrLabel}>{addr.label || "Home"}</Text>
                <Text style={styles.addrLine} numberOfLines={2}>
                  {addr.line1}{addr.city ? `, ${addr.city}` : ""}{addr.state ? `, ${addr.state}` : ""}
                </Text>
                <Text style={styles.addrPhone}>Phone: {userPhone || ""}</Text>
              </View>

              <View
                style={[
                  styles.radio,
                  selectedIdx === idx && styles.radioSelected,
                ]}
              >
                {selectedIdx === idx && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          ))}

          {/* Add new address */}
          <TouchableOpacity
            style={styles.addAddrRow}
            onPress={() => {
              onClose();
              router.push("/add-address" as any);
            }}
          >
            <Text style={styles.addAddrPlus}>＋</Text>
            <Text style={styles.addAddrText}>Add new address</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* CTA */}
        <TouchableOpacity
          style={[styles.sheetCta, isProcessing && styles.sheetCtaDisabled]}
          onPress={onPlaceOrder}
          disabled={isProcessing}
          activeOpacity={0.88}
        >
          {isProcessing ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.sheetCtaText}>Processing…</Text>
            </View>
          ) : (
            <Text style={styles.sheetCtaText}>Place Order</Text>
          )}
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

// ─── EMPTY CART ───────────────────────────────────────────────
function EmptyCart() {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyContent}>
        <Image
          source={require("@/assets/images/shopping-cart.png")}
          style={styles.emptyImage}
          resizeMode="contain"
        />
        <Text style={styles.emptyTitle}>Empty Cart</Text>
        <Text style={styles.emptySubtitle}>
          There are no items to show up here,{"\n"}add items to buy.
        </Text>
        <TouchableOpacity
          style={styles.shopBtn}
          onPress={() => router.push("/home" as any)}
        >
          <Text style={styles.shopBtnText}>Start Shopping</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── CART ITEM ────────────────────────────────────────────────────────────────
function CartItem({ item }: any) {
  const dispatch = useAppDispatch();
  // Read live cart quantities so we always compute the correct next qty
  const cartItems = useAppSelector(selectCartItems);
  const scale = useRef(new Animated.Value(1)).current;

  const product = item.product;

  if (!product) return null;

  const qty = item.qty;
  const price = product.priceRaw ?? 0;
  const weight = product.unit || "";
  const itemKey = product.id;

  const pulse = () =>
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.97,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 60,
        useNativeDriver: true,
      }),
    ]).start();

  const handleAdd = () => {
    pulse();
    const currentQty = cartItems[itemKey] ?? 0;
    const newQty = currentQty + 1;
    // Optimistic UI update
    dispatch(addItem(itemKey));
    // Sync to PATCH /cart/items
    dispatch(updateItemAsync({ productId: itemKey, quantity: newQty }));
  };

  const handleRemove = () => {
    pulse();
    const currentQty = cartItems[itemKey] ?? 0;
    const newQty = Math.max(0, currentQty - 1);
    // Optimistic UI update
    dispatch(removeItem(itemKey));
    // Sync to PATCH /cart/items (quantity: 0 removes the item server-side)
    dispatch(updateItemAsync({ productId: itemKey, quantity: newQty }));
  };

  return (
    <Animated.View style={[styles.cartRow, { transform: [{ scale }] }]}>
      <Image
        source={{ uri: getImage(product) }}
        style={styles.cartImage}
        resizeMode="contain"
      />

      <View style={styles.cartInfo}>
        <View style={styles.cartTopRow}>
          <Text style={styles.cartName} numberOfLines={2}>
            {product.name}
          </Text>
          {!!weight && <Text style={styles.cartWeight}>{weight}</Text>}
        </View>

        <View style={styles.cartBottomRow}>
          <Text style={styles.cartPrice}>₹{price}</Text>

          <View style={styles.stepper}>
            <TouchableOpacity onPress={handleRemove}>
              <Text style={styles.stepText}>−</Text>
            </TouchableOpacity>

            <Text style={styles.stepQty}>{qty}</Text>

            <TouchableOpacity onPress={handleAdd}>
              <Text style={styles.stepText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

// ─── Shipping state shape ────────────────────────────────────────────────────
type ShippingState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: ShippingRateResponse }
  | { status: 'error'; message: string };

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function CartScreen() {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(selectCartProducts);
  const subtotal = useAppSelector(selectSubtotal);
  const userId = useAppSelector((state) => state.user.userId);
  const userPhone = useAppSelector((state) => state.user.phone);
  const userAddresses = useAppSelector((state) => state.user.addresses) || [];

  console.log('[CART] userId:', userId);

  const isEmpty = cartItems.length === 0;

  const [sheetVisible, setSheetVisible] = useState(false);
  const [selectedAddressIdx, setSelectedAddressIdx] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const { submitOrderAsync } = useOrder();

  const addresses = userAddresses;
  const selectedAddress = addresses[selectedAddressIdx] ?? addresses[0] ?? null;

  // ── Live shipping rate ────────────────────────────────────────────────────
  const [shipping, setShipping] = useState<ShippingState>({ status: 'idle' });

  useEffect(() => {
    const pincode = Number(selectedAddress?.pincode);
    if (!pincode || cartItems.length === 0) {
      setShipping({ status: 'idle' });
      return;
    }

    let cancelled = false;
    setShipping({ status: 'loading' });

    // Fetch cart from backend to get totalWeight, then call shipping API
    fetchCart()
      .then((cartData) => {
        const totalWeight = cartData.totalWeight || 0;
        console.log('[SHIPPING] Cart totalWeight from backend:', totalWeight, 'g, pincode:', pincode);
        if (totalWeight === 0 || cancelled) {
          if (!cancelled) setShipping({ status: 'idle' });
          return;
        }
        return calculateShippingRate(totalWeight, pincode);
      })
      .then((res) => {
        if (res && !cancelled) {
          console.log('[SHIPPING] Rate:', JSON.stringify(res));
          setShipping({ status: 'success', data: res });
        }
      })
      .catch((err: any) => {
        console.log('[SHIPPING] Error:', err?.message);
        if (!cancelled)
          setShipping({ status: 'error', message: err?.message ?? 'Could not fetch rate' });
      });

    return () => { cancelled = true; };
  }, [cartItems.length, subtotal, selectedAddress?.pincode, selectedAddress?._id]);

  const shippingCharge =
    shipping.status === 'success' ? shipping.data.shippingCharge : 0;
  const grandTotal = subtotal + shippingCharge;

  // ── Sync selected address into orderSlice whenever it changes ──────────────
  useEffect(() => {
    if (!selectedAddress) return;
    // Store the address _id for the POST /orders call
    if (selectedAddress._id) {
      dispatch(setTempAddressId(selectedAddress._id));
    }
    dispatch(
      setTempAddress({
        name: selectedAddress.receiver_name || selectedAddress.label || "Customer",
        phone: selectedAddress.receiver_phone || selectedAddress.phone || "",
        street: selectedAddress.line1 || "",
        city: selectedAddress.city || "",
        state: selectedAddress.state || "",
        pincode: selectedAddress.pincode || "",
      })
    );
  }, [selectedAddress, dispatch]);

  // ── Place Order → Zoho Checkout (skips PaymentScreen) ──────────────────────
  const handlePlaceOrder = async () => {
    if (!selectedAddress || isProcessing) return;

    try {
      setIsProcessing(true);

      // 1. Create order on backend → returns orderId + paymentSessionId
      console.log('[CHECKOUT] Creating order...');
      console.log('[CHECKOUT] Selected address:', JSON.stringify(selectedAddress));
      console.log('[CHECKOUT] Address _id:', selectedAddress?._id);

      // Debug: check what the backend cart looks like
      try {
        const { fetchCart } = await import('../../cart/services/cart.api');
        const backendCart = await fetchCart();
        console.log('[CHECKOUT] Backend cart before order:', JSON.stringify(backendCart));
        console.log('[CHECKOUT] Backend cart items count:', backendCart?.items?.length);
      } catch (cartErr: any) {
        console.warn('[CHECKOUT] Could not fetch backend cart:', cartErr?.message);
      }

      // Local cart state
      console.log('[CHECKOUT] Local cart items:', JSON.stringify(cartItems.map((i: any) => ({
        id: i.product?.id || i.product?.item_id,
        name: i.product?.name,
        qty: i.qty,
      }))));

      let result;
      try {
        result = await submitOrderAsync();
      } catch (orderErr: any) {
        console.error('[CHECKOUT] submitOrderAsync threw:', orderErr);
        console.error('[CHECKOUT] Error type:', typeof orderErr);
        console.error('[CHECKOUT] Error keys:', orderErr ? Object.keys(orderErr) : 'null');
        console.error('[CHECKOUT] Error message:', orderErr?.message);
        console.error('[CHECKOUT] Error string:', String(orderErr));
        throw new Error(
          orderErr?.message || String(orderErr) || 'Failed to create order'
        );
      }

      console.log('[CHECKOUT] Order result:', JSON.stringify(result));
      const { orderId, paymentSessionId } = result;
      console.log('[CHECKOUT] Order created:', orderId, 'session:', paymentSessionId);

      if (!paymentSessionId) {
        throw new Error('No payment session received from server');
      }

      // 2. Open Zoho Payments checkout
      console.log('[CHECKOUT] Opening Zoho checkout...');
      setSheetVisible(false); // close address sheet if open

      const paymentResult = await openCheckout(paymentSessionId);
      console.log('[CHECKOUT] Payment result:', paymentResult.status);

      if (paymentResult.status === 'cancelled') {
        Alert.alert('Payment Cancelled', 'You can try again when ready.');
        return;
      }

      if (paymentResult.status === 'failed') {
        Alert.alert(
          'Payment Failed',
          paymentResult.errorMessage || 'Please try again.',
        );
        return;
      }

      // 3. Payment success → poll backend to confirm webhook
      console.log('[CHECKOUT] Verifying payment...');
      const finalStatus = await pollPaymentStatus(orderId);
      console.log('[CHECKOUT] Final status:', finalStatus);

      if (finalStatus === 'paid' || finalStatus === 'pending') {
        router.push('/checkout/success');
      } else {
        Alert.alert(
          'Payment Issue',
          'Your payment could not be verified. Contact support if money was deducted.',
        );
      }
    } catch (err: any) {
      console.error('[CHECKOUT] Final catch error:', err);
      console.error('[CHECKOUT] Error message:', err?.message);
      console.error('[CHECKOUT] Error string:', String(err));
      Alert.alert(
        'Order Failed',
        err?.message || String(err) || 'Could not place order. Please try again.',
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/home" as any)}>
          <SvgXml xml={BACK_ICON} width={28} height={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 28 }} />
      </View>

      {isEmpty ? (
        <EmptyCart />
      ) : (
        <>
          {/* ── Scrollable content (no address card here) ── */}
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Deliverables */}
            <View style={styles.card}>
              <View style={styles.sectionHeaderRow}>
                <SvgXml xml={CLOCK_ICON} width={18} height={18} />
                <View style={{ marginLeft: 8 }}>
                  <Text style={styles.sectionTitle}>Deliverables</Text>
                  <Text style={styles.sectionSubtitle}>
                    Shipped in package(s)
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              {cartItems.map((item: any) => (
                <CartItem
                  key={item.product?.id ?? item.product?.item_id}
                  item={item}
                />
              ))}
            </View>

            {/* Bill */}
            <View style={styles.card}>
              <View style={styles.sectionHeaderRow}>
                <SvgXml xml={BOX_ICON} width={18} height={18} />
                <Text style={[styles.sectionTitle, { marginLeft: 8 }]}>
                  Bill Details
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Items total</Text>
                <Text style={styles.billValue}>₹{subtotal}</Text>
              </View>

              <View style={styles.billRow}>
                <View>
                  <Text style={styles.billLabel}>Delivery charge</Text>
                  {shipping.status === 'success' && shipping.data.courier ? (
                    <Text style={styles.courierTag}>
                      {shipping.data.courier} · {shipping.data.estimatedDelivery}
                    </Text>
                  ) : null}
                </View>
                {shipping.status === 'loading' ? (
                  <ActivityIndicator size="small" color="#196F1B" />
                ) : shipping.status === 'success' ? (
                  <Text style={[styles.billValue, shippingCharge === 0 && styles.billValueFree]}>
                    {shippingCharge === 0 ? 'FREE' : `₹${shippingCharge}`}
                  </Text>
                ) : shipping.status === 'error' ? (
                  <Text style={styles.billValueError}>–</Text>
                ) : (
                  <Text style={styles.billValue}>–</Text>
                )}
              </View>

              {shipping.status === 'error' && (
                <Text style={styles.shippingErrorText}>⚠️ {shipping.message}</Text>
              )}

              <View style={styles.divider} />

              <View style={styles.billRow}>
                <Text style={styles.billLabelBold}>Grand Total</Text>
                <Text style={styles.billValueBold}>₹{grandTotal}</Text>
              </View>
            </View>

            {/* Policy */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Cancellation Policy</Text>
              <View style={styles.divider} />
              <Text style={styles.policyText}>
                Once order is placed, any cancellation may result in a fee. In case of unexpected delays leading to order cancellation, a complete refund will be provided. Once order is placed, any cancellation may result in a fee. In case of unexpected delays leading to order cancellation, a complete refund will be provided.
              </Text>
            </View>
          </ScrollView>

          {/* ── Fixed bottom zone: address card + payment button ── */}
          <View style={styles.bottomZone}>
            {addresses.length === 0 ? (
              /* ── No address: Blinkit-style Add Address prompt ── */
              <TouchableOpacity
                style={styles.addAddrPrompt}
                activeOpacity={0.85}
                onPress={() => router.push("/add-address" as any)}
              >
                <View style={styles.addAddrPromptLeft}>
                  <View style={styles.addAddrIconCircle}>
                    <SvgXml xml={PIN_ICON} width={16} height={16} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.addAddrPromptTitle}>Add delivery address</Text>
                    <Text style={styles.addAddrPromptSub}>Select a location to see product availability</Text>
                  </View>
                </View>
                <Text style={styles.addAddrPromptArrow}>›</Text>
              </TouchableOpacity>
            ) : (
              /* ── Has address: normal address card ── */
              <View style={styles.addressCard}>
                <View style={styles.addressTopRow}>
                  <View style={styles.addressRow}>
                    <SvgXml xml={PIN_ICON} width={14} height={14} />
                    <Text style={styles.addressLabel}>
                      {selectedAddress?.label ?? "Home"}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.changeBtn}
                    onPress={() => setSheetVisible(true)}
                  >
                    <Text style={styles.changeBtnText}>Change</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.addressText}>
                  {[selectedAddress?.line1, selectedAddress?.line2, selectedAddress?.city, selectedAddress?.state]
                    .filter(Boolean)
                    .join(", ")}
                </Text>
                {userPhone ? (
                  <Text style={styles.addressPhone}>📞 {userPhone}</Text>
                ) : null}
              </View>
            )}

            {/* Place Order button */}
            <TouchableOpacity
              style={[
                styles.paymentBtn,
                (addresses.length === 0 || isProcessing) && styles.paymentBtnDisabled,
              ]}
              disabled={addresses.length === 0 || isProcessing}
              onPress={handlePlaceOrder}
              activeOpacity={0.88}
            >
              {isProcessing ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.paymentBtnText}>Processing…</Text>
                </View>
              ) : (
                <Text style={styles.paymentBtnText}>Place Order · ₹{grandTotal}</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Address Bottom Sheet */}
          <AddressBottomSheet
            visible={sheetVisible}
            addresses={addresses}
            selectedIdx={selectedAddressIdx}
            onSelect={(idx) => { setSelectedAddressIdx(idx); setSheetVisible(false); }}
            onClose={() => setSheetVisible(false)}
            onPlaceOrder={handlePlaceOrder}
            isProcessing={isProcessing}
            userPhone={userPhone}
          />
        </>
      )}
    </View>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F2F2" },

  header: {
    height: 56,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  headerTitle: { fontSize: 16, fontWeight: "700" },

  // ScrollView only holds deliverables / bill / policy — no extra bottom padding needed
  scrollContent: {
    padding: 12,
    paddingBottom: 190,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },

  sectionHeaderRow: { flexDirection: "row", alignItems: "center" },
  sectionTitle: { fontSize: 14, fontWeight: "700" },
  sectionSubtitle: { fontSize: 11, color: "#888" },

  divider: { height: 1, backgroundColor: "#eee", marginVertical: 8 },

  cartRow: { flexDirection: "row", marginBottom: 10 },
  cartImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: "#F7F7F7",
  },
  cartInfo: { flex: 1, marginLeft: 10 },

  cartTopRow: { flexDirection: "row", justifyContent: "space-between" },
  cartName: { fontSize: 13, fontWeight: "600", flex: 1 },
  cartWeight: { fontSize: 11, color: "#888" },

  cartBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  cartPrice: { fontWeight: "700" },

  stepper: {
    flexDirection: "row",
    backgroundColor: "#196F1B",
    borderRadius: 8,
    alignItems: "center",
  },
  stepText: { color: "#fff", paddingHorizontal: 10, fontSize: 16 },
  stepQty: { color: "#fff", fontWeight: "700" },

  billRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  billLabel: { color: "#444" },
  billValue: { color: "#444" },
  billValueFree: { color: "#196F1B", fontWeight: "600" },
  billValueError: { color: "#EF4444", fontWeight: "600" },
  courierTag: { fontSize: 11, color: "#196F1B", marginTop: 2, fontWeight: "500" },
  shippingErrorText: { fontSize: 11, color: "#92400E", marginBottom: 4 },
  billLabelBold: { fontWeight: "700" },
  billValueBold: { fontWeight: "700" },

  policyText: { fontSize: 12, color: "#666" },

  // ── Fixed bottom zone (address + button) ──
  bottomZone: {
    position: "absolute", // ✅ KEY FIX
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#F2F2F2",
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 12,

    borderTopWidth: 1,
    borderTopColor: "#E8E8E8",

    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 5,
  },

  addressCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },

  addressTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  addressRow: { flexDirection: "row", alignItems: "center" },
  addressLabel: { marginLeft: 5, fontWeight: "600" },
  addressText: { fontSize: 12, color: "#666", marginTop: 6 },
  addressPhone: { fontSize: 12, color: "#333", marginTop: 4, fontWeight: "500", letterSpacing: 0.3 },

  changeBtn: {
    borderWidth: 1,
    borderColor: "#196F1B",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  changeBtnText: {
    color: "#196F1B",
    fontSize: 12,
    fontWeight: "600",
  },

  paymentBtn: {
    backgroundColor: "#196F1B",
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  paymentBtnDisabled: {
    backgroundColor: "#A5C8A6",
  },
  paymentBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },

  // ── Add-address prompt (Blinkit style) ──
  addAddrPrompt: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: "#196F1B",
  },
  addAddrPromptLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  addAddrIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EAF5EA",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  addAddrPromptTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E1E1E",
  },
  addAddrPromptSub: {
    fontSize: 11,
    color: "#888",
    marginTop: 2,
  },
  addAddrPromptArrow: {
    fontSize: 22,
    color: "#196F1B",
    fontWeight: "300",
    marginLeft: 8,
  },

  // ── Empty Cart ──
  emptyContainer: {
    flex: 1,
    backgroundColor: "#F2F2F2",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContent: { alignItems: "center", paddingHorizontal: 20 },
  emptyImage: { width: 150, height: 150, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: "700", marginBottom: 6 },
  emptySubtitle: {
    color: "#777",
    textAlign: "center",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 20,
  },
  shopBtn: {
    backgroundColor: "#196F1B",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  shopBtnText: { color: "#fff", fontWeight: "600" },

  // ── Address Bottom Sheet ──
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
  },

  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingBottom: 36,
    paddingTop: 12,
  },

  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#DDD",
    alignSelf: "center",
    marginBottom: 14,
  },

  // Title row + close button
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  sheetTitle: {
    fontSize: 15,
    fontWeight: "700",
  },

  sheetCloseBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },

  sheetCloseText: {
    fontSize: 13,
    color: "#444",
    fontWeight: "600",
  },

  addrCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: "#F0F0F0",
  },

  addrCardSelected: {
    borderColor: "#196F1B",
    backgroundColor: "#F0FAF0",
  },

  addrIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#EFEFEF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  addrTextBlock: { flex: 1 },

  addrLabel: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 2,
  },

  addrLine: {
    fontSize: 12,
    color: "#555",
    lineHeight: 16,
  },

  addrPhone: {
    fontSize: 11,
    color: "#888",
    marginTop: 3,
  },

  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: "#CCC",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    marginTop: 2,
  },

  radioSelected: { borderColor: "#196F1B" },

  radioDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#196F1B",
  },

  addAddrRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 4,
  },

  addAddrPlus: {
    fontSize: 18,
    color: "#196F1B",
    fontWeight: "700",
    marginRight: 8,
  },

  addAddrText: {
    fontSize: 13,
    color: "#196F1B",
    fontWeight: "600",
  },

  sheetCta: {
    backgroundColor: "#196F1B",
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },

  sheetCtaText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },

  sheetCtaDisabled: {
    backgroundColor: "#999",
  },
});
