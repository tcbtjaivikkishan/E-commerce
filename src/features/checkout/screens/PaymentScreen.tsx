import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAppSelector } from '../../../shared/hooks/useRedux';
import { useOrder } from '../hooks/useOrder';
import {
  selectSubtotal,
  selectTotalItems,
  selectTotalWeightGrams,
} from '../../cart/store/cartSlice';
import { calculateShippingRate, type ShippingRateResponse } from '../services/shipping.api';

const GREEN = '#0C8A45';
const BORDER = '#EBEBEB';
const TEXT_PRIMARY = '#1A1A1A';
const TEXT_SECONDARY = '#666666';
const TEXT_MUTED = '#AAAAAA';

const PAYMENT_OPTIONS = [
  { id: 'cod', title: 'Cash on Delivery', subtitle: 'Pay when your order arrives' },
  { id: 'upi', title: 'UPI / Wallet',      subtitle: 'Google Pay, PhonePe, Paytm' },
  { id: 'card', title: 'Credit / Debit Card', subtitle: 'Visa, Mastercard, RuPay' },
] as const;

type PaymentMethod = typeof PAYMENT_OPTIONS[number]['id'];

// ─── Shipping state shape ─────────────────────────────────────────────────────
type ShippingState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: ShippingRateResponse }
  | { status: 'error'; message: string };

