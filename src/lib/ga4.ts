// GA4 Data API（server 端專用）— 萌點 / Cutepoint
// 注意：本檔案只能在 API Route / Server 端使用，絕不可被前端元件 import。
// 使用環境變數（皆不可加 NEXT_PUBLIC_ 前綴）：
//   GA4_PROPERTY_ID_CUTEPOINT      GA4 Property ID（純數字）
//   GOOGLE_ANALYTICS_CLIENT_EMAIL  service account email
//   GOOGLE_ANALYTICS_PRIVATE_KEY   service account private key（\n 會自動還原）
// 不引入任何第三方套件：以 Node 內建 crypto 簽 JWT，直接呼叫 GA4 Data API REST。

import crypto from "crypto";

// ====== 日期範圍 ======
export type RangeKey = "today" | "7d" | "30d";

export const RANGES: Record<RangeKey, { startDate: string; endDate: string; label: string }> = {
  today: { startDate: "today", endDate: "today", label: "今天" },
  "7d": { startDate: "7daysAgo", endDate: "today", label: "近 7 天" },
  "30d": { startDate: "30daysAgo", endDate: "today", label: "近 30 天" },
};

export function parseRange(value: string | null | undefined): RangeKey {
  return value === "today" || value === "7d" || value === "30d" ? value : "7d";
}

// ====== 資料型別 ======
export interface FbCampaignRow {
  name: string;
  sessions: number;
  inquiries: number;
  conversionRate: number; // %（sessions 為 0 時固定 0）
}

export interface FbContentRow {
  name: string;
  sessions: number;
  inquiries: number;
  lineClicks: number;
}

export interface FbTrendRow {
  date: string; // yyyymmdd
  sessions: number;
  inquiries: number;
  lineClicks: number;
}

export interface FacebookAnalytics {
  sessions: number; // Facebook 導入工作階段
  organicSessions: number; // utm_medium 為自然貼文（含無 UTM 的 referral）
  paidSessions: number; // utm_medium 為付費廣告
  otherSessions: number; // 無法歸類的 medium
  inquiries: number; // Facebook 導入後 submit_inquiry
  lineClicks: number; // Facebook 導入後 click_line
  calculatePrice: number; // Facebook 導入後 calculate_price
  conversionRate: number; // 詢價轉換率 %（sessions 為 0 → 0）
  hasUtm: boolean; // 是否有可辨識的 utm_campaign / utm_content
  sources: { source: string; sessions: number }[]; // 實際辨識到的 FB 來源
  topCampaigns: FbCampaignRow[];
  topContents: FbContentRow[];
  trend: FbTrendRow[];
}

