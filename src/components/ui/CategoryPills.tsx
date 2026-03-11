// src/components/ui/CategoryPills.tsx
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { Category } from "../../constants/data";
import { Colors, FontSize, FontWeight, Radius, Spacing } from "../../constants/theme";

type Props = {
  categories: Category[];
  activeId: string;
  onSelect: (id: string) => void;
};

export function CategoryPills({ categories, activeId, onSelect }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
      {categories.map((cat) => {
        const isActive = cat.id === activeId;
        return (
          <TouchableOpacity key={cat.id} onPress={() => onSelect(cat.id)} style={styles.pill} activeOpacity={0.8}>
            <View style={[styles.iconWrap, { backgroundColor: isActive ? Colors.greenDeep : cat.bgColor }]}>
              <Text style={styles.emoji}>{cat.emoji}</Text>
            </View>
            <Text style={[styles.label, isActive && { color: Colors.greenDeep, fontWeight: FontWeight.bold }]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: Spacing.xl, gap: Spacing.md },
  pill:      { alignItems: "center", gap: 6 },
  iconWrap:  { width: 62, height: 62, borderRadius: Radius.lg, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  emoji:     { fontSize: 28 },
  label:     { fontSize: FontSize.xs, fontWeight: FontWeight.medium, color: Colors.gray700, textAlign: "center" },
});
