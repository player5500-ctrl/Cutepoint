import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/adminAuth";
import {
  fetchCutepointAnalytics,
  gaConfigured,
  missingGaEnv,
  parseRange,
  type CutepointAnalytics,
  type RangeKey,
} from "@/lib/ga4";

// GA 數據 API — 萌點 / Cutepoint
// 權限：需通過後台密碼驗證（x-admin-key）
// 參數：?range=today|7d|30d（預設 7d）
// 快取：server memory 每個範圍各 1 小時；GA4 失敗時回傳舊快取（stale: true），無快取則回空資料不 crash

export const dynamic = "force-dynamic";

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 小時

const cache = new Map<RangeKey, { data: CutepointAnalytics; cachedAt: number }>();

export async function GET(request: Request) {
  if (!isAuthed(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const range = parseRange(new URL(request.url).searchParams.get("range"));

  // 未設定 GA 環境變數：回報尚未設定 + 缺少的變數名稱（不含任何值）
  if (!gaConfigured()) {
    return NextResponse.json({
      configured: false,
      stale: false,
      range,
      missingEnv: missingGaEnv(),
      data: null,
    });
  }

  // 快取仍新鮮 → 直接回傳
  const hit = cache.get(range);
  if (hit && Date.now() - hit.cachedAt < CACHE_TTL_MS) {
    return NextResponse.json({
      configured: true,
      stale: false,
      cached: true,
      range,
      data: hit.data,
    });
  }

  try {
    const data = await fetchCutepointAnalytics(range);
    cache.set(range, { data, cachedAt: Date.now() });
    return NextResponse.json({ configured: true, stale: false, range, data });
  } catch (e) {
    // 只記錄訊息，避免把憑證內容寫進 log
    console.error("GA4 fetch failed:", e instanceof Error ? e.message : "unknown error");
    // 有舊快取 → 回傳舊快取並標記 stale
    if (hit) {
      return NextResponse.json({
        configured: true,
        stale: true,
        range,
        data: hit.data,
      });
    }
    // 無快取 → 回空資料，前端顯示空狀態（不可讓後台 crash）
    return NextResponse.json({
      configured: true,
      stale: false,
      range,
      data: null,
      error: "GA4_FETCH_FAILED",
    });
  }
}
