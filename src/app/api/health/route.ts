import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();

  try {
    // 1. Check PostgreSQL Database Connectivity via raw query
    await prisma.$queryRaw`SELECT 1`;

    const responseTimeMs = Date.now() - startTime;

    return NextResponse.json(
      {
        status: "ok",
        service: "gadgetbdg-platform",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        database: {
          status: "connected",
          provider: "postgresql",
          responseTimeMs,
        },
        container: {
          nodeEnv: process.env.NODE_ENV || "development",
          internalPort: process.env.PORT || "3001",
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      }
    );
  } catch (error: any) {
    const responseTimeMs = Date.now() - startTime;
    console.error("Health check database failure:", error);

    return NextResponse.json(
      {
        status: "error",
        service: "gadgetbdg-platform",
        timestamp: new Date().toISOString(),
        database: {
          status: "disconnected",
          error: error?.message || "Cannot connect to PostgreSQL",
          responseTimeMs,
        },
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      }
    );
  }
}
