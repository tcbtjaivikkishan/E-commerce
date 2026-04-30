// src/features/checkout/screens/SuccessScreen.tsx
// ─── Premium order success screen with animations ────────────────────────────

import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppSelector } from '../../../shared/hooks/useRedux';
import { useOrder } from '../hooks/useOrder';
import { pollPaymentStatus } from '../services/zoho-payments';
import { selectCurrentOrder } from '../store/orderSlice';

// ─── Palette ────────────────────────────────────────────────────────────────
const GREEN = '#0D9F4F';
const GREEN_DARK = '#0A7B3E';
const GREEN_PALE = '#E8F9EF';
const WHITE = '#FFFFFF';
const TEXT_DARK = '#1A1D1F';
const TEXT_MID = '#6F767E';
const TEXT_LIGHT = '#9A9FA5';
const BORDER = '#F0F0F0';
const BG = '#F5F6F8';

// ─── Animated Confetti Particle ─────────────────────────────────────────────
function ConfettiParticle({
  delay,
  left,
  color,
  size,
}: {
  delay: number;
  left: number;
  color: string;
  size: number;
}) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue: 1,
          duration: 2400 + Math.random() * 800,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: -10,
        left: `${left}%` as any,
        width: size,
        height: size * 0.6,
        borderRadius: size * 0.15,
        backgroundColor: color,
        opacity: anim.interpolate({ inputRange: [0, 0.12, 0.85, 1], outputRange: [0, 1, 1, 0] }),
        transform: [
          { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-30, 480] }) },
          {
            translateX: anim.interpolate({
              inputRange: [0, 0.3, 0.7, 1],
              outputRange: [0, -18 + Math.random() * 36, 12 - Math.random() * 24, Math.random() * 18],
            }),
          },
          {
            rotate: anim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', `${200 + Math.random() * 360}deg`],
            }),
          },
        ],
      }}
    />
  );
}

// ─── Animated Checkmark ─────────────────────────────────────────────────────
function AnimatedCheck() {
  const scale = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(0.6)).current;
  const ringOpacity = useRef(new Animated.Value(1)).current;
  const tickOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 5,
      tension: 120,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(ringScale, {
            toValue: 1.7,
            duration: 1400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(ringOpacity, {
            toValue: 0,
            duration: 1400,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(ringScale, { toValue: 0.6, duration: 0, useNativeDriver: true }),
          Animated.timing(ringOpacity, { toValue: 1, duration: 0, useNativeDriver: true }),
        ]),
      ]),
    ).start();

    Animated.timing(tickOpacity, {
      toValue: 1,
      duration: 350,
      delay: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={st.checkWrap}>
      <Animated.View
        style={[st.checkRing, { transform: [{ scale: ringScale }], opacity: ringOpacity }]}
      />
      <Animated.View style={[st.checkCircle, { transform: [{ scale }] }]}>
        <Animated.Text style={[st.checkTick, { opacity: tickOpacity }]}>✓</Animated.Text>
      </Animated.View>
    </View>
  );
}

// ─── Confetti colors ────────────────────────────────────────────────────────
const CONFETTI = [
  '#FF6B6B', '#4ECDC4', '#FFE66D', '#A78BFA',
  '#34D399', '#F472B6', '#60A5FA', '#FBBF24',
];

// ═════════════════════════════════════════════════════════════════════════════
// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────
// ═════════════════════════════════════════════════════════════════════════════

