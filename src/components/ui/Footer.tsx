import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";

const Footer = () => {
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        
        {/* Home */}
        <TouchableOpacity
          style={[styles.item, styles.activeItem]}
          onPress={() => router.push("/")}
        >
          <Text style={[styles.icon, styles.activeText]}>🏠</Text>
          <Text style={[styles.label, styles.activeText]}>Home</Text>
        </TouchableOpacity>

        {/* Cart */}
        <TouchableOpacity
          style={styles.item}
          onPress={() => router.push("/cart")}
        >
          <Text style={styles.icon}>🛒</Text>
          <Text style={styles.label}>Cart</Text>
        </TouchableOpacity>

        {/* Categories */}
        <TouchableOpacity
          style={styles.item}
          onPress={() => router.push("/categories")}
        >
          <Text style={styles.icon}>📦</Text>
          <Text style={styles.label}>Categories</Text>
        </TouchableOpacity>

        {/* Orders */}
        <TouchableOpacity
          style={styles.item}
          onPress={() => router.push("/orders")}
        >
          <Text style={styles.icon}>📄</Text>
          <Text style={styles.label}>Orders</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
};

export default Footer;

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    alignItems: "center",
  },

  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    width: "92%",
    paddingVertical: 10,
    paddingHorizontal: 10,

    backgroundColor: "#F3F3F3",
    borderRadius: 30,

    elevation: 8,
  },

  item: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 6,
    borderRadius: 20,
  },

  activeItem: {
    backgroundColor: "#DFF3E3",
  },

  icon: {
    fontSize: 18,
  },

  label: {
    fontSize: 11,
    marginTop: 2,
    color: "#444",
  },

  activeText: {
    color: "#196F1B",
    fontWeight: "700",
  },
});