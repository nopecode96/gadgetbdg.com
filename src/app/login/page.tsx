"use client";

import { useState } from "react";
import { loginAction } from "@/lib/actions/login-actions";
import { Store, Lock, Mail, Eye, EyeOff, AlertCircle, Home, ShieldAlert, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);

  // Form input states for instant demo filling
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleFillDemoStore = () => {
    setEmail("demo@gadgetbdg.com");
    setPassword("Admin123!");
    setError(null);
  };

  const handleFillSuperAdmin = () => {
    setEmail("admin@gadgetbdg.com");
    setPassword("Admin123!");
    setError(null);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await loginAction(formData);

    setLoading(false);
    if (!result.success) {
      setError(result.error || "Login gagal.");
      return;
    }
    if (result.redirect) {
      router.push(result.redirect);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xl mb-3">
            <Store className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-white">GadgetBdg</h1>
          <p className="text-sm text-blue-300 mt-1">Admin Panel &amp; Dashboard</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl">
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-blue-200 block mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-blue-200 block mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPass ? "text" : "password"}
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-10 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition text-sm shadow-md"
          >
            {loading ? "Memproses..." : "Masuk →"}
          </button>

          {/* Quick Demo Fill Buttons */}
          <div className="pt-2 border-t border-white/10">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2 text-center">
              Akses Cepat Demo &amp; Pengujian
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleFillDemoStore}
                className="px-2.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-white text-xs font-semibold transition flex flex-col items-center justify-center text-center gap-1 group"
              >
                <div className="flex items-center gap-1 text-emerald-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="font-bold text-[11px]">Demo Toko</span>
                </div>
                <span className="text-[10px] text-slate-400 group-hover:text-slate-300">Sales Partner</span>
              </button>

              <button
                type="button"
                onClick={handleFillSuperAdmin}
                className="px-2.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-white text-xs font-semibold transition flex flex-col items-center justify-center text-center gap-1 group"
              >
                <div className="flex items-center gap-1 text-indigo-400">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span className="font-bold text-[11px]">Super Admin</span>
                </div>
                <span className="text-[10px] text-slate-400 group-hover:text-slate-300">SaaS Platform</span>
              </button>
            </div>
          </div>
        </form>

        {/* Back to Home */}
        <div className="mt-5 flex items-center justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition font-medium"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>

        <p className="text-center text-xs text-slate-600 mt-3">
          Platform manajemen toko HP bekas Bandung
        </p>
      </div>
    </div>
  );
}
