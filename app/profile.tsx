import { router } from "expo-router";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { C } from "../src/constants/theme";

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      {/* 🔝 Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>

        <View style={styles.profileCenter}>
          <View style={styles.avatar}>
            <Text style={{ fontSize: 26 }}>👤</Text>
          </View>
          <Text style={styles.name}>Your account</Text>
          <Text style={styles.phone}>8602832751</Text>
        </View>
      </View>

      {/* 📦 Content */}
      <View style={styles.container}>
        {/* Section 1 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your information</Text>

          <MenuItem title="Address book" />
          <MenuItem title="Your wishlist" />
          <MenuItem title="Your orders" />
        </View>

        {/* Section 2 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Other information</Text>

          <MenuItem title="Log out" />
          <MenuItem title="Share the app" />
          <MenuItem title="Notification preferences" />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.brand}>TCBT</Text>
          <Text style={styles.version}>v1.0.0.10</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

/* 🔹 Reusable Menu Item */
const MenuItem = ({ title }: { title: string }) => (
  <TouchableOpacity style={styles.menuItem}>
    <Text style={styles.menuText}>{title}</Text>
    <Text style={styles.arrow}>›</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },

  /* 🔝 Header */
  header: {
    backgroundColor: "#196F1B",
    paddingTop: 40,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: "center",
  },

  backBtn: {
    position: "absolute",
    left: 16,
    top: 40,
  },

  backBtnText: {
    color: "#fff",
    fontSize: 22,
  },

  profileCenter: {
    alignItems: "center",
  },

  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  name: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  phone: {
    color: "#dcdcdc",
    fontSize: 12,
    marginTop: 4,
  },

  /* 📦 Content */
  container: {
    flex: 1,
    padding: 16,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    paddingVertical: 8,
  },

  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },

  menuText: {
    fontSize: 14,
    color: "#333",
  },

  arrow: {
    fontSize: 18,
    color: "#999",
  },

  /* 🔻 Footer */
  footer: {
    alignItems: "center",
    marginTop: 20,
  },

  brand: {
    fontSize: 28,
    color: "#bbb",
    fontWeight: "700",
  },

  version: {
    fontSize: 12,
    color: "#bbb",
  },
});