export default function SuccessScreen() {
  const currentOrder = useAppSelector(selectCurrentOrder);
  const { reset } = useOrder();

  // ── Background payment verification ──
  const [verifyState, setVerifyState] = useState<'checking' | 'paid' | 'failed' | 'pending'>('checking');
  const verified = verifyState === 'paid';

  useEffect(() => {
    if (!currentOrder?.id) return;
    pollPaymentStatus(currentOrder.id, 12, 2500)
      .then((status) => {
        console.log('[SUCCESS] Final poll result:', status);
        setVerifyState(status);
      })
      .catch(() => setVerifyState('pending'));
  }, [currentOrder?.id]);

  // ── Entrance animations ──
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(60)).current;
  const cardSlide = useRef(new Animated.Value(40)).current;
  const cardFade = useRef(new Animated.Value(0)).current;
  const btnSlide = useRef(new Animated.Value(30)).current;
  const btnFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideUp, { toValue: 0, friction: 6, useNativeDriver: true }),
    ]).start();

    Animated.parallel([
      Animated.timing(cardFade, { toValue: 1, duration: 400, delay: 400, useNativeDriver: true }),
      Animated.spring(cardSlide, { toValue: 0, friction: 7, delay: 400, useNativeDriver: true }),
    ]).start();

    Animated.parallel([
      Animated.timing(btnFade, { toValue: 1, duration: 350, delay: 700, useNativeDriver: true }),
      Animated.spring(btnSlide, { toValue: 0, friction: 7, delay: 700, useNativeDriver: true }),
    ]).start();
  }, []);

  // ── Auto-redirect after 8s ──
  useEffect(() => {
    const timer = setTimeout(() => {
      reset();
      router.replace('/(tabs)/home' as any);
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  // ── Fallback ──
  if (!currentOrder) {
    return (
      <SafeAreaView style={st.centered}>
        <StatusBar barStyle="dark-content" backgroundColor={WHITE} />
        <AnimatedCheck />
        <Text style={st.fallbackTitle}>Order Confirmed!</Text>
        <Text style={st.fallbackSub}>You'll be redirected shortly…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={st.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={WHITE} />

      <View style={st.content}>
        {/* ── Confetti ── */}
        <View style={st.confettiContainer} pointerEvents="none">
          {CONFETTI.map((c, i) => (
            <ConfettiParticle key={`a${i}`} delay={i * 110} left={6 + (i * 12) % 88} color={c} size={8 + (i % 3) * 3} />
          ))}
          {CONFETTI.map((c, i) => (
            <ConfettiParticle key={`b${i}`} delay={550 + i * 90} left={12 + (i * 11) % 76} color={c} size={6 + (i % 4) * 2} />
          ))}
        </View>

        <ScrollView
          contentContainerStyle={st.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Hero ── */}
          <Animated.View
            style={[st.heroSection, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}
          >
            <AnimatedCheck />

            <Text style={st.heroTitle}>Order Placed Successfully!</Text>
            <Text style={st.heroSub}>
              Your order <Text style={st.heroOrderId}>#{currentOrder.id}</Text> is confirmed
            </Text>

            {/* Verification badge */}
            <View style={[
              st.verifyBadge,
              verifyState === 'paid' && st.verifyBadgePaid,
              verifyState === 'failed' && st.verifyBadgeFailed,
            ]}>
              <Text style={st.verifyIcon}>
                {verifyState === 'paid' ? '🔒' : verifyState === 'failed' ? '⚠️' : '⏳'}
              </Text>
              <Text style={[
                st.verifyText,
                verifyState === 'paid' && st.verifyTextPaid,
                verifyState === 'failed' && st.verifyTextFailed,
              ]}>
                {verifyState === 'checking' && 'Verifying payment…'}
                {verifyState === 'paid' && 'Payment Verified'}
                {verifyState === 'failed' && 'Payment Failed'}
                {verifyState === 'pending' && 'Verification pending'}
              </Text>
            </View>
          </Animated.View>

          {/* ── Order Summary Card ── */}
          <Animated.View
            style={[st.card, { opacity: cardFade, transform: [{ translateY: cardSlide }] }]}
          >
            <Text style={st.cardSectionTitle}>Order Summary</Text>
            <View style={st.cardDivider} />

            <View style={st.summaryRow}>
              <View style={st.summaryItem}>
                <Text style={st.summaryLabel}>ORDER ID</Text>
                <Text style={st.summaryValue} numberOfLines={1}>#{currentOrder.id}</Text>
              </View>
              <View style={st.summaryDot} />
              <View style={st.summaryItem}>
                <Text style={st.summaryLabel}>ITEMS</Text>
                <Text style={st.summaryValue}>
                  {currentOrder.itemsCount} item{currentOrder.itemsCount > 1 ? 's' : ''}
                </Text>
              </View>
            </View>

            {currentOrder.total > 0 && (
              <>
                <View style={st.cardDivider} />
                <View style={st.totalRow}>
                  <Text style={st.totalLabel}>Total Paid</Text>
                  <Text style={st.totalValue}>
                    ₹{currentOrder.total.toLocaleString()}
                  </Text>
                </View>
              </>
            )}
          </Animated.View>

          {/* ── Delivery Address Card ── */}
          {currentOrder.address && (
            <Animated.View
              style={[st.card, { opacity: cardFade, transform: [{ translateY: cardSlide }] }]}
            >
              <View style={st.addressHeaderRow}>
                <Text style={st.addressPin}>📍</Text>
                <Text style={st.cardSectionTitle}>Delivering to</Text>
              </View>
              <View style={st.cardDivider} />

              <Text style={st.addressName}>{currentOrder.address.name}</Text>
              <Text style={st.addressLine}>
                {currentOrder.address.street}, {currentOrder.address.city},{' '}
                {currentOrder.address.state} – {currentOrder.address.pincode}
              </Text>
              {currentOrder.address.phone ? (
                <Text style={st.addressPhone}>📞 {currentOrder.address.phone}</Text>
              ) : null}
            </Animated.View>
          )}

          {/* ── What's Next Info ── */}
          <Animated.View
            style={[st.infoCard, { opacity: cardFade, transform: [{ translateY: cardSlide }] }]}
          >
            <Text style={st.infoTitle}>What happens next?</Text>
            <View style={st.infoRow}>
              <Text style={st.infoEmoji}>📦</Text>
              <Text style={st.infoText}>We're preparing your order for dispatch</Text>
            </View>
            <View style={st.infoRow}>
              <Text style={st.infoEmoji}>🚚</Text>
              <Text style={st.infoText}>You'll receive tracking details via SMS</Text>
            </View>
            <View style={st.infoRow}>
              <Text style={st.infoEmoji}>🏠</Text>
              <Text style={st.infoText}>Delivery to your doorstep in 3-5 days</Text>
            </View>
          </Animated.View>
        </ScrollView>

        {/* ── Bottom CTA ── */}
        <Animated.View
          style={[st.footer, { opacity: btnFade, transform: [{ translateY: btnSlide }] }]}
        >
          <TouchableOpacity
            style={st.ctaBtn}
            onPress={() => { reset(); router.replace('/(tabs)/home' as any); }}
            activeOpacity={0.88}
          >
            <Text style={st.ctaBtnText}>Continue Shopping</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

// ─── STYLES ─────────────────────────────────────────────────────────────────
const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: WHITE },
  content: { flex: 1, backgroundColor: BG },
  scrollContent: { paddingBottom: 100 },

  centered: {
    flex: 1,
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  fallbackTitle: { fontSize: 22, fontWeight: '800', color: TEXT_DARK, marginTop: 20 },
  fallbackSub: { fontSize: 14, color: TEXT_MID, marginTop: 6 },

  // Confetti
  confettiContainer: { ...StyleSheet.absoluteFillObject, overflow: 'hidden', zIndex: 10 },

  // Hero
  heroSection: {
    backgroundColor: WHITE,
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 28,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: TEXT_DARK,
    letterSpacing: -0.5,
    marginTop: 20,
    textAlign: 'center',
  },
  heroSub: { fontSize: 14, color: TEXT_MID, marginTop: 8, textAlign: 'center', lineHeight: 20 },
  heroOrderId: { fontWeight: '700', color: GREEN },

  // Checkmark
  checkWrap: { width: 90, height: 90, alignItems: 'center', justifyContent: 'center' },
  checkCircle: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: GREEN,
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  checkRing: {
    position: 'absolute',
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 3,
    borderColor: GREEN,
  },
  checkTick: { fontSize: 36, color: WHITE, fontWeight: '700', lineHeight: 42 },

  // Verify badge
  verifyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    marginTop: 18,
    gap: 6,
  },
  verifyBadgePaid: { backgroundColor: GREEN_PALE },
  verifyBadgeFailed: { backgroundColor: '#FEF2F2' },
  verifyIcon: { fontSize: 14 },
  verifyText: { fontSize: 13, fontWeight: '600', color: '#B8860B' },
  verifyTextPaid: { color: GREEN_DARK },
  verifyTextFailed: { color: '#DC2626' },

  // Card
  card: {
    backgroundColor: WHITE,
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: TEXT_DARK,
    letterSpacing: 0.2,
  },
  cardDivider: { height: 1, backgroundColor: BORDER, marginVertical: 14 },

  // Summary
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  summaryItem: { alignItems: 'center', flex: 1 },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: TEXT_LIGHT,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  summaryValue: { fontSize: 14, fontWeight: '700', color: TEXT_DARK },
  summaryDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D9D9D9',
    marginTop: 8,
  },

  // Total
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: { fontSize: 15, fontWeight: '700', color: TEXT_DARK },
  totalValue: { fontSize: 20, fontWeight: '800', color: GREEN },

  // Address
  addressHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  addressPin: { fontSize: 16 },
  addressName: { fontSize: 14, fontWeight: '700', color: TEXT_DARK, marginBottom: 4 },
  addressLine: { fontSize: 13, color: TEXT_MID, lineHeight: 20 },
  addressPhone: { fontSize: 13, color: TEXT_MID, marginTop: 6, fontWeight: '500' },

  // Info card
  infoCard: {
    backgroundColor: GREEN_PALE,
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#C8EDDA',
  },
  infoTitle: { fontSize: 14, fontWeight: '700', color: GREEN_DARK, marginBottom: 14 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  infoEmoji: { fontSize: 18 },
  infoText: { fontSize: 13, color: '#1B6B3A', lineHeight: 18, flex: 1, fontWeight: '500' },

  // Footer
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: BG,
  },
  ctaBtn: {
    backgroundColor: GREEN,
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: GREEN,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  ctaBtnText: { color: WHITE, fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
});
