export interface TemplateThemeConfig {
  id: string;
  name: string;
  tagline: string;
  category: "Starter" | "Pro" | "Advance";
  tierRequired: "STARTER" | "PRO" | "ADVANCE";
  description: string;
  badge?: string;
  archetype:
    | "minimal-clean"
    | "dark-gaming"
    | "keynote-obsidian"
    | "cyber-hud"
    | "tokyo-editorial"
    | "live-drop"
    | "midnight-gold"
    | "clean-ledger";
  colors: {
    isDark: boolean;
    bgMain: string;
    bgContainer: string;
    borderContainer: string;
    textPrimary: string;
    textSecondary: string;
    accent: string;
    accentHover: string;
    accentText: string;
    badgeVerifiedBg: string;
    badgeVerifiedText: string;
    badgeVerifiedBorder: string;
    cardBg: string;
    cardBorder: string;
    cardHoverBorder: string;
    headerBg: string;
    bottomNavBg: string;
    bottomNavBorder: string;
    bottomNavActive: string;
    bottomNavInactive: string;
    priceText: string;
    heroGradient: string;
    heroBorder: string;
  };
}

export const TEMPLATE_REGISTRY: Record<string, TemplateThemeConfig> = {
  // ==========================================
  // 1. MINIMAL-CLEAN (Starter)
  // ==========================================
  "minimal-clean": {
    id: "minimal-clean",
    name: "Minimal Clean",
    tagline: "Oraimo & Modern E-Commerce Standard",
    category: "Starter",
    tierRequired: "STARTER",
    archetype: "minimal-clean",
    description:
      "Desain mobile e-commerce terang modern. Dilengkapi visual quick category icons, hero promo banner melayang, dan kartu produk rounded-3xl kontras tinggi.",
    badge: "Populer Starter",
    colors: {
      isDark: false,
      bgMain: "bg-slate-50",
      bgContainer: "bg-white",
      borderContainer: "border-slate-200",
      textPrimary: "text-slate-900",
      textSecondary: "text-slate-500",
      accent: "bg-slate-900",
      accentHover: "hover:bg-slate-800",
      accentText: "text-slate-900",
      badgeVerifiedBg: "bg-emerald-50",
      badgeVerifiedText: "text-emerald-700",
      badgeVerifiedBorder: "border-emerald-200",
      cardBg: "bg-white",
      cardBorder: "border-slate-200/80",
      cardHoverBorder: "hover:border-slate-400",
      headerBg: "bg-white/95 border-slate-200 text-slate-900",
      bottomNavBg: "bg-white/95 border-slate-200",
      bottomNavBorder: "border-slate-200",
      bottomNavActive: "text-slate-950 font-black",
      bottomNavInactive: "text-slate-400 hover:text-slate-800",
      priceText: "text-slate-950 font-black",
      heroGradient: "bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white",
      heroBorder: "border-slate-800",
    },
  },

  // ==========================================
  // 2. DARK-GAMING (Starter)
  // ==========================================
  "dark-gaming": {
    id: "dark-gaming",
    name: "Dark Gaming Neon",
    tagline: "Spectra Dark & High-FPS Glow",
    category: "Starter",
    tierRequired: "STARTER",
    archetype: "dark-gaming",
    description:
      "Gaya gelap gaming Spectra dengan aksen neon mint-teal (#00e5b3), featured hero showcase besar, spec chips teknis (FPS & Chipset), dan floating CTA order.",
    badge: "Dark Spectra",
    colors: {
      isDark: true,
      bgMain: "bg-[#0c0f12]",
      bgContainer: "bg-[#14191f]",
      borderContainer: "border-emerald-950/60",
      textPrimary: "text-emerald-50",
      textSecondary: "text-emerald-400/60",
      accent: "bg-[#00e5b3] text-slate-950",
      accentHover: "hover:bg-[#00c99d]",
      accentText: "text-[#00e5b3]",
      badgeVerifiedBg: "bg-emerald-950/80",
      badgeVerifiedText: "text-[#00e5b3]",
      badgeVerifiedBorder: "border-emerald-800/60",
      cardBg: "bg-[#12161c]/90",
      cardBorder: "border-emerald-900/40",
      cardHoverBorder: "hover:border-[#00e5b3]/60",
      headerBg: "bg-[#0c0f12]/90 border-emerald-950 text-emerald-50 backdrop-blur-md",
      bottomNavBg: "bg-[#0c0f12]/95 border-emerald-950",
      bottomNavBorder: "border-emerald-950",
      bottomNavActive: "text-[#00e5b3] font-black",
      bottomNavInactive: "text-slate-500 hover:text-emerald-300",
      priceText: "text-[#00e5b3] font-mono font-black",
      heroGradient: "bg-gradient-to-br from-[#0c151b] via-[#102428] to-[#0c0f12] text-white",
      heroBorder: "border-[#00e5b3]/30",
    },
  },

  // ==========================================
  // 3. KEYNOTE-OBSIDIAN (Pro)
  // ==========================================
  "keynote-obsidian": {
    id: "keynote-obsidian",
    name: "Keynote Obsidian",
    tagline: "Apple Keynote Reveal Experience",
    category: "Pro",
    tierRequired: "PRO",
    archetype: "keynote-obsidian",
    description:
      "Gaya panggung reveal Apple Keynote. Dark obsidian, spotlight ambient halus, kartu showcase lebar horizontal, floating effect pada unit flagship, dan badge Dynamic Island.",
    badge: "Spotlight Event",
    colors: {
      isDark: true,
      bgMain: "bg-[#09090b]",
      bgContainer: "bg-[#121216]",
      borderContainer: "border-zinc-800",
      textPrimary: "text-zinc-100",
      textSecondary: "text-zinc-400",
      accent: "bg-white",
      accentHover: "hover:bg-zinc-200",
      accentText: "text-white",
      badgeVerifiedBg: "bg-zinc-800/80",
      badgeVerifiedText: "text-zinc-200",
      badgeVerifiedBorder: "border-zinc-700",
      cardBg: "bg-[#18181b]/90",
      cardBorder: "border-zinc-800",
      cardHoverBorder: "hover:border-zinc-600",
      headerBg: "bg-black/85 border-zinc-800/80 text-white backdrop-blur-md",
      bottomNavBg: "bg-black/90 border-zinc-800 backdrop-blur-md",
      bottomNavBorder: "border-zinc-800",
      bottomNavActive: "text-white font-bold",
      bottomNavInactive: "text-zinc-500 hover:text-zinc-300",
      priceText: "text-white font-black font-mono",
      heroGradient: "bg-gradient-to-b from-zinc-900 via-black to-[#09090b] text-white",
      heroBorder: "border-zinc-800",
    },
  },

  // ==========================================
  // 4. TOKYO-EDITORIAL (Pro)
  // ==========================================
  "tokyo-editorial": {
    id: "tokyo-editorial",
    name: "Tokyo Street Clean",
    tagline: "Streetwear Magazine & Asymmetric Pop",
    category: "Pro",
    tierRequired: "PRO",
    archetype: "tokyo-editorial",
    description:
      "Gaya Streetwear / Editorial Magazine Tech. Latar stone/off-white dengan kartu pastel asimetris, tipografi brutalist bold, dan showcase produk 3D melayang.",
    badge: "Street Editorial",
    colors: {
      isDark: false,
      bgMain: "bg-[#f4f1ea]",
      bgContainer: "bg-[#faf8f4]",
      borderContainer: "border-[#dfd8cc]",
      textPrimary: "text-[#1c1a17]",
      textSecondary: "text-[#736c62]",
      accent: "bg-[#d94823]",
      accentHover: "hover:bg-[#bc3b1a]",
      accentText: "text-[#d94823]",
      badgeVerifiedBg: "bg-[#fcece7]",
      badgeVerifiedText: "text-[#d94823]",
      badgeVerifiedBorder: "border-[#f4cfc4]",
      cardBg: "bg-white",
      cardBorder: "border-[#dfd8cc]",
      cardHoverBorder: "hover:border-[#1c1a17]",
      headerBg: "bg-[#faf8f4]/90 border-[#dfd8cc] text-[#1c1a17] backdrop-blur-md",
      bottomNavBg: "bg-[#faf8f4]/95 border-[#dfd8cc]",
      bottomNavBorder: "border-[#dfd8cc]",
      bottomNavActive: "text-[#d94823] font-black",
      bottomNavInactive: "text-[#736c62] hover:text-[#1c1a17]",
      priceText: "text-[#1c1a17] font-black",
      heroGradient: "bg-gradient-to-br from-[#1c1a17] via-[#2c2925] to-[#403b35] text-[#faf8f4]",
      heroBorder: "border-[#1c1a17]",
    },
  },

  // ==========================================
  // 5. CYBER-HUD (Advance)
  // ==========================================
  "cyber-hud": {
    id: "cyber-hud",
    name: "Cyber HUD Telemetry",
    tagline: "Hyper-Performance Console & Tactical Tech",
    category: "Advance",
    tierRequired: "ADVANCE",
    archetype: "cyber-hud",
    description:
      "Gaya Console Gaming / Hyper-Performance (ROG & High-FPS Gadgets). Ticker marquee berjalan, radar circular icon gadgets, bar spek visual baterai & sinyal, dan neon cyan glow.",
    badge: "Tactical HUD",
    colors: {
      isDark: true,
      bgMain: "bg-[#05070a]",
      bgContainer: "bg-[#0c1017]",
      borderContainer: "border-cyan-900/60",
      textPrimary: "text-cyan-100",
      textSecondary: "text-cyan-400/60",
      accent: "bg-cyan-500 text-slate-950",
      accentHover: "hover:bg-cyan-400",
      accentText: "text-cyan-400",
      badgeVerifiedBg: "bg-cyan-950/80",
      badgeVerifiedText: "text-cyan-300",
      badgeVerifiedBorder: "border-cyan-700/60",
      cardBg: "bg-[#080d14]/90",
      cardBorder: "border-cyan-900/50",
      cardHoverBorder: "hover:border-cyan-400",
      headerBg: "bg-[#05070a]/90 border-cyan-950 text-cyan-50 backdrop-blur-md",
      bottomNavBg: "bg-[#05070a]/95 border-cyan-950",
      bottomNavBorder: "border-cyan-950",
      bottomNavActive: "text-cyan-400 font-black",
      bottomNavInactive: "text-cyan-600 hover:text-cyan-300",
      priceText: "text-cyan-300 font-mono font-black",
      heroGradient: "bg-gradient-to-r from-[#040d1a] via-[#091f38] to-[#040d1a] text-cyan-50",
      heroBorder: "border-cyan-500/40",
    },
  },

  // ==========================================
  // 6. MIDNIGHT-GOLD (Advance)
  // ==========================================
  "midnight-gold": {
    id: "midnight-gold",
    name: "Midnight Gold Luxury",
    tagline: "VIP Concierge & Haute Horlogerie",
    category: "Advance",
    tierRequired: "ADVANCE",
    archetype: "midnight-gold",
    description:
      "Gaya VIP Concierge / Butik Mewah. Hitam pekat aksen emas/amber mewah, kartu kurasi flagship bak perhiasan berharga, dan hotline booking concierge VIP.",
    badge: "VIP Luxury",
    colors: {
      isDark: true,
      bgMain: "bg-[#0a0805]",
      bgContainer: "bg-[#14120e]",
      borderContainer: "border-amber-900/40",
      textPrimary: "text-amber-100",
      textSecondary: "text-amber-300/60",
      accent: "bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950",
      accentHover: "hover:from-amber-300 hover:to-amber-500",
      accentText: "text-amber-400",
      badgeVerifiedBg: "bg-amber-950/80",
      badgeVerifiedText: "text-amber-300",
      badgeVerifiedBorder: "border-amber-700/60",
      cardBg: "bg-[#16130d]/90",
      cardBorder: "border-amber-900/30",
      cardHoverBorder: "hover:border-amber-500/60",
      headerBg: "bg-[#0a0805]/90 border-amber-950 text-amber-100 backdrop-blur-md",
      bottomNavBg: "bg-[#0a0805]/95 border-amber-950",
      bottomNavBorder: "border-amber-950",
      bottomNavActive: "text-amber-400 font-bold",
      bottomNavInactive: "text-stone-500 hover:text-amber-200",
      priceText: "text-amber-300 font-mono font-black",
      heroGradient: "bg-gradient-to-b from-[#1b160e] via-[#100d08] to-[#0a0805] text-amber-100",
      heroBorder: "border-amber-600/40",
    },
  },
};

