"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import AdminGate, { getAdminKey } from "@/components/AdminGate";

type RangeKey = "today" | "7d" | "30d";

const RANGE_OPTIONS: { key: RangeKey; label: string }[] = [
  { key: "today", label: "今天" },
  { key: "7d", label: "近 7 天" },
  { key: "30d", label: "近 30 天" },
];

interface FbCampaignRow {
  name: string;
  sessions: number;
  inquiries: number;
  conversionRate: number;
}
interface FbContentRow {
  name: string;
  sessions: number;
  inquiries: number;
  lineClicks: number;
}
interface FbTrendRow {
  date: string;
  sessions: number;
  inquiries: number;
  lineClicks: number;
}
interface FacebookAnalytics {
  sessions: number;
  organicSessions: number;
  paidSessions: number;
  otherSessions: number;
  inquiries: number;
  lineClicks: number;
  calculatePrice: number;
  conversionRate: number;
  hasUtm: boolean;
  sources: { source: string; sessions: number }[];
  topCampaigns: FbCampaignRow[];
  topContents: FbContentRow[];
  trend: FbTrendRow[];
}

interface CutepointAnalytics {
  range: RangeKey;
  rangeLabel: string;
  todayUsers: number;
  users: number;
  pageViews: number;
  calculatePrice: number;
  submitInquiry: number;
  clickLine: number;
  clickFacebook: number;
  topPages: { path: string; views: number }[];
  sources: { source: string; sessions: number }[];
  topEvents: { name: string; count: number }[];
  trend: { date: string; users: number; views: number }[];
  facebook: FacebookAnalytics;
  fetchedAt: string;
}

interface ApiResponse {
  configured: boolean;
  stale: boolean;
  range?: RangeKey;
  missingEnv?: string[];
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
  view_calculator: "進入試算頁",
  open_inquiry: "開啟詢價表",
  session_start: "開始工作階段",
  first_visit: "首次造訪",
  scroll: "頁面捲動",
  user_engagement: "使用者互動",
};

const UTM_EXAMPLE =
  "https://cutepoint.vercel.app/?utm_source=facebook&utm_medium=organic_social&utm_campaign=pet_figure&utm_content=calico_cat_post";

// yyyymmdd → m/d
function formatGaDate(d: string): string {
  if (d.length !== 8) return d;
  return `${Number(d.slice(4, 6))}/${Number(d.slice(6, 8))}`;
}

// 百分比顯示（後端已做除以零保護，這裡再擋一次 NaN / Infinity）
function formatPct(v: number): string {
  if (!Number.isFinite(v) || v <= 0) return "0%";
  return `${v}%`;
}

