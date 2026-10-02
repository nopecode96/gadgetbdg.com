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
} from "lucide-react";
import { createSaasStaffAction, deleteSaasStaffAction } from "@/lib/actions";

interface SaasAdminUser {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN_SAAS";
  createdAt: string;
}

export function AdminsManagerClient({ initialAdmins }: { initialAdmins: SaasAdminUser[] }) {
  const [admins, setAdmins] = useState<SaasAdminUser[]>(initialAdmins);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"SUPER_ADMIN" | "ADMIN_SAAS">("ADMIN_SAAS");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  async function handleCreateAdmin(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!name || !email || !password) {
      setErrorMsg("Semua kolom formulir wajib diisi.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password minimal 6 karakter.");
      return;
    }

    setIsSubmitting(true);
    const res = await createSaasStaffAction({ name, email, password, role });
    setIsSubmitting(false);

    if (res.success && res.user) {
      setSuccessMsg(res.message || "Admin baru berhasil didaftarkan!");
      setAdmins((prev) => [res.user as SaasAdminUser, ...prev]);
      setName("");
      setEmail("");
      setPassword("");
      setRole("ADMIN_SAAS");
    } else {
      setErrorMsg(res.error || "Gagal membuat akun admin.");
    }
  }

  async function handleDeleteAdmin(admin: SaasAdminUser) {
    if (
      !confirm(
        `Yakin ingin menghapus akses internal untuk ${admin.name} (${admin.email})?\nTindakan ini tidak dapat dibatalkan.`
      )
    ) {
      return;
    }

    setLoadingId(admin.id);
    const res = await deleteSaasStaffAction(admin.id);
    setLoadingId(null);

    if (res.success) {
      setAdmins((prev) => prev.filter((a) => a.id !== admin.id));
    } else {
      alert(res.error || "Gagal menghapus admin.");
    }
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <span>Tim Internal Platform SaaS</span>
          <span className="text-xs font-mono bg-purple-950 text-purple-400 px-2.5 py-0.5 rounded-full border border-purple-800">
            {admins.length} Personel
          </span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Kelola hak akses operator platform GadgetBdg.com: Super Admin (Akses Penuh) &amp; Admin SaaS (Operasional &amp; Billing).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Tambah Admin */}
        <div className="lg:col-span-1 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-sm space-y-4 h-fit">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-700/60 text-white font-bold text-sm">
            <UserPlus className="w-4 h-4 text-indigo-400" />
            <span>Tambah Tim Pengelola SaaS</span>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-xs text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-xs text-emerald-300 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleCreateAdmin} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Nama Lengkap:</label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Misal: Budi Operasional"
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Email Kredensial:</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@gadgetbdg.com"
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Kata Sandi Awal:</label>
              <div className="relative">
                <KeyRound className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Role / Tingkat Wewenang:</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ADMIN_SAAS">ADMIN_SAAS (Verifikasi Bayar &amp; Monitoring)</option>
                <option value="SUPER_ADMIN">SUPER_ADMIN (Hak Akses Penuh Termasuk User)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold transition flex items-center justify-center gap-2 shadow-md shadow-indigo-600/30"
            >
              {isSubmitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              <span>Buat Akun Staf SaaS</span>
            </button>
          </form>
        </div>

        {/* Tabel Tim Admin */}
        <div className="lg:col-span-2 bg-slate-800/80 border border-slate-700/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-700 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>Daftar Pengguna Berwenang</span>
            </h2>
            <span className="text-[11px] text-slate-400 font-mono">storeId: null (Internal)</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-900/90 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-700">
                <tr>
                  <th className="px-5 py-3">Nama &amp; Email</th>
                  <th className="px-5 py-3">Role Wewenang</th>
                  <th className="px-5 py-3">Dibuat Pada</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60">
                {admins.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-slate-500">
                      Belum ada staf SaaS terdaftar.
                    </td>
                  </tr>
                ) : (
                  admins.map((adm) => {
                    const isLoading = loadingId === adm.id;
                    const isSuper = adm.role === "SUPER_ADMIN";

                    return (
                      <tr key={adm.id} className="hover:bg-slate-750/50 transition">
                        <td className="px-5 py-3.5">
                          <div className="font-bold text-white text-sm flex items-center gap-2">
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                                isSuper
                                  ? "bg-purple-950 text-purple-300 border border-purple-800"
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
                                : "bg-sky-950 text-sky-300 border-sky-800"
                            }`}
                          >
                            <Shield className="w-3 h-3" />
                            {adm.role}
                          </span>
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
                            onClick={() => handleDeleteAdmin(adm)}
                            disabled={isLoading}
                            className="p-1.5 rounded-lg bg-slate-700/60 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 border border-slate-600 transition disabled:opacity-50"
                            title="Cabut Akses Admin"
                          >
                            {isLoading ? (
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
