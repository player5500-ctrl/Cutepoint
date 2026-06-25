"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import QChan from "@/components/QChan";

interface ProductSpec {
  label: string;
  value: string;
}

interface ProductItem {
  id: string;
  name: string;
  desc: string;
  specs: ProductSpec[];
  image: string;
  bg?: string;
  tagColor?: string;
}

// 後台未指定配色時，依序套用的預設色盤
const palette = [
  { bg: "bg-brand-peach-light", tagColor: "text-brand-orange bg-brand-peach-light" },
  { bg: "bg-brand-yellow-light", tagColor: "text-amber-600 bg-brand-yellow-light" },
  { bg: "bg-orange-50", tagColor: "text-brand-orange bg-orange-100" },
  { bg: "bg-brand-peach-light/40", tagColor: "text-pink-600 bg-pink-50" },
  { bg: "bg-brand-yellow-light/40", tagColor: "text-yellow-700 bg-yellow-100" },
  { bg: "bg-emerald-50", tagColor: "text-emerald-600 bg-emerald-100" },
];

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // 暫時只顯示這些產品（避免重疊／清掉其他類別）；要顯示全部就把陣列清空 []
  const ONLY_SHOW_NAMES = ["Q版人物", "Q版人像公仔"];
  const visibleProducts = ONLY_SHOW_NAMES.length
    ? products.filter((p) => ONLY_SHOW_NAMES.some((n) => (p.name || "").includes(n)))
    : products;

  return (
    <div className="w-full py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-12">
          <span className="text-xs font-black tracking-widest text-brand-orange uppercase bg-brand-peach-light px-3 py-1 rounded-full">
            CATEGORIES
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-brand-dark">
            產品與服務類別
          </h1>
          <p className="text-sm sm:text-base text-brand-muted font-medium">
            點擊各類別下方的試算按鈕，可以將該類別預設帶入成本估價器中，快速得出價格範圍唷！
          </p>
        </div>

        {/* Q-chan Mascot guide */}
        <div className="max-w-3xl mx-auto mb-16">
          <QChan
            image="/assets/qchan/q_board.gif"
            text="主打服務都在這裡囉！萌點3D 提供多項製作項目，由 3D處理人員協助檔案整理、修模與列印前確認。從人像、寵物到角色模型，我們都會把細節整理清楚，讓珍貴的模樣更安心地被留下來 ✨"
            position="left"
          />
        </div>

        {/* Product Cards Layout */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-orange" />
          </div>
        ) : visibleProducts.length === 0 ? (
          <div className="text-center py-20 text-sm text-brand-muted font-medium">
            目前尚未上架產品項目，請稍後再回來看看 🐾
          </div>
        ) : (
          <div className="space-y-12">
            {visibleProducts.map((product, idx) => {
              const colors = palette[idx % palette.length];
              const bg = product.bg || colors.bg;
              const tagColor = product.tagColor || colors.tagColor;
              return (
                <div
                  key={product.id}
                  id={`service-${idx}`}
                  className="relative isolate bg-white rounded-3xl border border-brand-border/60 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 grid grid-cols-1 lg:grid-cols-12"
                >
                  {/* Product Visual */}
                  <div className={`lg:col-span-4 relative ${bg} flex items-center justify-center p-5 sm:p-6 overflow-hidden border-b lg:border-b-0 lg:border-r border-brand-border/40`}>
                    {/* 置中固定方框：圖片限制在自己欄位內，不會溢出壓到右側文字 */}
                    <div className="relative w-full max-w-[300px] aspect-square rounded-2xl overflow-hidden shadow-inner border border-brand-border bg-white">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="(min-width: 1024px) 300px, 80vw"
                      />
                    </div>
                    {/* Floating badge */}
                    <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-black ${tagColor}`}>
                      NO.{String(idx + 1).padStart(2, "0")}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="lg:col-span-8 p-6 sm:p-10 flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                      <h2 className="text-2xl sm:text-3xl font-black text-brand-dark flex items-center gap-3">
                        {product.name}
                      </h2>
                      <p className="text-sm sm:text-base text-brand-muted leading-relaxed font-medium whitespace-pre-line">
                        {product.desc}
                      </p>

                      {/* Specifications Grid */}
                      {product.specs.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-brand-border/40">
                          {product.specs.map((spec, i) => (
                            <div key={i} className="flex flex-col space-y-1">
                              <span className="text-xs font-extrabold text-brand-orange tracking-wider">{spec.label}</span>
                              <span className="text-sm text-brand-dark font-medium leading-relaxed">{spec.value}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Calculator link */}
                    <div className="pt-4 flex justify-end">
                      <Link
                        href={`/calculator?type=${encodeURIComponent(product.name)}`}
                        className="inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-extrabold text-white bg-brand-orange hover:bg-brand-orange-hover shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
                      >
                        試算此項目費用 ➔
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
