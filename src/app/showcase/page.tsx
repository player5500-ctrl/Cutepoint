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
  "文創模型",
];

const caseStudies = [
  {
    id: 1,
    title: "森林系婚禮 Q版人像對偶",
    category: "Q版人像公仔",
    desc: "從新人的婚紗照出發，把兩人最幸福的模樣化成 12cm Q版公仔，在簽到桌迎接每一位賓客，也成為親友帶回家的暖心紀念。",
    size: "12cm",
    days: "14天",
    img: "/assets/q_jiang.jpg",
  },
  {
    id: 2,
    title: "英國短毛貓「波波」紀念公仔",
    category: "寵物公仔",
    desc: "波波圓潤的腮幫子與無辜大眼，我們都用心留了下來，再以手工噴塗還原毛色，讓飼主能繼續把最愛的毛孩留在身邊。",
    size: "8cm",
    days: "12天",
    img: "/assets/q_jiang.jpg",
  },
  {
    id: 3,
    title: "AI 生成圖「機械精靈」立體化",
    category: "角色/AI圖轉公仔",
    desc: "客戶用 Midjourney 畫出心中的科幻角色，我們的 3D 師傅以專業建模將平面圖轉為立體結構，分件列印組裝，讓想像第一次真正站在眼前。",
    size: "15cm",
    days: "18天",
    img: "/assets/q_jiang.jpg",
  },
  {
    id: 4,
    title: "「小藍創投」品牌吉祥物公仔",
    category: "企業展示樣品",
    desc: "為創投公司打造展示廳的迎賓吉祥物。我們將企業 LOGO 立體化，以簡潔現代的幾何線條，傳達品牌的專業與親和力。",
    size: "18cm",
    days: "10天",
    img: "/assets/q_jiang.jpg",
  },
  {
    id: 5,
    title: "桌遊「奇幻王國」客製模型配件",
    category: "大量列印服務",
    desc: "桌遊設計工作室委託的 120 套小兵配件代印，以工業級全彩石膏粉末設備批量印製，專業把關卡榫契合度與色彩一致性，如期交付。",
    size: "6cm",
    days: "7天",
    img: "/assets/q_jiang.jpg",
  },
  {
    id: 6,
    title: "原創繪本角色「鯛魚燒貓貓」文創模型",
    category: "文創模型",
    desc: "將平面手繪稿轉為立體文創模型，從建模、面網優化到全彩列印，讓繪本角色走進實體收藏的下一段旅程。",
    size: "10cm",
    days: "7天",
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
            每一件作品背後，都有一段顧客想留住的故事。我們用專業的 3D 技術，陪伴大家把心中重要的人事物，化成能捧在手心的溫暖。
          </p>
        </div>

        {/* Q-chan mascot message */}
        <div className="max-w-3xl mx-auto mb-12">
          <QChan
            image="/assets/qchan/q_wow.gif"
            text={`你看！這些都是我們師傅跟客人一起完成的公仔唷🐾！\n特別是第三個的「機械精靈」，是客人拿自己用 AI 畫的平面圖片轉出來的呢！我們的 3D 師傅用心把它變成立體，客人收到的時候感動得不得了！\n如果你也想做一個，可以參考這些案例的尺寸跟複雜度，點擊底下的按鈕直接去試算看看喔！`}
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
