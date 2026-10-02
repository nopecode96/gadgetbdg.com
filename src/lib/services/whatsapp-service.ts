/**
 * WhatsApp Gateway Service
 * Mengirim pesan WhatsApp via HTTP Gateway (Fonnte, Wablas, atau gateway kompatibel)
 */

export interface SendWhatsAppParams {
  target: string;
  message: string;
}

export interface SendWhatsAppResult {
  success: boolean;
  error?: string;
  response?: any;
}

/**
 * Sanitasi nomor WhatsApp ke format internasional (misal: 0812xxx atau +628xxx -> 628xxx)
 */
export function sanitizeWhatsAppNumber(target: string): string {
  if (!target) return "";
  let cleaned = target.replace(/[^0-9]/g, "");

  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.slice(1);
  } else if (cleaned.startsWith("+62")) {
    cleaned = cleaned.slice(1);
  } else if (!cleaned.startsWith("62") && cleaned.length >= 9) {
    cleaned = "62" + cleaned;
  }

  return cleaned;
}

/**
 * Kirim notifikasi pesan WhatsApp
 */
export async function sendWhatsAppMessage({
  target,
  message,
}: SendWhatsAppParams): Promise<SendWhatsAppResult> {
  const cleanTarget = sanitizeWhatsAppNumber(target);

  if (!cleanTarget) {
    return { success: false, error: "Nomor tujuan WhatsApp tidak valid." };
  }

  const gatewayUrl = process.env.WHATSAPP_GATEWAY_URL || "https://api.fonnte.com/send";
  const gatewayToken = process.env.WHATSAPP_GATEWAY_TOKEN;

  // Graceful fallback jika token belum diset
  if (!gatewayToken) {
    console.info(
      `[WhatsApp Gateway Service] WHATSAPP_GATEWAY_TOKEN belum dikonfigurasi di .env.\n` +
      `Simulasi Pengiriman ke ${cleanTarget}:\n${message}\n------------------------`
    );
    return {
      success: true,
      error: "Token gateway belum dikonfigurasi (pesan disimulasikan di server log).",
    };
  }

  try {
    const formData = new URLSearchParams();
    formData.append("target", cleanTarget);
    formData.append("message", message);
    formData.append("countryCode", "62");

    const response = await fetch(gatewayUrl, {
      method: "POST",
      headers: {
        Authorization: gatewayToken,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
      // Timeout 10 detik agar tidak menggantung thread server
      signal: AbortSignal.timeout(10000),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      console.warn(`[WhatsApp Gateway] Response HTTP ${response.status}:`, data);
      return {
        success: false,
        error: `HTTP ${response.status}: ${data?.reason || data?.message || "Gagal mengirim WA"}`,
      };
    }

    console.info(`[WhatsApp Gateway] Pesan berhasil dikirim ke ${cleanTarget}`);
    return { success: true, response: data };
  } catch (err: any) {
    console.error("[WhatsApp Gateway Service Exception]:", err?.message || err);
    return { success: false, error: err?.message || "Kesalahan jaringan WhatsApp gateway." };
  }
}
