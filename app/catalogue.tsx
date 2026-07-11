import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Animated,
} from "react-native";
import { Redirect } from "expo-router";

type ScreenMode = "catalog" | "coming-soon" | "app";

export default function CataloguePage() {
  const [screenMode, setScreenMode] = useState<ScreenMode>("catalog");

  if (screenMode === "app") {
    return <Redirect href="/(tabs)/home" />;
  }

  if (screenMode === "coming-soon") {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Image
            source={require("@/assets/images/logo.png")}
            style={styles.logoSmall}
            resizeMode="contain"
          />
          <Text style={styles.title}>Coming Soon</Text>
          <Text style={styles.subtitle}>
            This option is not available yet.
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => setScreenMode("catalog")}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerSection}>
          <Image
            source={require("@/assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>TCBT Organic Shop</Text>
          <Text style={styles.subtitle}>Explore Our Collections</Text>
        </View>

        <View style={styles.container}>
          <View style={styles.grid}>
            <View style={styles.column}>
              <OptionCard
                label="TCBT Organic Shop"
                icon="🌾"
                onPress={() => setScreenMode("app")}
                color="#1ea76d"
              />
              <OptionCard
                label="Option 3"
                icon="🍅"
                onPress={() => setScreenMode("coming-soon")}
                color="#ef4444"
              />
            </View>

            <View style={styles.column}>
              <OptionCard
                label="Option 2"
                icon="🥬"
                onPress={() => setScreenMode("coming-soon")}
                color="#f59e0b"
              />
              <OptionCard
                label="Option 4"
                icon="🌽"
                onPress={() => setScreenMode("coming-soon")}
                color="#eab308"
              />
            </View>
          </View>
        </View>

        <View style={styles.footerSection}>
          <Text style={styles.footerText}>🌱 Fresh & Organic 🌱</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function OptionCard({
  label,
  icon,
  onPress,
  color,
}: {
  label: string;
  icon: string;
  onPress: () => void;
  color: string;
}) {
  const [pressed, setPressed] = React.useState(false);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    setPressed(true);
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    setPressed(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[
          styles.card,
          {
            borderColor: color,
            backgroundColor: color + "15",
          },
          pressed && { backgroundColor: color + "25" },
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.7}
      >
        <Text style={styles.icon}>{icon}</Text>
        <Text style={[styles.cardText, { color }]}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    flexGrow: 1,
  },
  headerSection: {
    alignItems: "center",
    paddingTop: 32,
    paddingBottom: 24,
    backgroundColor: "#f9fafb",
    borderBottomWidth: 2,
    borderBottomColor: "#ecfdf5",
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 12,
  },
  logoSmall: {
    width: 60,
    height: 60,
    marginBottom: 20,
  },
  container: {
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1f2937",
    marginBottom: 4,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 8,
    textAlign: "center",
  },
  grid: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    width: "100%",
  },
  column: {
    gap: 16,
    width: "45%",
  },
  card: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2.5,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  icon: {
    fontSize: 48,
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  button: {
    marginTop: 20,
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: "#16a34a",
    borderRadius: 12,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  footerSection: {
    alignItems: "center",
    paddingVertical: 24,
    backgroundColor: "#f9fafb",
    borderTopWidth: 2,
    borderTopColor: "#ecfdf5",
  },
  footerText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#16a34a",
  },
});