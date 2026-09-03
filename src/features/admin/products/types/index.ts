// src/features/admin/products/types/index.ts

/** Global attribute catalog row (EAV key, e.g. "RAM"). */
export type AttributeItem = {
  id: string;
  name: string;
  dataType: "string" | "number" | "boolean";
  createdAt?: string;
  updatedAt?: string;
};

/** An attribute-value pair attached to a SKU (from product detail response). */
export type SkuAttributeValueItem = {
  id: string;
  value: string;
  attribute: {
    id: string;
    name: string;
    dataType: string;
  };
};

/** A product image (attached to a SKU/variant). */
export type SkuImageItem = {
  id: string;
  imageUrl: string;
  isPrimary: boolean;
};

/** A single SKU/variant row returned by the API (nested under a product). */
export type SkuItem = {
  id: string;
  skuCode: string;
  variantName: string;
  /** numeric(19,2) — serialized as a string to avoid float drift. */
  price: string;
  images?: SkuImageItem[];
  attributeValues?: SkuAttributeValueItem[];
};

/** Single product row returned by the API. */
export type ProductItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  brandId: string | null;
  brand?: { id: string; name: string } | null;
  categoryId: string;
  category?: { id: string; name: string } | null;
  skus?: SkuItem[];
  createdAt?: string;
  updatedAt?: string;
};

// ---------------------------------------------------------------------------
// Payloads (match backend DTOs)
// ---------------------------------------------------------------------------

/** One attribute-value pair sent when creating a SKU. */
export type CreateSkuAttributeValuePayload = {
  attributeId: string;
  value: string;
};

/** One SKU sent when creating a product. */
export type CreateSkuPayload = {
  skuCode: string;
  variantName: string;
  /** Arrives as a number from the client; persisted as string by backend. */
  price: number;
  images?: { imageUrl: string; isPrimary?: boolean }[];
  attributeValues: CreateSkuAttributeValuePayload[];
};

/** Payload accepted by create/update product endpoints. */
export type ProductPayload = {
  brandId?: string | null;
  categoryId: string;
  name: string;
  description?: string | null;
  isActive?: boolean;
  /** Required for create; omitted on update (backend `update` only patches scalar fields). */
  skus?: CreateSkuPayload[];
};

/** Payload accepted by create attribute endpoint. */
export type AttributePayload = {
  name: string;
  dataType?: "string" | "number" | "boolean";
};
