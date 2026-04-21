import React, { useEffect, useRef, useState } from "react";
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Dimensions,
} from "react-native";

const { width } = Dimensions.get("window");

// FULL WIDTH (important)
const BANNER_WIDTH = width;

// mock data
const bannerData = [1, 2, 3, 4];

// duplicate for infinite loop illusion
const loopData = [...bannerData, ...bannerData];

export default function BannerCarousel() {
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);

  // AUTO SCROLL
  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = index + 1;

      scrollRef.current?.scrollTo({
        x: nextIndex * BANNER_WIDTH,
        animated: true,
      });

      setIndex(nextIndex);
    }, 2000);

    return () => clearInterval(interval);
  }, [index]);

  // LOOP RESET (smooth)
  useEffect(() => {
    if (index >= bannerData.length) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({
          x: 0,
          animated: false,
        });
        setIndex(0);
      }, 300);
    }
  }, [index]);

  return (
    <View style={{ marginTop: 14 }}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const i = Math.round(
            e.nativeEvent.contentOffset.x / BANNER_WIDTH
          );
          setIndex(i);
        }}
      >
        {loopData.map((item, i) => (
          <View key={i} style={{ width: BANNER_WIDTH }}>
            <View style={styles.bannerCard}>
              <Text style={{ color: "#888" }}>
                Banner {i % bannerData.length + 1}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* DOTS */}
      <View style={styles.dots}>
        {bannerData.map((_, i) => {
          const active = i === index % bannerData.length;

          return (
            <View
              key={i}
              style={[styles.dot, active && styles.activeDot]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bannerCard: {
    height: width * 0.5,
    marginHorizontal: 16, // spacing like Blinkit
    borderRadius: 14,
    backgroundColor: "#EAEAEA",
    alignItems: "center",
    justifyContent: "center",
  },

  dots: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ccc",
    marginHorizontal: 4,
  },

  activeDot: {
    backgroundColor: "#000",
    width: 16,
  },
});