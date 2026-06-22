"use client";

import { useState, useEffect } from "react";
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

const caseStudies: {
  id: number;
  title: string;
  category: string;
  desc: string;
  size: string;
  days: string;
  img: string;
}[] = [];

export default function ShowcasePage() {
  const [activeCategory, setActiveCategory] = useState("全部案例");
  const [dynamicCases, setDynamicCases] = useState<typeof caseStudies>([]);

  // 讀取後台 /studio 新增的作品案例
  useEffect(() => {
    fetch("/api/cases", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => Array.isArray(data) && setDynamicCases(data))
      .catch(() => {});
  }, []);

  const allCases = [...dynamicCases, ...caseStudies];

  const filteredCases = activeCategory === "全部案例"
    ? allCases
    : allCases.filter((c) => c.category === activeCategory);

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
            每一件作品背後，都有顧客想留住的故事。我們用專業 3D 技術，陪你把重要的人事物化成能捧在手心的紀念。
          </p>
        </div>

        {/* Q-chan mascot message */}
        <div className="max-w-3xl mx-auto mb-12">
          <QChan
            image="/assets/qchan/q_wow.gif"
            text={`這些案例，都是客人與萌點3D 一起完成的作品🐾！\n從一張照片開始，經 3D處理人員整理結構、修模與分件後，才變成能收藏的立體公仔。\n你也可以參考尺寸與複雜度，點擊下方按鈕試算類似項目。`}
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
