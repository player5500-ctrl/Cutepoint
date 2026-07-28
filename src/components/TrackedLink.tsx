"use client";

import type { ReactNode } from "react";
import { safeTrackEvent } from "@/lib/analytics";

// 外部連結 + GA4 事件追蹤（供 server component 也能使用的最小 client 元件）
// 只傳送非個資參數（來源位置、頁面路徑等），一次點擊只送一次事件。
export default function TrackedLink({
  href,
  event,
  params,
  className,
  children,
  external = true,
}: {
  href: string;
  event: string;
  params?: Record<string, string | number | boolean>;
  className?: string;
  children: ReactNode;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      onClick={() => safeTrackEvent(event, params)}
      className={className}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
}
