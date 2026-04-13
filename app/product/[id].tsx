import { useLocalSearchParams } from "expo-router";
import ProductScreen from "../../src/screens/ProductScreen";

export default function ProductRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ProductScreen productId={id} />;
}