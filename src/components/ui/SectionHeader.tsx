// src/components/ui/SectionHeader.tsx
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors, FontSize, FontWeight, Radius, Spacing } from "../../constants/theme";

type Props = { title: string; onSeeAll?: () => void; seeAllLabel?: string };

export function SectionHeader({ title, onSeeAll, seeAllLabel = "See all" }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll} style={styles.btn}>
          <Text style={styles.btnText}>{seeAllLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row:     { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  title:   { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.gray900 },
  btn:     { backgroundColor: Colors.greenPale, paddingHorizontal: Spacing.md, paddingVertical: 4, borderRadius: Radius.full },
  btnText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.greenMid },
});
