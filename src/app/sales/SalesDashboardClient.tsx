"use client";

import { useState } from "react";
import {
  Users,
  Copy,
  Check,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  Store,
  CreditCard,
  Building,
  Edit3,
  ExternalLink,
  ShieldCheck,
  LogOut,
  Sparkles,
  BellRing,
  AlertTriangle,
} from "lucide-react";
import { updateSalesBankDetailsAction } from "@/lib/actions/sales-actions";
import { logoutAction } from "@/lib/actions/login-actions";

export interface RecruitedStore {
  id: string;
  name: string;
  slug: string;
  tier: string;
  isActive: boolean;
  whatsapp: string;
  subscriptionStartedAt?: string | null;
  subscriptionExpiresAt?: string | null;
  createdAt: string;
  monthlyCommission: number;
}

export interface SalesCommissionItem {
  id: string;
  storeName: string;
  storeSlug: string;
  tier: string;
  amount: number;
  status: "PENDING" | "PAID" | "CANCELLED";
  period: string;
  createdAt: string;
  paidAt: string | null;
}

export interface SalesPartnerProfile {
  id: string;
  name: string;
  code: string;
  phone: string;
  email: string;
  bankName: string | null;
  bankAccount: string | null;
  bankHolder: string | null;
}

function formatRupiah(n: number) {
  return "Rp " + Math.round(n).toLocaleString("id-ID");
}

