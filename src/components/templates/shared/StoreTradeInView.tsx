"use client";

import React from "react";
import { StoreData, ProductData } from "./types";
import { TradeInForm } from "./TradeInForm";

interface StoreTradeInViewProps {
  store: StoreData;
  availableProducts?: ProductData[];
  products?: ProductData[];
  theme?: string;
  isMockup?: boolean;
}

export function StoreTradeInView({
  store,
  availableProducts = [],
  products = [],
  theme,
  isMockup = false,
}: StoreTradeInViewProps) {
  const mergedProducts = availableProducts.length > 0 ? availableProducts : products;

  return (
    <TradeInForm
      store={store}
      availableProducts={mergedProducts}
      theme={theme}
      isMockup={isMockup}
    />
  );
}
