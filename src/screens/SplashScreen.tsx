import { router, type Href } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Loader from "../components/ui/Loader";

export default function SplashScreen() {
  const [isNavigating, setIsNavigating] = useState(false);

  const logoScale = useRef(new Animated.Value(0.4)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textSlide = useRef(new Animated.Value(30)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const btnOpacity = useRef(new Animated.Value(0)).current;
  const loaderOpacity = useRef(new Animated.Value(1)).current;
  const leafRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(leafRotate, {
        toValue: 1,
        duration: 18000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [leafRotate]);

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 5,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(textSlide, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(1000),
      Animated.parallel([
        Animated.timing(loaderOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(btnOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [logoScale, logoOpacity, textSlide, textOpacity, loaderOpacity, btnOpacity]);

  const leafSpin = leafRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const handleNavigate = (destination: Href) => {
    setIsNavigating(true);
    setTimeout(() => {
      router.replace(destination);
    }, 2000);
  };

  const goHome = () => handleNavigate("/home");
  const goLogin = () => handleNavigate("/login"); // later change to "/login"

  if (isNavigating) return <Loader />;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#1B4332",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <StatusBar barStyle="light-content" backgroundColor="#1B4332" />

      <Animated.Text
        style={{
          position: "absolute",
          fontSize: 320,
          opacity: 0.07,
          transform: [{ rotate: leafSpin }],
          top: -80,
          right: -80,
          lineHeight: 340,
        }}
      >
        🌿
      </Animated.Text>

      <Animated.Text
        style={{
          position: "absolute",
          fontSize: 200,
          opacity: 0.05,
          transform: [{ rotate: leafSpin }],
          bottom: -40,
          left: -40,
          lineHeight: 220,
        }}
      >
        🍃
      </Animated.Text>

      <View
        style={{
          position: "absolute",
          width: 260,
          height: 260,
          borderRadius: 130,
          backgroundColor: "#52B788",
          opacity: 0.15,
          elevation: 20,
        }}
      />

      <Animated.Image
        source={{
          uri: "https://cdn-icons-png.flaticon.com/512/2909/2909765.png",
        }}
        style={{
          width: 110,
          height: 110,
          marginBottom: 28,
          tintColor: "#D8F3DC",
          transform: [{ scale: logoScale }],
          opacity: logoOpacity,
        }}
      />

      <Animated.View
        style={{
          alignItems: "center",
          transform: [{ translateY: textSlide }],
          opacity: textOpacity,
          paddingHorizontal: 32,
        }}
      >
        <Text
          style={{
            fontSize: 38,
            fontWeight: "800",
            color: "#D8F3DC",
            letterSpacing: 1.5,
            textAlign: "center",
          }}
        >
          Jaivik Mart
        </Text>
        <View
          style={{
            width: 60,
            height: 2,
            backgroundColor: "#74C69D",
            borderRadius: 1,
            marginTop: 10,
            marginBottom: 12,
          }}
        />
        <Text
          style={{
            color: "#95D5B2",
            fontSize: 14,
            textAlign: "center",
            lineHeight: 21,
            letterSpacing: 0.4,
          }}
        >
          Fresh Organic Products Directly From Farmers
        </Text>
      </Animated.View>

      <Animated.View style={{ marginTop: 48, opacity: loaderOpacity }}>
        <DotsLoader />
      </Animated.View>

      <Animated.View
        style={{
          position: "absolute",
          bottom: 72,
          left: 32,
          right: 32,
          opacity: btnOpacity,
          gap: 14,
        }}
      >
        <TouchableOpacity
          onPress={goHome}
          activeOpacity={0.85}
          style={{
            backgroundColor: "#52B788",
            paddingVertical: 16,
            borderRadius: 14,
            alignItems: "center",
            elevation: 6,
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: 16,
              fontWeight: "700",
              letterSpacing: 0.5,
            }}
          >
            🛒 Browse & Order
          </Text>
          <Text
            style={{
              color: "#D8F3DC",
              fontSize: 11,
              marginTop: 3,
              opacity: 0.85,
            }}
          >
            No account needed — fill details at checkout
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={goLogin}
          activeOpacity={0.8}
          style={{
            borderWidth: 1.5,
            borderColor: "#52B788",
            paddingVertical: 14,
            borderRadius: 14,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: "#95D5B2",
              fontSize: 15,
              fontWeight: "600",
              letterSpacing: 0.4,
            }}
          >
            Login / Sign Up
          </Text>
          <Text
            style={{
              color: "#74C69D",
              fontSize: 11,
              marginTop: 2,
              opacity: 0.8,
            }}
          >
            Save addresses · Track orders
          </Text>
        </TouchableOpacity>
      </Animated.View>

      <Text
        style={{
          position: "absolute",
          bottom: 28,
          color: "#52B788",
          fontSize: 11,
          opacity: 0.5,
          letterSpacing: 0.5,
        }}
      >
        v1.0.0
      </Text>
    </View>
  );
}

function DotsLoader() {
  const dots = [
    useRef(new Animated.Value(0.3)).current,
    useRef(new Animated.Value(0.3)).current,
    useRef(new Animated.Value(0.3)).current,
  ];

  useEffect(() => {
    const animations = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 200),
          Animated.timing(dot, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.delay((dots.length - 1 - i) * 200),
        ])
      )
    );

    animations.forEach((a) => a.start());
    return () => animations.forEach((a) => a.stop());
  }, []);

  return (
    <View style={{ flexDirection: "row", gap: 10 }}>
      {dots.map((dot, i) => (
        <Animated.View
          key={i}
          style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: "#74C69D",
            opacity: dot,
          }}
        />
      ))}
    </View>
  );
}