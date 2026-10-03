"use client";
 
import React from "react";
import { StoreData, ProductData } from "../shared/types";
import { MinimalCleanLayout } from "./MinimalCleanLayout";

interface StorefrontProps {
  store: StoreData;
  products: ProductData[];
  isMockup?: boolean;
}

export function MinimalCleanStorefront({ store, products, isMockup = false }: StorefrontProps) {
  return <MinimalCleanLayout store={store} products={products} isMockup={isMockup} />;
}

