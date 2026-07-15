"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import AdminGate, { getAdminKey } from "@/components/AdminGate";

interface CutepointAnalytics {
  todayUsers: number;
  users7d: number;
  pageViews7d: number;
  calculatePrice: number;
  submitInquiry: number;
  clickLine: number;
  clickFacebook: number;
  topPages: { path: string; views: number }[];
  sources: { source: string; sessions: number }[];
  topEvents: { name: string; count: number }[];
  trend: { date: string; users: number; views: number }[];
  fetchedAt: string;
}

interface ApiResponse {
  configured: boolean;
  stale: boolean;
  data: CutepointAnalytics | null;
  error?: string;
}

// 事件名稱中文對照
const eventLabels: { [key: string]: string } = {
  page_view: "頁面瀏覽",
  calculate_price: "試算報價",
  submit_inquiry: "送出詢價",
  click_line: "點擊 LINE",
  click_facebook: "點擊 FB",
  session_start: "開始工作階段",
  first_visit: "首次造訪",
  scroll: "頁面捲動",
  user_engagement: "使用者互動",
};

// yyyymmdd → m/d
function formatGaDate(d: string): string {
  if (d.length !== 8) return d;
  return `${Number(d.slice(4, 6))}/${Number(d.slice(6, 8))}`;
}

function StatCard({
  label,
  value,
  accent,
  icon,
}: {
  label: string;
  value: number;
  accent: string;
  icon: string;
}) {
  return (
    <div className="bg-white p-5 rounded-3xl border border-brand-border shadow-sm">
      <span className={`text-[10px] font-bold tracking-wider block ${accent}`}>
        {icon} {label}
      </span>
      <span className={`text-2xl font-black mt-1 block ${accent}`}>
        {value.toLocaleString()}
      </span>
    </div>
  );
}