export default function PaymentScreen() {
  const { tempAddress, tempPayment, updatePayment, submitOrderAsync, isReadyToPlace, status } = useOrder();
  const subtotal       = useAppSelector(selectSubtotal);
  const totalItems     = useAppSelector(selectTotalItems);
  const totalWeightG   = useAppSelector(selectTotalWeightGrams);

  const [shipping, setShipping] = useState<ShippingState>({ status: 'idle' });

  // ── Fetch live shipping rate whenever address pincode or weight changes ──────
  useEffect(() => {
    const pincode = Number(tempAddress?.pincode);
    if (!pincode || totalWeightG <= 0) {
      setShipping({ status: 'idle' });
      return;
    }

    let cancelled = false;
    setShipping({ status: 'loading' });

    calculateShippingRate(totalWeightG, pincode)
      .then((res) => {
        if (!cancelled) setShipping({ status: 'success', data: res });
      })
      .catch((err: any) => {
        if (!cancelled)
          setShipping({
            status: 'error',
            message: err?.message ?? 'Could not fetch shipping rate',
          });
      });

    return () => { cancelled = true; };
  }, [totalWeightG, tempAddress?.pincode]);

  // ── Derived shipping values ──────────────────────────────────────────────────
  const shippingCharge =
    shipping.status === 'success' ? shipping.data.shippingCharge : 0;
  const courierLabel =
    shipping.status === 'success'
      ? `${shipping.data.courier} · ${shipping.data.estimatedDelivery}`
      : null;
  const grandTotal = subtotal + shippingCharge;

  // ── Place order ──────────────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (isReadyToPlace && subtotal > 0 && totalItems > 0) {
      try {
        await submitOrderAsync();
        router.push('/checkout/success');
      } catch (err: any) {
        Alert.alert('Order Failed', err?.message || 'Could not place order. Please try again.');
      }
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} activeOpacity={0.7}>
          <Text style={s.backArrow}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={s.headerTitle}>Payment</Text>
          <Text style={s.headerSub}>₹{subtotal.toLocaleString()} · {totalItems} item{totalItems > 1 ? 's' : ''}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Payment options */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionLabel}>PAYMENT METHOD</Text>
        </View>

        <View style={s.optionsCard}>
          {PAYMENT_OPTIONS.map((option, index) => {
            const selected = tempPayment?.method === option.id;
            return (
              <View key={option.id}>
                <TouchableOpacity
                  style={s.optionRow}
                  onPress={() => updatePayment({ method: option.id as PaymentMethod })}
                  activeOpacity={0.7}
                >
                  <View style={s.optionText}>
                    <Text style={[s.optionTitle, selected && s.optionTitleSelected]}>
                      {option.title}
                    </Text>
                    <Text style={s.optionSub}>{option.subtitle}</Text>
                  </View>
                  {/* Radio button */}
                  <View style={[s.radio, selected && s.radioSelected]}>
                    {selected && <View style={s.radioDot} />}
                  </View>
                </TouchableOpacity>
                {index < PAYMENT_OPTIONS.length - 1 && <View style={s.divider} />}
              </View>
            );
          })}
        </View>

        {/* Bill summary */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionLabel}>BILL SUMMARY</Text>
        </View>

        <View style={s.billCard}>
          {/* Item total */}
          <View style={s.billRow}>
            <Text style={s.billLabel}>Item Total</Text>
            <Text style={s.billValue}>₹{subtotal.toLocaleString()}</Text>
          </View>
          <View style={s.divider} />

          {/* Delivery Fee — live */}
          <View style={s.billRow}>
            <View style={s.deliveryLabelCol}>
              <Text style={s.billLabel}>Delivery Fee</Text>
              {courierLabel && (
                <Text style={s.courierTag}>{courierLabel}</Text>
              )}
            </View>
            <View style={s.deliveryValueCol}>
              {shipping.status === 'loading' ? (
                <ActivityIndicator size="small" color={GREEN} />
              ) : shipping.status === 'success' ? (
                <Text style={[s.billValue, shippingCharge === 0 && s.greenText]}>
                  {shippingCharge === 0 ? 'FREE' : `₹${shippingCharge}`}
                </Text>
              ) : shipping.status === 'error' ? (
                <Text style={s.errorText}>–</Text>
              ) : (
                <Text style={[s.billValue, s.greenText]}>–</Text>
              )}
            </View>
          </View>
          <View style={s.divider} />

          {/* Grand total */}
          <View style={s.billRow}>
            <Text style={s.billTotalLabel}>To Pay</Text>
            <Text style={s.billTotalValue}>₹{grandTotal.toLocaleString()}</Text>
          </View>
        </View>

        {/* Shipping error banner */}
        {shipping.status === 'error' && (
          <View style={s.shippingErrorBanner}>
            <Text style={s.shippingErrorText}>
              ⚠️ {shipping.message}. Shipping cost may vary.
            </Text>
          </View>
        )}

      </ScrollView>

      {/* Place order footer */}
      <View style={s.footer}>
        <View style={s.footerInfo}>
          <Text style={s.footerTotal}>₹{grandTotal.toLocaleString()}</Text>
          <Text style={s.footerSub}>
            {totalItems} item{totalItems > 1 ? 's' : ''}
            {shippingCharge > 0 ? ` · ₹${shippingCharge} delivery` : ' · Free delivery'}
          </Text>
        </View>
        <TouchableOpacity
          style={[s.placeBtn, !isReadyToPlace && s.placeBtnDisabled]}
          onPress={handlePlaceOrder}
          disabled={!isReadyToPlace}
          activeOpacity={0.88}
        >
          <Text style={[s.placeBtnText, !isReadyToPlace && s.placeBtnTextDisabled]}>
            Place Order
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F4F4F4' },

  // Header — white, flat, matches CartScreen
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  backBtn: { padding: 4 },
  backArrow: { fontSize: 20, color: TEXT_PRIMARY, fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: TEXT_PRIMARY, letterSpacing: -0.3 },
  headerSub: { fontSize: 12, color: TEXT_MUTED, marginTop: 1 },

  scroll: { paddingBottom: 16 },

  // Section label — same as CartScreen / SuccessScreen
  sectionHeader: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 8 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: TEXT_MUTED, letterSpacing: 0.8 },

  // Payment options — flat card, dividers only
  optionsCard: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: BORDER,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  optionText: { flex: 1 },
  optionTitle: { fontSize: 14, fontWeight: '600', color: TEXT_PRIMARY },
  optionTitleSelected: { color: GREEN },
  optionSub: { fontSize: 12, color: TEXT_MUTED, marginTop: 2 },
  divider: { height: 1, backgroundColor: BORDER },

  // Radio button
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: GREEN },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: GREEN,
  },

  // Bill card
  billCard: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  billLabel: { fontSize: 13, color: TEXT_SECONDARY },
  billValue: { fontSize: 13, fontWeight: '600', color: TEXT_PRIMARY },
  greenText: { color: GREEN },
  errorText: { fontSize: 13, fontWeight: '600', color: '#EF4444' },
  billTotalLabel: { fontSize: 14, fontWeight: '700', color: TEXT_PRIMARY },
  billTotalValue: { fontSize: 15, fontWeight: '700', color: TEXT_PRIMARY },

  // Delivery fee row with courier sub-label
  deliveryLabelCol: { flex: 1 },
  deliveryValueCol: { minWidth: 60, alignItems: 'flex-end' },
  courierTag: {
    fontSize: 11,
    color: GREEN,
    marginTop: 2,
    fontWeight: '500',
  },

  // Shipping error banner
  shippingErrorBanner: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  shippingErrorText: {
    fontSize: 12,
    color: '#92400E',
  },

  // Footer — same pattern as CartScreen checkout bar
  footer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  footerInfo: {},
  footerTotal: { fontSize: 17, fontWeight: '700', color: TEXT_PRIMARY },
  footerSub: { fontSize: 11, color: TEXT_MUTED, marginTop: 1 },
  placeBtn: {
    flex: 1,
    backgroundColor: GREEN,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  placeBtnDisabled: { backgroundColor: '#D1D5DB' },
  placeBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  placeBtnTextDisabled: { color: '#9CA3AF' },
});
