// src/components/ui/HeroBanner.tsx
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors, FontSize, FontWeight, Radius, Spacing } from "../../core/theme";

export function HeroBanner() {
  return (
    <View style={styles.hero}>
      <View style={styles.glow} />
      <View style={styles.textBlock}>
        <Text style={styles.kicker}>Season's Best</Text>
        <Text style={styles.headline}>Fresh Organic{"\n"}Direct to Door</Text>
        <Text style={styles.sub}>From verified farmers · No middlemen</Text>
        <TouchableOpacity style={styles.btn} activeOpacity={0.85}>
          <Text style={styles.btnText}>Shop Now →</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.heroEmoji}>🥦</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero:      { marginHorizontal: Spacing.xl, marginTop: Spacing.lg, borderRadius: Radius.xl, backgroundColor: Colors.greenDeep, padding: 22, flexDirection: "row", alignItems: "center", justifyContent: "space-between", overflow: "hidden", shadowColor: Colors.greenDeep, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 8 },
  glow:      { position: "absolute", top: -30, right: -30, width: 140, height: 140, borderRadius: 70, backgroundColor: "rgba(255,255,255,0.07)" },
  textBlock: { flex: 1 },
  kicker:    { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.greenLight, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 },
  headline:  { fontSize: 21, fontWeight: FontWeight.extrabold, color: Colors.white, lineHeight: 26, marginBottom: 8 },
  sub:       { fontSize: FontSize.xs, color: "rgba(255,255,255,0.7)", marginBottom: 14 },
  btn:       { backgroundColor: Colors.amber, paddingHorizontal: Spacing.lg, paddingVertical: 9, borderRadius: Radius.md, alignSelf: "flex-start" },
  btnText:   { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.greenDeep },
  heroEmoji: { fontSize: 64, marginLeft: Spacing.md },
});
