"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Sparkles, LayoutTemplate } from "lucide-react";
import { SocialGeneratorClient } from "@/app/admin/social-tools/SocialGeneratorClient";
import { BannerPromoManager } from "./BannerPromoManager";

const TABS = [
  {
    id: "generator",
    label: "Generator Konten & Caption",
    icon: Sparkles,
    iconColor: "text-purple-600",
  },
  {
    id: "banner",
    label: "Banner Promosi Beranda",
    icon: LayoutTemplate,
    iconColor: "text-amber-500",
  },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface MarketingTabsProps {
  store: any;
  products: any[];
}

export function MarketingTabs({ store, products }: MarketingTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const rawTab = searchParams.get("tab") as TabId | null;
  const activeTab: TabId = rawTab && TABS.some((t) => t.id === rawTab) ? rawTab : "generator";

  function setTab(id: TabId) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", id);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Marketing & Promosi</h1>
        <p className="text-xs text-slate-500 mt-1">
          Generator konten medsos, poster Story 9:16 HD, caption otomatis, dan pengaturan banner beranda toko.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl w-full sm:w-fit">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/60"
                  : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? tab.iconColor : "text-slate-400"}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "generator" && (
          <SocialGeneratorClient store={store} products={products} />
        )}
        {activeTab === "banner" && (
          <BannerPromoManager store={store} />
        )}
      </div>
    </div>
  );
}
