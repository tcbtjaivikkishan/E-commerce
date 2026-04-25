// src/features/orders/screens/OrdersScreen.tsx
// ─── Blinkit-style Order History ─────────────────────────────────────────────

import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { SvgXml } from "react-native-svg";
import { useAppDispatch, useAppSelector } from "../../../shared/hooks/useRedux";
import {
  loadOrders,
  cancelOrderThunk,
  selectOrders,
  selectOrdersLoading,
  selectOrdersError,
  selectOrdersPagination,
} from "../store/ordersSlice";

// ─── Back icon SVG (same as CartScreen) ──────────────────────────────────────
const BACK_ICON = `<svg width="28" height="28" viewBox="0 0 28 28" fill="none">
  <circle cx="14" cy="14" r="13" stroke="#1E1E1E" stroke-width="1.5"/>
  <path d="M15.5 9.5L11 14L15.5 18.5" stroke="#1E1E1E" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

// ─── Design tokens ───────────────────────────────────────────────────────────
const GREEN = "#0F8847";
const GREEN_LIGHT = "#E8F5E9";
const GREEN_DARK = "#0A6B36";
const YELLOW = "#F9A825";
const YELLOW_LIGHT = "#FFF8E1";
const RED = "#E53935";
const RED_LIGHT = "#FFEBEE";
const BLUE = "#1976D2";
const BLUE_LIGHT = "#E3F2FD";
const GREY_BG = "#F4F5F7";
const WHITE = "#FFFFFF";
const TEXT_PRIMARY = "#1A1A1A";
const TEXT_SECONDARY = "#666666";
const TEXT_MUTED = "#999999";
const BORDER = "#EEEEEE";

// ─── Status config ───────────────────────────────────────────────────────────

interface StatusStyle {
  bg: string;
  text: string;
  icon: string;
  label: string;
}

const ORDER_STATUS: Record<string, StatusStyle> = {
  created:    { bg: YELLOW_LIGHT, text: "#F57F17", icon: "⏳", label: "Order Placed" },
  confirmed:  { bg: GREEN_LIGHT,  text: GREEN,     icon: "✓",  label: "Confirmed" },
  processing: { bg: BLUE_LIGHT,   text: BLUE,      icon: "⚙️", label: "Processing" },
  shipped:    { bg: BLUE_LIGHT,   text: BLUE,      icon: "🚚", label: "Shipped" },
  delivered:  { bg: GREEN_LIGHT,  text: GREEN,     icon: "📦", label: "Delivered" },
  cancelled:  { bg: RED_LIGHT,    text: RED,        icon: "✕",  label: "Cancelled" },
};

const PAYMENT_STATUS: Record<string, StatusStyle> = {
  pending: { bg: YELLOW_LIGHT, text: "#F57F17", icon: "⏳", label: "Pending" },
  paid:    { bg: GREEN_LIGHT,  text: GREEN,     icon: "✓",  label: "Paid" },
  failed:  { bg: RED_LIGHT,    text: RED,        icon: "✕",  label: "Failed" },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;

  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

function formatTime(dateStr?: string): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

// ─── Order Card Component ────────────────────────────────────────────────────

function OrderCard({
  order,
  onCancel,
}: {
  order: any;
  onCancel: (id: string) => void;
}) {
  const statusInfo = ORDER_STATUS[order.orderStatus] || ORDER_STATUS.created;
  const paymentInfo = PAYMENT_STATUS[order.paymentStatus] || PAYMENT_STATUS.pending;
  const canCancel = order.orderStatus === "created" && order.paymentStatus !== "failed";
  const items = order.items || [];
  const itemCount = items.reduce((sum: number, i: any) => sum + (i.quantity || 1), 0);
  const maxThumbs = 4;
  const showMore = items.length > maxThumbs;

  return (
    <View style={s.card}>
      {/* ─ Top row: date + status badge ─ */}
      <View style={s.cardTop}>
        <View style={s.dateWrap}>
          <Text style={s.dateText}>{formatDate(order.createdAt)}</Text>
          <Text style={s.timeText}>{formatTime(order.createdAt)}</Text>
        </View>
        <View style={[s.statusPill, { backgroundColor: statusInfo.bg }]}>
          <Text style={[s.statusPillText, { color: statusInfo.text }]}>
            {statusInfo.icon} {statusInfo.label}
          </Text>
        </View>
      </View>

      {/* ─ Product thumbnails row ─ */}
      <View style={s.thumbRow}>
        {items.slice(0, maxThumbs).map((item: any, idx: number) => (
          <View key={item.productId || idx} style={s.thumbWrap}>
            <Image
              source={{ uri: item.image || "https://via.placeholder.com/60" }}
              style={s.thumbImg}
              contentFit="contain"
              transition={200}
            />
            {(item.quantity || 1) > 1 && (
              <View style={s.thumbQtyBadge}>
                <Text style={s.thumbQtyText}>×{item.quantity}</Text>
              </View>
            )}
          </View>
        ))}
        {showMore && (
          <View style={s.thumbMore}>
            <Text style={s.thumbMoreText}>+{items.length - maxThumbs}</Text>
          </View>
        )}
      </View>

      {/* ─ Item names summary ─ */}
      <Text style={s.itemSummary} numberOfLines={2}>
        {items.map((i: any) => i.name).join(", ")}
      </Text>

      {/* ─ Amount + Payment row ─ */}
      <View style={s.amountRow}>
        <View style={s.amountLeft}>
          <Text style={s.amountLabel}>{itemCount} item{itemCount !== 1 ? "s" : ""}</Text>
          <Text style={s.amountValue}>₹{(order.finalAmount || order.totalAmount || 0).toLocaleString("en-IN")}</Text>
        </View>
        <View style={[s.paymentPill, { backgroundColor: paymentInfo.bg }]}>
          <Text style={[s.paymentPillText, { color: paymentInfo.text }]}>
            {paymentInfo.label}
          </Text>
        </View>
      </View>

      {/* ─ Delivery address snippet ─ */}
      {order.address && (
        <View style={s.addressRow}>
          <Ionicons name="location-outline" size={13} color={TEXT_MUTED} />
          <Text style={s.addressText} numberOfLines={1}>
            {order.address.label || order.address.city}, {order.address.state} – {order.address.pincode}
          </Text>
        </View>
      )}

      {/* ─ Bottom actions ─ */}
      <View style={s.cardActions}>
        {order.trackingId && (
          <TouchableOpacity style={s.trackBtn} activeOpacity={0.7}>
            <MaterialIcons name="local-shipping" size={14} color={GREEN} />
            <Text style={s.trackBtnText}>Track</Text>
          </TouchableOpacity>
        )}

        {canCancel && (
          <TouchableOpacity
            style={s.cancelBtn}
            onPress={() => onCancel(order.orderId)}
            activeOpacity={0.7}
          >
            <Text style={s.cancelBtnText}>Cancel Order</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={s.reorderBtn} activeOpacity={0.7}>
          <Ionicons name="repeat-outline" size={14} color={GREEN} />
          <Text style={s.reorderBtnText}>Reorder</Text>
        </TouchableOpacity>
      </View>

      {/* ─ Order ID footer ─ */}
      <View style={s.orderIdRow}>
        <Text style={s.orderIdLabel}>Order ID</Text>
        <Text style={s.orderIdValue}>{order.orderId}</Text>
      </View>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function OrdersScreen() {
  const dispatch = useAppDispatch();
  const orders = useAppSelector(selectOrders);
  const loading = useAppSelector(selectOrdersLoading);
  const pagination = useAppSelector(selectOrdersPagination);
  const [refreshing, setRefreshing] = useState(false);
  const isLoggedIn = useAppSelector((state) => state.user.isLoggedIn);

  useEffect(() => {
    if (isLoggedIn) {
      dispatch(loadOrders({ page: 1, limit: 20 }));
    }
  }, [dispatch, isLoggedIn]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await dispatch(loadOrders({ page: 1, limit: 20 }));
    setRefreshing(false);
  }, [dispatch]);

  const handleCancel = useCallback(
    (orderId: string) => {
      Alert.alert(
        "Cancel Order",
        "Are you sure you want to cancel this order?",
        [
          { text: "No", style: "cancel" },
          {
            text: "Yes, Cancel",
            style: "destructive",
            onPress: async () => {
              try {
                await dispatch(cancelOrderThunk(orderId)).unwrap();
                Alert.alert("Cancelled", "Your order has been cancelled.");
                dispatch(loadOrders({ page: 1, limit: 20 }));
              } catch (err: any) {
                Alert.alert("Error", err || "Failed to cancel order");
              }
            },
          },
        ]
      );
    },
    [dispatch]
  );

  // ── Not logged in ──
  if (!isLoggedIn) {
    return (
      <View style={s.container}>
        <StatusBar barStyle="dark-content" backgroundColor={WHITE} />
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.push("/(tabs)/home" as any)}>
            <SvgXml xml={BACK_ICON} width={28} height={28} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>My Orders</Text>
          <View style={{ width: 28 }} />
        </View>
        <View style={s.emptyWrap}>
          <View style={s.emptyCircle}>
            <Ionicons name="lock-closed-outline" size={36} color={TEXT_MUTED} />
          </View>
          <Text style={s.emptyTitle}>Login Required</Text>
          <Text style={s.emptySub}>Please login to view your orders</Text>
          <TouchableOpacity
            style={s.ctaBtn}
            onPress={() => router.push("/login" as any)}
          >
            <Text style={s.ctaBtnText}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Loading ──
  if (loading && orders.length === 0) {
    return (
      <View style={s.container}>
        <StatusBar barStyle="dark-content" backgroundColor={WHITE} />
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.push("/(tabs)/home" as any)}>
            <SvgXml xml={BACK_ICON} width={28} height={28} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>My Orders</Text>
          <View style={{ width: 28 }} />
        </View>
        <View style={s.emptyWrap}>
          <ActivityIndicator size="large" color={GREEN} />
          <Text style={[s.emptySub, { marginTop: 12 }]}>Loading orders...</Text>
        </View>
      </View>
    );
  }

  // ── Empty ──
  if (orders.length === 0) {
    return (
      <View style={s.container}>
        <StatusBar barStyle="dark-content" backgroundColor={WHITE} />
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.push("/(tabs)/home" as any)}>
            <SvgXml xml={BACK_ICON} width={28} height={28} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>My Orders</Text>
          <View style={{ width: 28 }} />
        </View>
        <View style={s.emptyWrap}>
          <View style={s.emptyCircle}>
            <Ionicons name="bag-outline" size={40} color={TEXT_MUTED} />
          </View>
          <Text style={s.emptyTitle}>No orders yet</Text>
          <Text style={s.emptySub}>
            Your order history will show up here once you place an order.
          </Text>
          <TouchableOpacity
            style={s.ctaBtn}
            onPress={() => router.push("/(tabs)/home" as any)}
          >
            <Text style={s.ctaBtnText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Order list ──
  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor={WHITE} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => router.push("/(tabs)/home" as any)}>
          <SvgXml xml={BACK_ICON} width={28} height={28} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>My Orders</Text>
        {pagination.total > 0 ? (
          <Text style={s.headerCount}>{pagination.total}</Text>
        ) : (
          <View style={{ width: 28 }} />
        )}
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.orderId || item._id || String(Math.random())}
        renderItem={({ item }) => (
          <OrderCard order={item} onCancel={handleCancel} />
        )}
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[GREEN]}
            tintColor={GREEN}
          />
        }
      />
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: GREY_BG },

  // Header — matches CartScreen
  header: {
    height: 56,
    backgroundColor: WHITE,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },
  headerCount: {
    fontSize: 13,
    fontWeight: "600",
    color: TEXT_MUTED,
  },

  // List
  listContent: { padding: 12, paddingBottom: 120 },

  // Card
  card: {
    backgroundColor: WHITE,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },

  // Top row
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  dateWrap: { flexDirection: "row", alignItems: "center", gap: 6 },
  dateText: { fontSize: 13, fontWeight: "600", color: TEXT_PRIMARY },
  timeText: { fontSize: 12, color: TEXT_MUTED },

  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusPillText: { fontSize: 11, fontWeight: "700" },

  // Thumbnails
  thumbRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  thumbWrap: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: "#F8F8F8",
    borderWidth: 1,
    borderColor: BORDER,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  thumbImg: { width: 48, height: 48 },
  thumbQtyBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: GREEN,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
    minWidth: 16,
    alignItems: "center",
  },
  thumbQtyText: { fontSize: 9, fontWeight: "700", color: WHITE },
  thumbMore: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: BORDER,
  },
  thumbMoreText: { fontSize: 14, fontWeight: "700", color: TEXT_MUTED },

  // Item summary
  itemSummary: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    lineHeight: 18,
    marginBottom: 12,
  },

  // Amount row
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BORDER,
  },
  amountLeft: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  amountLabel: { fontSize: 12, color: TEXT_MUTED },
  amountValue: { fontSize: 16, fontWeight: "800", color: TEXT_PRIMARY },
  paymentPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  paymentPillText: { fontSize: 10, fontWeight: "700" },

  // Address
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 12,
    marginTop: 2,
  },
  addressText: {
    fontSize: 12,
    color: TEXT_MUTED,
    flex: 1,
  },

  // Actions
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BORDER,
  },
  trackBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: GREEN_LIGHT,
  },
  trackBtnText: { fontSize: 12, fontWeight: "700", color: GREEN },
  cancelBtn: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: RED,
  },
  cancelBtnText: { fontSize: 12, fontWeight: "600", color: RED },
  reorderBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: GREEN,
    marginLeft: "auto",
  },
  reorderBtnText: { fontSize: 12, fontWeight: "700", color: GREEN },

  // Order ID footer
  orderIdRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BORDER,
  },
  orderIdLabel: { fontSize: 11, color: TEXT_MUTED },
  orderIdValue: { fontSize: 11, fontWeight: "600", color: TEXT_MUTED },

  // Empty state
  emptyWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingBottom: 100,
  },
  emptyCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 14,
    color: TEXT_MUTED,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  ctaBtn: {
    backgroundColor: GREEN,
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 10,
  },
  ctaBtnText: { color: WHITE, fontWeight: "700", fontSize: 15 },
});