export function SalesDashboardClient({
  profile,
  stores,
  commissions,
}: {
  profile: SalesPartnerProfile;
  stores: RecruitedStore[];
  commissions: SalesCommissionItem[];
}) {
  const [copied, setCopied] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [bankName, setBankName] = useState(profile.bankName || "");
  const [bankAccount, setBankAccount] = useState(profile.bankAccount || "");
  const [bankHolder, setBankHolder] = useState(profile.bankHolder || "");
  const [isSavingBank, setIsSavingBank] = useState(false);
  const [bankMsg, setBankMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Bank display info
  const [currentBank, setCurrentBank] = useState({
    bankName: profile.bankName,
    bankAccount: profile.bankAccount,
    bankHolder: profile.bankHolder,
  });

  const referralLink = `https://gadgetbdg.com?ref=${profile.code}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // KPI Calculations
  const activeStores = stores.filter((s) => s.isActive);
  const activeStoresCount = activeStores.length;

  const pendingCommissions = commissions.filter((c) => c.status === "PENDING");
  const paidCommissions = commissions.filter((c) => c.status === "PAID");

  const totalPendingAmount = pendingCommissions.reduce((sum, c) => sum + c.amount, 0);
  const totalPaidAmount = paidCommissions.reduce((sum, c) => sum + c.amount, 0);

  // Estimasi komisi bulan depan dari active stores
  const nextMonthEstimate = activeStores.reduce((sum, s) => sum + s.monthlyCommission, 0);

  // Toko yang perlu diperpanjang (< 7 Hari atau sudah expired)
  const now = new Date();
  const renewingStores = stores.filter((s) => {
    if (!s.subscriptionExpiresAt) return false;
    const exp = new Date(s.subscriptionExpiresAt);
    const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > -30; // 7 hari sebelum expired atau baru expired < 30 hari
  });
  const renewingCommissionTotal = renewingStores.reduce((sum, s) => sum + s.monthlyCommission, 0);

  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingBank(true);
    setBankMsg(null);

    const res = await updateSalesBankDetailsAction({
      bankName,
      bankAccount,
      bankHolder,
    });

    setIsSavingBank(false);
    if (res.success && res.partner) {
      setCurrentBank({
        bankName: res.partner.bankName,
        bankAccount: res.partner.bankAccount,
        bankHolder: res.partner.bankHolder,
      });
      setBankMsg({ type: "success", text: "Rekening bank berhasil disimpan!" });
      setTimeout(() => {
        setIsBankModalOpen(false);
        setBankMsg(null);
      }, 1500);
    } else {
      setBankMsg({ type: "error", text: res.error || "Gagal menyimpan rekening." });
    }
  };

  return (
    <div className="space-y-8">
      {/* ── Top Navigation Bar ──────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              SALES PARTNER PORTAL
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Data Terisolasi &amp; Terenkripsi
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Dashboard Partner: {profile.name}
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Kelola referral toko mitra konter HP, pantau aktivasi, dan transparansi pencairan komisi bulanan Anda.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              Keluar
            </button>
          </form>
        </div>
      </div>

      {/* ── Partner Profile & Referral Header Card ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Referral Link & Code Box */}
        <div className="lg:col-span-2 bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-900 border border-blue-500/20 rounded-2xl p-6 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400">
                Kode Referral Resmi
              </span>
              <div className="text-2xl font-black text-white font-mono tracking-wider flex items-center gap-2 mt-0.5">
                {profile.code}
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-sans font-medium border border-emerald-500/30">
                  Aktif
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Email Login</span>
              <div className="text-sm font-medium text-slate-200">{profile.email}</div>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed mb-4">
            Bagikan tautan referral ini ke pemilik konter HP di BEC, ITC, atau luar Bandung. Setiap toko yang mendaftar dan berlangganan akan otomatis diatribusikan ke komisi Anda.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch gap-2">
            <div className="flex-1 bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-2.5 font-mono text-xs text-blue-300 flex items-center overflow-x-auto whitespace-nowrap">
              {referralLink}
            </div>
            <button
              onClick={copyToClipboard}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Salin Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Bank Account Info Card */}
        <div className="bg-slate-850 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                <CreditCard className="w-4 h-4 text-amber-400" />
                Rekening Pencairan
              </div>
              <button
                onClick={() => setIsBankModalOpen(true)}
                className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-medium transition"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Ubah
              </button>
            </div>

            {currentBank.bankAccount ? (
              <div className="space-y-2 mt-2 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Bank</span>
                  <span className="text-xs font-bold text-white uppercase">{currentBank.bankName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">No. Rekening</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">{currentBank.bankAccount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Atas Nama</span>
                  <span className="text-xs font-semibold text-slate-200">{currentBank.bankHolder}</span>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl text-center mt-2">
                <p className="text-xs text-amber-300 mb-3">
                  Rekening transfer belum diatur. Lengkapi untuk mempermudah transfer Super Admin.
                </p>
                <button
                  onClick={() => setIsBankModalOpen(true)}
                  className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold rounded-lg transition"
                >
                  Isi Rekening Sekarang
                </button>
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-400 pt-3 mt-3 border-t border-slate-800/80 flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-slate-400" />
            Transfer komisi diproses berkala oleh Super Admin SaaS.
          </div>
        </div>
      </div>

      {/* ── KPI 4 Stat Cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Stores */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 font-semibold uppercase">Toko Klien Aktif</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Store className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">{activeStoresCount}</span>
            <span className="text-xs text-slate-400">/ {stores.length} toko terdaftar</span>
          </div>
          <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Berlangganan aktif
          </div>
        </div>

        {/* Card 2: Pending Commission */}
        <div className="bg-slate-900/90 border border-amber-500/20 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-amber-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-amber-300/80 font-semibold uppercase">Komisi Menunggu Transfer</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-amber-400 font-mono tracking-tight">
              {formatRupiah(totalPendingAmount)}
            </div>
            <div className="text-xs text-slate-400 mt-1">{pendingCommissions.length} transaksi pending</div>
          </div>
          <div className="mt-2 text-[11px] text-amber-300/70">
            Diproses setelah verifikasi pembayaran
          </div>
        </div>

        {/* Card 3: Paid Commission */}
        <div className="bg-slate-900/90 border border-emerald-500/20 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-emerald-400/80 font-semibold uppercase">Komisi Lunas Ditransfer</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-emerald-400 font-mono tracking-tight">
              {formatRupiah(totalPaidAmount)}
            </div>
            <div className="text-xs text-slate-400 mt-1">{paidCommissions.length} kali pencairan berhasil</div>
          </div>
          <div className="mt-2 text-[11px] text-emerald-400/70">
            Sudah masuk rekening Anda
          </div>
        </div>

        {/* Card 4: Next Month Estimate */}
        <div className="bg-slate-900/90 border border-indigo-500/20 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-indigo-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-indigo-300/80 font-semibold uppercase">Estimasi Bulan Depan</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-indigo-300 font-mono tracking-tight">
              {formatRupiah(nextMonthEstimate)}
            </div>
            <div className="text-xs text-slate-400 mt-1">Dari perpanjangan toko aktif</div>
          </div>
          <div className="mt-2 text-[11px] text-indigo-300/70">
            Starter Rp 50rb • Pro Rp 100rb • Adv Rp 150rb
          </div>
        </div>
      </div>

      {/* ── Section Khusus: Klien Perlu Diperpanjang (< 7 Hari) ────── */}
      <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl shadow-xl overflow-hidden relative">
        <div className="px-6 py-5 border-b border-slate-800 bg-amber-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <BellRing className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Klien Perlu Diperpanjang (&le; 7 Hari)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {renewingStores.length} Klien
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Toko binaan Anda yang akan habis masa berlakunya. Follow-up segera agar komisi perpanjangan bulanan tetap mengalir!
              </p>
            </div>
          </div>

          <div className="text-right sm:border-l sm:border-slate-800 sm:pl-6">
            <span className="text-[11px] uppercase font-mono text-slate-400 font-semibold block">
              Potensi Komisi Cair:
            </span>
            <span className="text-lg font-black text-emerald-400 font-mono">
              {formatRupiah(renewingCommissionTotal)}
            </span>
          </div>
        </div>

        <div className="p-6">
          {renewingStores.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500/80" />
              Semua toko binaan Anda memiliki masa aktif aman (&gt; 7 hari). Tidak ada tagihan mendesak saat ini.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {renewingStores.map((s) => {
                const expDate = new Date(s.subscriptionExpiresAt!);
                const diffDays = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                const cleanPhone = s.whatsapp.replace(/\D/g, "");
                const expFormatted = expDate.toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });

                const followUpMsg = encodeURIComponent(
                  `Halo Bos/Kakak dari *${s.name}*! 👋\n\n` +
                    `Saya *${profile.name}* (Sales Partner resmi GadgetBdg).\n\n` +
                    `Mau infoin nih, paket langganan SaaS toko *${s.name}* (${s.tier}) ` +
                    (diffDays <= 0
                      ? `sudah kedaluwarsa sejak *${expFormatted}*.`
                      : `akan segera berakhir dalam *${diffDays} hari lagi* (jatuh tempo *${expFormatted}*).`) +
                    `\n\nAgar website katalog & etalase online tetap aktif melayani pembeli di WhatsApp tanpa gangguan, yuk segera perpanjang langganannya ya Bos!\n\n` +
                    `Kalau ada kendala atau butuh bantuan pembayaran, bisa langsung balas pesan ini ya. Salam sukses selalu! 🚀`
                );

                return (
                  <div
                    key={s.id}
                    className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-white text-sm leading-tight">{s.name}</div>
                          <div className="text-[11px] font-mono text-slate-400">{s.slug}.gadgetbdg.com</div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full font-mono font-bold text-[10px] bg-slate-800 text-slate-200 border border-slate-700">
                          {s.tier}
                        </span>
                      </div>

                      <div className="mt-3 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Jatuh Tempo:</span>
                          <span className="font-mono text-slate-200">{expFormatted}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Sisa Waktu:</span>
                          <span
                            className={`font-bold font-mono ${
                              diffDays <= 0 ? "text-red-400" : "text-amber-400"
                            }`}
                          >
                            {diffDays <= 0 ? `Lewat ${Math.abs(diffDays)} hari` : `${diffDays} hari lagi`}
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                          <span className="text-slate-400">Komisi Sales:</span>
                          <span className="font-mono font-bold text-emerald-400">
                            {formatRupiah(s.monthlyCommission)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80">
                      {cleanPhone ? (
                        <a
                          href={`https://wa.me/${cleanPhone}?text=${followUpMsg}`}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 font-bold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition"
                        >
                          <BellRing className="w-3.5 h-3.5 text-emerald-400" />
                          Follow-up Klien (WA)
                        </a>
                      ) : (
                        <span className="text-[11px] text-slate-500 text-center block">
                          No WhatsApp belum terdaftar
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Table 1: Toko yang Direkrut ─────────────────────────── */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              Daftar Toko Mitra Rekrutan ({stores.length})
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Toko konter HP yang mendaftar menggunakan referral Anda ({profile.code}).
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Nama Toko &amp; Slug</th>
                <th className="px-6 py-3.5">Paket Langganan</th>
                <th className="px-6 py-3.5">Status Toko</th>
                <th className="px-6 py-3.5">Potensi Komisi / Bln</th>
                <th className="px-6 py-3.5">WhatsApp</th>
                <th className="px-6 py-3.5">Tanggal Daftar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {stores.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <Store className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                    Belum ada toko yang mendaftar dengan kode referral Anda.
                    <br />
                    Bagikan tautan referral untuk mulai mendapatkan komisi!
                  </td>
                </tr>
              ) : (
                stores.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white text-sm">{s.name}</div>
                      <div className="text-[11px] font-mono text-slate-400">{s.slug}.gadgetbdg.com</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-0.5 rounded-full font-mono font-bold text-[10px] bg-slate-800 text-slate-200 border border-slate-700">
                        {s.tier}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {s.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/80">
                          <CheckCircle2 className="w-3 h-3" /> Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/80 text-amber-400 border border-amber-800/80">
                          <Clock className="w-3 h-3" /> Menunggu Tagihan
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-blue-400">
                      {formatRupiah(s.monthlyCommission)}
                    </td>
                    <td className="px-6 py-4 text-slate-300 font-mono">
                      {s.whatsapp || "-"}
                    </td>
                    <td className="px-6 py-4 text-slate-400 font-mono text-[11px]">
                      {new Date(s.createdAt).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Table 2: Riwayat Komisi (Read-Only for Sales) ──────── */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Catatan &amp; Transparansi Komisi ({commissions.length})
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Setiap pembayaran paket toko yang disetujui Super Admin otomatis masuk ke catatan ini.
            </p>
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Transparansi Real-Time
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Toko Mitra</th>
                <th className="px-6 py-3.5">Paket</th>
                <th className="px-6 py-3.5">Periode</th>
                <th className="px-6 py-3.5">Nominal Komisi</th>
                <th className="px-6 py-3.5">Status Pencairan</th>
                <th className="px-6 py-3.5">Tanggal Dibuat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {commissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <Clock className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                    Belum ada riwayat komisi. Komisi akan otomatis terbit saat pembayaran langganan toko disetujui.
                  </td>
                </tr>
              ) : (
                commissions.map((comm) => (
                  <tr key={comm.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white text-sm">{comm.storeName}</div>
                      <div className="text-[11px] font-mono text-slate-400">{comm.storeSlug}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-0.5 rounded-full font-mono font-bold text-[10px] bg-slate-800 text-slate-200 border border-slate-700">
                        {comm.tier}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-300">
                      {comm.period}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-emerald-400 text-sm">
                      {formatRupiah(comm.amount)}
                    </td>
                    <td className="px-6 py-4">
                      {comm.status === "PAID" ? (
                        <div>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                            <CheckCircle2 className="w-3 h-3" /> Lunas Ditransfer
                          </span>
                          {comm.paidAt && (
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              Tgl: {new Date(comm.paidAt).toLocaleDateString("id-ID")}
                            </div>
                          )}
                        </div>
                      ) : comm.status === "CANCELLED" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-950/80 text-rose-400 border border-rose-800">
                          Dibatalkan
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/80 text-amber-400 border border-amber-800">
                          <Clock className="w-3 h-3" /> Menunggu Transfer
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-400 font-mono text-[11px]">
                      {new Date(comm.createdAt).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal Edit Rekening Bank ────────────────────────────── */}
      {isBankModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-400" />
              Pengaturan Rekening Transfer
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Informasi ini digunakan oleh Super Admin untuk mentransfer komisi referral Anda.
            </p>

            {bankMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold mb-4 ${
                  bankMsg.type === "success"
                    ? "bg-emerald-950/80 border border-emerald-800 text-emerald-300"
                    : "bg-rose-950/80 border border-rose-800 text-rose-300"
                }`}
              >
                {bankMsg.text}
              </div>
            )}

            <form onSubmit={handleSaveBank} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nama Bank / E-Wallet
                </label>
                <input
                  type="text"
                  placeholder="Contoh: BCA, Mandiri, BRI, BNI, GoPay, OVO"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nomor Rekening / Akun
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 1234567890"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nama Pemilik Rekening (Sesuai Buku Tabungan)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Andi Permana"
                  value={bankHolder}
                  onChange={(e) => setBankHolder(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsBankModalOpen(false)}
                  disabled={isSavingBank}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingBank}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-blue-500/20"
                >
                  {isSavingBank ? "Menyimpan..." : "Simpan Rekening"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
