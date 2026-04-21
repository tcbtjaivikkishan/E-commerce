import { router } from 'expo-router';
import { useEffect } from 'react';
import {
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
import { selectCurrentOrder } from '../store/orderSlice';

const GREEN = '#0C8A45';
const GREEN_LIGHT = '#F0FAF4';
const BORDER = '#EBEBEB';
const TEXT_PRIMARY = '#1A1A1A';
const TEXT_SECONDARY = '#666666';
const TEXT_MUTED = '#AAAAAA';

export default function SuccessScreen() {
  const currentOrder = useAppSelector(selectCurrentOrder);
  const { reset } = useOrder();

  useEffect(() => {
    const timer = setTimeout(() => {
      reset();
      router.replace('/');
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!currentOrder) {
    return (
      <SafeAreaView style={s.centered}>
        <Text style={s.fallbackText}>Order Confirmed</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Success header */}
        <View style={s.heroSection}>
          <View style={s.checkCircle}>
            <Text style={s.checkMark}>✓</Text>
          </View>
          <Text style={s.heroTitle}>Order Placed!</Text>
          <Text style={s.heroSub}>Order #{currentOrder.id} is confirmed</Text>
        </View>

        {/* Delivery ETA banner */}
        <View style={s.etaBanner}>
          <View style={s.etaLeft}>
            <Text style={s.etaLabel}>Estimated Delivery</Text>
            <Text style={s.etaTime}>30 – 60 min</Text>
          </View>
          <Text style={s.etaIcon}>⚡</Text>
        </View>

        {/* Order summary card */}
        <View style={s.card}>
          <Text style={s.cardTitle}>ORDER SUMMARY</Text>

          <View style={s.row}>
            <Text style={s.rowLabel}>Order ID</Text>
            <Text style={s.rowValue}>#{currentOrder.id}</Text>
          </View>
          <View style={s.divider} />

          <View style={s.row}>
            <Text style={s.rowLabel}>Items</Text>
            <Text style={s.rowValue}>{currentOrder.itemsCount} item{currentOrder.itemsCount > 1 ? 's' : ''}</Text>
          </View>
          <View style={s.divider} />

          <View style={s.row}>
            <Text style={s.totalLabel}>Total Paid</Text>
            <Text style={s.totalValue}>₹{currentOrder.total.toLocaleString()}</Text>
          </View>
        </View>

        {/* Delivery address */}
        <View style={s.card}>
          <Text style={s.cardTitle}>DELIVERY ADDRESS</Text>

          <Text style={s.addrName}>{currentOrder.address.name}</Text>
          <Text style={s.addrLine}>
            {currentOrder.address.street}, {currentOrder.address.city},{' '}
            {currentOrder.address.state} – {currentOrder.address.pincode}
          </Text>
          <View style={s.divider} />
          <Text style={s.addrPhone}>{currentOrder.address.phone}</Text>
        </View>

        {/* Status steps */}
        <View style={s.card}>
          <Text style={s.cardTitle}>ORDER STATUS</Text>

          <View style={s.statusRow}>
            <View style={[s.statusDot, s.statusDotActive]} />
            <View style={s.statusText}>
              <Text style={s.statusTitle}>Order Confirmed</Text>
              <Text style={s.statusSub}>Payment secured</Text>
            </View>
          </View>
          <View style={s.statusLine} />
          <View style={s.statusRow}>
            <View style={[s.statusDot, s.statusDotPending]} />
            <View style={s.statusText}>
              <Text style={[s.statusTitle, { color: TEXT_MUTED }]}>Out for Delivery</Text>
              <Text style={s.statusSub}>We'll notify you when it's on the way</Text>
            </View>
          </View>
          <View style={s.statusLine} />
          <View style={s.statusRow}>
            <View style={[s.statusDot, s.statusDotPending]} />
            <View style={s.statusText}>
              <Text style={[s.statusTitle, { color: TEXT_MUTED }]}>Delivered</Text>
              <Text style={s.statusSub}>Expected in 30–60 min</Text>
            </View>
          </View>
        </View>

      </ScrollView>

      {/* Bottom CTA */}
      <View style={s.footer}>
        <TouchableOpacity
          style={s.ctaBtn}
          onPress={() => { reset(); router.push('/'); }}
          activeOpacity={0.88}
        >
          <Text style={s.ctaBtnText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F4F4F4' },
  centered: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  fallbackText: { fontSize: 18, fontWeight: '700', color: TEXT_PRIMARY },

  scroll: { paddingBottom: 24 },

  // Hero — minimal, no giant emoji box
  heroSection: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 28,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  checkCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  checkMark: { fontSize: 28, color: '#fff', fontWeight: '700', lineHeight: 34 },
  heroTitle: { fontSize: 22, fontWeight: '700', color: TEXT_PRIMARY, letterSpacing: -0.3 },
  heroSub: { fontSize: 14, color: TEXT_SECONDARY, marginTop: 4 },

  // ETA banner — full width green strip
  etaBanner: {
    backgroundColor: GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  etaLeft: {},
  etaLabel: { fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: '500' },
  etaTime: { fontSize: 18, fontWeight: '700', color: '#fff', marginTop: 1 },
  etaIcon: { fontSize: 20 },

  // Cards — flat white sections, same pattern as CartScreen
  card: {
    backgroundColor: '#fff',
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: BORDER,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: TEXT_MUTED,
    letterSpacing: 0.8,
    marginBottom: 14,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 11,
  },
  divider: { height: 1, backgroundColor: BORDER },
  rowLabel: { fontSize: 13, color: TEXT_SECONDARY },
  rowValue: { fontSize: 13, fontWeight: '600', color: TEXT_PRIMARY },
  totalLabel: { fontSize: 14, fontWeight: '700', color: TEXT_PRIMARY },
  totalValue: { fontSize: 16, fontWeight: '700', color: GREEN },

  // Address
  addrName: { fontSize: 14, fontWeight: '700', color: TEXT_PRIMARY, marginBottom: 4 },
  addrLine: { fontSize: 13, color: TEXT_SECONDARY, lineHeight: 19, marginBottom: 12 },
  addrPhone: { fontSize: 13, color: TEXT_SECONDARY, paddingTop: 11 },

  // Status tracker
  statusRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 10 },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginTop: 3 },
  statusDotActive: { backgroundColor: GREEN },
  statusDotPending: { backgroundColor: BORDER },
  statusLine: { width: 1, height: 12, backgroundColor: BORDER, marginLeft: 4, marginVertical: -4 },
  statusText: {},
  statusTitle: { fontSize: 13, fontWeight: '600', color: TEXT_PRIMARY },
  statusSub: { fontSize: 12, color: TEXT_MUTED, marginTop: 1 },

  // Footer
  footer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 28,
  },
  ctaBtn: {
    backgroundColor: GREEN,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  ctaBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
