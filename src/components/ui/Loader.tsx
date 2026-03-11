/**
 * Loader.tsx  →  src/components/ui/Loader.tsx
 *
 * Design: White background, small green eco-cart logo slides left→right
 * with spinning wheels. Used between SplashScreen → Home and on page loads.
 *
 * Requires: npx expo install react-native-svg
 */

import React, { useEffect, useRef } from "react";
import {
    Animated,
    Easing,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from "react-native";
import Svg, { Circle, ClipPath, Defs, Line, Path } from "react-native-svg";

const G = {
  deep:   "#1b5e20",
  forest: "#2e7d32",
  main:   "#4caf50",
  mid:    "#66bb6a",
  light:  "#a5d6a7",
  pale:   "#e8f5e9",
  white:  "#ffffff",
};

// ── Animated SVG circle wrapper for wheel spin ──────────────────
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function Loader() {
  // Cart slides from left (-120) to right (+120) and bounces back — loop
  const cartX    = useRef(new Animated.Value(-130)).current;
  // Wheel rotation
  const wheelRot = useRef(new Animated.Value(0)).current;
  // Subtle vertical bob while rolling
  const cartY    = useRef(new Animated.Value(0)).current;
  // Label fade
  const labelOp  = useRef(new Animated.Value(0)).current;
  // Trail dots opacity
  const trail    = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  useEffect(() => {
    // Label fades in
    Animated.timing(labelOp, {
      toValue: 1, duration: 400, useNativeDriver: true,
    }).start();

    // Wheel spins continuously
    Animated.loop(
      Animated.timing(wheelRot, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Cart rolls left → right, slight bounce, loops
    Animated.loop(
      Animated.sequence([
        // Roll in from left
        Animated.timing(cartX, {
          toValue: 130,
          duration: 1600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        // Tiny pause at right
        Animated.delay(120),
        // Snap back to left (instant reset)
        Animated.timing(cartX, {
          toValue: -130,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.delay(60),
      ])
    ).start();

    // Vertical bob synced with rolling
    Animated.loop(
      Animated.sequence([
        Animated.timing(cartY, { toValue: -3, duration: 200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(cartY, { toValue: 2,  duration: 200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(cartY, { toValue: -3, duration: 200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(cartY, { toValue: 0,  duration: 200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();

    // Trail dots pulse
    trail.forEach((t, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 180),
          Animated.timing(t, { toValue: 1,   duration: 300, useNativeDriver: true }),
          Animated.timing(t, { toValue: 0.2, duration: 300, useNativeDriver: true }),
          Animated.delay(240),
        ])
      ).start();
    });
  }, []);

  const spinDeg = wheelRot.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor={G.white} />

      {/* ── Track line ── */}
      <View style={s.track} />

      {/* ── Rolling cart ── */}
      <Animated.View style={[s.cartWrap, {
        transform: [{ translateX: cartX }, { translateY: cartY }],
      }]}>
        {/* Cart body SVG */}
        <Svg width={56} height={58} viewBox="0 0 190 200">
          <Defs>
            <ClipPath id="cl">
              <Path d="M 42 34 L 162 34 L 147 111 L 57 111 Z" />
            </ClipPath>
          </Defs>

          {/* Handle */}
          <Path d="M 10 60 L 10 44 Q 10 32 22 32 L 38 32"
            stroke={G.main} strokeWidth="11" strokeLinecap="round" fill="none" />

          {/* Cart body */}
          <Path d="M 38 32 L 168 32 L 150 122 L 56 122 Z"
            stroke={G.main} strokeWidth="10" strokeLinejoin="round"
            fill="rgba(76,175,80,0.08)" />

          {/* Grid verticals */}
          <Line x1="76"  y1="32" x2="71"  y2="122" stroke={G.main} strokeWidth="8" clipPath="url(#cl)" />
          <Line x1="106" y1="32" x2="103" y2="122" stroke={G.main} strokeWidth="8" clipPath="url(#cl)" />
          <Line x1="136" y1="32" x2="135" y2="122" stroke={G.main} strokeWidth="8" clipPath="url(#cl)" />

          {/* Grid horizontals */}
          <Line x1="38" y1="64"  x2="168" y2="60"  stroke={G.main} strokeWidth="8" clipPath="url(#cl)" />
          <Line x1="38" y1="94"  x2="164" y2="91"  stroke={G.main} strokeWidth="8" clipPath="url(#cl)" />

          {/* Bottom bar */}
          <Line x1="56" y1="122" x2="150" y2="122" stroke={G.main} strokeWidth="9" strokeLinecap="round" />

          {/* Stem */}
          <Line x1="103" y1="32" x2="103" y2="-8"
            stroke={G.main} strokeWidth="7" strokeLinecap="round" />

          {/* Left leaf */}
          <Path d="M 103 -6 Q 70 -56 52 -32 Q 66 -6 103 -6 Z" fill={G.main} />
          <Path d="M 103 -6 Q 82 -28 64 -28"
            stroke="rgba(255,255,255,0.45)" strokeWidth="2.5" fill="none" strokeLinecap="round" />

          {/* Right leaf */}
          <Path d="M 103 -6 Q 136 -56 154 -32 Q 140 -6 103 -6 Z" fill={G.main} />
          <Path d="M 103 -6 Q 124 -28 142 -28"
            stroke="rgba(255,255,255,0.45)" strokeWidth="2.5" fill="none" strokeLinecap="round" />

          {/* Left wheel — outer ring (static) */}
          <Circle cx="76" cy="150" r="18" stroke={G.main} strokeWidth="9" fill={G.white} />
          {/* Left wheel — hub (static) */}
          <Circle cx="76" cy="150" r="5" fill={G.main} />

          {/* Right wheel — outer ring (static) */}
          <Circle cx="136" cy="150" r="18" stroke={G.main} strokeWidth="9" fill={G.white} />
          {/* Right wheel — hub (static) */}
          <Circle cx="136" cy="150" r="5" fill={G.main} />
        </Svg>

        {/* Spinning spokes overlay — separate so we can rotate it */}
        <Animated.View style={[s.spokesOverlay, { transform: [{ rotate: spinDeg }] }]}>
          <Svg width={56} height={58} viewBox="0 0 190 200">
            {/* Left wheel spokes */}
            <Line x1="76" y1="135" x2="76" y2="165" stroke={G.main} strokeWidth="5" strokeLinecap="round" />
            <Line x1="61" y1="150" x2="91" y2="150" stroke={G.main} strokeWidth="5" strokeLinecap="round" />
            <Line x1="65" y1="139" x2="87" y2="161" stroke={G.main} strokeWidth="4" strokeLinecap="round" />
            <Line x1="65" y1="161" x2="87" y2="139" stroke={G.main} strokeWidth="4" strokeLinecap="round" />
            {/* Right wheel spokes */}
            <Line x1="136" y1="135" x2="136" y2="165" stroke={G.main} strokeWidth="5" strokeLinecap="round" />
            <Line x1="121" y1="150" x2="151" y2="150" stroke={G.main} strokeWidth="5" strokeLinecap="round" />
            <Line x1="125" y1="139" x2="147" y2="161" stroke={G.main} strokeWidth="4" strokeLinecap="round" />
            <Line x1="125" y1="161" x2="147" y2="139" stroke={G.main} strokeWidth="4" strokeLinecap="round" />
          </Svg>
        </Animated.View>
      </Animated.View>

      {/* ── Brand label ── */}
      <Animated.View style={[s.labelWrap, { opacity: labelOp }]}>
        <Text style={s.label}>Jaivik Mart</Text>
        <View style={s.dotsRow}>
          {trail.map((t, i) => (
            <Animated.View key={i} style={[s.dot, { opacity: t }]} />
          ))}
        </View>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: G.white,
    alignItems: "center",
    justifyContent: "center",
  },
  track: {
    position: "absolute",
    width: 240,
    height: 1.5,
    backgroundColor: G.pale,
    borderRadius: 1,
    // vertically aligned with where the wheels sit
    top: "50%",
    marginTop: 22,
  },
  cartWrap: {
    width: 56,
    height: 58,
    marginBottom: 20,
  },
  spokesOverlay: {
    position: "absolute",
    top: 0, left: 0,
    width: 56,
    height: 58,
  },
  labelWrap: {
    alignItems: "center",
    marginTop: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
    color: G.forest,
    letterSpacing: 1.8,
  },
  dotsRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 10,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: G.main,
  },
});
