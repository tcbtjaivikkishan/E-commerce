import { useEffect, useState } from "react";
import {
  fetchAllProducts,
  fetchCategories,
  ApiProductResponse,
  CategoryResponse,
} from "../services/product.api";

type CategoryWithProducts = CategoryResponse & {
  products: ApiProductResponse[];
};

export const useCatalog = () => {
  const [data, setData] = useState<CategoryWithProducts[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [categories, products] = await Promise.all([
        fetchCategories(),
        fetchAllProducts(),
      ]);

      // 🔥 Group products by category_id
      const grouped: Record<string, ApiProductResponse[]> = {};

      products.forEach((product) => {
        if (!product.category_id) return;

        if (!grouped[product.category_id]) {
          grouped[product.category_id] = [];
        }

        grouped[product.category_id].push(product);
      });

      // 🔥 Merge categories + products
      const finalData: CategoryWithProducts[] = categories.map((cat) => ({
        ...cat,
        products: grouped[cat.category_id] || [],
      }));

      setData(finalData);
    } catch (error) {
      console.error("Catalog load error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return { data, loading };
};