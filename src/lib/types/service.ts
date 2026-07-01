export interface ServiceImage {
  id: number;
  imageUrl: string;
  imageKey: string;
  altText: string | null;
  sortOrder: number;
}

export interface ServiceItem {
  id: number;
  name: string;
  title: string;
  slug: string;
  mainImageUrl: string;
  mainImageKey: string;
  shortDescription: string;
  longDescription: string;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  tags: string;
  price: number;
  discountType: "none" | "percentage" | "fixed";
  discountValue: number | null;
  finalPrice: number;
  durationMinutes: number;
  includes: string[];
  isActive: boolean;
  isFeatured: boolean;
  images: ServiceImage[];
  createdAt: string;
}
