// GA4 Data API（server 端專用）— 萌點 / Cutepoint
// 注意：本檔案只能在 API Route / Server 端使用，絕不可被前端元件 import。
// 使用環境變數（皆不可加 NEXT_PUBLIC_ 前綴）：
//   GA4_PROPERTY_ID_CUTEPOINT      GA4 Property ID（純數字）
//   GOOGLE_ANALYTICS_CLIENT_EMAIL  service account email
//   GOOGLE_ANALYTICS_PRIVATE_KEY   service account private key（\n 會自動還原）
// 不引入任何第三方套件：以 Node 內建 crypto 簽 JWT，直接呼叫 GA4 Data API REST。

import crypto from "crypto";

export interface CutepointAnalytics {
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
    throw new Error(`OAuth token exchange failed: ${res.status} ${await res.text()}`);
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

// 讀取萌點 Property 的完整儀表板數據
export async function fetchCutepointAnalytics(): Promise<CutepointAnalytics> {
  const token = await getAccessToken();

  const [todayRep, totalsRep, trendRep, pagesRep, sourcesRep, eventsRep] =
    await Promise.all([
      // 今日使用者
      runReport(token, {
        dateRanges: [{ startDate: "today", endDate: "today" }],
        metrics: [{ name: "activeUsers" }],
      }),
      // 近 7 天使用者 / 瀏覽量
      runReport(token, {
        dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
        metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }],
      }),
      // 近 7 天每日趨勢
      runReport(token, {
        dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
        dimensions: [{ name: "date" }],
        metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }],
        orderBys: [{ dimension: { dimensionName: "date" } }],
      }),
      // 熱門頁面 Top 5
      runReport(token, {
        dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
        dimensions: [{ name: "pagePath" }],
        metrics: [{ name: "screenPageViews" }],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: 5,
      }),
      // 流量來源 Top 5
      runReport(token, {
        dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
        dimensions: [{ name: "sessionSource" }],
        metrics: [{ name: "sessions" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 5,
      }),
      // 事件排行（一次抓 50 筆，再從中取指定事件數與 Top 10）
      runReport(token, {
        dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
        dimensions: [{ name: "eventName" }],
        metrics: [{ name: "eventCount" }],
        orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
        limit: 50,
      }),
    ]);

  const eventRows = (eventsRep.rows ?? []).map((r) => ({
    name: r.dimensionValues?.[0]?.value ?? "",
    count: num(r.metricValues?.[0]?.value),
  }));
  const eventCount = (name: string) =>
    eventRows.find((e) => e.name === name)?.count ?? 0;

  return {
    todayUsers: num(todayRep.rows?.[0]?.metricValues?.[0]?.value),
    users7d: num(totalsRep.rows?.[0]?.metricValues?.[0]?.value),
    pageViews7d: num(totalsRep.rows?.[0]?.metricValues?.[1]?.value),
    calculatePrice: eventCount("calculate_price"),
    submitInquiry: eventCount("submit_inquiry"),
    clickLine: eventCount("click_line"),
    clickFacebook: eventCount("click_facebook"),
    topPages: (pagesRep.rows ?? []).map((r) => ({
      path: r.dimensionValues?.[0]?.value ?? "",
      views: num(r.metricValues?.[0]?.value),
    })),
    sources: (sourcesRep.rows ?? []).map((r) => ({
      source: r.dimensionValues?.[0]?.value ?? "(direct)",
      sessions: num(r.metricValues?.[0]?.value),
    })),
    topEvents: eventRows.slice(0, 10),
    trend: (trendRep.rows ?? []).map((r) => ({
      date: r.dimensionValues?.[0]?.value ?? "",
      users: num(r.metricValues?.[0]?.value),
      views: num(r.metricValues?.[1]?.value),
    })),
    fetchedAt: new Date().toISOString(),
  };
}
