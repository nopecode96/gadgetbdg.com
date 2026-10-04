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
  Globe,
  HelpCircle,
  Layers,
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
    customDomain?: string | null;
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
  const [slug, setSlug] = useState("");
  const [address, setAddress] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [mapsUrl, setMapsUrl] = useState("");
  const [isMain, setIsMain] = useState(false);

  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isAdvance = store.tier === "ADVANCE";
  const mainDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN || "gadgetbdg.com";

  function openCreateModal() {
    setEditingBranch(null);
    setName("");
    setSlug("");
    setAddress("");
    setWhatsapp("");
    setMapsUrl("");
    setIsMain(branches.length === 0);
    setErrorMsg(null);
    setShowModal(true);
  }

  function openEditModal(branch: BranchData) {
    setEditingBranch(branch);
    setName(branch.name);
    setSlug(branch.slug || "");
    setAddress(branch.address);
    setWhatsapp(branch.whatsapp || branch.phone || "");
    setMapsUrl(branch.mapsUrl || "");
    setIsMain(branch.isMain);
    setErrorMsg(null);
    setShowModal(true);
  }

  function handleNameChange(val: string) {
    setName(val);
    if (!editingBranch && !slug) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      setSlug(generated);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !address.trim()) {
      setErrorMsg("Nama cabang dan alamat wajib diisi.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const cleanSlug = slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    if (editingBranch) {
      // Edit Branch
      const res = await updateBranchAction(editingBranch.id, {
        name,
        slug: cleanSlug || undefined,
        address,
        whatsapp: whatsapp || undefined,
        phone: whatsapp || undefined,
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
        slug: cleanSlug || undefined,
        address,
        whatsapp: whatsapp || undefined,
        phone: whatsapp || undefined,
        mapsUrl: mapsUrl || undefined,
        isMain,
      });

      setLoading(false);
      if (res.success && res.branch) {
        const newBranch = { ...res.branch, _count: { products: 0, users: 0, tradeIns: 0 } };
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
            <span>Kelola Multi-Cabang & Subdomain</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kelola lokasi fisik toko, titik COD, penugasan staf kasir, dan katalog mandiri per cabang.
          </p>
        </div>

        {isAdvance && (
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Cabang Baru</span>
          </button>
        )}
      </div>

      {/* ── Card Informatif / Banner Edukasi Subdomain ── */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200/80 rounded-2xl p-5 sm:p-6 shadow-xs relative overflow-hidden">
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
            <Globe className="w-5 h-5" />
          </div>
          <div className="space-y-1.5 flex-1">
            <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>💡 Fitur Multi-Cabang &amp; Subdomain Tersendiri</span>
              <span className="text-[10px] bg-blue-600 text-white font-bold px-2 py-0.5 rounded-full uppercase">
                Advance
              </span>
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Setiap cabang memiliki tautan katalog mandiri. Pada domain sendiri (misal:{" "}
              <code className="text-blue-700 bg-blue-100/60 px-1 py-0.5 rounded font-mono font-bold">
                {store.customDomain || `${store.slug}.com`}
              </code>
              ), cabang dapat diakses via subdomain seperti{" "}
              <code className="text-purple-700 bg-purple-100/60 px-1 py-0.5 rounded font-mono font-bold">
                bec.{store.customDomain || `${store.slug}.com`}
              </code>{" "}
              atau tautan toko{" "}
              <code className="text-indigo-700 bg-indigo-100/60 px-1 py-0.5 rounded font-mono font-bold">
                {store.slug}.{mainDomain}?branch=bec
              </code>
              . Pembeli yang masuk melalui link cabang otomatis hanya melihat stok unit cabang tersebut dan langsung terhubung ke WhatsApp kasir konter terkait.
            </p>
          </div>
        </div>
      </div>

      {/* ── Locked Banner for Starter / Pro ── */}
      {!isAdvance && (
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-blue-500/10 border border-amber-200 rounded-2xl p-6 relative overflow-hidden">
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
                href="/admin/subscription"
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
          {branches.map((b) => {
            const branchSubdomain = store.customDomain
              ? `https://${b.slug}.${store.customDomain}`
              : `https://${store.slug}.${mainDomain}?branch=${b.slug}`;

            return (
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
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-sm">{b.name}</h3>
                        {b.isMain && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                            <ShieldCheck className="w-3 h-3" />
                            Pusat
                          </span>
                        )}
                      </div>
                      <div className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                        <Globe className="w-3 h-3 text-purple-600" />
                        <span>Subdomain: {b.slug}</span>
                      </div>
                    </div>

                    {isAdvance && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(b)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                          title="Edit Cabang"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(b)}
                          disabled={deletingId === b.id}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition disabled:opacity-50 cursor-pointer"
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

                    {(b.whatsapp || b.phone) && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="font-mono font-semibold text-emerald-700">
                          WA Hotline: {b.whatsapp || b.phone}
                        </span>
                      </div>
                    )}

                    {/* Dedicated Catalog Link */}
                    <div className="pt-1 flex flex-wrap items-center gap-3">
                      <a
                        href={branchSubdomain}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Katalog Khusus Cabang</span>
                      </a>

                      {b.mapsUrl && (
                        <a
                          href={b.mapsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-700 hover:underline"
                        >
                          <MapPin className="w-3 h-3" />
                          <span>Google Maps</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Counts Badge */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-3">
                    <span className="bg-slate-100 px-2 py-0.5 rounded font-medium">
                      📦 <b>{b._count?.products ?? 0}</b> Unit Stok
                    </span>
                    <span className="bg-slate-100 px-2 py-0.5 rounded font-medium">
                      👥 <b>{b._count?.users ?? 0}</b> Staf Kasir
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400">/{b.slug}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modal Create / Edit ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>{editingBranch ? "Edit Data Cabang" : "Tambah Cabang Baru"}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer"
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
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Contoh: Cabang BEC Lantai 1"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 font-medium"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">
                    Slug Subdomain Cabang * (URL-safe)
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Hanya huruf kecil, angka, tanda hubung (-)
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) =>
                      setSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9-]/g, "")
                      )
                    }
                    placeholder="Contoh: bec atau buahbatu"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-slate-50 font-mono font-bold text-purple-700"
                  />
                </div>
                <div className="mt-1.5 p-2 rounded-lg bg-purple-50/70 border border-purple-100 text-[11px] text-purple-800 font-mono">
                  🌐 Preview Link:{" "}
                  <b>
                    {slug ? slug : "[subdomain]"}.{store.customDomain || `${store.slug}.${mainDomain}`}
                  </b>
                </div>
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
                  placeholder="Contoh: Gedung BEC 1 Lt. 1 Blok C05, Jl. Purnawarman No. 13-15, Bandung"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 resize-none font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    WhatsApp Kasir / Cabang *
                  </label>
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="081234567890"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Orderan cabang ini langsung masuk ke WA ini.
                  </p>
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
                  className="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition flex items-center gap-1.5 disabled:opacity-50 shadow-md shadow-blue-500/20 cursor-pointer"
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
