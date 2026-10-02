"use server";

import { prisma } from "@/lib/prisma";

export async function trackWhatsAppClickAction(productId: string, storeId: string) {
  try {
    // Log atau track intent click WA
    // Menghindari blocking operasi user, dijalankan di server action aman
    console.log(`[ANALYTICS] WhatsApp Click: Product=${productId}, Store=${storeId}, Timestamp=${new Date().toISOString()}`);

    // Jika tabel Analytics / Event log tersedia, bisa disimpan ke DB.
    // Saat ini dicatat via structured server telemetry agar cepat tanpa overhead DB blocking.
    return { success: true };
  } catch (error: any) {
    console.error("Error tracking WhatsApp click:", error);
    return { success: false };
  }
}