export interface CutepointAnalytics {
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

// ====== 環境變數 ======
function getEnv() {
  const propertyId = process.env.GA4_PROPERTY_ID_CUTEPOINT ?? "";
  const clientEmail = process.env.GOOGLE_ANALYTICS_CLIENT_EMAIL ?? "";
  // Vercel 環境變數常把換行存成字面 \n，這裡還原成真正的換行
  const privateKey = (process.env.GOOGLE_ANALYTICS_PRIVATE_KEY ?? "").replace(/\\n/g, "\n");
  return { propertyId, clientEmail, privateKey };
}

// 是否已設定 GA4 環境變數（未設定時 API 回報「尚未設定」，不報錯）
export function gaConfigured(): boolean {
  const { propertyId, clientEmail, privateKey } = getEnv();
  return !!(propertyId && clientEmail && privateKey);
}

// 缺少哪些環境變數（僅回傳變數名稱，絕不回傳內容）
export function missingGaEnv(): string[] {
  const { propertyId, clientEmail, privateKey } = getEnv();
  const missing: string[] = [];
  if (!propertyId) missing.push("GA4_PROPERTY_ID_CUTEPOINT");
  if (!clientEmail) missing.push("GOOGLE_ANALYTICS_CLIENT_EMAIL");
  if (!privateKey) missing.push("GOOGLE_ANALYTICS_PRIVATE_KEY");
  return missing;
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// 以 service account 簽 JWT 換取 access token
async function getAccessToken(): Promise<string> {
  const { clientEmail, privateKey } = getEnv();
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64url(
    JSON.stringify({
      iss: clientEmail,
      scope: "https://www.googleapis.com/auth/analytics.readonly",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    })
  );
  const unsigned = `${header}.${payload}`;
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(unsigned);
  const jwt = `${unsigned}.${base64url(signer.sign(privateKey))}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  if (!res.ok) {
    // 只回報 HTTP 狀態，不輸出憑證內容
    throw new Error(`OAuth token exchange failed: ${res.status}`);
  }
  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token) throw new Error("OAuth response missing access_token");
  return json.access_token;
}

interface Ga4Row {
  dimensionValues?: { value?: string }[];
  metricValues?: { value?: string }[];
}
interface Ga4Report {
  rows?: Ga4Row[];
}

async function runReport(token: string, body: object): Promise<Ga4Report> {
  const { propertyId } = getEnv();
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) {
    throw new Error(`GA4 runReport failed: ${res.status} ${await res.text()}`);
  }
  return (await res.json()) as Ga4Report;
}

const num = (v?: string) => {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
};

const dim = (r: Ga4Row, i: number) => r.dimensionValues?.[i]?.value ?? "";

// 除以零保護：分母為 0 時回傳 0，不會出現 NaN / Infinity
export function rate(numerator: number, denominator: number): number {
  if (!denominator || !Number.isFinite(denominator) || denominator <= 0) return 0;
  const r = (numerator / denominator) * 100;
  return Number.isFinite(r) ? Math.round(r * 10) / 10 : 0;
}

// ====== Facebook 來源辨識 ======
// 涵蓋 facebook / m.facebook.com / l.facebook.com / lm.facebook.com / web.facebook.com、
// fb / fb.me、Meta 廣告（meta、meta_ads）、Messenger、Meta Audience Network（an）。
export function isFacebookSource(source: string): boolean {
  const s = source.toLowerCase().trim();
  if (!s) return false;
  if (s.includes("facebook")) return true;
  if (s === "fb" || s === "fb.me" || s.startsWith("fb.") || s.includes("fbclid")) return true;
  if (
    s === "meta" ||
    s.startsWith("meta_") ||
    s.startsWith("meta-") ||
    s.includes("meta ads") ||
    s.includes("metaads")
  ) {
    return true;
  }
  if (s === "messenger" || s.includes("messenger.com")) return true;
  if (s === "an" || s === "audience_network") return true;
  return false;
}

type FbChannel = "organic" | "paid" | "other";

// utm_medium 分類：organic_social → 自然貼文；paid_social / cpc → 付費廣告
export function classifyFbMedium(medium: string): FbChannel {
  const m = medium.toLowerCase().trim();
  if (!m) return "other";
  if (
    m.includes("paid") ||
    m === "cpc" ||
    m === "ppc" ||
    m === "cpm" ||
    m === "cpv" ||
    m === "display" ||
    m.includes("ads")
  ) {
    return "paid";
  }
  // 無 UTM 的 Facebook referral 視為自然流量（使用者點貼文連結進站）
  if (
    m.includes("organic") ||
    m === "social" ||
    m === "referral" ||
    m === "(none)" ||
    m === "post" ||
    m === "social_post"
  ) {
    return "organic";
  }
  return "other";
}

// GA4 以 (not set) / (direct) 等佔位字串表示無值
const PLACEHOLDERS = new Set([
  "(not set)",
  "(direct)",
  "(none)",
  "(other)",
  "(organic)",
  "not set",
  "",
]);
function isSetValue(v: string): boolean {
  return !PLACEHOLDERS.has(v.toLowerCase().trim());
}

const FB_EVENTS = ["submit_inquiry", "click_line", "calculate_price"];

// ====== 主查詢 ======
export async function fetchCutepointAnalytics(
  range: RangeKey = "7d"
): Promise<CutepointAnalytics> {
  const token = await getAccessToken();
  const { startDate, endDate, label } = RANGES[range];
  const dateRanges = [{ startDate, endDate }];

  const [
    todayRep,
    totalsRep,
    trendRep,
    pagesRep,
    sourcesRep,
    eventsRep,
    fbSessionsRep,
    fbEventsRep,
    fbTrendSessionsRep,
    fbTrendEventsRep,
  ] = await Promise.all([
    // 今日使用者（固定為今天，不隨選取範圍改變）
    runReport(token, {
      dateRanges: [{ startDate: "today", endDate: "today" }],
      metrics: [{ name: "activeUsers" }],
    }),
    // 區間使用者 / 瀏覽量
    runReport(token, {
      dateRanges,
      metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }],
    }),
    // 每日趨勢
    runReport(token, {
      dateRanges,
      dimensions: [{ name: "date" }],
      metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }],
      orderBys: [{ dimension: { dimensionName: "date" } }],
      limit: 100,
    }),
    // 熱門頁面 Top 5
    runReport(token, {
      dateRanges,
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }],
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 5,
    }),
    // 流量來源 Top 5
    runReport(token, {
      dateRanges,
      dimensions: [{ name: "sessionSource" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 5,
    }),
    // 事件排行（一次抓 50 筆，再從中取指定事件數與 Top 10）
    runReport(token, {
      dateRanges,
      dimensions: [{ name: "eventName" }],
      metrics: [{ name: "eventCount" }],
      orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
      limit: 50,
    }),
    // Facebook 導流：來源 / 媒介 / 活動 / 貼文 × 工作階段
    runReport(token, {
      dateRanges,
      dimensions: [
        { name: "sessionSource" },
        { name: "sessionMedium" },
        { name: "sessionCampaignName" },
        { name: "sessionManualAdContent" },
      ],
      metrics: [{ name: "sessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 1000,
    }),
    // Facebook 導流後的關鍵事件（依活動 / 貼文拆分）
    runReport(token, {
      dateRanges,
      dimensions: [
        { name: "sessionSource" },
        { name: "sessionCampaignName" },
        { name: "sessionManualAdContent" },
        { name: "eventName" },
      ],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: {
        filter: {
          fieldName: "eventName",
          inListFilter: { values: FB_EVENTS, caseSensitive: true },
        },
      },
      limit: 2000,
    }),
    // Facebook 每日工作階段
    runReport(token, {
      dateRanges,
      dimensions: [{ name: "date" }, { name: "sessionSource" }, { name: "sessionMedium" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ dimension: { dimensionName: "date" } }],
      limit: 5000,
    }),
    // Facebook 每日事件
    runReport(token, {
      dateRanges,
      dimensions: [{ name: "date" }, { name: "sessionSource" }, { name: "eventName" }],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: {
        filter: {
          fieldName: "eventName",
          inListFilter: { values: ["submit_inquiry", "click_line"], caseSensitive: true },
        },
      },
      orderBys: [{ dimension: { dimensionName: "date" } }],
      limit: 5000,
    }),
  ]);

  const eventRows = (eventsRep.rows ?? []).map((r) => ({
    name: dim(r, 0),
    count: num(r.metricValues?.[0]?.value),
  }));
  const eventCount = (name: string) => eventRows.find((e) => e.name === name)?.count ?? 0;

  const trend = (trendRep.rows ?? []).map((r) => ({
    date: dim(r, 0),
    users: num(r.metricValues?.[0]?.value),
    views: num(r.metricValues?.[1]?.value),
  }));

  const facebook = buildFacebook(
    fbSessionsRep,
    fbEventsRep,
    fbTrendSessionsRep,
    fbTrendEventsRep,
    trend.map((t) => t.date)
  );

  return {
    range,
    rangeLabel: label,
    todayUsers: num(todayRep.rows?.[0]?.metricValues?.[0]?.value),
    users: num(totalsRep.rows?.[0]?.metricValues?.[0]?.value),
    pageViews: num(totalsRep.rows?.[0]?.metricValues?.[1]?.value),
    calculatePrice: eventCount("calculate_price"),
    submitInquiry: eventCount("submit_inquiry"),
    clickLine: eventCount("click_line"),
    clickFacebook: eventCount("click_facebook"),
    topPages: (pagesRep.rows ?? []).map((r) => ({
      path: dim(r, 0),
      views: num(r.metricValues?.[0]?.value),
    })),
    sources: (sourcesRep.rows ?? []).map((r) => ({
      source: dim(r, 0) || "(direct)",
      sessions: num(r.metricValues?.[0]?.value),
    })),
    topEvents: eventRows.slice(0, 10),
    trend,
    facebook,
    fetchedAt: new Date().toISOString(),
  };
}

// ====== Facebook 統計組裝 ======
// export 供單元測試使用（server 端模組，不會被打包進前端）
export function buildFacebook(
  sessionsRep: Ga4Report,
  eventsRep: Ga4Report,
  trendSessionsRep: Ga4Report,
  trendEventsRep: Ga4Report,
  allDates: string[]
): FacebookAnalytics {
  let sessions = 0;
  let organicSessions = 0;
  let paidSessions = 0;
  let otherSessions = 0;
  let hasUtm = false;

  const sourceMap = new Map<string, number>();
  const campaignSessions = new Map<string, number>();
  const contentSessions = new Map<string, number>();

  for (const r of sessionsRep.rows ?? []) {
    const source = dim(r, 0);
    if (!isFacebookSource(source)) continue;
    const medium = dim(r, 1);
    const campaign = dim(r, 2);
    const content = dim(r, 3);
    const s = num(r.metricValues?.[0]?.value);

    sessions += s;
    const channel = classifyFbMedium(medium);
    if (channel === "organic") organicSessions += s;
    else if (channel === "paid") paidSessions += s;
    else otherSessions += s;

    sourceMap.set(source, (sourceMap.get(source) ?? 0) + s);
    if (isSetValue(campaign)) {
      hasUtm = true;
      campaignSessions.set(campaign, (campaignSessions.get(campaign) ?? 0) + s);
    }
    if (isSetValue(content)) {
      hasUtm = true;
      contentSessions.set(content, (contentSessions.get(content) ?? 0) + s);
    }
  }

  // Facebook 導入後的事件數（總計 + 依活動 / 貼文拆分）
  let inquiries = 0;
  let lineClicks = 0;
  let calculatePrice = 0;
  const campaignInquiries = new Map<string, number>();
  const contentInquiries = new Map<string, number>();
  const contentLineClicks = new Map<string, number>();

  for (const r of eventsRep.rows ?? []) {
    const source = dim(r, 0);
    if (!isFacebookSource(source)) continue;
    const campaign = dim(r, 1);
    const content = dim(r, 2);
    const eventName = dim(r, 3);
    const c = num(r.metricValues?.[0]?.value);

    if (eventName === "submit_inquiry") {
      inquiries += c;
      if (isSetValue(campaign)) {
        campaignInquiries.set(campaign, (campaignInquiries.get(campaign) ?? 0) + c);
      }
      if (isSetValue(content)) {
        contentInquiries.set(content, (contentInquiries.get(content) ?? 0) + c);
      }
    } else if (eventName === "click_line") {
      lineClicks += c;
      if (isSetValue(content)) {
        contentLineClicks.set(content, (contentLineClicks.get(content) ?? 0) + c);
      }
    } else if (eventName === "calculate_price") {
      calculatePrice += c;
    }
  }

  const topCampaigns: FbCampaignRow[] = [...campaignSessions.entries()]
    .map(([name, s]) => {
      const inq = campaignInquiries.get(name) ?? 0;
      return { name, sessions: s, inquiries: inq, conversionRate: rate(inq, s) };
    })
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 5);

  const topContents: FbContentRow[] = [...contentSessions.entries()]
    .map(([name, s]) => ({
      name,
      sessions: s,
      inquiries: contentInquiries.get(name) ?? 0,
      lineClicks: contentLineClicks.get(name) ?? 0,
    }))
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 5);

  // 每日趨勢：以主趨勢的日期為基準補齊 0，避免圖表缺格
  const trendMap = new Map<string, FbTrendRow>();
  const ensure = (date: string) => {
    let row = trendMap.get(date);
    if (!row) {
      row = { date, sessions: 0, inquiries: 0, lineClicks: 0 };
      trendMap.set(date, row);
    }
    return row;
  };
  for (const d of allDates) ensure(d);

  for (const r of trendSessionsRep.rows ?? []) {
    if (!isFacebookSource(dim(r, 1))) continue;
    ensure(dim(r, 0)).sessions += num(r.metricValues?.[0]?.value);
  }
  for (const r of trendEventsRep.rows ?? []) {
    if (!isFacebookSource(dim(r, 1))) continue;
    const row = ensure(dim(r, 0));
    const eventName = dim(r, 2);
    const c = num(r.metricValues?.[0]?.value);
    if (eventName === "submit_inquiry") row.inquiries += c;
    else if (eventName === "click_line") row.lineClicks += c;
  }

  const trend = [...trendMap.values()].sort((a, b) => a.date.localeCompare(b.date));

  return {
    sessions,
    organicSessions,
    paidSessions,
    otherSessions,
    inquiries,
    lineClicks,
    calculatePrice,
    conversionRate: rate(inquiries, sessions),
    hasUtm,
    sources: [...sourceMap.entries()]
      .map(([source, s]) => ({ source, sessions: s }))
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, 5),
    topCampaigns,
    topContents,
    trend,
  };
}
