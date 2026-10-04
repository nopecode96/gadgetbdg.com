export interface BranchData {
  id: string;
  name: string;
  address: string;
  phone?: string | null;
  whatsapp?: string | null;
  mapsUrl?: string | null;
  googleMapsUrl?: string | null;
  image?: string | null;
  googleReviewUrl?: string | null;
  businessHours?: string | null;
  warrantyInfo?: string | null;
  isMain?: boolean;
}

export interface ReviewData {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  purchasedUnit?: string | null;
  branchId?: string | null;
  branchName?: string | null;
  reviewDate?: string;
  createdAt: string;
}

export interface StoreData {
  id: string;
  name: string;
  slug: string;
  whatsapp: string;
  address: string | null;
  city?: string | null;
  description?: string | null;
  socialMedia?: string | null;
  bankName?: string | null;
  bankAccount?: string | null;
  bankHolder?: string | null;
  qrisUrl?: string | null;
  storeImage?: string | null;
  mapsUrl: string | null;
  googleReviewUrl?: string | null;
  operationalHours?: string | null;
  warrantyPolicy?: string | null;
  verifiedBadge?: boolean;
  primaryColor: string;
  bannerUrl: string | null;
  logoUrl: string | null;
  tier: string;
  templateId: string;
  hasWatermark?: boolean;
  promoBannerActive?: boolean;
  promoBannerBadge?: string | null;
  promoBannerTitle?: string | null;
  promoBannerSubtitle?: string | null;
  promoBannerImage?: string | null;
  promoBannerCtaText?: string | null;
  promoBannerCtaLink?: string | null;
  branches?: BranchData[];
  reviews?: ReviewData[];
  isTenantHost?: boolean;
}

export interface ProductData {
  id: string;
  name: string;
  title?: string;
  slug?: string;
  category?: string;
  brand: string;
  price: number;
  grade?: string | null;
  ram?: string | null;
  storage?: string | null;
  ramRom: string;
  batteryHealth: string | number | null;
  imeiStatus: string;
  completeness: string;
  condition: string;
  conditionNotes?: string | null;
  description?: string | null;
  warrantyBonus?: string | null;
  thumbnail?: string | null;
  minusNotes: string | null;
  status: string;
  isFeatured?: boolean;
  isReadyCod?: boolean;
  images: string[];
  branchId?: string | null;
  branch?: BranchData | null;
}

export type StoreTabType = "home" | "list" | "trade-in" | "about";
