export interface TemplateThemeConfig {
  id: string;
  name: string;
  tagline: string;
  category: "Starter" | "Pro" | "Advance";
  tierRequired: "STARTER" | "PRO" | "ADVANCE";
  description: string;
  badge?: string;
  archetype:
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
  // 1. CLEAN-LEDGER (Starter / Pro / Advance)
  // ==========================================
  "clean-ledger": {
    id: "clean-ledger",
    name: "Clean Ledger",
    tagline: "Minimalist Terminal Data",
    category: "Starter",
    tierRequired: "STARTER",
    archetype: "clean-ledger",
    description:
      "Format baris horizontal modern & padat informasi. Status IMEI, BH %, dan catatan minus langsung terbaca dengan pencarian instan super cepat.",
    badge: "Terminal Data",
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
      badgeVerifiedBg: "bg-slate-100",
      badgeVerifiedText: "text-slate-800",
      badgeVerifiedBorder: "border-slate-300",
      cardBg: "bg-white",
      cardBorder: "border-slate-200",
      cardHoverBorder: "hover:border-slate-400",
      headerBg: "bg-white/90 border-slate-200 text-slate-900",
      bottomNavBg: "bg-white/95 border-slate-200",
      bottomNavBorder: "border-slate-200",
      bottomNavActive: "text-slate-900 font-extrabold",
      bottomNavInactive: "text-slate-400 hover:text-slate-800",
      priceText: "text-slate-900 font-mono font-black",
      heroGradient: "bg-gradient-to-r from-slate-900 via-slate-800 to-zinc-900 text-white",
      heroBorder: "border-slate-800",
    },
  },

  // ==========================================
  // 2. KEYNOTE-OBSIDIAN (Pro / Advance)
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
  // 3. TOKYO-EDITORIAL (Pro / Advance)
  // ==========================================
  "tokyo-editorial": {
    id: "tokyo-editorial",
    name: "Tokyo Editorial",
    tagline: "Streetwear Magazine & Raw Typography",
    category: "Pro",
    tierRequired: "PRO",
    archetype: "tokyo-editorial",
    description:
      "Gaya Streetwear / Editorial Magazine Tech. Latar stone/off-white, tipografi bold asimetris, infinite marquee text, layout majalah dengan kartu foto resolusi tinggi dan label grade transparan.",
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
  // 4. CYBER-HUD (Advance Only)
  // ==========================================
  "cyber-hud": {
    id: "cyber-hud",
    name: "Cyber HUD",
    tagline: "Hyper-Performance Console Gaming",
    category: "Advance",
    tierRequired: "ADVANCE",
    archetype: "cyber-hud",
    description:
      "Gaya Console Gaming / Hyper-Performance (ROG & High-FPS Gadgets). Ticker marquee berjalan 'STATUS STOK BEC READY COD', sudut kartu tegas chamfered, bar spek visual, dan neon glow border.",
    badge: "ROG Cyber HUD",
    colors: {
      isDark: true,
      bgMain: "bg-[#05070a]",
      bgContainer: "bg-[#0c1017]",
      borderContainer: "border-cyan-900/60",
      textPrimary: "text-cyan-100",
      textSecondary: "text-cyan-400/60",
      accent: "bg-cyan-500",
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
  // 5. LIVE-DROP (Advance Only)
  // ==========================================
  "live-drop": {
    id: "live-drop",
    name: "Live Drop",
    tagline: "TikTok & Reels Mobile-First Feed",
    category: "Advance",
    tierRequired: "ADVANCE",
    archetype: "live-drop",
    description:
      "Gaya TikTok & Reels-First. Format kartu vertikal 9:16 sinematik, swipe horizontal snap untuk galeri foto fisik, floating pulsing button 'Ambil via WhatsApp', dan live inventory vibes.",
    badge: "9:16 Video Vibes",
    colors: {
      isDark: true,
      bgMain: "bg-black",
      bgContainer: "bg-[#111111]",
      borderContainer: "border-neutral-800",
      textPrimary: "text-white",
      textSecondary: "text-neutral-400",
      accent: "bg-[#fe2c55]",
      accentHover: "hover:bg-[#e0264b]",
      accentText: "text-[#fe2c55]",
      badgeVerifiedBg: "bg-[#fe2c55]/20",
      badgeVerifiedText: "text-[#ff6b87]",
      badgeVerifiedBorder: "border-[#fe2c55]/40",
      cardBg: "bg-[#141414]",
      cardBorder: "border-neutral-800",
      cardHoverBorder: "hover:border-[#fe2c55]/60",
      headerBg: "bg-black/80 border-neutral-900 text-white backdrop-blur-md",
      bottomNavBg: "bg-black/90 border-neutral-900",
      bottomNavBorder: "border-neutral-900",
      bottomNavActive: "text-[#fe2c55] font-black",
      bottomNavInactive: "text-neutral-500 hover:text-white",
      priceText: "text-white font-black",
      heroGradient: "bg-gradient-to-b from-neutral-950 via-[#1a080d] to-black text-white",
      heroBorder: "border-[#fe2c55]/30",
    },
  },

  // ==========================================
  // 6. MIDNIGHT-GOLD (Advance Only)
  // ==========================================
  "midnight-gold": {
    id: "midnight-gold",
    name: "Midnight Gold",
    tagline: "VIP Concierge & Luxury Boutique",
    category: "Advance",
    tierRequired: "ADVANCE",
    archetype: "midnight-gold",
    description:
      "Gaya VIP Concierge / Butik Mewah. Hitam pekat aksen emas/amber mewah, kartu jaminan garansi toko interaktif, dan kurasi katalog seperti perhiasan berharga.",
    badge: "VIP Concierge",
    colors: {
      isDark: true,
      bgMain: "bg-[#0a0907]",
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
      headerBg: "bg-[#0a0907]/90 border-amber-950 text-amber-100 backdrop-blur-md",
      bottomNavBg: "bg-[#0a0907]/95 border-amber-950",
      bottomNavBorder: "border-amber-950",
      bottomNavActive: "text-amber-400 font-bold",
      bottomNavInactive: "text-stone-500 hover:text-amber-200",
      priceText: "text-amber-300 font-mono font-black",
      heroGradient: "bg-gradient-to-b from-[#1b160e] via-[#100d08] to-[#0a0907] text-amber-100",
      heroBorder: "border-amber-600/40",
    },
  },
};

export const TEMPLATE_LIST = Object.values(TEMPLATE_REGISTRY);

/**
 * Filter template yang tersedia berdasarkan tier langganan toko:
 * - STARTER: clean-ledger (1 template)
 * - PRO: clean-ledger, keynote-obsidian, tokyo-editorial (3 template)
 * - ADVANCE: semua 6 arketipe layout
 */
export function getAvailableTemplatesForTier(tier: string | undefined): TemplateThemeConfig[] {
  const cleanTier = (tier || "STARTER").toUpperCase();
  if (cleanTier === "ADVANCE") {
    return TEMPLATE_LIST;
  }
  if (cleanTier === "PRO") {
    return TEMPLATE_LIST.filter(
      (t) =>
        t.id === "clean-ledger" ||
        t.id === "keynote-obsidian" ||
        t.id === "tokyo-editorial"
    );
  }
  // STARTER tier
  return TEMPLATE_LIST.filter((t) => t.id === "clean-ledger");
}

export function getTemplateConfig(templateId: string | undefined): TemplateThemeConfig {
  if (templateId && TEMPLATE_REGISTRY[templateId]) {
    return TEMPLATE_REGISTRY[templateId];
  }
  // Fallback map untuk legacy template ids yang mungkin tersimpan di DB
  if (templateId === "dark-gaming") return TEMPLATE_REGISTRY["cyber-hud"];
  if (templateId === "flagship-gold") return TEMPLATE_REGISTRY["midnight-gold"];
  if (templateId === "tokyo-street") return TEMPLATE_REGISTRY["tokyo-editorial"];

  return TEMPLATE_REGISTRY["clean-ledger"];
}
