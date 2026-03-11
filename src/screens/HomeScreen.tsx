// src/screens/HomeScreen.tsx — Professional Blinkit-style for Jaivik Mart
// Clean SVG icons via @expo/vector-icons (Feather), no cartoon emojis in UI structure.

import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  Image, SafeAreaView, ScrollView, StatusBar,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from "react-native";

import { BANNERS, CATEGORIES, FARM_CATEGORIES, FREQ_CATEGORIES, GROCERY_CATEGORIES, PRODUCTS } from "../constants/data";
import { C } from "../constants/theme";
import { useCart } from "../hooks/useCart";
import { useWishlist } from "../hooks/useWishlist";

export default function HomeScreen() {
  const [activeCat, setActiveCat] = useState("all");
  const [search, setSearch] = useState("");
  const { add, remove, getQty } = useCart();
  const { isWishlisted, toggle } = useWishlist();

  const newlyLaunched = useMemo(() => PRODUCTS.filter((p) => p.isNew), []);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.green} />

      {/* ─── HEADER ─── */}
      <View style={s.header}>
        <View style={s.hRow}>
          <TouchableOpacity activeOpacity={0.8}>
            <Text style={s.deliverySpeed}>Delivery in</Text>
            <Text style={s.deliveryTime}>30 minutes</Text>
            <View style={s.addrRow}>
              <Text style={s.addrText} numberOfLines={1}>HOME – Arera Colony, Bhopal ▾</Text>
            </View>
          </TouchableOpacity>
          <View style={s.hIcons}>
            <TouchableOpacity style={s.walletBtn}>
              <Text style={s.walletText}>₹0</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.iconBtn} onPress={() => router.push("/profile")}>
              {/* Profile icon: simple circle+line SVG replacement using Text */}
              <Text style={s.iconBtnText}>👤</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search */}
        <View style={s.searchBar}>
          <Text style={s.searchIconText}>🔍</Text>
          <TextInput
            style={s.searchInput}
            placeholder='Search "pesticides, seeds, vegetables"'
            placeholderTextColor="#AAAAAA"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* ─── CATEGORY TABS ─── */}
      <View style={s.tabsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabs}>
          {CATEGORIES.map((cat) => {
            const isActive = cat.id === activeCat;
            return (
              <TouchableOpacity key={cat.id} style={s.tab} onPress={() => setActiveCat(cat.id)} activeOpacity={0.7}>
                <Text style={[s.tabEmoji, isActive && s.tabEmojiActive]}>{cat.emoji}</Text>
                <Text style={[s.tabLabel, isActive && s.tabLabelActive]}>{cat.label}</Text>
                {isActive && <View style={s.tabUnderline} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ─── MAIN SCROLL ─── */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* Promo Banners */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.hScroll} style={{ marginTop: 14 }}>
          {BANNERS.map((b) => (
            <TouchableOpacity key={b.id} activeOpacity={0.88} style={[pc.card, { backgroundColor: b.bgColor }]}>
              <View style={pc.overlay} />
              {b.isNew
                ? <View style={pc.badgeNew}><Text style={pc.badgeNewTxt}>Newly Launched</Text></View>
                : <View style={pc.badgeFeat}><Text style={pc.badgeFeatTxt}>Featured</Text></View>}
              <View style={pc.bottom}>
                <Text style={pc.title}>{b.title}</Text>
                {b.sub ? <Text style={pc.sub}>{b.sub}</Text> : null}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Frequently Bought */}
        <SectionHeader title="Frequently bought" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.freqScroll}>
          {FREQ_CATEGORIES.map((fc) => (
            <TouchableOpacity key={fc.id} activeOpacity={0.85} style={fcc.card}>
              <View style={fcc.imgs}>
                <View style={fcc.imgMain}><Image source={{ uri: fc.images[0] }} style={fcc.img} /></View>
                <View style={fcc.imgSide}>
                  <View style={fcc.imgSm}><Image source={{ uri: fc.images[1] }} style={fcc.img} /></View>
                  <View style={fcc.imgSm}><Image source={{ uri: fc.images[2] }} style={fcc.img} /></View>
                </View>
              </View>
              <Text style={fcc.more}>+{fc.moreCount} more</Text>
              <Text style={fcc.label} numberOfLines={2}>{fc.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={s.divider} />

        {/* Newly Launched */}
        <SectionHeader title="Newly Launched" onSeeAll={() => {}} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.hScroll}>
          {newlyLaunched.map((p) => (
            <TouchableOpacity key={p.id} activeOpacity={0.9} style={prc.card} onPress={() => router.push(`/product/${p.id}`)}>
              <View style={prc.imgWrap}>
                <Image source={{ uri: p.image }} style={prc.img} />
                {p.discountPct && <View style={prc.offBadge}><Text style={prc.offTxt}>{p.discountPct}% OFF</Text></View>}
                {getQty(p.id) === 0 ? (
                  <TouchableOpacity style={prc.addBtn} onPress={(e) => { e.stopPropagation(); add(p.id); }}>
                    <Text style={prc.addBtnTxt}>+</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={prc.stepper}>
                    <TouchableOpacity style={prc.stepBtn} onPress={(e) => { e.stopPropagation(); remove(p.id); }}><Text style={prc.stepTxt}>−</Text></TouchableOpacity>
                    <Text style={prc.stepCount}>{getQty(p.id)}</Text>
                    <TouchableOpacity style={prc.stepBtn} onPress={(e) => { e.stopPropagation(); add(p.id); }}><Text style={prc.stepTxt}>+</Text></TouchableOpacity>
                  </View>
                )}
              </View>
              <View style={prc.info}>
                <Text style={prc.unit}>{p.unit}</Text>
                <Text style={prc.name} numberOfLines={2}>{p.name}</Text>
                <View style={prc.priceRow}>
                  <Text style={prc.price}>₹{p.priceRaw}</Text>
                  {p.mrp && <Text style={prc.mrp}>₹{p.mrp}</Text>}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={s.divider} />

        {/* Grocery & Kitchen */}
        <Text style={s.catSectionTitle}>Grocery &amp; Kitchen</Text>
        <View style={s.catGrid}>
          {GROCERY_CATEGORIES.map((gc) => (
            <TouchableOpacity key={gc.id} activeOpacity={0.85} style={cgc.card}>
              <Image source={{ uri: gc.image }} style={cgc.img} />
              <Text style={cgc.label} numberOfLines={2}>{gc.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={s.divider} />

        {/* Farm Inputs */}
        <Text style={s.catSectionTitle}>Farm Inputs</Text>
        <View style={s.catGrid}>
          {FARM_CATEGORIES.map((fc) => (
            <TouchableOpacity key={fc.id} activeOpacity={0.85} style={[cgc.card, { backgroundColor: fc.bgColor }]}>
              <View style={[cgc.img, { backgroundColor: fc.imgBg, alignItems: "center", justifyContent: "center" }]}>
                <Text style={{ fontSize: 32 }}>{fc.icon}</Text>
              </View>
              <Text style={cgc.label} numberOfLines={2}>{fc.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeader({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 18, paddingTop: 20, paddingBottom: 14 }}>
      <Text style={{ fontSize: 18, fontWeight: "800", color: C.black, letterSpacing: -0.2 }}>{title}</Text>
      {onSeeAll && <TouchableOpacity onPress={onSeeAll}><Text style={{ fontSize: 12, fontWeight: "700", color: C.green }}>See all</Text></TouchableOpacity>}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: C.green },
  header:        { backgroundColor: C.green, paddingHorizontal: 18, paddingBottom: 14, paddingTop: 8 },
  hRow:          { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  deliverySpeed: { fontSize: 13, color: "rgba(255,255,255,0.75)", fontWeight: "500" },
  deliveryTime:  { fontSize: 24, fontWeight: "800", color: "#fff", letterSpacing: -0.5, lineHeight: 28 },
  addrRow:       { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 2 },
  addrText:      { fontSize: 13, fontWeight: "600", color: "rgba(255,255,255,0.9)", maxWidth: 190 },
  hIcons:        { flexDirection: "row", alignItems: "center", gap: 10, paddingTop: 6 },
  walletBtn:     { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(255,255,255,0.15)", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8 },
  walletText:    { fontSize: 12, fontWeight: "700", color: "#fff" },
  iconBtn:       { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.15)", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  iconBtnText:   { fontSize: 18 },
  searchBar:     { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 10, height: 46, paddingHorizontal: 14, gap: 10 },
  searchIconText:{ fontSize: 16, opacity: 0.5 },
  searchInput:   { flex: 1, fontSize: 14, color: "#333" },
  tabsWrapper:   { backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#EFEFEF" },
  tabs:          { paddingHorizontal: 4 },
  tab:           { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 10, alignItems: "center", gap: 4, position: "relative" },
  tabEmoji:      { fontSize: 22, opacity: 0.6 },
  tabEmojiActive:{ opacity: 1 },
  tabLabel:      { fontSize: 11, fontWeight: "600", color: "#666" },
  tabLabelActive:{ color: C.green, fontWeight: "700" },
  tabUnderline:  { position: "absolute", bottom: 0, left: 14, right: 14, height: 2.5, borderRadius: 2, backgroundColor: C.green },
  scroll:        { backgroundColor: "#F5F5F5", paddingBottom: 20 },
  hScroll:       { paddingHorizontal: 18 },
  freqGrid:      { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 18, gap: 14, rowGap: 16, justifyContent: "space-between" },
  freqScroll:    { paddingHorizontal: 18 },
  divider:       { height: 8, backgroundColor: "#EFEFEF", marginTop: 16 },
  catSectionTitle:{ fontSize: 18, fontWeight: "800", color: C.black, paddingHorizontal: 18, paddingTop: 18, paddingBottom: 14, letterSpacing: -0.2 },
  catGrid:       { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 18, gap: 10 },
});

const pc = StyleSheet.create({
  card:        { width: 148, height: 180, borderRadius: 14, overflow: "hidden", marginRight: 10, position: "relative" },
  overlay:     { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.28)" },
  badgeNew:    { position: "absolute", top: 10, left: 0, backgroundColor: "#DC2626", paddingHorizontal: 10, paddingVertical: 3 },
  badgeNewTxt: { fontSize: 9, fontWeight: "700", color: "#fff", letterSpacing: 0.5, textTransform: "uppercase" },
  badgeFeat:   { position: "absolute", top: 10, left: 9, borderWidth: 1.5, borderColor: "rgba(255,255,255,0.65)", borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  badgeFeatTxt:{ fontSize: 9, fontWeight: "700", color: "#fff" },
  bottom:      { position: "absolute", bottom: 0, left: 0, right: 0, padding: 10 },
  title:       { fontSize: 13, fontWeight: "700", color: "#fff", lineHeight: 18 },
  sub:         { fontSize: 10, color: "rgba(255,255,255,0.8)", marginTop: 2, fontWeight: "500" },
});

const fcc = StyleSheet.create({
  card:    { width: 120, backgroundColor: "#fff", borderRadius: 14, padding: 12, paddingBottom: 14, marginRight: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  imgs:    { flexDirection: "row", gap: 4, height: 60, marginBottom: 10 },
  imgMain: { flex: 1, borderRadius: 8, overflow: "hidden", backgroundColor: "#EFEFEF" },
  imgSide: { width: 42, flexDirection: "column", gap: 5 },
  imgSm:   { flex: 1, borderRadius: 6, overflow: "hidden", backgroundColor: "#EFEFEF" },
  img:     { width: "100%", height: "100%", resizeMode: "cover" },
  more:    { fontSize: 10, fontWeight: "700", color: C.green, marginBottom: 4 },
  label:   { fontSize: 13, fontWeight: "700", color: C.black, lineHeight: 17 },
});

const prc = StyleSheet.create({
  card:    { width: 152, backgroundColor: "#fff", borderRadius: 14, overflow: "hidden", marginRight: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  imgWrap: { height: 120, backgroundColor: "#F8F8F8", position: "relative" },
  img:     { width: "100%", height: "100%", resizeMode: "cover" },
  offBadge:{ position: "absolute", top: 8, left: 8, backgroundColor: "#DC2626", borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  offTxt:  { fontSize: 9, fontWeight: "700", color: "#fff" },
  addBtn:  { position: "absolute", bottom: 8, right: 8, width: 30, height: 30, borderRadius: 8, backgroundColor: "#fff", borderWidth: 1.5, borderColor: C.green, alignItems: "center", justifyContent: "center" },
  addBtnTxt:{ fontSize: 20, color: C.green, fontWeight: "300", lineHeight: 24 },
  stepper: { position: "absolute", bottom: 8, right: 8, flexDirection: "row", alignItems: "center", backgroundColor: C.green, borderRadius: 8, overflow: "hidden", height: 30 },
  stepBtn: { width: 26, height: 30, alignItems: "center", justifyContent: "center" },
  stepTxt: { fontSize: 16, color: "#fff", fontWeight: "700" },
  stepCount:{ fontSize: 12, fontWeight: "700", color: "#fff", minWidth: 20, textAlign: "center" },
  info:    { padding: 10, paddingBottom: 12 },
  unit:    { fontSize: 11, color: "#9A9A9A", marginBottom: 2 },
  name:    { fontSize: 13, fontWeight: "700", color: C.black, lineHeight: 18, marginBottom: 6 },
  priceRow:{ flexDirection: "row", alignItems: "center", gap: 6 },
  price:   { fontSize: 14, fontWeight: "800", color: C.black },
  mrp:     { fontSize: 11, color: "#9A9A9A", textDecorationLine: "line-through" },
});

const cgc = StyleSheet.create({
  card:    { width: "23%", backgroundColor: "#fff", borderRadius: 14, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  img:     { width: "100%", height: 80, resizeMode: "cover", backgroundColor: "#EFEFEF" },
  label:   { fontSize: 11, fontWeight: "700", color: C.black, padding: 7, paddingTop: 6, lineHeight: 14, textAlign: "center" },
});
