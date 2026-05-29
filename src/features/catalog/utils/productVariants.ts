export type ProductVariantOption = {
  id: string;
  cartId: string;
  name: string;
  unit: string;
  price: number;
  image: string | null;
  raw: any;
};

const firstString = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
};

const firstNumber = (...values: unknown[]) => {
  for (const value of values) {
    const num = Number(value);
    if (Number.isFinite(num) && num >= 0) return num;
  }
  return 0;
};

const productLikeId = (value: unknown) => {
  const id = firstString(value);
  if (!id) return "";
  if (/^[a-f0-9]{24}$/i.test(id)) return id;
  if (/^\d{8,}$/.test(id)) return id;
  return "";
};

export const getProductId = (product: any) =>
  firstString(product?._id, product?.zoho_item_id, product?.item_id, product?.id);

export const getProductImage = (product: any): string | null => {
  if (!product) return null;
  if (typeof product.image === "string") return product.image;
  return firstString(
    product.image_url,
    product.image?.image_url,
    product.image?.url,
    product.image?.src,
    product.image_name && product.image_document_id
      ? `https://cdn2.zohoecommerce.com/product-images/${product.image_name}/${product.image_document_id}/800x800?storefront_domain=products.tcbtjaivikkisan.com`
      : ""
  ) || null;
};

export const getProductPrice = (product: any) =>
  firstNumber(product?.price, product?.rate, product?.priceRaw, product?.selling_price);

export const getProductUnit = (product: any) => {
  // Check variant attributes first (from Zoho: { "Weight": "500ml" })
  const attrs = product?.attributes;
  if (attrs && typeof attrs === "object" && !Array.isArray(attrs)) {
    const attrVal = Object.values(attrs).find(
      (v) => typeof v === "string" && v.trim()
    );
    if (attrVal) return (attrVal as string).trim();
  }

  const direct = firstString(
    product?.unit,
    product?.weight_with_unit,
    product?.weight_unit,
    product?.pack_size,
    product?.size,
    product?.variant_name,
    product?.label
  );
  if (direct) return direct;

  const weight = Number(product?.weight ?? product?.dimensions?.weight);
  if (!Number.isFinite(weight) || weight <= 0) return "";
  return weight >= 1 ? `${weight} kg` : `${Math.round(weight * 1000)} g`;
};

const getRawVariants = (product: any): any[] => {
  const candidates = [
    product?.variants,
    product?.product_variants,
    product?.variant_options,
    product?.options,
    product?.sizes,
    product?.packs,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate) && candidate.length > 1) return candidate;
  }
  return [];
};

export const getProductVariants = (product: any): ProductVariantOption[] => {
  const baseId = getProductId(product);
  const baseImage = getProductImage(product);
  const baseName = firstString(product?.name, product?.item_name, "Product");

  return getRawVariants(product)
    .map((variant, index) => {
      const id = firstString(
        variant?._id,
        variant?.zoho_item_id,
        variant?.item_id,
        variant?.id,
        variant?.sku,
        baseId ? `${baseId}:${index}` : ""
      );
      const cartId = firstString(
        variant?.product_id,
        variant?.productId,
        variant?.zoho_item_id,
        variant?.item_id,
        variant?._id,
        productLikeId(variant?.id),
        baseId
      );

      return {
        id,
        cartId,
        name: firstString(variant?.name, variant?.item_name, baseName),
        unit: getProductUnit(variant) || getProductUnit(product),
        price: getProductPrice(variant) || getProductPrice(product),
        image: getProductImage(variant) || baseImage,
        raw: variant,
      };
    })
    .filter((variant) => variant.id && variant.cartId);
};

export const hasProductVariants = (product: any) => getProductVariants(product).length > 1;

export const getProductCartId = (product: any) => getProductId(product);

export const getVariantCartSummary = (
  product: any,
  getQty: (id: string) => number
) => {
  const variants = getProductVariants(product);
  let totalQty = 0;
  let firstCartId = "";

  for (const variant of variants) {
    const qty = getQty(variant.cartId);
    if (qty > 0 && !firstCartId) firstCartId = variant.cartId;
    totalQty += qty;
  }

  return { totalQty, firstCartId };
};
