/**
 * Helper to resolve Tailwind/Hex class to a valid Hex/RGB color string for PWA manifest & browser theme
 */
export function resolveHexColor(colorClass: string | undefined, fallback: string): string {
  if (!colorClass) return fallback;
  // If already hex
  if (colorClass.startsWith("#")) return colorClass;
  // If tailwind class with bracket like bg-[#09090b] or text-[#1c1a17]
  const hexMatch = colorClass.match(/#([0-9a-fA-F]{3,8})/);
  if (hexMatch) return `#${hexMatch[1]}`;

  // Common Tailwind color mapping
  const lower = colorClass.toLowerCase();
  if (lower.includes("slate-50")) return "#f8fafc";
  if (lower.includes("slate-900")) return "#0f172a";
  if (lower.includes("slate-800")) return "#1e293b";
  if (lower.includes("zinc-900")) return "#18181b";
  if (lower.includes("black")) return "#000000";
  if (lower.includes("white")) return "#ffffff";
  if (lower.includes("cyan-500")) return "#06b6d4";
  if (lower.includes("cyan-400")) return "#22d3ee";
  if (lower.includes("amber-400")) return "#fbbf24";
  if (lower.includes("amber-500")) return "#f59e0b";
  if (lower.includes("red-500")) return "#ef4444";

  return fallback;
}
