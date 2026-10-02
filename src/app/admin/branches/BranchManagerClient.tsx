"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Phone,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Lock,
  ArrowRight,
  Store,
} from "lucide-react";
import {
  createBranchAction,
  updateBranchAction,
  deleteBranchAction,
  BranchData,
} from "@/lib/actions/branch-actions";

interface BranchManagerClientProps {
  store: {
    id: string;
    name: string;
    slug: string;
    tier: string;
    address: string | null;
  };
  initialBranches: BranchData[];
}

export function BranchManagerClient({ store, initialBranches }: BranchManagerClientProps) {
  const [branches, setBranches] = useState<BranchData[]>(initialBranches);
  const [showModal, setShowModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<BranchData | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [mapsUrl, setMapsUrl] = useState("");
  const [isMain, setIsMain] = useState(false);

  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isAdvance = store.tier === "ADVANCE";

  function openCreateModal() {
    setEditingBranch(null);
    setName("");
    setAddress("");
    setPhone("");
    setMapsUrl("");
    setIsMain(branches.length === 0);
    setErrorMsg(null);
    setShowModal(true);
  }

  function openEditModal(branch: BranchData) {
    setEditingBranch(branch);
    setName(branch.name);
    setAddress(branch.address);
    setPhone(branch.phone || "");
    setMapsUrl(branch.mapsUrl || "");
    setIsMain(branch.isMain);
    setErrorMsg(null);
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !address.trim()) {
      setErrorMsg("Nama cabang dan alamat wajib diisi.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    if (editingBranch) {
      // Edit Branch
      const res = await updateBranchAction(editingBranch.id, {
        name,
        address,
        phone: phone || undefined,
        mapsUrl: mapsUrl || undefined,
        isMain,
      });

      setLoading(false);
      if (res.success && res.branch) {
        setBranches((prev) =>
          prev.map((b) => {
            if (b.id === editingBranch.id) {
              return { ...res.branch, _count: b._count };
            }
            if (isMain && b.id !== editingBranch.id) {
              return { ...b, isMain: false };
            }
            return b;
          })
        );
        setShowModal(false);
      } else {
        setErrorMsg(res.error || "Gagal memperbarui cabang.");
      }
    } else {
      // Create Branch
      const res = await createBranchAction({
        name,
        address,
        phone: phone || undefined,
        mapsUrl: mapsUrl || undefined,
        isMain,
      });

      setLoading(false);
      if (res.success && res.branch) {
        const newBranch = { ...res.branch, _count: { products: 0, users: 0 } };
        setBranches((prev) => {
          if (newBranch.isMain) {
            return [newBranch, ...prev.map((b) => ({ ...b, isMain: false }))];
          }
          return [...prev, newBranch];
        });
        setShowModal(false);
      } else {
        setErrorMsg(res.error || "Gagal membuat cabang baru.");
      }
    }
  }

  async function handleDelete(branch: BranchData) {
    if (branch.isMain && branches.length > 1) {
      alert("Cabang ini adalah Cabang Utama. Jadikan cabang lain sebagai Cabang Utama sebelum menghapus.");
      return;
    }

    if (!confirm(`Hapus cabang "${branch.name}"? Unit HP dan staf yang tertaut akan dialihkan.`)) {
      return;
    }

    setDeletingId(branch.id);
    const res = await deleteBranchAction(branch.id);
    setDeletingId(null);

    if (res.success) {
      setBranches((prev) => prev.filter((b) => b.id !== branch.id));
    } else {
      alert(res.error || "Gagal menghapus cabang.");
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <span>Kelola Multi-Cabang (Branch Management)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kelola lokasi fisik toko, titik COD, penugasan staf kasir, dan alokasi stok per cabang.
          </p>
        </div>

        {isAdvance && (
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Cabang Baru</span>
          </button>
        )}
      </div>

      {/* ── Locked Banner for Starter / Pro ── */}
      {!isAdvance && (
        <div className="bg-linear-to-r from-amber-500/10 via-orange-500/10 to-blue-500/10 border border-amber-200 rounded-2xl p-6 relative overflow-hidden">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-white">
              <Lock className="w-3.5 h-3.5" />
              <span>Fitur Eksklusif Paket Advance</span>
            </div>
            <h2 className="text-lg font-black text-slate-900">
              Punya Lebih dari 1 Konter HP / Titik COD di Bandung?
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Toko Anda saat ini menggunakan paket <b>{store.tier}</b>. Fitur <b>Multi-Cabang</b>{" "}
              memungkinkan Anda mengelola banyak outlet fisik (contoh: BEC Lantai 1, BEC Lantai 2,
              Cibiru, Buah Batu), menugaskan staf kasir per cabang, serta menampilkan filter lokasi
              cabang secara realtime di etalase pembeli PWA.
            </p>
            <div className="pt-2">
              <Link
                href="/super-admin/billing"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow"
              >
                <span>Upgrade ke Paket Advance</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Branches Grid / Cards ── */}
      {branches.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Store className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Belum Ada Cabang Fisik Didaftarkan</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {isAdvance
              ? "Tambahkan cabang utama atau konter fisik toko Anda untuk mulai mengalokasikan stok unit dan akun staf kasir."
              : "Upgrade ke paket Advance untuk membuka fitur multi-cabang ini."}
          </p>
          {isAdvance && (
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Cabang Pertama</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {branches.map((b) => (
            <div
              key={b.id}
              className={`bg-white rounded-2xl border p-5 transition flex flex-col justify-between ${
                b.isMain
                  ? "border-blue-300 ring-2 ring-blue-500/10 shadow-sm"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm">{b.name}</h3>
                    {b.isMain && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                        <ShieldCheck className="w-3 h-3" />
                        Pusat
                      </span>
                    )}
                  </div>

                  {isAdvance && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(b)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
                        title="Edit Cabang"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(b)}
                        disabled={deletingId === b.id}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition disabled:opacity-50"
                        title="Hapus Cabang"
                      >
                        {deletingId === b.id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{b.address}</span>
                  </div>

                  {b.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono">{b.phone}</span>
                    </div>
                  )}

                  {b.mapsUrl && (
                    <div className="pt-1">
                      <a
                        href={b.mapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Buka Peta Google Maps</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Counts Badge */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-3">
                  <span>
                    📦 <b>{b._count?.products ?? 0}</b> unit HP
                  </span>
                  <span>
                    👥 <b>{b._count?.users ?? 0}</b> staf
                  </span>
                </div>
                <span className="font-mono text-[10px] text-slate-400">ID: {b.id.slice(-6)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modal Create / Edit ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>{editingBranch ? "Edit Data Cabang" : "Tambah Cabang Baru"}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                Tutup ✕
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center gap-2 text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Cabang / Outlet *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: BEC Lantai 1 Blok C-05"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Alamat Lengkap Rute Fisik *
                </label>
                <textarea
                  required
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Contoh: Gedung BEC 1 Lt. 1 No. C05, Jl. Purnawarman No. 13-15, Bandung"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    No WA Khusus Cabang (Opsional)
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="08123456789"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    URL Google Maps (Opsional)
                  </label>
                  <input
                    type="url"
                    value={mapsUrl}
                    onChange={(e) => setMapsUrl(e.target.value)}
                    placeholder="https://maps.app.goo.gl/..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isMain}
                    onChange={(e) => setIsMain(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-bold text-slate-800">Jadikan Cabang Utama (Pusat)</span>
                    <p className="text-[11px] text-slate-500">
                      Cabang utama menjadi alamat default toko jika produk tidak dialokasikan ke cabang tertentu.
                    </p>
                  </div>
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingBranch ? "Simpan Perubahan" : "Buat Cabang"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
