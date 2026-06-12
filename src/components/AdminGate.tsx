"use client";

import { useState, useEffect, ReactNode } from "react";

// 取得已登入的後台密碼（供 API 請求帶上 x-admin-key）
export function getAdminKey(): string {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem("cp_admin_key") || "";
}

// 後台密碼閘門：包住後台頁面內容，驗證通過才顯示
export default function AdminGate({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<"checking" | "locked" | "open">("checking");
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const verify = async (key: string, remember: boolean): Promise<boolean> => {
    try {
      const res = await fetch("/api/studio-auth", {
        method: "POST",
        headers: { "x-admin-key": key },
      });
      if (res.ok) {
        if (remember) sessionStorage.setItem("cp_admin_key", key);
        setStatus("open");
        return true;
      }
    } catch (e) {
      console.error("Auth check failed", e);
    }
    return false;
  };

  useEffect(() => {
    (async () => {
      const ok = await verify(getAdminKey(), false);
      if (!ok) setStatus("locked");
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === "checking") {
    return (
      <div className="flex justify-center py-32">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange" />
      </div>
    );
  }

  if (status === "open") return <>{children}</>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const ok = await verify(input, true);
    if (!ok) setError("密碼錯誤，請再試一次");
    setSubmitting(false);
  };

  return (
    <div className="w-full py-24 flex justify-center bg-brand-cream/20 min-h-[60vh]">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl border border-brand-border/60 p-8 shadow-sm w-full max-w-sm space-y-5 h-fit"
      >
        <div className="text-center space-y-1">
          <span className="text-3xl block">🔒</span>
          <h1 className="text-lg font-black text-brand-dark">後台管理登入</h1>
          <p className="text-xs text-brand-muted font-medium">請輸入管理密碼</p>
        </div>
        <input
          type="password"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="管理密碼"
          autoFocus
          className="w-full px-4 py-3 rounded-xl border border-brand-border focus:border-brand-orange focus:outline-none text-sm font-medium"
        />
        {error && <p className="text-xs text-red-500 font-bold">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 rounded-full text-sm font-extrabold text-white bg-brand-orange hover:bg-brand-orange-hover shadow-sm transition-all disabled:opacity-50"
        >
          {submitting ? "驗證中…" : "進入後台"}
        </button>
      </form>
    </div>
  );
}
