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
import { router } from "expo-router";
import { useAppDispatch, useAppSelector } from "../../../shared/hooks/useRedux";
import {
  loadOrders,
  cancelOrderThunk,
  selectOrders,
  selectOrdersLoading,
  selectOrdersError,
  selectOrdersPagination,
} from "../store/ordersSlice";

const GREEN = "#0F7B3C";

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  created: { bg: "#FFF3CD", text: "#856404" },
  confirmed: { bg: "#D4EDDA", text: "#155724" },
  processing: { bg: "#CCE5FF", text: "#004085" },
  shipped: { bg: "#D1ECF1", text: "#0C5460" },
  delivered: { bg: "#D4EDDA", text: "#155724" },
  cancelled: { bg: "#F8D7DA", text: "#721C24" },
  pending: { bg: "#FFF3CD", text: "#856404" },
  paid: { bg: "#D4EDDA", text: "#155724" },
  failed: { bg: "#F8D7DA", text: "#721C24" },
};

export default function OrdersScreen() {
  const dispatch = useAppDispatch();
  const orders = useAppSelector(selectOrders);
  const loading = useAppSelector(selectOrdersLoading);
  const error = useAppSelector(selectOrdersError);
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
        `Are you sure you want to cancel order ${orderId}?`,
        [
          { text: "No", style: "cancel" },
          {
            text: "Yes, Cancel",
            style: "destructive",
            onPress: async () => {
              try {
                await dispatch(cancelOrderThunk(orderId)).unwrap();
                Alert.alert("Success", "Order cancelled successfully");
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

  if (!isLoggedIn) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Orders</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔒</Text>
          <Text style={styles.emptyTitle}>Login Required</Text>
          <Text style={styles.emptySubtitle}>
            Please login to view your orders
          </Text>
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => router.push("/login" as any)}
          >
            <Text style={styles.loginBtnText}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const renderOrder = ({ item }: { item: any }) => {
    const orderColor = STATUS_COLORS[item.orderStatus] || STATUS_COLORS.created;
    const paymentColor =
      STATUS_COLORS[item.paymentStatus] || STATUS_COLORS.pending;
    const canCancel =
      item.orderStatus === "created" && item.orderStatus !== "cancelled";

    return (
      <View style={styles.orderCard}>
        {/* Order header */}
        <View style={styles.orderHeader}>
          <Text style={styles.orderId}>{item.orderId}</Text>
          <View
            style={[styles.statusBadge, { backgroundColor: orderColor.bg }]}
          >
            <Text style={[styles.statusText, { color: orderColor.text }]}>
              {item.orderStatus?.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Order details */}
        <View style={styles.orderRow}>
          <Text style={styles.orderLabel}>Items</Text>
          <Text style={styles.orderValue}>
            {item.items?.length || 0} item(s)
          </Text>
        </View>

        <View style={styles.orderRow}>
          <Text style={styles.orderLabel}>Total</Text>
          <Text style={styles.orderValueBold}>
            ₹{item.finalAmount || item.totalAmount || 0}
          </Text>
        </View>

        <View style={styles.orderRow}>
          <Text style={styles.orderLabel}>Payment</Text>
          <View
            style={[
              styles.statusBadgeSmall,
              { backgroundColor: paymentColor.bg },
            ]}
          >
            <Text
              style={[styles.statusTextSmall, { color: paymentColor.text }]}
            >
              {item.paymentStatus?.toUpperCase()}
            </Text>
          </View>
        </View>

        {item.address && (
          <View style={styles.orderRow}>
            <Text style={styles.orderLabel}>Delivery</Text>
            <Text style={styles.orderValueSmall} numberOfLines={1}>
              {item.address.city}, {item.address.state}
            </Text>
          </View>
        )}

        {/* Actions */}
        <View style={styles.orderActions}>
          {canCancel && (
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => handleCancel(item.orderId)}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
        {pagination.total > 0 && (
          <Text style={styles.headerCount}>{pagination.total} order(s)</Text>
        )}
      </View>

      {loading && orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={GREEN} />
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.emptySubtitle}>
            Start shopping to see your orders here
          </Text>
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => router.push("/home" as any)}
          >
            <Text style={styles.loginBtnText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.orderId || item._id || String(Math.random())}
          renderItem={renderOrder}
          contentContainerStyle={styles.listContent}
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },

  header: {
    backgroundColor: "white",
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: { color: "black", fontSize: 20, fontWeight: "bold" },
  headerCount: { color: "rgba(255,255,255,0.8)", fontSize: 13 },

  listContent: { padding: 12, paddingBottom: 120 },

  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },

  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderId: { fontSize: 15, fontWeight: "700", color: "#1A1A1A" },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: { fontSize: 11, fontWeight: "700" },

  statusBadgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusTextSmall: { fontSize: 10, fontWeight: "600" },

  orderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  orderLabel: { fontSize: 13, color: "#888" },
  orderValue: { fontSize: 13, color: "#333" },
  orderValueBold: { fontSize: 14, fontWeight: "700", color: "#1A1A1A" },
  orderValueSmall: { fontSize: 12, color: "#666", maxWidth: 180 },

  orderActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
    gap: 8,
  },

  cancelBtn: {
    borderWidth: 1.5,
    borderColor: "#E53935",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  cancelBtnText: { color: "#E53935", fontWeight: "600", fontSize: 13 },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 120,
    paddingHorizontal: 40,
  },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "#333", marginBottom: 6 },
  emptySubtitle: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginBottom: 20,
  },

  loginBtn: {
    backgroundColor: GREEN,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  loginBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },

  loadingText: { marginTop: 12, color: "#666", fontSize: 14 },
});