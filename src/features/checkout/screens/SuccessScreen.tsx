// src/features/checkout/screens/SuccessScreen.tsx
// ─── Blinkit-style order success screen with animations ─────────────────────

import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAppSelector } from '../../../shared/hooks/useRedux';
import { useOrder } from '../hooks/useOrder';
import { pollPaymentStatus } from '../services/zoho-payments';
import { selectCurrentOrder } from '../store/orderSlice';

// ─── Palette ────────────────────────────────────────────────────────────────
const GREEN = '#0D9F4F';
const GREEN_DARK = '#0A7B3E';
const GREEN_PALE = '#EAFAF0';
const WHITE = '#FFFFFF';
const TEXT_DARK = '#1A1D1F';
const TEXT_MID = '#6F767E';
const TEXT_LIGHT = '#9A9FA5';
const BORDER = '#ECECEC';
const BG = '#F7F8F8';
const GOLD = '#FFC107';

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
          duration: 2200 + Math.random() * 600,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-30, 420],
  });

  const translateX = anim.interpolate({
    inputRange: [0, 0.3, 0.7, 1],
    outputRange: [0, -15 + Math.random() * 30, 10 - Math.random() * 20, Math.random() * 15],
  });

  const opacity = anim.interpolate({
    inputRange: [0, 0.15, 0.85, 1],
    outputRange: [0, 1, 1, 0],
  });

  const rotate = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', `${180 + Math.random() * 360}deg`],
  });

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
        opacity,
        transform: [{ translateY }, { translateX }, { rotate }],
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
    // Circle pop
    Animated.spring(scale, {
      toValue: 1,
      friction: 5,
      tension: 120,
      useNativeDriver: true,
    }).start();

    // Ring pulse
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(ringScale, {
            toValue: 1.6,
            duration: 1200,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(ringOpacity, {
            toValue: 0,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(ringScale, {
            toValue: 0.6,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(ringOpacity, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ).start();

    // Tick appear
    Animated.timing(tickOpacity, {
      toValue: 1,
      duration: 350,
      delay: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={s.checkWrap}>
      {/* Pulse ring */}
      <Animated.View
        style={[
          s.checkRing,
          {
            transform: [{ scale: ringScale }],
            opacity: ringOpacity,
          },
        ]}
      />
      {/* Circle */}
      <Animated.View style={[s.checkCircle, { transform: [{ scale }] }]}>
        <Animated.Text style={[s.checkTick, { opacity: tickOpacity }]}>
          ✓
        </Animated.Text>
      </Animated.View>
    </View>
  );
}

// ─── Status Step ────────────────────────────────────────────────────────────
function StatusStep({
  title,
  subtitle,
  active,
  last,
}: {
  title: string;
  subtitle: string;
  active: boolean;
  last?: boolean;
}) {
  return (
    <>
      <View style={s.stepRow}>
        <View style={s.stepDotCol}>
          <View style={[s.stepDot, active && s.stepDotActive]}>
            {active && <View style={s.stepDotInner} />}
          </View>
          {!last && (
            <View style={[s.stepLine, active && s.stepLineActive]} />
          )}
        </View>
        <View style={s.stepContent}>
          <Text style={[s.stepTitle, !active && { color: TEXT_LIGHT }]}>
            {title}
          </Text>
          <Text style={s.stepSub}>{subtitle}</Text>
        </View>
      </View>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ─── MAIN SCREEN ────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

const CONFETTI_COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#FFE66D',
  '#A78BFA',
  '#34D399',
  '#F472B6',
  '#60A5FA',
  '#FBBF24',
];

export default function SuccessScreen() {
  const currentOrder = useAppSelector(selectCurrentOrder);
  const { reset } = useOrder();

  // ── Background payment verification (non-blocking) ──
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (!currentOrder?.id) return;

    // Poll in background — user already sees success screen
    pollPaymentStatus(currentOrder.id, 8, 2500)
      .then((status) => {
        if (status === 'paid') setVerified(true);
      })
      .catch(() => {});
  }, [currentOrder?.id]);

  // ── Entrance animations ──
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(60)).current;
  const cardSlide = useRef(new Animated.Value(40)).current;
  const cardFade = useRef(new Animated.Value(0)).current;
  const btnSlide = useRef(new Animated.Value(30)).current;
  const btnFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Hero section
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideUp, {
        toValue: 0,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    // Cards — delayed
    Animated.parallel([
      Animated.timing(cardFade, {
        toValue: 1,
        duration: 400,
        delay: 400,
        useNativeDriver: true,
      }),
      Animated.spring(cardSlide, {
        toValue: 0,
        friction: 7,
        delay: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Button — more delayed
    Animated.parallel([
      Animated.timing(btnFade, {
        toValue: 1,
        duration: 350,
        delay: 700,
        useNativeDriver: true,
      }),
      Animated.spring(btnSlide, {
        toValue: 0,
        friction: 7,
        delay: 700,
        useNativeDriver: true,
      }),
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

  // ── Fallback if no order ──
  if (!currentOrder) {
    return (
      <SafeAreaView style={s.centered}>
        <AnimatedCheck />
        <Text style={s.fallbackTitle}>Order Confirmed!</Text>
        <Text style={s.fallbackSub}>You'll be redirected shortly…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={WHITE} />

      {/* ── Confetti ── */}
      <View style={s.confettiContainer} pointerEvents="none">
        {CONFETTI_COLORS.map((color, i) => (
          <ConfettiParticle
            key={`c-${i}`}
            delay={i * 120}
            left={8 + (i * 12) % 84}
            color={color}
            size={8 + (i % 3) * 3}
          />
        ))}
        {CONFETTI_COLORS.map((color, i) => (
          <ConfettiParticle
            key={`c2-${i}`}
            delay={600 + i * 100}
            left={15 + (i * 10) % 70}
            color={color}
            size={6 + (i % 4) * 2}
          />
        ))}
      </View>

      {/* ── Hero ── */}
      <Animated.View
        style={[
          s.heroSection,
          {
            opacity: fadeIn,
            transform: [{ translateY: slideUp }],
          },
        ]}
      >
        <AnimatedCheck />

        <Text style={s.heroTitle}>Order Placed Successfully!</Text>
        <Text style={s.heroSub}>
          Your order{' '}
          <Text style={s.heroOrderId}>#{currentOrder.id}</Text> is confirmed
        </Text>

        {/* Verification badge */}
        <View style={[s.verifyBadge, verified && s.verifyBadgeActive]}>
          <Text style={s.verifyIcon}>{verified ? '🔒' : '⏳'}</Text>
          <Text
            style={[s.verifyText, verified && s.verifyTextActive]}
          >
            {verified ? 'Payment Verified' : 'Verifying payment…'}
          </Text>
        </View>
      </Animated.View>

      {/* ── Order Info Card ── */}
      <Animated.View
        style={[
          s.card,
          {
            opacity: cardFade,
            transform: [{ translateY: cardSlide }],
          },
        ]}
      >
        {/* Order Details */}
        <View style={s.cardRow}>
          <View>
            <Text style={s.cardLabel}>ORDER ID</Text>
            <Text style={s.cardValue}>#{currentOrder.id}</Text>
          </View>
          <View style={s.cardRight}>
            <Text style={s.cardLabel}>ITEMS</Text>
            <Text style={s.cardValue}>
              {currentOrder.itemsCount} item
              {currentOrder.itemsCount > 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        <View style={s.cardDivider} />

        {/* Total */}
        {currentOrder.total > 0 && (
          <>
            <View style={s.cardRow}>
              <Text style={s.totalLabel}>Total Paid</Text>
              <Text style={s.totalValue}>
                ₹{currentOrder.total.toLocaleString()}
              </Text>
            </View>
            <View style={s.cardDivider} />
          </>
        )}

        {/* Delivery Address */}
        {currentOrder.address && (
          <View style={s.addressBlock}>
            <View style={s.addressHeader}>
              <Text style={s.addressIcon}>📍</Text>
              <Text style={s.addressTitle}>Delivering to</Text>
            </View>
            <Text style={s.addressName}>
              {currentOrder.address.name}
            </Text>
            <Text style={s.addressLine}>
              {currentOrder.address.street}, {currentOrder.address.city},{' '}
              {currentOrder.address.state} – {currentOrder.address.pincode}
            </Text>
            {currentOrder.address.phone ? (
              <Text style={s.addressPhone}>
                📞 {currentOrder.address.phone}
              </Text>
            ) : null}
          </View>
        )}
      </Animated.View>

      {/* ── Status Tracker ── */}
      <Animated.View
        style={[
          s.card,
          {
            opacity: cardFade,
            transform: [{ translateY: cardSlide }],
          },
        ]}
      >
        <View style={s.statusHeader}>
          <Text style={s.statusHeaderTitle}>Order Status</Text>
          <View style={s.liveTag}>
            <View style={s.liveDot} />
            <Text style={s.liveText}>LIVE</Text>
          </View>
        </View>

        <View style={s.cardDivider} />

        <StatusStep
          title="Order Confirmed"
          subtitle="Payment secured & order received"
          active
        />
        <StatusStep
          title="Processing"
          subtitle="We're packing your order"
          active={false}
        />
        <StatusStep
          title="Out for Delivery"
          subtitle="Your order is on the way"
          active={false}
          last
        />
      </Animated.View>

      {/* ── Bottom Buttons ── */}
      <Animated.View
        style={[
          s.footer,
          {
            opacity: btnFade,
            transform: [{ translateY: btnSlide }],
          },
        ]}
      >
        <TouchableOpacity
          style={s.trackBtn}
          onPress={() => {
            reset();
            router.push('/(tabs)/orders' as any);
          }}
          activeOpacity={0.88}
        >
          <Text style={s.trackBtnText}>Track Order</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.homeBtn}
          onPress={() => {
            reset();
            router.replace('/(tabs)/home' as any);
          }}
          activeOpacity={0.88}
        >
          <Text style={s.homeBtnText}>Continue Shopping</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

// ─── STYLES ─────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG,
  },
  centered: {
    flex: 1,
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  fallbackTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: TEXT_DARK,
    marginTop: 20,
  },
  fallbackSub: {
    fontSize: 14,
    color: TEXT_MID,
    marginTop: 6,
  },

  // ── Confetti ──
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    zIndex: 10,
  },

  // ── Hero ──
  heroSection: {
    backgroundColor: WHITE,
    alignItems: 'center',
    paddingTop: 36,
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: TEXT_DARK,
    letterSpacing: -0.4,
    marginTop: 18,
    textAlign: 'center',
  },
  heroSub: {
    fontSize: 14,
    color: TEXT_MID,
    marginTop: 6,
    textAlign: 'center',
  },
  heroOrderId: {
    fontWeight: '700',
    color: GREEN,
  },

  // Check
  checkWrap: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: GREEN,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  checkRing: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: GREEN,
  },
  checkTick: {
    fontSize: 32,
    color: WHITE,
    fontWeight: '700',
    lineHeight: 38,
  },

  // Verify badge
  verifyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    marginTop: 16,
    gap: 6,
  },
  verifyBadgeActive: {
    backgroundColor: GREEN_PALE,
  },
  verifyIcon: {
    fontSize: 13,
  },
  verifyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#B8860B',
  },
  verifyTextActive: {
    color: GREEN_DARK,
  },

  // ── Card ──
  card: {
    backgroundColor: WHITE,
    marginHorizontal: 14,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 4,
  },
  cardRight: {
    alignItems: 'flex-end',
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: TEXT_LIGHT,
    letterSpacing: 1,
    marginBottom: 3,
  },
  cardValue: {
    fontSize: 14,
    fontWeight: '700',
    color: TEXT_DARK,
  },
  cardDivider: {
    height: 1,
    backgroundColor: BORDER,
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: TEXT_DARK,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: GREEN,
  },

  // Address
  addressBlock: {
    marginTop: 2,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  addressIcon: {
    fontSize: 14,
  },
  addressTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: TEXT_LIGHT,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  addressName: {
    fontSize: 14,
    fontWeight: '700',
    color: TEXT_DARK,
    marginBottom: 3,
  },
  addressLine: {
    fontSize: 13,
    color: TEXT_MID,
    lineHeight: 19,
  },
  addressPhone: {
    fontSize: 13,
    color: TEXT_MID,
    marginTop: 5,
    fontWeight: '500',
  },

  // ── Status tracker ──
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: TEXT_DARK,
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3F2',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 5,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  liveText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EF4444',
    letterSpacing: 0.8,
  },

  // Steps
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepDotCol: {
    alignItems: 'center',
    width: 24,
    marginRight: 10,
  },
  stepDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepDotActive: {
    borderColor: GREEN,
    backgroundColor: GREEN,
  },
  stepDotInner: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: WHITE,
  },
  stepLine: {
    width: 2,
    height: 28,
    backgroundColor: '#E8E8E8',
    marginVertical: 2,
  },
  stepLineActive: {
    backgroundColor: GREEN,
  },
  stepContent: {
    flex: 1,
    paddingBottom: 14,
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: TEXT_DARK,
  },
  stepSub: {
    fontSize: 12,
    color: TEXT_LIGHT,
    marginTop: 2,
  },

  // ── Footer ──
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: WHITE,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -4 },
    elevation: 6,
  },
  trackBtn: {
    backgroundColor: GREEN,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: GREEN,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  trackBtnText: {
    color: WHITE,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  homeBtn: {
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: BORDER,
    backgroundColor: WHITE,
  },
  homeBtnText: {
    color: TEXT_MID,
    fontSize: 15,
    fontWeight: '600',
  },
});
