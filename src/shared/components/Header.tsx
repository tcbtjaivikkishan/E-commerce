import { router } from "expo-router";
import React from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SvgXml } from "react-native-svg";
import { useSelector } from "react-redux";

// ── Exact SVGs from Figma ────────────────────────────────────────────────────
const SEARCH_SVG = `<svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M16.5289 16.625L13.1051 13.1812M14.9547 8.70833C14.9547 12.2061 12.1356 15.0417 8.65799 15.0417C5.18041 15.0417 2.36127 12.2061 2.36127 8.70833C2.36127 5.21053 5.18041 2.375 8.65799 2.375C12.1356 2.375 14.9547 5.21053 14.9547 8.70833Z" stroke="#1E1E1E" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const MIC_SVG = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M9.94219 11.6667C9.25176 11.6667 8.6649 11.4236 8.1816 10.9375C7.69829 10.4514 7.45664 9.86111 7.45664 9.16666V4.16666C7.45664 3.47222 7.69829 2.88194 8.1816 2.39583C8.6649 1.90972 9.25176 1.66666 9.94219 1.66666C10.6326 1.66666 11.2195 1.90972 11.7028 2.39583C12.1861 2.88194 12.4277 3.47222 12.4277 4.16666V9.16666C12.4277 9.86111 12.1861 10.4514 11.7028 10.9375C11.2195 11.4236 10.6326 11.6667 9.94219 11.6667ZM9.11368 17.5V14.9375C7.67758 14.7431 6.49004 14.0972 5.55106 13C4.61207 11.9028 4.14258 10.625 4.14258 9.16666H5.79961C5.79961 10.3194 6.20351 11.3021 7.01132 12.1146C7.81912 12.9271 8.79608 13.3333 9.94219 13.3333C11.0883 13.3333 12.0653 12.9271 12.8731 12.1146C13.6809 11.3021 14.0848 10.3194 14.0848 9.16666H15.7418C15.7418 10.625 15.2723 11.9028 14.3333 13C13.3943 14.0972 12.2068 14.7431 10.7707 14.9375V17.5H9.11368Z" fill="#1D1B20"/>
</svg>`;

const { width } = Dimensions.get("window");
const SCALE = width / 375;

interface HeaderProps {
  showSearch?: boolean;
  onSearchPress?: () => void;
  onMicPress?: () => void;
  searchPlaceholder?: string;
}

export default function Header({
  showSearch = true,
  onSearchPress,
  onMicPress,
  searchPlaceholder = 'Search "Agnihotra"',
}: HeaderProps) {
  const user = useSelector((state: any) => state.user);

  const handleProfilePress = () => {
    if (user?.isLoggedIn) {
      router.push("/profile");
    } else {
      router.push("/profile");
    }
  };

  return (
    <View style={styles.header}>
      {/* ── Row 1: Brand + Profile ── */}
      <View style={styles.topRow}>
        <View style={styles.brandBlock}>
          <Text style={styles.brandName}>Jaivik Mart</Text>
          <Text style={styles.deliveryTime}>3-5 days</Text>
          <View style={styles.locationRow}>
            <Text style={styles.homeText}>Fully</Text>
            <Text style={styles.locationSep}> – </Text>
            <Text style={styles.locationText}>Organic Products</Text>
            <Text style={styles.dropdownArrow}> ▾</Text>
          </View>
        </View>

        {/* Figma: Ellipse 2 = 37×37 white circle, user image = 13×15px inside */}
        <TouchableOpacity
          style={styles.profileCircle}
          onPress={handleProfilePress}
          activeOpacity={0.8}
        >
          <Image
            source={require("@/assets/icons/user_1.png")}
            style={styles.profileIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      {/* ── Search Bar ── */}
      {showSearch && (
        <TouchableOpacity
          style={styles.searchBar}
          onPress={onSearchPress}
          activeOpacity={0.9}
        >
          {/* Search icon */}
          <SvgXml xml={SEARCH_SVG} width={16} height={16} />

          {/* Search placeholder text */}
          <Text style={styles.searchInput} numberOfLines={1}>
            {searchPlaceholder}
          </Text>

          {/* Vertical divider line — "Line 2" from Figma */}
          <View style={styles.divider} />

          {/* Mic icon */}
          <TouchableOpacity onPress={onMicPress} activeOpacity={0.7}>
            <SvgXml xml={MIC_SVG} width={20} height={20} />
          </TouchableOpacity>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#196F1B",
    width: "100%",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingHorizontal: Math.round(16 * SCALE),
    paddingTop: Math.round(40 * SCALE),
    paddingBottom: Math.round(14 * SCALE),
  },

  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: Math.round(10 * SCALE),
  },

  brandBlock: { flex: 1 },

  brandName: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFB700",
    letterSpacing: -0.3,
  },
  deliveryTime: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.3,
    marginTop: 1,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  homeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  locationSep: {
    fontSize: 12,
    color: "#FFFFFF",
    marginHorizontal: 2,
  },
  locationText: {
    fontSize: 12,
    fontWeight: "400",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  dropdownArrow: {
    fontSize: 11,
    color: "#FFFFFF",
    marginLeft: 2,
  },

  // Figma: Ellipse 2 → 37×37, radius 20, #FFFFFF
  profileCircle: {
    width: 37,
    height: 37,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  // Figma: user 1 image → 13×15px inside the circle
  profileIcon: {
    width: 13,
    height: 15,
  },

  // Figma: Search bar 344×37, border #C5C5C5, radius 10
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    width: Math.round(344 * SCALE),
    height: 37,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#C5C5C5",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    alignSelf: "center",
    gap: 8,
  },

  searchInput: {
    flex: 1,
    fontSize: 13,
    color: "#aaa",
  },

  // Figma: Line 2 — vertical divider between search text and mic icon
  divider: {
    width: 1,
    height: 20,
    backgroundColor: "#C5C5C5",
  },
});
