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

export function DarkGamingStorefront({ store, products }: StorefrontProps) {
  const [activeTab, setActiveTab] = useState<StoreTabType>("home");
  const [selectedBrand, setSelectedBrand] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua Unit");

  return (
    <StoreShell
      store={store}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      theme="dark-gaming"
    >
      {activeTab === "home" && (
        <StoreHomeView
          store={store}
          products={products}
          onNavigateTab={setActiveTab}
          onSelectBrand={setSelectedBrand}
          onSelectCategoryFilter={(filter) => {
            if (filter.category) setSelectedCategory(filter.category);
          }}
          theme="dark-gaming"
        />
      )}

      {activeTab === "list" && (
        <StoreListView
          store={store}
          products={products}
          selectedBrand={selectedBrand}
          onBrandChange={setSelectedBrand}
          initialCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          theme="dark-gaming"
        />
      )}

      {activeTab === "trade-in" && (
        <StoreTradeInView store={store} theme="dark-gaming" />
      )}

      {activeTab === "about" && (
        <StoreAboutView store={store} theme="dark-gaming" />
      )}
    </StoreShell>
  );
}
