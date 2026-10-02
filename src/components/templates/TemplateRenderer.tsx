"use client";

import React, { useState } from "react";
import { StoreData, ProductData, StoreTabType } from "./shared/types";
import { StoreShell } from "./shared/StoreShell";
import { StoreHomeView } from "./shared/StoreHomeView";
import { StoreListView } from "./shared/StoreListView";
import { StoreTradeInView } from "./shared/StoreTradeInView";
import { StoreAboutView } from "./shared/StoreAboutView";

interface TemplateRendererProps {
  store: StoreData;
  products: ProductData[];
}

export function TemplateRenderer({ store, products }: TemplateRendererProps) {
  const [activeTab, setActiveTab] = useState<StoreTabType>("home");
  const [selectedBrand, setSelectedBrand] = useState<string>("ALL");

  const currentThemeId = store.templateId || "minimal-clean";

  return (
    <StoreShell
      store={store}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      theme={currentThemeId}
    >
      {activeTab === "home" && (
        <StoreHomeView
          store={store}
          products={products}
          onNavigateTab={setActiveTab}
          onSelectBrand={setSelectedBrand}
          theme={currentThemeId}
        />
      )}

      {activeTab === "list" && (
        <StoreListView
          store={store}
          products={products}
          selectedBrand={selectedBrand}
          onBrandChange={setSelectedBrand}
          theme={currentThemeId}
        />
      )}

      {activeTab === "trade-in" && (
        <StoreTradeInView store={store} theme={currentThemeId} />
      )}

      {activeTab === "about" && (
        <StoreAboutView store={store} theme={currentThemeId} />
      )}
    </StoreShell>
  );
}