export const TEMPLATE_LIST = Object.values(TEMPLATE_REGISTRY);

/**
 * Filter template yang tersedia berdasarkan tier langganan toko:
 * - STARTER: minimal-clean, dark-gaming (2 template)
 * - PRO: minimal-clean, dark-gaming, keynote-obsidian, tokyo-editorial (4 template)
 * - ADVANCE / ALL: semua 6 arketipe lengkap
 */
export function getAvailableTemplatesForTier(tier: string | undefined): TemplateThemeConfig[] {
  const cleanTier = (tier || "ALL").toUpperCase();
  if (cleanTier === "ALL" || cleanTier === "ADVANCE") {
    return TEMPLATE_LIST;
  }
  if (cleanTier === "PRO") {
    return TEMPLATE_LIST.filter(
      (t) => t.tierRequired === "STARTER" || t.tierRequired === "PRO"
    );
  }
  if (cleanTier === "STARTER") {
    return TEMPLATE_LIST.filter((t) => t.tierRequired === "STARTER");
  }
  return TEMPLATE_LIST;
}

export function getTemplateConfig(templateId: string | undefined): TemplateThemeConfig {
  if (templateId && TEMPLATE_REGISTRY[templateId]) {
    return TEMPLATE_REGISTRY[templateId];
  }
  // Fallback map untuk legacy template ids
  if (templateId === "clean-ledger") return TEMPLATE_REGISTRY["minimal-clean"];
  if (templateId === "live-drop") return TEMPLATE_REGISTRY["dark-gaming"];
  if (templateId === "flagship-gold") return TEMPLATE_REGISTRY["midnight-gold"];
  if (templateId === "tokyo-street") return TEMPLATE_REGISTRY["tokyo-editorial"];

  return TEMPLATE_REGISTRY["minimal-clean"];
}
