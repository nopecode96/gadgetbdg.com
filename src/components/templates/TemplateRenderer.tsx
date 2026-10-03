"use client";

import React from "react";
import { StoreData, ProductData } from "./shared/types";
import { getTemplateConfig } from "@/lib/constants/templates";
import { MinimalCleanLayout } from "./minimal-clean/MinimalCleanLayout";
import { DarkGamingLayout } from "./dark-gaming/DarkGamingLayout";
import { KeynoteObsidianLayout as KeynoteObsidianLayoutNew } from "./keynote-obsidian/KeynoteObsidianLayout";
import { TokyoStreetLayout } from "./tokyo-street/TokyoStreetLayout";
import { CyberHudLayout } from "./cyber-hud/CyberHudLayout";
import { MidnightGoldLayout as MidnightGoldLayoutNew } from "./midnight-gold/MidnightGoldLayout";
import { KeynoteObsidianLayout } from "./archetypes/KeynoteObsidianLayout";
import { TokyoEditorialLayout } from "./archetypes/TokyoEditorialLayout";
import { LiveDropLayout } from "./archetypes/LiveDropLayout";
import { MidnightGoldLayout } from "./archetypes/MidnightGoldLayout";

interface TemplateRendererProps {
  store: StoreData;
  products: ProductData[];
}

export function TemplateRenderer({ store, products }: TemplateRendererProps) {
  const currentConfig = getTemplateConfig(store.templateId);
  const archetype = currentConfig.archetype || "minimal-clean";

  switch (archetype) {
    case "minimal-clean":
      return <MinimalCleanLayout store={store} products={products} isMockup={false} />;

    case "dark-gaming":
      return <DarkGamingLayout store={store} products={products} isMockup={false} />;

    case "keynote-obsidian":
      return <KeynoteObsidianLayoutNew store={store} products={products} isMockup={false} />;

    case "tokyo-street":
    case "tokyo-editorial":
      return <TokyoStreetLayout store={store} products={products} isMockup={false} />;

    case "cyber-hud":
      return <CyberHudLayout store={store} products={products} isMockup={false} />;

    case "live-drop":
      return <LiveDropLayout store={store} products={products} />;

    case "midnight-gold":
      return <MidnightGoldLayoutNew store={store} products={products} isMockup={false} />;

    case "clean-ledger":
    default:
      return <MinimalCleanLayout store={store} products={products} isMockup={false} />;
  }
}
