"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { SESSION_COOKIE } from "@/lib/auth/session";
import type { SessionPayload } from "@/lib/auth/session";

// ─── Login ────────────────────────────────────────────────────────
export async function loginAction(formData: FormData) {
  const email = (formData.get("email") as string)?.toLowerCase().trim();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, error: "Email dan password wajib diisi." };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        store: {
          select: {
            slug: true,
            customDomain: true,
            customDomainStatus: true,
          },
        },
      },
    });
    if (!user) {
      return { success: false, error: "Email atau password salah." };
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return { success: false, error: "Email atau password salah." };
    }

    const payload: SessionPayload = {
      userId: user.id,
      storeId: user.storeId,
      role: user.role,
    };

    const cookieStore = cookies();
    cookieStore.set(SESSION_COOKIE, JSON.stringify(payload), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 hari
      path: "/",
    });

    const rootDomain = (process.env.NEXT_PUBLIC_MAIN_DOMAIN || "gadgetbdg.com").toLowerCase();
    const isProd = process.env.NODE_ENV === "production";

    // Redirect based on role
    if (user.role === "SALES" || user.role === "SALES_AGENT") {
      return { success: true, redirect: "/sales" };
    }
    if (user.role === "SUPER_ADMIN" || user.role === "ADMIN_SAAS") {
      if (isProd) {
        return { success: true, redirect: `https://admin.${rootDomain}` };
      }
      return { success: true, redirect: "/super-admin" };
    }

    // Merchant Store Owner / Staff
    const storeSlug = user.store?.slug;
    if (storeSlug) {
      if (isProd) {
        return { success: true, redirect: `https://${storeSlug}.${rootDomain}/admin` };
      }
      return { success: true, redirect: `/admin` };
    }

    return { success: true, redirect: "/admin" };
  } catch (error: any) {
    console.error("loginAction error:", error);
    return { success: false, error: "Terjadi kesalahan. Coba lagi." };
  }
}

// ─── Logout ───────────────────────────────────────────────────────
export async function logoutAction(target?: FormData | string) {
  const { revalidatePath } = await import("next/cache");
  const cookieStore = cookies();
  cookieStore.delete(SESSION_COOKIE);
  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  revalidatePath("/", "layout");

  const redirectTo = typeof target === "string" ? target : "/login";
  redirect(redirectTo);
}

export async function superAdminLogoutAction() {
  return logoutAction("/login?role=super_admin");
}

export async function merchantLogoutAction() {
  const rootDomain = (process.env.NEXT_PUBLIC_MAIN_DOMAIN || "gadgetbdg.com").toLowerCase();
  const isProd = process.env.NODE_ENV === "production";
  const loginUrl = isProd ? `https://${rootDomain}/login` : "/login";
  return logoutAction(loginUrl);
}
