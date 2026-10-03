"use client";

import { useState } from "react";
import {
  ShieldCheck,
  UserPlus,
  Trash2,
  RefreshCw,
  Mail,
  Shield,
  KeyRound,
  User,
  CheckCircle2,
  AlertCircle,
  Building,
  CreditCard,
  Hash,
} from "lucide-react";
import {
  createInternalAdminAction,
  deleteInternalAdminAction,
  InternalAdminItem,
} from "@/lib/actions/admin-management-actions";

export function AdminsManagerClient({ initialAdmins }: { initialAdmins: InternalAdminItem[] }) {
  const [admins, setAdmins] = useState<InternalAdminItem[]>(initialAdmins);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"SUPER_ADMIN" | "ADMIN_SAAS" | "SALES">("ADMIN_SAAS");
  const [referralCode, setReferralCode] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankHolder, setBankHolder] = useState("");

  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const isSalesRole = role === "SALES";

  async function handleCreateAdmin(e: React.FormEvent) {
    e.preventDefault();
    setToast(null);

    if (!name.trim() || !email.trim() || !password) {
      setToast({ type: "error", message: "Semua kolom formulir utama wajib diisi." });
      return;
    }

    if (password.length < 6) {
      setToast({ type: "error", message: "Password minimal 6 karakter." });
      return;
    }

    setIsSubmitting(true);
    const res = await createInternalAdminAction({
      name: name.trim(),
      email: email.trim(),
      password,
      role,
      referralCode: isSalesRole ? referralCode.trim() : undefined,
      bankName: isSalesRole ? bankName.trim() : undefined,
      bankAccount: isSalesRole ? bankAccount.trim() : undefined,
      bankHolder: isSalesRole ? bankHolder.trim() : undefined,
    });
    setIsSubmitting(false);

    if (res.success && res.user) {
      setToast({ type: "success", message: res.message || "Admin baru berhasil didaftarkan!" });
      setAdmins((prev) => [res.user as InternalAdminItem, ...prev]);
      setName("");
      setEmail("");
      setPassword("");
      setRole("ADMIN_SAAS");
      setReferralCode("");
      setBankName("");
      setBankAccount("");
      setBankHolder("");
    } else {
      setToast({ type: "error", message: res.error || "Gagal membuat akun admin." });
    }
  }

  async function handleDeleteAdmin(admin: InternalAdminItem) {
    const isConfirmed = window.confirm(
      `Hapus akses staf ${admin.name} (${admin.email})?\nTindakan ini akan mencabut seluruh akses dan tidak dapat dibatalkan.`
    );
    if (!isConfirmed) return;

    setLoadingId(admin.id);
    setToast(null);

    const res = await deleteInternalAdminAction(admin.id);
    setLoadingId(null);

    if (res.success) {
      setToast({ type: "success", message: res.message || "Akun berhasil dihapus." });
      setAdmins((prev) => prev.filter((a) => a.id !== admin.id));
    } else {
      setToast({ type: "error", message: res.error || "Gagal menghapus akun." });
    }
  }

  return (
    <div className="space-y-8">
      {/* Toast Alert Banner */}
      {toast && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between shadow-lg transition-all ${
            toast.type === "success"
              ? "bg-emerald-950/90 border-emerald-800 text-emerald-300"
              : "bg-rose-950/90 border-rose-800 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span>{toast.message}</span>
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-xs opacity-70 hover:opacity-100 ml-4 font-mono underline"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Header Page Title */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            INTERNAL SAAS RBAC
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> PostgreSQL Multi-Tenant Protected
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Tim Pengelola SaaS &amp; Mitra Sales
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Kelola wewenang hak akses admin internal platform, verifikator pembayaran, dan akun mitra Sales Partner.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Tambah Staf Baru */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl h-fit">
          <h2 className="font-bold text-sm text-white mb-4 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-purple-400" />
            <span>Tambah Akun Staf / Mitra Baru</span>
          </h2>

          <form onSubmit={handleCreateAdmin} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Nama Lengkap:</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Sales BEC"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Email Akun (Login):</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="budi@gadgetbdg.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Password Awal:</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Role / Tingkat Wewenang:</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="ADMIN_SAAS">ADMIN_SAAS (Verifikasi Bayar &amp; Monitoring)</option>
                <option value="SUPER_ADMIN">SUPER_ADMIN (Hak Akses Penuh Termasuk User)</option>
                <option value="SALES">SALES (Mitra Sales Partner &amp; Referral)</option>
              </select>
            </div>

            {/* Field Tambahan Khusus Sales */}
            {isSalesRole && (
              <div className="p-3.5 bg-slate-950/70 border border-purple-900/60 rounded-xl space-y-3">
                <span className="text-[11px] font-bold text-purple-400 block flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5" />
                  Informasi Mitra Sales Partner
                </span>

                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">Kode Referral Unik:</label>
                  <div className="relative">
                    <Hash className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-500" />
                    <input
                      type="text"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                      placeholder="Contoh: BUDI-BEC"
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono uppercase text-xs focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">Bank Pencairan:</label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="BCA / Mandiri"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">Nomor Rekening:</label>
                    <input
                      type="text"
                      value={bankAccount}
                      onChange={(e) => setBankAccount(e.target.value)}
                      placeholder="1234567890"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">Nama Pemilik Rekening:</label>
                  <input
                    type="text"
                    value={bankHolder}
                    onChange={(e) => setBankHolder(e.target.value)}
                    placeholder="Sesuai buku tabungan"
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl font-bold bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white transition flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 text-xs"
            >
              {isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
              <span>{isSubmitting ? "Mendaftarkan..." : "Buat Akun Staf SaaS"}</span>
            </button>
          </form>
        </div>

        {/* Tabel Daftar Pengguna Berwenang */}
        <div className="lg:col-span-2 bg-slate-800/80 border border-slate-700/80 rounded-2xl shadow-xl overflow-hidden h-fit">
          <div className="px-6 py-4 border-b border-slate-700/80 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-400" />
              <span>Daftar Pengguna Berwenang &amp; Mitra ({admins.length})</span>
            </h2>
            <span className="text-[11px] text-slate-400 font-mono">storeId: null (Platform Internal)</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-900/90 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-700">
                <tr>
                  <th className="px-5 py-3.5">Nama &amp; Email</th>
                  <th className="px-5 py-3.5">Role Wewenang</th>
                  <th className="px-5 py-3.5">Ref / Rekening</th>
                  <th className="px-5 py-3.5">Dibuat Pada</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60">
                {admins.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-slate-500">
                      Belum ada staf SaaS terdaftar.
                    </td>
                  </tr>
                ) : (
                  admins.map((adm) => {
                    const isBusy = loadingId === adm.id;
                    const isSuper = adm.role === "SUPER_ADMIN";
                    const isSales = adm.role === "SALES" || adm.role === "SALES_AGENT";

                    return (
                      <tr key={adm.id} className="hover:bg-slate-750/50 transition">
                        <td className="px-5 py-3.5">
                          <div className="font-bold text-white text-sm flex items-center gap-2.5">
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                                isSuper
                                  ? "bg-purple-950 text-purple-300 border border-purple-800"
                                  : isSales
                                  ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                                  : "bg-blue-950 text-blue-300 border border-blue-800"
                              }`}
                            >
                              {adm.name.charAt(0)}
                            </div>
                            <div>
                              <div>{adm.name}</div>
                              <div className="text-[11px] text-slate-400 font-mono font-normal">
                                {adm.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-3.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border inline-flex items-center gap-1 ${
                              isSuper
                                ? "bg-purple-950 text-purple-300 border-purple-800"
                                : isSales
                                ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                                : "bg-sky-950 text-sky-300 border-sky-800"
                            }`}
                          >
                            <Shield className="w-3 h-3" />
                            {adm.role}
                          </span>
                        </td>

                        <td className="px-5 py-3.5 text-slate-300">
                          {isSales ? (
                            <div className="space-y-0.5">
                              <span className="font-mono text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800 text-[10px]">
                                {adm.referralCode || "-"}
                              </span>
                              {adm.bankNumber && (
                                <div className="text-[10px] text-slate-400">
                                  {adm.bankName} {adm.bankNumber} ({adm.bankHolder})
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-500 font-mono">–</span>
                          )}
                        </td>

                        <td className="px-5 py-3.5 text-slate-400 font-mono text-[11px]">
                          {new Date(adm.createdAt).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>

                        <td className="px-5 py-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteAdmin(adm)}
                            disabled={isBusy}
                            className="p-2 rounded-lg bg-slate-700/60 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 border border-slate-600 transition disabled:opacity-50"
                            title="Cabut Akses Staf / Hapus Akun"
                          >
                            {isBusy ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
