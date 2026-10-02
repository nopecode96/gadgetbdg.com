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
}

export type StoreTabType = "home" | "list" | "trade-in" | "about";
