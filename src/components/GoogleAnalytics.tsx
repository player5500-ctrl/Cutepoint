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
          var h = window.location.hostname;
          // localhost 開發環境不初始化、不送正式數據
          if (h !== 'localhost' && h !== '127.0.0.1' && h !== '::1' && !h.endsWith('.local')) {
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
