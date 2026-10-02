"use server";

import { prisma } from "@/lib/prisma";

export async function trackWhatsAppClickAction(productId: string, storeId: string) {
  try {
    console.log(`[ANALYTICS] WhatsApp Click: Product=${productId}, Store=${storeId}, Timestamp=${new Date().toISOString()}`);

    if (productId) {
      await prisma.product.update({
        where: { id: productId },
        data: {
          clickCount: {
            increment: 1,
          },
        },
      }).catch((err) => {
        // Fallback jika id tidak match tanpa error meledak
        console.warn("Could not increment clickCount:", err?.message);
      });
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error tracking WhatsApp click:", error);
    return { success: false };
  }
}
