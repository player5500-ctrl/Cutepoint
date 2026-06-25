"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import QChan from "@/components/QChan";

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const [inquiryId, setInquiryId] = useState("");
  const [clientName, setClientName] = useState("");

  useEffect(() => {
    setInquiryId(searchParams.get("id") || "CP-" + Math.floor(Math.random() * 90000 + 10000));
    setClientName(searchParams.get("name") || "顧客");
  }, [searchParams]);

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-brand-border/60 p-8 md:p-12 shadow-sm text-center space-y-8">
      {/* Decorative success animation badge */}
      <div className="relative w-24 h-24 mx-auto">
        <div className="absolute inset-0 bg-brand-peach/20 rounded-full animate-ping" />
        <div className="relative w-24 h-24 rounded-full bg-brand-yellow-light border-2 border-brand-orange flex items-center justify-center text-5xl shadow-md">
          🎉
        </div>
      </div>

      <div className="space-y-3">
        <h1 className="text-2xl sm:text-3xl font-black text-brand-dark">
          詢價單提交成功！
        </h1>
        <p className="text-sm text-brand-muted font-medium">
          親愛的 <span className="text-brand-orange font-bold">{clientName}</span>，您的詢價單已順利送達我們的系統。
        </p>
      </div>

      {/* Inquiry Detail Badge */}
      <div className="bg-brand-cream/50 rounded-2xl p-4 max-w-sm mx-auto border border-brand-border/40 space-y-1 text-sm font-medium">
        <div className="flex justify-between text-brand-muted">
          <span>詢價 ID：</span>
          <span className="font-extrabold text-brand-dark tracking-wider select-all">
            {inquiryId}
          </span>
        </div>
        <div className="flex justify-between text-brand-muted">
          <span>收件時間：</span>
          <span className="text-brand-dark">
            {new Date().toLocaleString("zh-TW", { hour12: false })}
          </span>
        </div>
      </div>

      {/* Q-chan guide bubble */}
      <div className="text-left">
        <QChan
          image="/assets/qchan/q_thanks.gif"
          text={`收到你的委託單囉，謝謝你的信任💕\n這張詢價單的序號是【${inquiryId}】，Q醬 已經交給專業團隊與 3D處理人員進行評估。\n\n我們會在 24 小時內檢查你上傳的檔案、尺寸與需求複雜度，並透過你留下的聯絡方式回覆正式報價單與後續製作流程，請耐心等候我們唷🐾！`}
          position="left"
        />
      </div>

      {/* Recommended steps */}
      <div className="space-y-4 pt-4 border-t border-brand-border/40">
        <h3 className="text-xs font-black tracking-widest text-brand-orange uppercase">
          後續製作流程簡介
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
          <div className="p-4 bg-brand-cream/20 rounded-xl border border-brand-border/25">
            <span className="text-lg block mb-1">1</span>
            <p className="text-xs font-bold text-brand-dark">需求核對</p>
            <p className="text-[10px] text-brand-muted mt-0.5 font-medium leading-relaxed">確認模型檔案/上色規格與交期</p>
          </div>
          <div className="p-4 bg-brand-cream/20 rounded-xl border border-brand-border/25">
            <span className="text-lg block mb-1">2</span>
            <p className="text-xs font-bold text-brand-dark">3D處理人員建模</p>
            <p className="text-[10px] text-brand-muted mt-0.5 font-medium leading-relaxed">建立 3D 結構並確認細節</p>
          </div>
          <div className="p-4 bg-brand-cream/20 rounded-xl border border-brand-border/25">
            <span className="text-lg block mb-1">3</span>
            <p className="text-xs font-bold text-brand-dark">列印上色</p>
            <p className="text-[10px] text-brand-muted mt-0.5 font-medium leading-relaxed">專業打磨上色與防護包裝寄送</p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-center gap-4 pt-4">
        <Link
          href="/"
          className="px-6 py-2.5 rounded-full text-sm font-bold text-brand-orange bg-brand-peach-light hover:bg-brand-peach/30 transition-all"
        >
          返回首頁
        </Link>
        <Link
          href="/products"
          className="px-6 py-2.5 rounded-full text-sm font-bold text-white bg-brand-orange hover:bg-brand-orange-hover shadow-md transition-all"
        >
          瀏覽其它產品
        </Link>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <div className="w-full py-16 md:py-20 bg-brand-cream/20 flex-grow flex items-center justify-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <Suspense fallback={
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange" />
          </div>
        }>
          <SuccessPageContent />
        </Suspense>
      </div>
    </div>
  );
}
