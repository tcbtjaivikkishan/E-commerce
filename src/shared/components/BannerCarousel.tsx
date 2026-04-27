import React, { useEffect, useRef, useState } from "react";
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

// duplicate for infinite loop illusion
const loopData = [...bannerImages, ...bannerImages];

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
    }, 3000);

    return () => clearInterval(interval);
  }, [index]);

  // LOOP RESET (smooth)
  useEffect(() => {
    if (index >= bannerImages.length) {
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
        {loopData.map((imgSource, i) => (
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
        {bannerImages.map((_, i) => {
          const active = i === index % bannerImages.length;

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