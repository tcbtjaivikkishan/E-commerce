import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  ScrollView,
  Image,
  StyleSheet,
  Dimensions,
} from "react-native";

const { width } = Dimensions.get("window");

// FULL WIDTH (important)
const BANNER_WIDTH = width;

// Banner images from assets
const bannerImages = [
  require("../../../assets/images/banner1.jpeg"),
  require("../../../assets/images/banner2.jpeg"),
];

export default function BannerCarousel() {
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const indexRef = useRef(0);

  // AUTO SCROLL — single interval, no cascading effects
  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (indexRef.current + 1) % bannerImages.length;
      indexRef.current = nextIndex;
      setActiveIndex(nextIndex);
      scrollRef.current?.scrollTo({
        x: nextIndex * BANNER_WIDTH,
        animated: true,
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []); // runs once — no deps, no re-render loop

  const handleScrollEnd = useCallback((e: any) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / BANNER_WIDTH) % bannerImages.length;
    indexRef.current = i;
    setActiveIndex(i);
  }, []);

  return (
    <View style={{ marginTop: 14 }}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
      >
        {bannerImages.map((imgSource, i) => (
          <View key={i} style={{ width: BANNER_WIDTH }}>
            <View style={styles.bannerCard}>
              <Image
                source={imgSource}
                style={styles.bannerImage}
                resizeMode="cover"
              />
            </View>
          </View>
        ))}
      </ScrollView>

      {/* DOTS */}
      <View style={styles.dots}>
        {bannerImages.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === activeIndex && styles.activeDot]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bannerCard: {
    height: width * 0.45,
    marginHorizontal: 16,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#EAEAEA",
  },

  bannerImage: {
    width: "100%",
    height: "100%",
    borderRadius: 14,
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