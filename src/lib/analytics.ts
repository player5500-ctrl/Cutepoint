// GA4 共用追蹤工具 — 萌點 / Cutepoint
// 設計原則：
//  1. Measurement ID 一律由環境變數提供，程式碼不寫死。
//  2. 未設定 GA ID 或在 localhost 開發環境時，所有函式安全 no-op，絕不報錯、不送正式數據。
//  3. 對外一律使用 safeTrackEvent / safeTrackPageView（try/catch 包裝）。
//  4. safeTrackEvent 內建個資過濾：即使呼叫端誤帶姓名/電話/Email 等鍵，也會被剔除。

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID_CUTEPOINT ?? "";

type Params = Record<string, unknown>;

// 禁止送往 GA4 的個資鍵（子字串比對，大小寫不拘）
const PII_KEYS = [
  "name", "username", "user_name", "fullname", "full_name",
  "phone", "tel", "mobile", "cellphone",
  "email", "mail",
  "address", "addr", "zip", "postcode",
  "note", "remark", "message", "comment", "content", "memo",
  "id_number", "idnumber", "ssn", "national_id",
  "household", "unit_no", "room", "door",
  "amount", "fee", "payment", "price_paid",
];

function isPiiKey(key: string): boolean {
  const k = key.toLowerCase();
  return PII_KEYS.some((p) => k === p || k.includes(p));
}

// 只保留非個資、基本型別（string/number/boolean）的參數
function sanitize(params?: Params): Params {
  if (!params) return {};
  const out: Params = {};
  for (const [key, value] of Object.entries(params)) {
    if (isPiiKey(key)) continue;
    if (value === null || value === undefined) continue;
    if (typeof value === "object") continue; // 避免整包物件夾帶個資
    out[key] = value;
  }
  return out;
}

function isLocalhost(): boolean {
  if (typeof window === "undefined") return false;
  const h = window.location.hostname;
  return h === "localhost" || h === "127.0.0.1" || h === "::1" || h.endsWith(".local");
}

// 是否允許送 GA：需在瀏覽器、有 GA_ID、且非 localhost
export function gaEnabled(): boolean {
  return typeof window !== "undefined" && !!GA_ID && !isLocalhost();
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

// —— 原始追蹤（內部使用，不含 try/catch）——
export function trackPageView(pagePath?: string): void {
  if (!gaEnabled() || typeof window.gtag !== "function") return;
  const path = pagePath ?? window.location.pathname + window.location.search;
  window.gtag("event", "page_view", {
    page_path: path,
    page_location: window.location.href,
    page_title: typeof document !== "undefined" ? document.title : undefined,
  });
}

export function trackEvent(eventName: string, params?: Params): void {
  if (!gaEnabled() || typeof window.gtag !== "function") return;
  window.gtag("event", eventName, sanitize(params));
}

// —— 安全包裝（對外一律用這兩個）——
export function safeTrackPageView(pagePath?: string): void {
  try {
    trackPageView(pagePath);
  } catch {
    /* 追蹤失敗不得影響網站運作 */
  }
}

export function safeTrackEvent(eventName: string, params?: Params): void {
  try {
    trackEvent(eventName, sanitize(params));
  } catch {
    /* 追蹤失敗不得影響網站運作 */
  }
}
