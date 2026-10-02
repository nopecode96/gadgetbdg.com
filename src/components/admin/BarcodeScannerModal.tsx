"use client";

import React, { useEffect, useRef, useState } from "react";
import { X, Camera, SwitchCamera, AlertCircle, Sparkles, Volume2 } from "lucide-react";

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (decodedText: string) => void;
}

export function BarcodeScannerModal({
  isOpen,
  onClose,
  onScanSuccess,
}: BarcodeScannerModalProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const html5QrCodeRef = useRef<any>(null);
  const isStoppingRef = useRef<boolean>(false);

  // Sound beep helper using Web Audio API
  const playBeep = () => {
    try {
      if (typeof window === "undefined") return;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime); // 880Hz (A5)
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      // Audio might be blocked by browser policy without user interaction
      console.warn("Audio beep failed:", e);
    }
  };

  const triggerVibrate = () => {
    try {
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(100);
      }
    } catch {
      // Ignore vibration error on unsupported devices
    }
  };

  // Stop scanner safely
  const stopScanner = async () => {
    if (html5QrCodeRef.current && !isStoppingRef.current) {
      isStoppingRef.current = true;
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        await html5QrCodeRef.current.clear();
      } catch (err) {
        console.warn("Error stopping scanner:", err);
      } finally {
        html5QrCodeRef.current = null;
        isStoppingRef.current = false;
        setIsScanning(false);
      }
    }
  };

  // Start scanner
  const startScanner = async (cameraId?: string) => {
    if (!isOpen) return;
    setErrorMessage(null);
    setIsScanning(false);

    try {
      const { Html5Qrcode } = await import("html5-qrcode");

      // Stop previous instance if any
      await stopScanner();

      const scannerElement = document.getElementById("barcode-scanner-viewfinder");
      if (!scannerElement) return;

      const html5QrCode = new Html5Qrcode("barcode-scanner-viewfinder");
      html5QrCodeRef.current = html5QrCode;

      // Get cameras if not queried yet
      let activeCamId = cameraId;
      if (!activeCamId) {
        try {
          const devices = await Html5Qrcode.getCameras();
          if (devices && devices.length > 0) {
            setCameras(devices);
            // Default to back/environment camera if available
            const backCam = devices.find(
              (d) =>
                d.label.toLowerCase().includes("back") ||
                d.label.toLowerCase().includes("belakang") ||
                d.label.toLowerCase().includes("environment") ||
                d.label.toLowerCase().includes("rear")
            );
            activeCamId = backCam ? backCam.id : devices[0].id;
            setSelectedCameraId(activeCamId);
          }
        } catch (camErr) {
          console.warn("Could not enumerate camera devices:", camErr);
        }
      }

      const cameraConfig = activeCamId ? { deviceId: { exact: activeCamId } } : { facingMode: "environment" };

      const qrConfig = {
        fps: 15,
        qrbox: { width: 280, height: 180 },
        aspectRatio: 1.0,
      };

      await html5QrCode.start(
        cameraConfig,
        qrConfig,
        (decodedText: string) => {
          // Sanitasi String IMEI:
          // Hilangkan karakter non-numerik dan ambil 15 digit pertama (standar IMEI GSM)
          const imeiMatch = decodedText.replace(/[^0-9]/g, "").slice(0, 15);

          // Berikan feedback instan
          playBeep();
          triggerVibrate();

          // Stop scanner and return result
          stopScanner().then(() => {
            onScanSuccess(imeiMatch || decodedText);
            onClose();
          });
        },
        () => {
          // Scan frame fail - ignore per-frame noise
        }
      );

      setIsScanning(true);
    } catch (err: any) {
      console.error("Camera scanner error:", err);
      let msg = "Gagal mengakses kamera.";
      const errorStr = String(err).toLowerCase();
      if (errorStr.includes("notallowederror") || errorStr.includes("permission")) {
        msg = "Izin kamera ditolak. Silakan izinkan akses kamera di pengaturan browser Anda.";
      } else if (errorStr.includes("notreadableerror") || errorStr.includes("in use")) {
        msg = "Kamera sedang digunakan oleh aplikasi lain atau browser tidak dapat membaca video feed.";
      } else if (errorStr.includes("insecure") || window.location.protocol !== "https:") {
        msg = "Akses kamera browser memerlukan koneksi aman HTTPS atau localhost.";
      }
      setErrorMessage(msg);
      setIsScanning(false);
    }
  };

  // Toggle Camera (front/back or next device)
  const handleSwitchCamera = async () => {
    if (cameras.length <= 1) return;
    const currentIndex = cameras.findIndex((c) => c.id === selectedCameraId);
    const nextIndex = (currentIndex + 1) % cameras.length;
    const nextCam = cameras[nextIndex];
    setSelectedCameraId(nextCam.id);
    await startScanner(nextCam.id);
  };

  useEffect(() => {
    if (isOpen) {
      startScanner();
    } else {
      stopScanner();
      setErrorMessage(null);
    }

    return () => {
      stopScanner();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl text-white">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                Scan Barcode Dus / IMEI
              </h3>
              <p className="text-[11px] text-slate-400">Arahkan kamera ke barcode stiker bodi atau dus</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopScanner().then(() => onClose());
            }}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewfinder Area */}
        <div className="relative w-full aspect-square bg-black flex items-center justify-center overflow-hidden">
          {/* Container for html5-qrcode video */}
          <div id="barcode-scanner-viewfinder" className="w-full h-full object-cover" />

          {/* Futuristic Overlay viewfinder lines */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {/* Target Area Box */}
            <div className="w-72 h-44 border-2 border-cyan-500/40 rounded-2xl relative shadow-[0_0_20px_rgba(6,182,212,0.2)]">
              {/* Corner HUD markers */}
              <div className="absolute -top-1 -left-1 w-5 h-5 border-t-2 border-l-2 border-cyan-400 rounded-tl-lg" />
              <div className="absolute -top-1 -right-1 w-5 h-5 border-t-2 border-r-2 border-cyan-400 rounded-tr-lg" />
              <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-2 border-l-2 border-cyan-400 rounded-bl-lg" />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-2 border-r-2 border-cyan-400 rounded-br-lg" />

              {/* Animated Laser Scanning Beam */}
              {isScanning && (
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_10px_#22d3ee] animate-pulse absolute top-1/2 -translate-y-1/2" />
              )}
            </div>
          </div>

          {/* Error Message banner */}
          {errorMessage && (
            <div className="absolute inset-4 z-20 bg-slate-900/95 border border-red-500/30 rounded-2xl p-5 flex flex-col items-center justify-center text-center">
              <AlertCircle className="w-10 h-10 text-red-400 mb-2" />
              <p className="text-xs font-semibold text-red-200 mb-4">{errorMessage}</p>
              <button
                onClick={() => startScanner(selectedCameraId || undefined)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white rounded-xl transition"
              >
                Coba Lagi
              </button>
            </div>
          )}
        </div>

        {/* Footer Controls */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Otomatis ekstrak 15 digit IMEI</span>
          </div>

          <div className="flex items-center gap-2">
            {cameras.length > 1 && (
              <button
                type="button"
                onClick={handleSwitchCamera}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
                title="Ganti Kamera"
              >
                <SwitchCamera className="w-3.5 h-3.5 text-cyan-400" />
                <span>Ganti Kamera</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                stopScanner().then(() => onClose());
              }}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