function StatCard({
  label,
  value,
  accent,
  icon,
  display,
  hint,
}: {
  label: string;
  value: number;
  accent: string;
  icon: string;
  display?: string;
  hint?: string;
}) {
  return (
    <div
      className="bg-white p-4 sm:p-5 rounded-3xl border border-brand-border shadow-sm min-w-0"
      title={hint}
    >
      <span className={`text-[10px] font-bold tracking-wider block truncate ${accent}`}>
        {icon} {label}
      </span>
      <span className={`text-xl sm:text-2xl font-black mt-1 block ${accent}`}>
        {display ?? value.toLocaleString()}
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
    <div className="bg-white rounded-3xl border border-brand-border shadow-sm p-5 sm:p-6 min-w-0">
      <h3 className="text-sm font-extrabold text-brand-dark mb-4 flex items-center gap-1.5">
        <span>{icon}</span> {title}
      </h3>
      {rows.length === 0 ? (
        <p className="text-xs text-gray-400 font-semibold py-6 text-center">{emptyText}</p>
      ) : (
        <div className="space-y-3">
          {rows.map((row, idx) => (
            <div key={`${row.label}-${idx}`} className="space-y-1 min-w-0">
              <div className="flex justify-between items-center text-xs font-semibold gap-2">
                <span className="text-brand-dark truncate min-w-0" title={row.label}>
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

// Facebook 沒有 UTM 資料時的提示
function NoUtmNotice() {
  return (
    <div className="bg-sky-50 border border-sky-200 rounded-2xl px-4 py-3 text-[11px] sm:text-xs font-semibold text-sky-800 leading-relaxed">
      目前尚無可辨識的 Facebook UTM 流量。
      <br />
      請在 Facebook 貼文網址加入 utm_source、utm_medium、utm_campaign 與 utm_content。
    </div>
  );
}

// Facebook 熱門活動 / 貼文表格（手機版可橫向捲動、長名稱截斷）
function FbTable({
  title,
  icon,
  headers,
  rows,
  emptyText,
}: {
  title: string;
  icon: string;
  headers: string[];
  rows: { name: string; cells: string[] }[];
  emptyText: string;
}) {
  return (
    <div className="bg-white rounded-3xl border border-brand-border shadow-sm p-5 sm:p-6 min-w-0">
      <h3 className="text-sm font-extrabold text-brand-dark mb-4 flex items-center gap-1.5">
        <span>{icon}</span> {title}
      </h3>
      {rows.length === 0 ? (
        <p className="text-xs text-gray-400 font-semibold py-6 text-center">{emptyText}</p>
      ) : (
        <div className="overflow-x-auto -mx-1 px-1">
          <table className="w-full text-xs min-w-[320px]">
            <thead>
              <tr className="text-brand-muted border-b border-brand-border/60">
                <th className="text-left py-2 pr-2 font-bold">{headers[0]}</th>
                {headers.slice(1).map((h) => (
                  <th key={h} className="text-right py-2 pl-2 font-bold whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr
                  key={`${row.name}-${idx}`}
                  className="border-b border-brand-border/30 last:border-0"
                >
                  <td className="py-2 pr-2 font-semibold text-brand-dark max-w-[140px] sm:max-w-[220px]">
                    <span className="block truncate" title={row.name}>
                      <span className="text-brand-muted mr-1.5">{idx + 1}.</span>
                      {row.name}
                    </span>
                  </td>
                  {row.cells.map((c, i) => (
                    <td
                      key={i}
                      className="py-2 pl-2 text-right font-black text-brand-dark whitespace-nowrap"
                    >
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Facebook 每日趨勢（三組長條：工作階段 / 詢價 / LINE 點擊）
function FbTrendChart({ trend }: { trend: FbTrendRow[] }) {
  const max = Math.max(...trend.flatMap((t) => [t.sessions, t.inquiries, t.lineClicks]), 1);
  return (
    <div className="bg-white rounded-3xl border border-brand-border shadow-sm p-5 sm:p-6 min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h3 className="text-sm font-extrabold text-brand-dark flex items-center gap-1.5">
          <span>📊</span> Facebook 每日趨勢
        </h3>
        <div className="flex flex-wrap gap-3 text-[10px] font-bold text-brand-muted">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500 inline-block" />
            工作階段
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-brand-orange inline-block" />
            詢價
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-green-500 inline-block" />
            LINE 點擊
          </span>
        </div>
      </div>
      {trend.length === 0 ? (
        <p className="text-xs text-gray-400 font-semibold py-6 text-center">尚無趨勢數據</p>
      ) : (
        <>
          <div className="overflow-x-auto -mx-1 px-1">
            <div
              className="flex items-end gap-2 h-40"
              style={{ minWidth: `${Math.max(trend.length * 44, 280)}px` }}
            >
              {trend.map((t) => (
                <div
                  key={t.date}
                  className="flex-1 flex flex-col items-center gap-1 h-full justify-end min-w-[36px]"
                  title={`${formatGaDate(t.date)}：${t.sessions} 工作階段 / ${t.inquiries} 詢價 / ${t.lineClicks} LINE 點擊`}
                >
                  <div className="flex items-end gap-0.5 w-full h-full justify-center">
                    <div
                      className="w-1/3 max-w-3 bg-indigo-500/80 rounded-t"
                      style={{ height: `${Math.max((t.sessions / max) * 100, 2)}%` }}
                    />
                    <div
                      className="w-1/3 max-w-3 bg-brand-orange/80 rounded-t"
                      style={{ height: `${Math.max((t.inquiries / max) * 100, 2)}%` }}
                    />
                    <div
                      className="w-1/3 max-w-3 bg-green-500/80 rounded-t"
                      style={{ height: `${Math.max((t.lineClicks / max) * 100, 2)}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-bold text-gray-400 whitespace-nowrap">
                    {formatGaDate(t.date)}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[10px] text-brand-muted font-semibold mt-3 text-center">
            滑鼠移入可看每日完整數字
          </p>
        </>
      )}
    </div>
  );
}

// UTM 使用說明 + 複製範例網址
function UtmGuide() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(UTM_EXAMPLE);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      /* 剪貼簿不可用時忽略，使用者仍可手動選取複製 */
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-brand-border shadow-sm p-5 sm:p-6 space-y-3">
      <h3 className="text-sm font-extrabold text-brand-dark flex items-center gap-1.5">
        <span>🔗</span> Facebook 貼文網址 UTM 標記說明
      </h3>
      <p className="text-[11px] sm:text-xs text-brand-muted font-semibold leading-relaxed">
        貼文只要帶上 UTM 參數，後台就能分辨是哪一篇貼文、哪一個活動帶來的流量與詢價。
      </p>
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3 space-y-2">
        <code className="block text-[10px] sm:text-[11px] font-mono text-brand-dark break-all leading-relaxed">
          {UTM_EXAMPLE}
        </code>
        <button
          onClick={copy}
          className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-brand-orange hover:bg-brand-orange-hover text-white shadow-sm transition-all"
        >
          {copied ? "✓ 已複製" : "複製範例網址"}
        </button>
      </div>
      <ul className="text-[11px] sm:text-xs font-semibold text-brand-muted space-y-1.5">
        <li>
          <code className="font-mono text-brand-dark">utm_source</code>：流量平台（例：facebook）
        </li>
        <li>
          <code className="font-mono text-brand-dark">utm_medium</code>：自然貼文
          <code className="font-mono text-brand-dark mx-1">organic_social</code>
          或付費廣告
          <code className="font-mono text-brand-dark ml-1">paid_social</code>
        </li>
        <li>
          <code className="font-mono text-brand-dark">utm_campaign</code>：行銷活動名稱
        </li>
        <li>
          <code className="font-mono text-brand-dark">utm_content</code>：個別貼文名稱
        </li>
      </ul>
    </div>
  );
}

function AnalyticsPanel() {
  const [loading, setLoading] = useState(true);
  const [resp, setResp] = useState<ApiResponse | null>(null);
  const [fetchError, setFetchError] = useState(false);
  const [range, setRange] = useState<RangeKey>("7d");

  // 注意：所有 setState 都在 await 之後，避免 effect 內同步 setState（react-hooks/set-state-in-effect）
  const load = useCallback(async (r: RangeKey) => {
    try {
      const res = await fetch(`/api/admin/analytics/cutepoint?range=${r}`, {
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
    load(range);
  };

  const changeRange = (r: RangeKey) => {
    if (r === range) return;
    setRange(r);
    setLoading(true);
    setFetchError(false);
    load(r);
  };

  useEffect(() => {
    // load 內的 setState 皆在 await 之後（非同步），此規則為誤判
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load("7d");
  }, [load]);

  const data = resp?.data ?? null;
  const rangeLabel = RANGE_OPTIONS.find((o) => o.key === range)?.label ?? "近 7 天";
  const fb = data?.facebook ?? null;
  const trendMax = data ? Math.max(...data.trend.map((t) => t.views), 1) : 1;

  return (
    <div className="w-full py-8 sm:py-12 bg-[#F3F4F6] min-h-screen flex-grow overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-brand-border shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-12 h-12 shrink-0 overflow-hidden rounded-xl bg-white border border-brand-border p-1 flex items-center justify-center shadow-sm">
              <Image
                src="/assets/logo.png"
                alt="Logo"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-brand-dark">
                GA 數據 — 萌點網站分析
              </h1>
              <p className="text-[11px] sm:text-xs text-brand-muted font-medium">
                資料來源：Google Analytics 4（每小時更新一次）
                {data && (
                  <span className="ml-2 text-gray-400">
                    更新時間：
                    {new Date(data.fetchedAt).toLocaleString("zh-TW", { hour12: false })}
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={reload}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 shadow-sm transition-all disabled:opacity-50"
            >
              ⟳ 重新載入
            </button>
            <Link
              href="/admin"
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 shadow-sm transition-all"
            >
              ← 回詢價管理
            </Link>
          </div>
        </div>

        {/* 日期範圍選擇 */}
        <div className="bg-white p-2 rounded-2xl border border-brand-border shadow-sm inline-flex flex-wrap gap-1">
          {RANGE_OPTIONS.map((o) => (
            <button
              key={o.key}
              onClick={() => changeRange(o.key)}
              disabled={loading}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-60 ${
                range === o.key
                  ? "bg-brand-orange text-white shadow-sm"
                  : "text-brand-muted hover:bg-gray-50"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>

        {/* Stale warning */}
        {resp?.stale && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold px-5 py-3 rounded-2xl">
            ⚠️ 目前無法連線 GA4，以下顯示的是上一次成功取得的快取數據。
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-3xl border border-brand-border shadow-sm p-16 sm:p-20 text-center text-xs text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange mx-auto mb-4" />
            正在載入 GA 數據...
          </div>
        ) : resp && !resp.configured ? (
          /* 尚未設定 GA env — 明確列出缺少哪些變數 */
          <div className="bg-white rounded-3xl border border-brand-border shadow-sm p-10 sm:p-16 text-center space-y-3">
            <span className="text-4xl block">📊</span>
            <h2 className="text-base font-black text-brand-dark">GA 數據尚未設定</h2>
            <p className="text-xs text-brand-muted font-semibold leading-relaxed">
              請在 Vercel 專案設定以下環境變數後重新部署：
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {(resp.missingEnv && resp.missingEnv.length > 0
                ? resp.missingEnv
                : [
                    "GA4_PROPERTY_ID_CUTEPOINT",
                    "GOOGLE_ANALYTICS_CLIENT_EMAIL",
                    "GOOGLE_ANALYTICS_PRIVATE_KEY",
                  ]
              ).map((k) => (
                <code
                  key={k}
                  className="font-mono text-[11px] bg-red-50 border border-red-200 text-red-700 rounded px-2 py-1 break-all"
                >
                  {k}
                </code>
              ))}
            </div>
            <p className="text-[11px] text-gray-400 font-semibold">
              另外前台追蹤需設定 NEXT_PUBLIC_GA_ID_CUTEPOINT。
            </p>
          </div>
        ) : !data ? (
          /* GA4 失敗且無快取 / API 錯誤 */
          <div className="bg-white rounded-3xl border border-brand-border shadow-sm p-10 sm:p-16 text-center space-y-3">
            <span className="text-4xl block">😿</span>
            <h2 className="text-base font-black text-brand-dark">暫時無法取得 GA 數據</h2>
            <p className="text-xs text-brand-muted font-semibold">
              {fetchError
                ? "連線後台 API 失敗，請稍後再試。"
                : "GA4 連線失敗且目前沒有快取數據，請稍後再試。"}
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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatCard
                label="今日使用者"
                value={data.todayUsers}
                accent="text-brand-dark"
                icon="👤"
              />
              <StatCard
                label={`${rangeLabel}使用者`}
                value={data.users}
                accent="text-blue-600"
                icon="👥"
              />
              <StatCard
                label={`${rangeLabel}瀏覽量`}
                value={data.pageViews}
                accent="text-emerald-600"
                icon="👀"
              />
              <StatCard
                label={`詢價送出數（${rangeLabel}）`}
                value={data.submitInquiry}
                accent="text-brand-orange"
                icon="📮"
              />
            </div>

            {/* 事件統計卡片 */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              <StatCard
                label={`試算次數（${rangeLabel}）`}
                value={data.calculatePrice}
                accent="text-purple-600"
                icon="🧮"
              />
              <StatCard
                label={`LINE 點擊數（${rangeLabel}）`}
                value={data.clickLine}
                accent="text-green-600"
                icon="💬"
              />
              <StatCard
                label={`FB 點擊數（${rangeLabel}）`}
                value={data.clickFacebook}
                accent="text-indigo-600"
                icon="👍"
              />
            </div>

            {/* ===== Facebook 導流分析 ===== */}
            {fb && (
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <h2 className="text-base font-black text-brand-dark flex items-center gap-1.5">
                    <span>📣</span> Facebook 導流分析
                  </h2>
                  <span className="text-[11px] font-bold text-brand-muted bg-white border border-brand-border rounded-full px-2.5 py-1">
                    {rangeLabel}
                  </span>
                </div>

                {!fb.hasUtm && <NoUtmNotice />}

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <StatCard
                    label="FB 導入工作階段"
                    value={fb.sessions}
                    accent="text-indigo-600"
                    icon="🚪"
                    hint="來源含 facebook / m.facebook.com / l.facebook.com / lm.facebook.com / Meta 廣告等"
                  />
                  <StatCard
                    label="FB 自然流量"
                    value={fb.organicSessions}
                    accent="text-teal-600"
                    icon="🌱"
                    hint="utm_medium=organic_social，或無 UTM 的 Facebook referral"
                  />
                  <StatCard
                    label="FB 付費流量"
                    value={fb.paidSessions}
                    accent="text-rose-600"
                    icon="💰"
                    hint="utm_medium=paid_social / cpc 等付費媒介"
                  />
                  <StatCard
                    label="FB 導入後詢價數"
                    value={fb.inquiries}
                    accent="text-brand-orange"
                    icon="📮"
                    hint="submit_inquiry（詢價成功送出後才計）"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  <StatCard
                    label="FB 詢價轉換率"
                    value={fb.conversionRate}
                    display={formatPct(fb.conversionRate)}
                    accent="text-brand-orange"
                    icon="🎯"
                    hint="FB 導入詢價數 ÷ FB 導入工作階段 × 100%（工作階段為 0 時顯示 0%）"
                  />
                  <StatCard
                    label="FB 導入後 LINE 點擊"
                    value={fb.lineClicks}
                    accent="text-green-600"
                    icon="💬"
                  />
                  <StatCard
                    label="FB 導入後試算次數"
                    value={fb.calculatePrice}
                    accent="text-purple-600"
                    icon="🧮"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <FbTable
                    title="Facebook 熱門活動 Top 5"
                    icon="🏅"
                    headers={["活動名稱（utm_campaign）", "工作階段", "詢價", "轉換率"]}
                    rows={fb.topCampaigns.map((c) => ({
                      name: c.name,
                      cells: [
                        c.sessions.toLocaleString(),
                        c.inquiries.toLocaleString(),
                        formatPct(c.conversionRate),
                      ],
                    }))}
                    emptyText="尚無帶 utm_campaign 的 Facebook 流量"
                  />
                  <FbTable
                    title="Facebook 熱門貼文 Top 5"
                    icon="📝"
                    headers={["貼文名稱（utm_content）", "工作階段", "詢價", "LINE"]}
                    rows={fb.topContents.map((c) => ({
                      name: c.name,
                      cells: [
                        c.sessions.toLocaleString(),
                        c.inquiries.toLocaleString(),
                        c.lineClicks.toLocaleString(),
                      ],
                    }))}
                    emptyText="尚無帶 utm_content 的 Facebook 流量"
                  />
                  <FbTrendChart trend={fb.trend} />
                  <RankList
                    title="Facebook 來源明細"
                    icon="🔍"
                    rows={fb.sources.map((s) => ({ label: s.source, value: s.sessions }))}
                    emptyText="尚無 Facebook 導入流量"
                  />
                </div>

                <UtmGuide />
              </div>
            )}

            {/* ===== 全站數據 ===== */}
            <h2 className="text-base font-black text-brand-dark flex items-center gap-1.5 pt-2">
              <span>🌐</span> 全站數據
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <RankList
                title={`熱門頁面 Top 5（${rangeLabel}）`}
                icon="🔥"
                rows={data.topPages.map((p) => ({ label: p.path, value: p.views }))}
                emptyText="尚無頁面瀏覽數據"
              />
              <RankList
                title={`事件排行 Top 10（${rangeLabel}）`}
                icon="🏆"
                rows={data.topEvents.map((e) => ({
                  label: eventLabels[e.name] ? `${eventLabels[e.name]}（${e.name}）` : e.name,
                  value: e.count,
                }))}
                emptyText="尚無事件數據"
              />
              <RankList
                title={`流量來源 Top 5（${rangeLabel}）`}
                icon="🚏"
                rows={data.sources.map((s) => ({ label: s.source, value: s.sessions }))}
                emptyText="尚無流量來源數據"
              />

              {/* 每日趨勢 */}
              <div className="bg-white rounded-3xl border border-brand-border shadow-sm p-5 sm:p-6 min-w-0">
                <h3 className="text-sm font-extrabold text-brand-dark mb-4 flex items-center gap-1.5">
                  <span>📈</span> {rangeLabel}趨勢
                </h3>
                {data.trend.length === 0 ? (
                  <p className="text-xs text-gray-400 font-semibold py-6 text-center">
                    尚無趨勢數據
                  </p>
                ) : (
                  <>
                    <div className="overflow-x-auto -mx-1 px-1">
                      <div
                        className="flex items-end gap-2 h-40"
                        style={{ minWidth: `${Math.max(data.trend.length * 36, 280)}px` }}
                      >
                        {data.trend.map((t) => (
                          <div
                            key={t.date}
                            className="flex-1 flex flex-col items-center gap-1 h-full justify-end min-w-[28px]"
                            title={`${formatGaDate(t.date)}：${t.views.toLocaleString()} 瀏覽 / ${t.users.toLocaleString()} 使用者`}
                          >
                            <span className="text-[9px] font-bold text-brand-muted">
                              {t.views.toLocaleString()}
                            </span>
                            <div
                              className="w-full max-w-10 bg-brand-orange/70 hover:bg-brand-orange rounded-t-lg transition-colors"
                              style={{ height: `${Math.max((t.views / trendMax) * 100, 3)}%` }}
                            />
                            <span className="text-[9px] font-bold text-gray-400 whitespace-nowrap">
                              {formatGaDate(t.date)}
                            </span>
                          </div>
                        ))}
                      </div>
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
