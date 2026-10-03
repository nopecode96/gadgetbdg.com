"use client";

import React from "react";
import { StoreData, ProductData } from "./shared/types";
import { getTemplateConfig } from "@/lib/constants/templates";
import { MinimalCleanLayout } from "./minimal-clean/MinimalCleanLayout";
import { DarkGamingStorefront } from "./dark-gaming/Storefront";
import { KeynoteObsidianLayout } from "./archetypes/KeynoteObsidianLayout";
import { CyberHudLayout } from "./archetypes/CyberHudLayout";
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
      return <DarkGamingStorefront store={store} products={products} />;

    case "keynote-obsidian":
      return <KeynoteObsidianLayout store={store} products={products} />;

    case "cyber-hud":
      return <CyberHudLayout store={store} products={products} />;

    case "tokyo-editorial":
      return <TokyoEditorialLayout store={store} products={products} />;

    case "live-drop":
      return <LiveDropLayout store={store} products={products} />;

    case "midnight-gold":
      return <MidnightGoldLayout store={store} products={products} />;

    case "clean-ledger":
    default:
      return <MinimalCleanLayout store={store} products={products} isMockup={false} />;
  }
}
