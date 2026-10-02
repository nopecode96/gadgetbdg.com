"use client";

import React from "react";
import { StoreData, ProductData } from "./shared/types";
import { getTemplateConfig } from "@/lib/constants/templates";
import { KeynoteObsidianLayout } from "./archetypes/KeynoteObsidianLayout";
import { CyberHudLayout } from "./archetypes/CyberHudLayout";
import { TokyoEditorialLayout } from "./archetypes/TokyoEditorialLayout";
import { LiveDropLayout } from "./archetypes/LiveDropLayout";
import { MidnightGoldLayout } from "./archetypes/MidnightGoldLayout";
import { CleanLedgerLayout } from "./archetypes/CleanLedgerLayout";

interface TemplateRendererProps {
  store: StoreData;
  products: ProductData[];
}

export function TemplateRenderer({ store, products }: TemplateRendererProps) {
  const currentConfig = getTemplateConfig(store.templateId);
  const archetype = currentConfig.archetype || "clean-ledger";

  switch (archetype) {
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
      return <CleanLedgerLayout store={store} products={products} />;
  }
}
