export interface BranchData {
  id: string;
  name: string;
  address: string;
  phone?: string | null;
  mapsUrl?: string | null;
  isMain?: boolean;
}

export interface StoreData {
  id: string;
  name: string;
  slug: string;
  whatsapp: string;
  address: string | null;
  mapsUrl: string | null;
  primaryColor: string;
  bannerUrl: string | null;
  logoUrl: string | null;
  tier: string;
  templateId: string;
  hasWatermark?: boolean;
  branches?: BranchData[];
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
