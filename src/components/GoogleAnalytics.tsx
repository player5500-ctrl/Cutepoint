"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { GA_ID, safeTrackPageView } from "@/lib/analytics";

// 路由變化時送 pageview（App Router SPA 導頁不會重新載入頁面）
function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const qs = searchParams?.toString();
    safeTrackPageView(pathname + (qs ? `?${qs}` : ""));
  }, [pathname, searchParams]);

  return null;
}

export function GoogleAnalytics() {
  // 未設定 GA ID → 完全不載入（server/client 一致，無 hydration mismatch）。
  if (!GA_ID) return null;
  // 開發模式（next dev）完全不載入 GA，避免測試數據進正式 GA4 資源。
  if (process.env.NODE_ENV !== "production") return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          var h = (window.location.hostname || '').toLowerCase();
          // 開發用主機（localhost / .local / 私有網段 IP）不初始化、不送正式數據
          var isDevHost =
            h === 'localhost' || h === '127.0.0.1' || h === '::1' || h === '[::1]' ||
            h.endsWith('.local') || h.endsWith('.localhost') ||
            /^10\\./.test(h) || /^192\\.168\\./.test(h) ||
            /^172\\.(1[6-9]|2[0-9]|3[01])\\./.test(h);
          if (!isDevHost) {
            gtag('js', new Date());
            // send_page_view: false —— 首次與後續 pageview 一律交由 PageViewTracker 送，避免重複
            gtag('config', '${GA_ID}', { send_page_view: false });
          }
        `}
      </Script>
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
    </>
  );
}

export default GoogleAnalytics;
