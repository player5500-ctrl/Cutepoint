import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/adminAuth";
import {
  fetchCutepointAnalytics,
  gaConfigured,
  type CutepointAnalytics,
} from "@/lib/ga4";

// GA 數據 API — 萌點 / Cutepoint
// 權限：需通過後台密碼驗證（x-admin-key）
// 快取：server memory 1 小時；GA4 失敗時回傳舊快取（stale: true），無快取則回空資料不 crash

export const dynamic = "force-dynamic";

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 小時

let cache: { data: CutepointAnalytics; cachedAt: number } | null = null;

export async function GET(request: Request) {
  if (!isAuthed(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 未設定 GA 環境變數：回報尚未設定，前端顯示空狀態
  if (!gaConfigured()) {
    return NextResponse.json({ configured: false, stale: false, data: null });
  }

  // 快取仍新鮮 → 直接回傳
  if (cache && Date.now() - cache.cachedAt < CACHE_TTL_MS) {
    return NextResponse.json({
      configured: true,
      stale: false,
      cached: true,
      data: cache.data,
    });
  }

  try {
    const data = await fetchCutepointAnalytics();
    cache = { data, cachedAt: Date.now() };
    return NextResponse.json({ configured: true, stale: false, data });
  } catch (e) {
    console.error("GA4 fetch failed", e);
    // 有舊快取 → 回傳舊快取並標記 stale
    if (cache) {
      return NextResponse.json({
        configured: true,
        stale: true,
        data: cache.data,
      });
    }
    // 無快取 → 回空資料，前端顯示空狀態（不可讓後台 crash）
    return NextResponse.json({
      configured: true,
      stale: false,
      data: null,
      error: "GA4_FETCH_FAILED",
    });
  }
}
