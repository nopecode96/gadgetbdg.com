"use client";

import React, { useState } from "react";
import { StoreData, ProductData, StoreTabType } from "../shared/types";
import { StoreShell } from "../shared/StoreShell";
import { StoreHomeView } from "../shared/StoreHomeView";
import { StoreListView } from "../shared/StoreListView";
import { StoreTradeInView } from "../shared/StoreTradeInView";
import { StoreAboutView } from "../shared/StoreAboutView";

interface StorefrontProps {
  store: StoreData;
  products: ProductData[];
}

export function MinimalCleanStorefront({ store, products }: StorefrontProps) {
  const [activeTab, setActiveTab] = useState<StoreTabType>("home");
  const [selectedBrand, setSelectedBrand] = useState<string>("ALL");

  return (
    <StoreShell
      store={store}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      theme="minimal-clean"
    >
      {activeTab === "home" && (
        <StoreHomeView
          store={store}
          products={products}
          onNavigateTab={setActiveTab}
          onSelectBrand={setSelectedBrand}
          theme="minimal-clean"
        />
      )}

      {activeTab === "list" && (
        <StoreListView
          store={store}
          products={products}
          selectedBrand={selectedBrand}
          onBrandChange={setSelectedBrand}
          theme="minimal-clean"
        />
      )}

      {activeTab === "trade-in" && (
        <StoreTradeInView store={store} theme="minimal-clean" />
      )}

      {activeTab === "about" && (
        <StoreAboutView store={store} theme="minimal-clean" />
      )}
    </StoreShell>
  );
}
