import React, { useEffect, useRef } from "react";
import {
  Animated,
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function CartToast({
  visible,
  onHide,
}: {
  visible: boolean;
  onHide: () => void;
}) {
  const translateY = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        hide();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hide = () => {
    Animated.timing(translateY, {
      toValue: 100,
      duration: 250,
      useNativeDriver: true,
    }).start(() => onHide());
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY }] },
      ]}
    >
      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.85}
        onPress={() => {
          hide();
          router.push("/cart");
        }}
      >
        <Ionicons name="cart" size={18} color="#fff" />
        <Text style={styles.text}>View Cart</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0F7B3C",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    elevation: 6,
  },
  text: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
});