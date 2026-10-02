export const TIER_LIMITS = {
  STARTER: {
    name: "Starter",
    price: 250000,
    period: "/ bulan",
    maxActiveProducts: 15,
    maxAdmins: 1,
    allowedTemplates: 2,
    templateChangeCooldownDays: 0, // Bebas di 2 template
    hasWatermark: false,
    customDomain: false,
    description: "Solusi hemat untuk toko HP pemula / konter personal yang ingin katalog online rapi.",
  },
  PRO: {
    name: "Pro",
    price: 600000,
    period: "/ bulan",
    maxActiveProducts: 30,
    maxAdmins: 3,
    allowedTemplates: 10,
    templateChangeCooldownDays: 30, // 1x per 30 hari
    hasWatermark: true,
    customDomain: true,
    description: "Untuk konter HP aktif BEC / Bandung yang ingin scale-up penjualan & branding profesional.",
  },
  ADVANCE: {
    name: "Advance",
    price: 1000000,
    period: "/ bulan",
    maxActiveProducts: Infinity,
    maxAdmins: 5,
    allowedTemplates: 30,
    templateChangeCooldownDays: 0, // Bebas ganti kapan saja
    hasWatermark: true,
    customDomain: true,
    description: "Kapasitas tanpa batas untuk juragan HP second dengan perputaran stok masif & multi-cabang.",
  },
} as const;

export type TierType = keyof typeof TIER_LIMITS;
