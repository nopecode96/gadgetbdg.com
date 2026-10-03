export interface BranchData {
  id: string;
  name: string;
  address: string;
  phone?: string | null;
  mapsUrl?: string | null;
  isMain?: boolean;
}

export interface ReviewData {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  purchasedUnit?: string | null;
  createdAt: string;
}

export interface StoreData {
  id: string;
  name: string;
  slug: string;
  whatsapp: string;
  address: string | null;
  storeImage?: string | null;
  mapsUrl: string | null;
  operationalHours?: string | null;
  warrantyPolicy?: string | null;
  verifiedBadge?: boolean;
  primaryColor: string;
  bannerUrl: string | null;
  logoUrl: string | null;
  tier: string;
  templateId: string;
  hasWatermark?: boolean;
  branches?: BranchData[];
  reviews?: ReviewData[];
}

export interface ProductData {
  id: string;
  name: string;
  brand: string;
  price: number;
  ramRom: string;
  batteryHealth: number | null;
  imeiStatus: string;
  completeness: string;
  condition: string;
  minusNotes: string | null;
  status: string;
  images: string[];
  branchId?: string | null;
  branch?: BranchData | null;
}

export type StoreTabType = "home" | "list" | "trade-in" | "about";
