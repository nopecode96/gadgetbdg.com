"use client";

import React from "react";
import { MinimalCleanStorefront } from "./minimal-clean/Storefront";
import { DarkGamingStorefront } from "./dark-gaming/Storefront";
import { StoreData, ProductData } from "./shared/types";

interface TemplateRendererProps {
  store: StoreData;
  products: ProductData[];
}

export function TemplateRenderer({ store, products }: TemplateRendererProps) {
  switch (store.templateId) {
    case "dark-gaming":
      return <DarkGamingStorefront store={store} products={products} />;
    case "minimal-clean":
    default:
      return <MinimalCleanStorefront store={store} products={products} />;
  }
}
