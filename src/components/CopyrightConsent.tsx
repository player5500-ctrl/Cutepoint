"use client";

import { useState } from "react";

// 著作權與授權聲明 —— 客戶閱讀後勾選確認
export function CopyrightConsent() {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="max-w-5xl mx-auto mt-8 bg-white rounded-2xl border border-brand-orange/40 p-5 sm:p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <span className="w-9 h-9 rounded-full bg-brand-orange text-white font-black flex items-center justify-center text-sm">
          ✓
        </span>
        <h2 className="text-base font-black text-brand-dark">著作權與授權聲明</h2>
      </div>

      <div className="rounded-xl bg-brand-cream/40 border border-brand-border/60 p-4 space-y-3 text-xs sm:text-sm text-brand-muted leading-relaxed font-medium">
        <p>
          我確認我提供之照片、模型、設計及相關素材均已取得合法使用權或授權，不侵害任何第三人之著作權、商標權、肖像權或其他智慧財產權。
        </p>
        <p>
          如因委製方提供素材致第三人提出任何民、刑事主張或求償，應自行負責並賠償因此致本公司所受之一切損害。
        </p>
      </div>

      <label
        className={`mt-4 flex items-start gap-3 rounded-xl p-3.5 border cursor-pointer transition-colors ${
          agreed
            ? "border-brand-orange/50 bg-brand-peach-light/50"
            : "border-brand-border/60 bg-brand-cream/30 hover:bg-brand-peach-light/30"
        }`}
      >
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 h-4 w-4 flex-shrink-0 cursor-pointer"
          style={{ accentColor: "#f97316" }}
        />
        <span className="text-xs sm:text-sm font-bold text-brand-dark leading-relaxed">
          我已閱讀並確認上述著作權與授權聲明：所提供之照片、模型、設計及相關素材均已取得合法使用權或授權，不侵害任何第三人之智慧財產權，並願就委製方提供素材所生之第三人主張自行負責。
        </span>
      </label>

      {agreed ? (
        <p className="mt-3 text-xs font-bold text-green-600">✓ 已確認，感謝您的配合！</p>
      ) : null}
    </div>
  );
}
