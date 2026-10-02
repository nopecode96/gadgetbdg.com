export const TIER_LIMITS = {
  STARTER: {
    name: "Starter",
    price: 250000,
    period: "/ bulan",
    maxActiveProducts: 15,
    maxAdmins: 1,
    allowedTemplates: 1,
    templateChangeCooldownDays: 0, // Bebas
    hasWatermark: false,
    customDomain: false,
    description: "Solusi hemat untuk toko HP pemula / konter personal yang ingin katalog online rapi.",
    qrKit: {
      allowGoogleReview: false,
      allowHdDownload: false,
      showWatermarkPlatform: true, // label footer: "Powered by gadgetbdg.com"
      allowedFormats: ["compact-mono"] as const,
    },
  },
  PRO: {
    name: "Pro",
    price: 600000,
    period: "/ bulan",
    maxActiveProducts: 30,
    maxAdmins: 3,
    allowedTemplates: 3,
    templateChangeCooldownDays: 30, // 1x per 30 hari
    hasWatermark: true,
    customDomain: true,
    description: "Untuk konter HP aktif BEC / Bandung yang ingin scale-up penjualan & branding profesional.",
    qrKit: {
      allowGoogleReview: true,
      allowHdDownload: true,
      showWatermarkPlatform: false,
      allowedFormats: ["compact-mono", "acrylic-stand", "tent-card"] as const,
    },
  },
  ADVANCE: {
    name: "Advance",
    price: 1000000,
    period: "/ bulan",
    maxActiveProducts: Infinity,
    maxAdmins: 5,
    allowedTemplates: 6,
    templateChangeCooldownDays: 0, // Bebas ganti kapan saja
    hasWatermark: true,
    customDomain: true,
    description: "Kapasitas tanpa batas untuk juragan HP second dengan perputaran stok masif & multi-cabang.",
    qrKit: {
      allowGoogleReview: true,
      allowHdDownload: true,
      showWatermarkPlatform: false,
      allowedFormats: ["compact-mono", "acrylic-stand", "tent-card", "gold-luxury", "badge-custom"] as const,
    },
  },
} as const;

export type TierType = keyof typeof TIER_LIMITS;