function RankList({
  title,
  icon,
  rows,
  emptyText,
}: {
  title: string;
  icon: string;
  rows: { label: string; value: number }[];
  emptyText: string;
}) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <div className="bg-white rounded-3xl border border-brand-border shadow-sm p-6">
      <h3 className="text-sm font-extrabold text-brand-dark mb-4 flex items-center gap-1.5">
        <span>{icon}</span> {title}
      </h3>
      {rows.length === 0 ? (
        <p className="text-xs text-gray-400 font-semibold py-6 text-center">{emptyText}</p>
      ) : (
        <div className="space-y-3">
          {rows.map((row, idx) => (
            <div key={`${row.label}-${idx}`} className="space-y-1">
              <div className="flex justify-between items-center text-xs font-semibold gap-2">
                <span className="text-brand-dark truncate" title={row.label}>
                  <span className="text-brand-muted mr-1.5">{idx + 1}.</span>
                  {row.label}
                </span>
                <span className="text-brand-orange font-black shrink-0">
                  {row.value.toLocaleString()}
                </span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-orange/70 rounded-full"
                  style={{ width: `${Math.max((row.value / max) * 100, 2)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AnalyticsPanel() {
  const [loading, setLoading] = useState(true);
  const [resp, setResp] = useState<ApiResponse | null>(null);
  const [fetchError, setFetchError] = useState(false);

  // 注意：所有 setState 都在 await 之後，避免 effect 內同步 setState（react-hooks/set-state-in-effect）
  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/analytics/cutepoint", {
        headers: { "x-admin-key": getAdminKey() },
      });
      if (res.ok) {
        const json = (await res.json()) as ApiResponse;
        setResp(json);
        setFetchError(false);
      } else {
        setFetchError(true);
      }
    } catch (e) {
      console.error("Failed to load analytics", e);
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const reload = () => {
    setLoading(true);
    setFetchError(false);
    load();
  };

  useEffect(() => {
    // load 內的 setState 皆在 await 之後（非同步），此規則為誤判
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const data = resp?.data ?? null;
  const trendMax = data
    ? Math.max(...data.trend.map((t) => t.views), 1)
    : 1;

  return (
    <div className="w-full py-12 bg-[#F3F4F6] min-h-screen flex-grow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-brand-border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 overflow-hidden rounded-xl bg-white border border-brand-border p-1 flex items-center justify-center shadow-sm">
              <Image
                src="/assets/logo.png"
                alt="Logo"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-brand-dark">GA 數據 — 萌點網站分析</h1>
              <p className="text-xs text-brand-muted font-medium">
                資料來源：Google Analytics 4（每小時更新一次）
                {data && (
                  <span className="ml-2 text-gray-400">
                    更新時間：{new Date(data.fetchedAt).toLocaleString("zh-TW", { hour12: false })}
                  </span>
                )}
              </p>
            </div>
          </div>
          <Link
            href="/admin"
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 shadow-sm transition-all"
          >
            ← 回詢價管理
          </Link>
        </div>

        {/* Stale warning */}
        {resp?.stale && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold px-5 py-3 rounded-2xl">
            ⚠️ 目前無法連線 GA4，以下顯示的是上一次成功取得的快取數據。
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-3xl border border-brand-border shadow-sm p-20 text-center text-xs text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange mx-auto mb-4" />
            正在載入 GA 數據...
          </div>
        ) : resp && !resp.configured ? (
          /* 尚未設定 GA env */
          <div className="bg-white rounded-3xl border border-brand-border shadow-sm p-16 text-center space-y-3">
            <span className="text-4xl block">📊</span>
            <h2 className="text-base font-black text-brand-dark">GA 數據尚未設定</h2>
            <p className="text-xs text-brand-muted font-semibold leading-relaxed">
              請在 Vercel 專案設定以下環境變數後重新部署：
              <br />
              <code className="font-mono text-[11px] bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5 mx-0.5">GA4_PROPERTY_ID_CUTEPOINT</code>
              <code className="font-mono text-[11px] bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5 mx-0.5">GOOGLE_ANALYTICS_CLIENT_EMAIL</code>
              <code className="font-mono text-[11px] bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5 mx-0.5">GOOGLE_ANALYTICS_PRIVATE_KEY</code>
            </p>
          </div>
        ) : !data ? (
          /* GA4 失敗且無快取 / API 錯誤 */
          <div className="bg-white rounded-3xl border border-brand-border shadow-sm p-16 text-center space-y-3">
            <span className="text-4xl block">😿</span>
            <h2 className="text-base font-black text-brand-dark">暫時無法取得 GA 數據</h2>
            <p className="text-xs text-brand-muted font-semibold">
              {fetchError ? "連線後台 API 失敗，請稍後再試。" : "GA4 連線失敗且目前沒有快取數據，請稍後再試。"}
            </p>
            <button
              onClick={reload}
              className="px-5 py-2.5 rounded-full text-xs font-bold bg-brand-orange hover:bg-brand-orange-hover text-white shadow-sm transition-all"
            >
              重新載入
            </button>
          </div>
        ) : (
          <>
            {/* 上方統計卡片 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="今日使用者" value={data.todayUsers} accent="text-brand-dark" icon="👤" />
              <StatCard label="近 7 天使用者" value={data.users7d} accent="text-blue-600" icon="👥" />
              <StatCard label="近 7 天瀏覽量" value={data.pageViews7d} accent="text-emerald-600" icon="👀" />
              <StatCard label="詢價送出數（7天）" value={data.submitInquiry} accent="text-brand-orange" icon="📮" />
            </div>

            {/* 事件統計卡片 */}
            <div className="grid grid-cols-3 gap-4">
              <StatCard label="試算次數（7天）" value={data.calculatePrice} accent="text-purple-600" icon="🧮" />
              <StatCard label="LINE 點擊數（7天）" value={data.clickLine} accent="text-green-600" icon="💬" />
              <StatCard label="FB 點擊數（7天）" value={data.clickFacebook} accent="text-indigo-600" icon="👍" />
            </div>

            {/* 下方區塊 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RankList
                title="熱門頁面 Top 5（近 7 天）"
                icon="🔥"
                rows={data.topPages.map((p) => ({ label: p.path, value: p.views }))}
                emptyText="尚無頁面瀏覽數據"
              />
              <RankList
                title="事件排行 Top 10（近 7 天）"
                icon="🏆"
                rows={data.topEvents.map((e) => ({
                  label: eventLabels[e.name] ? `${eventLabels[e.name]}（${e.name}）` : e.name,
                  value: e.count,
                }))}
                emptyText="尚無事件數據"
              />
              <RankList
                title="流量來源 Top 5（近 7 天）"
                icon="🚏"
                rows={data.sources.map((s) => ({ label: s.source, value: s.sessions }))}
                emptyText="尚無流量來源數據"
              />

              {/* 近 7 天趨勢 */}
              <div className="bg-white rounded-3xl border border-brand-border shadow-sm p-6">
                <h3 className="text-sm font-extrabold text-brand-dark mb-4 flex items-center gap-1.5">
                  <span>📈</span> 近 7 天趨勢
                </h3>
                {data.trend.length === 0 ? (
                  <p className="text-xs text-gray-400 font-semibold py-6 text-center">尚無趨勢數據</p>
                ) : (
                  <>
                    <div className="flex items-end gap-2 h-40">
                      {data.trend.map((t) => (
                        <div
                          key={t.date}
                          className="flex-1 flex flex-col items-center gap-1 h-full justify-end"
                          title={`${formatGaDate(t.date)}：${t.views.toLocaleString()} 瀏覽 / ${t.users.toLocaleString()} 使用者`}
                        >
                          <span className="text-[9px] font-bold text-brand-muted">
                            {t.views.toLocaleString()}
                          </span>
                          <div
                            className="w-full max-w-10 bg-brand-orange/70 hover:bg-brand-orange rounded-t-lg transition-colors"
                            style={{ height: `${Math.max((t.views / trendMax) * 100, 3)}%` }}
                          />
                          <span className="text-[9px] font-bold text-gray-400">
                            {formatGaDate(t.date)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-brand-muted font-semibold mt-3 text-center">
                      柱高 = 每日瀏覽量（滑鼠移入可見使用者數）
                    </p>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// /admin/analytics — 只有通過後台密碼驗證（admin）才能看到內容
export default function AdminAnalyticsPage() {
  return (
    <AdminGate>
      <AnalyticsPanel />
    </AdminGate>
  );
}
