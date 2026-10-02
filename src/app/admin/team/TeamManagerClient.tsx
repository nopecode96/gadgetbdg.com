"use client";

import { useState } from "react";
import {
  Users,
  UserPlus,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Shield,
  User,
} from "lucide-react";
import { createStaffUserAction, deleteStaffUserAction } from "@/lib/actions";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: "STORE_OWNER" | "STORE_STAFF";
  createdAt: string;
}

interface TeamManagerClientProps {
  storeId: string;
  storeName: string;
  tier: "STARTER" | "PRO" | "ADVANCE";
  initialUsers: UserItem[];
}

const STAFF_QUOTA: Record<"STARTER" | "PRO" | "ADVANCE", number> = {
  STARTER: 1,
  PRO: 3,
  ADVANCE: 5,
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function TeamManagerClient({
  storeId,
  storeName,
  tier,
  initialUsers,
}: TeamManagerClientProps) {
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [showForm, setShowForm] = useState(false);
  const [staffName, setStaffName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const maxQuota = STAFF_QUOTA[tier];
  const currentCount = users.length;
  const isFull = currentCount >= maxQuota;
  const isStarter = tier === "STARTER";

  async function handleCreateStaff(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!staffName || !email || !password) {
      setFormError("Semua kolom wajib diisi.");
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append("storeId", storeId);
    formData.append("staffName", staffName);
    formData.append("email", email);
    formData.append("password", password);

    const res = await createStaffUserAction(formData);
    setSubmitting(false);

    if (res.success) {
      // Optimistic UI — tambahkan ke daftar
      setUsers((prev) => [
        ...prev,
        {
          id: res.userId!,
          name: staffName,
          email,
          role: "STORE_STAFF",
          createdAt: new Date().toISOString(),
        },
      ]);
      setStaffName("");
      setEmail("");
      setPassword("");
      setShowForm(false);
    } else {
      setFormError(res.error || "Gagal membuat akun staf.");
    }
  }

  async function handleDelete(user: UserItem) {
    if (!confirm(`Hapus akun staf "${user.name}" (${user.email})?`)) return;
    setDeletingId(user.id);
    const res = await deleteStaffUserAction(user.id);
    setDeletingId(null);

    if (res.success) {
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } else {
      alert(res.error || "Gagal menghapus staf.");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <span>Kelola Tim &amp; Akun Staf</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Toko: <b>{storeName}</b> · Paket <b>{tier}</b> · Kuota: {currentCount}/{maxQuota} Akun
          </p>
        </div>

        {!isStarter && !isFull && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition flex items-center gap-1.5 shadow-md"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Tambah Staf
          </button>
        )}
      </div>

      {/* Kuota Info */}
      <div className={`p-4 rounded-2xl border text-xs ${
        isStarter
          ? "bg-slate-50 border-slate-200 text-slate-600"
          : isFull
          ? "bg-amber-50 border-amber-200 text-amber-800"
          : "bg-indigo-50 border-indigo-200 text-indigo-800"
      }`}>
        <div className="flex items-center gap-2 font-bold">
          <Shield className="w-4 h-4" />
          {isStarter
            ? "Paket Starter: Hanya 1 Akun (Pemilik Toko) — Tidak bisa menambah staf kasir."
            : isFull
            ? `Kuota penuh: ${maxQuota} akun (${tier}). Upgrade tier untuk menambah lebih banyak staf.`
            : `Tersedia ${maxQuota - currentCount} slot akun lagi dari kuota ${maxQuota} (${tier}).`}
        </div>
        {isStarter && (
          <p className="mt-1 text-slate-500">Upgrade ke paket Pro untuk menambah hingga 3 akun kasir, atau Advance untuk 5 akun per cabang.</p>
        )}
      </div>

      {/* Add Staff Form */}
      {showForm && !isStarter && !isFull && (
        <form
          onSubmit={handleCreateStaff}
          className="p-5 bg-white border border-indigo-200 rounded-2xl shadow-sm space-y-4"
        >
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
            <UserPlus className="w-4 h-4 text-indigo-600" /> Buat Akun Kasir/Staf Baru
          </h3>

          {formError && (
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200 flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nama Staf *</label>
              <input
                type="text"
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                placeholder="Contoh: Ahmad Kasir"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Login *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="kasir@email.com"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 karakter"
                className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2 text-slate-400 hover:text-slate-700"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            {password.length >= 6 && (
              <p className="text-[11px] text-emerald-600 mt-0.5 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Password aman
              </p>
            )}
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 transition flex items-center gap-1.5 disabled:opacity-50"
            >
              {submitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
              Buat Akun Staf
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setFormError(null); }}
              className="px-4 py-2 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-100 transition"
            >
              Batal
            </button>
          </div>
        </form>
      )}

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[10px] border-b border-slate-200">
            <tr>
              <th className="px-5 py-3.5">Nama &amp; Email</th>
              <th className="px-5 py-3.5">Role</th>
              <th className="px-5 py-3.5">Tgl Dibuat</th>
              <th className="px-5 py-3.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50 transition">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-black shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{user.name}</div>
                      <div className="text-slate-400 text-[11px]">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      user.role === "STORE_OWNER"
                        ? "bg-indigo-100 text-indigo-800"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {user.role === "STORE_OWNER" ? (
                      <><Shield className="w-3 h-3" /> Pemilik Toko</>
                    ) : (
                      <><User className="w-3 h-3" /> Kasir / Staf</>
                    )}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-slate-400">{formatDate(user.createdAt)}</td>
                <td className="px-5 py-3.5 text-right">
                  {user.role === "STORE_STAFF" ? (
                    <button
                      onClick={() => handleDelete(user)}
                      disabled={deletingId === user.id}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition disabled:opacity-50"
                    >
                      {deletingId === user.id ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : (
                        <Trash2 className="w-3 h-3" />
                      )}
                      Hapus
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-400">Akun Utama</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
