"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import QChan from "@/components/QChan";

const categories = [
  "全部案例",
  "Q版人像公仔",
  "寵物公仔",
  "角色/AI圖轉公仔",
  "企業展示樣品",
  "大量列印服務",
  "3D 建模與修圖服務",
];

const caseStudies = [
  {
    id: 1,
    title: "森林系婚禮 Q版人像對偶",
    category: "Q版人像公仔",
    desc: "依據新人提供的多角度婚紗照，量身打造 12cm Q版陶質質感公仔，做為婚禮簽到桌看板與伴手禮。",
    size: "12cm",
    days: "14天",
    img: "/assets/q_jiang.jpg",
  },
  {
    id: 2,
    title: "英國短毛貓「波波」紀念公仔",
    category: "寵物公仔",
    desc: "精準雕塑波波圓潤的腮幫子與無辜大眼，手工毛流噴塗上色，為飼主保留最有溫度的毛孩身影。",
    size: "8cm",
    days: "12天",
    img: "/assets/q_jiang.jpg",
  },
  {
    id: 3,
    title: "AI 生成圖「機械精靈」立體化",
    category: "角色/AI圖轉公仔",
    desc: "客戶使用 Midjourney 生成的精細科幻女僕圖。我們的 3D 師進行分件拆分，並在細節處補齊 3D 結構，最終列印組裝而成。",
    size: "15cm",
    days: "18天",
    img: "/assets/q_jiang.jpg",
  },
  {
    id: 4,
    title: "「小藍創投」品牌吉祥物公仔",
    category: "企業展示樣品",
    desc: "為創投公司打造展示廳迎賓吉祥物公仔。我們對企業 LOGO 進行 3D 轉化，呈現出簡潔現代感的幾何切面線條。",
    size: "18cm",
    days: "10天",
    img: "/assets/q_jiang.jpg",
  },
  {
    id: 5,
    title: "桌遊「奇幻王國」客製模型配件",
    category: "大量列印服務",
    desc: "桌遊設計工作室委託的 120 套精細小兵配件代印，使用紅蠟樹脂進行超高精度列印，確保卡榫契合度。",
    size: "6cm",
    days: "7天",
    img: "/assets/q_jiang.jpg",
  },
  {
    id: 6,
    title: "原創繪本角色「鯛魚燒貓貓」建模",
    category: "3D 建模與修圖服務",
    desc: "將平面手繪稿轉為數位 3D 雕塑檔案。完成完整拓撲與面網優化，可直接用於後續動畫製作與實體列印拆件。",
    size: "數位檔案",
    days: "5天",
    img: "/assets/q_jiang.jpg",
  },
];

export default function ShowcasePage() {
  const [activeCategory, setActiveCategory] = useState("全部案例");

  const filteredCases = activeCategory === "全部案例"
    ? caseStudies
    : caseStudies.filter((c) => c.category === activeCategory);

  return (
    <div className="w-full py-12 md:py-16 bg-brand-cream/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-10">
          <span className="text-xs font-black tracking-widest text-brand-orange uppercase bg-brand-peach-light px-3 py-1 rounded-full">
            PORTFOLIO
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-brand-dark">
            作品案例展示
          </h1>
          <p className="text-sm text-brand-muted font-medium">
            在這裡，我們展示了與顧客們共同創作出具有溫馨故事與完美細節的實體 3D 作品。
          </p>
        </div>

        {/* Q-chan mascot message */}
        <div className="max-w-3xl mx-auto mb-12">
          <QChan
            image="/assets/qchan/q_complexity.gif"
            text={`你看！這些都是我們師傅跟客人一起做出來的公仔唷🐾！\n特別是第三個的「機械精靈」，是客人拿自己用 AI 畫的平面圖片轉出來的呢！我們 3D 師父特別對細節做了精細雕琢，做出來的時候大家都驚嘆不已！\n如果你也想做一個，可以參考這些案例的尺寸跟複雜度，點擊底下的按鈕直接去試算看看喔！`}
            position="left"
          />
        </div>

        {/* Filters Tab Row */}
        <div className="flex flex-wrap gap-2.5 justify-center mb-12 max-w-4xl mx-auto">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold border transition-all duration-200 ${
                  isActive
                    ? "border-brand-orange bg-brand-orange text-white shadow-md scale-105"
                    : "border-brand-border bg-white text-brand-muted hover:border-brand-orange/40 hover:bg-brand-cream"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Showcase Grid */}
        {filteredCases.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCases.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-brand-border/60 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                {/* Visual */}
                <div className="relative w-full h-56 bg-brand-cream/30 border-b border-brand-border/40 flex items-center justify-center p-4">
                  <div className="relative w-44 h-44 rounded-2xl overflow-hidden shadow-inner border border-brand-border bg-white">
                    <Image
                      src={item.img}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="absolute top-4 left-4 bg-white/95 px-3 py-1 rounded-full border border-brand-border/60 shadow-sm">
                    <span className="text-[10px] font-extrabold text-brand-orange tracking-wider uppercase">
                      {item.category}
                    </span>
                  </div>
                </div>

                {/* Info Text */}
                <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-black text-brand-dark hover:text-brand-orange transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-brand-muted leading-relaxed font-semibold">
                      {item.desc}
                    </p>
                  </div>

                  {/* Meta data row */}
                  <div className="flex justify-between items-center text-[11px] font-bold text-brand-muted pt-4 border-t border-brand-border/40">
                    <div className="flex gap-1.5 items-center">
                      <span className="text-brand-orange">📏</span>
                      <span>尺寸：{item.size}</span>
                    </div>
                    <div className="flex gap-1.5 items-center">
                      <span className="text-brand-orange">⏱</span>
                      <span>耗時：{item.days}</span>
                    </div>
                  </div>
                </div>

                {/* Quick CTA inside card */}
                <div className="px-6 pb-6 pt-2">
                  <Link
                    href={`/calculator?type=${encodeURIComponent(item.category)}`}
                    className="block w-full text-center py-2.5 rounded-full text-xs font-extrabold text-brand-orange border border-brand-orange hover:bg-brand-peach-light/40 transition-colors"
                  >
                    試算類似項目 ➔
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-brand-border/60 max-w-md mx-auto p-8 space-y-4">
            <span className="text-4xl block">🔍</span>
            <h3 className="text-base font-bold text-brand-dark">目前尚無此類別的案例</h3>
            <p className="text-xs text-brand-muted leading-relaxed">
              我們正努力補齊所有服務類別的成品相片！您可點選下方按鈕直接進行估價試算。
            </p>
            <Link
              href="/calculator"
              className="inline-block px-6 py-2 bg-brand-orange text-white text-xs font-bold rounded-full hover:bg-brand-orange-hover"
            >
              前往成本試算
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
