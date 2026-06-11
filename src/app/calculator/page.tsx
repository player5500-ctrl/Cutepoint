"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import QChan from "@/components/QChan";

// Fixed choices
const productTypes = [
  { name: "Q版人像公仔", basePrice: 2500, defaultModeling: true },
  { name: "寵物公仔", basePrice: 2200, defaultModeling: true },
  { name: "角色/AI圖轉公仔", basePrice: 3000, defaultModeling: true },
  { name: "企業展示樣品", basePrice: 4500, defaultModeling: false },
  { name: "大量列印服務", basePrice: 800, defaultModeling: false },
  { name: "3D 建模與修圖服務", basePrice: 1200, defaultModeling: true },
];

const sizes = ["6cm", "8cm", "10cm", "12cm", "15cm", "18cm"];
const quantities = ["1 件", "2–5 件", "6–20 件", "20 件以上"];
const complexities = [
  { label: "簡單", desc: "少數細節、平滑面多" },
  { label: "一般", desc: "標準細節、中度紋理" },
  { label: "複雜", desc: "高精細雕花、極多配飾" },
];

function CalculatorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State initialization
  const [productType, setProductType] = useState("Q版人像公仔");
  const [size, setSize] = useState("10cm");
  const [quantity, setQuantity] = useState("1 件");
  const [needModeling, setNeedModeling] = useState(true);
  const [needRetouching, setNeedRetouching] = useState(false);
  const [complexity, setComplexity] = useState("一般");
  const [isUrgent, setIsUrgent] = useState(false);
  const [needPackaging, setNeedPackaging] = useState(false);

  // Load category from URL query if present
  useEffect(() => {
    const typeFromQuery = searchParams.get("type");
    if (typeFromQuery) {
      const matched = productTypes.find((t) => t.name === typeFromQuery);
      if (matched) {
        setProductType(matched.name);
        setNeedModeling(matched.defaultModeling);
      }
    }
  }, [searchParams]);

  // Adjust defaults when product type changes
  const handleTypeChange = (typeName: string) => {
    setProductType(typeName);
    const matched = productTypes.find((t) => t.name === typeName);
    if (matched) {
      setNeedModeling(matched.defaultModeling);
      // For 3D modeling and retouching only, default to no packaging and small size
      if (typeName === "3D 建模與修圖服務") {
        setNeedPackaging(false);
      }
    }
  };

  // Cost calculation formula
  const calculateEstimate = () => {
    const selectedType = productTypes.find((t) => t.name === productType) || productTypes[0];
    
    // 1. Base price
    let base = selectedType.basePrice;

    // 2. Modeling & Retouching extra fees
    let modelingFee = needModeling ? 2000 : 0;
    let retouchingFee = needRetouching ? 800 : 0;

    // 3. Packaging fee
    let packagingFee = 0;
    if (needPackaging) {
      if (size === "6cm" || size === "8cm") packagingFee = 150;
      else if (size === "10cm" || size === "12cm") packagingFee = 250;
      else packagingFee = 450;
    }

    // Subtotal of additions
    let subtotal = base + modelingFee + retouchingFee + packagingFee;

    // 4. Size multiplier
    let sizeFactor = 1.0;
    if (size === "6cm") sizeFactor = 0.8;
    else if (size === "8cm") sizeFactor = 1.0;
    else if (size === "10cm") sizeFactor = 1.3;
    else if (size === "12cm") sizeFactor = 1.6;
    else if (size === "15cm") sizeFactor = 2.2;
    else if (size === "18cm") sizeFactor = 3.0;

    // 5. Complexity multiplier
    let complexityFactor = 1.0;
    if (complexity === "簡單") complexityFactor = 0.85;
    else if (complexity === "一般") complexityFactor = 1.0;
    else if (complexity === "複雜") complexityFactor = 1.45;

    // 6. Quantity multiplier (per unit)
    let qtyFactor = 1.0;
    let qtyNumber = 1;
    if (quantity === "1 件") {
      qtyFactor = 1.0;
      qtyNumber = 1;
    } else if (quantity === "2–5 件") {
      qtyFactor = 0.9;
      qtyNumber = 3; // Median for display range
    } else if (quantity === "6–20 件") {
      qtyFactor = 0.8;
      qtyNumber = 12; // Median for display range
    } else if (quantity === "20 件以上") {
      qtyFactor = 0.7;
      qtyNumber = 30; // Min representative for bulk
    }

    // 7. Urgent multiplier
    let urgentFactor = isUrgent ? 1.3 : 1.0;

    // Calculate Unit Price Range
    let calculatedBase = subtotal * sizeFactor * complexityFactor * urgentFactor;
    
    // Apply quantity factor
    let totalLow = Math.round(calculatedBase * qtyFactor * qtyNumber * 0.95);
    let totalHigh = Math.round(calculatedBase * qtyFactor * qtyNumber * 1.15);

    // If unit only, or bulk printing adjustments
    if (productType === "大量列印服務") {
      // For bulk printing, unit price decreases significantly with volume
      // So adjust calculations
      totalLow = Math.round((base * sizeFactor * complexityFactor * urgentFactor * qtyFactor + packagingFee) * qtyNumber * 0.9);
      totalHigh = Math.round((base * sizeFactor * complexityFactor * urgentFactor * qtyFactor + packagingFee) * qtyNumber * 1.1);
    }

    // 8. Time estimation
    let baseDays = 12;
    if (productType === "大量列印服務" || productType === "3D 建模與修圖服務" || !needModeling) {
      baseDays = 5;
    }

    // Complexity impact on days
    if (complexity === "簡單") baseDays -= 2;
    else if (complexity === "複雜") baseDays += 5;

    // Quantity impact on days
    if (quantity === "2–5 件") baseDays += 3;
    else if (quantity === "6–20 件") baseDays += 7;
    else if (quantity === "20 件以上") baseDays += 14;

    // Urgent impact on days
    let finalDays = isUrgent ? Math.ceil(baseDays * 0.6) : baseDays;
    if (finalDays < 3) finalDays = 3; // Minimum 3 days

    // Safety checks for minimum prices
    if (totalLow < 500) totalLow = 500;
    if (totalHigh < totalLow + 200) totalHigh = totalLow + 300;

    return {
      low: totalLow,
      high: totalHigh,
      days: finalDays,
    };
  };

  const { low, high, days } = calculateEstimate();

  // Go to Official Inquiry Form and pass params
  const handleGoToInquiry = () => {
    const params = new URLSearchParams({
      type: productType,
      size,
      qty: quantity,
      modeling: needModeling.toString(),
      retouching: needRetouching.toString(),
      complexity,
      urgent: isUrgent.toString(),
      pkg: needPackaging.toString(),
      low: low.toString(),
      high: high.toString(),
    });
    router.push(`/inquiry?${params.toString()}`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left: Input Form Controls */}
      <div className="lg:col-span-8 bg-white rounded-3xl border border-brand-border/60 p-6 md:p-8 shadow-sm space-y-6">
        <h2 className="text-xl font-bold text-brand-dark pb-4 border-b border-brand-border/50 flex items-center gap-2">
          <span className="text-brand-orange">⚙</span> 選擇試算規格
        </h2>

        {/* 1. Product Type */}
        <div className="space-y-3">
          <label className="text-sm font-extrabold text-brand-dark tracking-wider">1. 選擇產品類型</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {productTypes.map((type) => {
              const isSelected = productType === type.name;
              return (
                <button
                  key={type.name}
                  type="button"
                  onClick={() => handleTypeChange(type.name)}
                  className={`px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold border transition-all duration-200 text-center ${
                    isSelected
                      ? "border-brand-orange bg-brand-peach-light/45 text-brand-orange shadow-sm scale-[1.02]"
                      : "border-brand-border/80 bg-white hover:bg-brand-cream hover:border-brand-orange/40 text-brand-muted"
                  }`}
                >
                  {type.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Size & 3. Quantity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Size */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-extrabold text-brand-dark tracking-wider">
              <Image src="/assets/qchan/q_measure.gif" alt="Q醬量尺寸" width={36} height={36} className="rounded-full border border-brand-orange/40 bg-white" />
              2. 選擇尺寸 (高/長度)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {sizes.map((s) => {
                const isSelected = size === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    className={`py-2.5 rounded-xl text-sm font-bold border transition-colors ${
                      isSelected
                        ? "border-brand-orange bg-brand-orange text-white shadow-sm"
                        : "border-brand-border/80 bg-white hover:bg-brand-cream text-brand-muted"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity */}
          <div className="space-y-3">
            <label className="text-sm font-extrabold text-brand-dark tracking-wider">3. 選擇製作數量</label>
            <div className="grid grid-cols-2 gap-2">
              {quantities.map((q) => {
                const isSelected = quantity === q;
                return (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setQuantity(q)}
                    className={`py-2.5 rounded-xl text-sm font-bold border transition-colors ${
                      isSelected
                        ? "border-brand-orange bg-brand-orange text-white shadow-sm"
                        : "border-brand-border/80 bg-white hover:bg-brand-cream text-brand-muted"
                    }`}
                  >
                    {q}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 4. Need Modeling & 5. Need Retouching */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Modeling */}
          <div className="space-y-3">
            <label className="text-sm font-extrabold text-brand-dark tracking-wider flex items-center justify-between">
              <span>4. 是否需要 3D 建模</span>
              <span className="text-[10px] text-brand-orange font-bold bg-brand-peach-light px-2 py-0.5 rounded-full">未提供3D模型必選</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setNeedModeling(true)}
                className={`py-2.5 rounded-xl text-sm font-bold border transition-colors ${
                  needModeling
                    ? "border-brand-orange bg-brand-orange text-white shadow-sm"
                    : "border-brand-border/80 bg-white hover:bg-brand-cream text-brand-muted"
                }`}
              >
                需要 (+ $2000)
              </button>
              <button
                type="button"
                onClick={() => setNeedModeling(false)}
                className={`py-2.5 rounded-xl text-sm font-bold border transition-colors ${
                  !needModeling
                    ? "border-brand-orange bg-brand-orange text-white shadow-sm"
                    : "border-brand-border/80 bg-white hover:bg-brand-cream text-brand-muted"
                }`}
              >
                不需要 (已有STL)
              </button>
            </div>
          </div>

          {/* Retouching */}
          <div className="space-y-3">
            <label className="text-sm font-extrabold text-brand-dark tracking-wider flex items-center justify-between">
              <span>5. 是否需要 3D 修圖</span>
              <span className="text-[10px] text-brand-muted bg-brand-cream px-2 py-0.5 rounded-full">微調、修破面、減面</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setNeedRetouching(true)}
                className={`py-2.5 rounded-xl text-sm font-bold border transition-colors ${
                  needRetouching
                    ? "border-brand-orange bg-brand-orange text-white shadow-sm"
                    : "border-brand-border/80 bg-white hover:bg-brand-cream text-brand-muted"
                }`}
              >
                需要 (+ $800)
              </button>
              <button
                type="button"
                onClick={() => setNeedRetouching(false)}
                className={`py-2.5 rounded-xl text-sm font-bold border transition-colors ${
                  !needRetouching
                    ? "border-brand-orange bg-brand-orange text-white shadow-sm"
                    : "border-brand-border/80 bg-white hover:bg-brand-cream text-brand-muted"
                }`}
              >
                不需要
              </button>
            </div>
          </div>
        </div>

        {/* 6. Complexity */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-extrabold text-brand-dark tracking-wider">
            <Image src="/assets/qchan/q_complexity.gif" alt="Q醬檢視複雜度" width={36} height={36} className="rounded-full border border-brand-orange/40 bg-white" />
            6. 模型複雜度
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {complexities.map((comp) => {
              const isSelected = complexity === comp.label;
              return (
                <button
                  key={comp.label}
                  type="button"
                  onClick={() => setComplexity(comp.label)}
                  className={`p-3 rounded-2xl border transition-all duration-200 text-left flex flex-col justify-center ${
                    isSelected
                      ? "border-brand-orange bg-brand-peach-light/45 text-brand-dark shadow-sm"
                      : "border-brand-border/80 bg-white hover:bg-brand-cream hover:border-brand-orange/45"
                  }`}
                >
                  <span className={`text-sm font-extrabold ${isSelected ? "text-brand-orange" : "text-brand-dark"}`}>
                    {comp.label}
                  </span>
                  <span className="text-[11px] text-brand-muted mt-0.5">{comp.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 7. Urgent & 8. Need Packaging */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Urgent */}
          <div className="flex items-center justify-between p-4 bg-brand-cream/45 rounded-2xl border border-brand-border/40">
            <div className="space-y-0.5">
              <label className="text-sm font-extrabold text-brand-dark flex items-center gap-1.5">
                <span>⚡ 設為急件</span>
                <span className="text-[10px] text-brand-orange font-bold bg-brand-peach-light px-2 py-0.5 rounded-full">
                  工期 -40%
                </span>
              </label>
              <p className="text-xs text-brand-muted font-medium">急件加收 30% 費用，快速安排製作</p>
            </div>
            <button
              type="button"
              onClick={() => setIsUrgent(!isUrgent)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isUrgent ? "bg-brand-orange" : "bg-gray-200"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isUrgent ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Packaging */}
          <div className="flex items-center justify-between p-4 bg-brand-cream/45 rounded-2xl border border-brand-border/40">
            <div className="space-y-0.5">
              <label className="text-sm font-extrabold text-brand-dark flex items-center gap-1.5">
                <span>🎁 精緻包裝</span>
                <span className="text-[10px] text-amber-600 bg-brand-yellow-light px-2 py-0.5 rounded-full">
                  適合送禮
                </span>
              </label>
              <p className="text-xs text-brand-muted font-medium">抗震防護與可愛紙盒提袋</p>
            </div>
            <button
              type="button"
              onClick={() => setNeedPackaging(!needPackaging)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                needPackaging ? "bg-brand-orange" : "bg-gray-200"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  needPackaging ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Right: Real-time Calculation Result */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-gradient-to-br from-brand-orange to-brand-peach text-white rounded-3xl p-6 md:p-8 shadow-md border border-brand-orange/20 relative overflow-hidden">
          {/* Decorative bubble background */}
          <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-white/10 filter blur-xl" />
          <div className="absolute top-10 left-10 w-24 h-24 rounded-full bg-white/10 filter blur-lg" />

          <h3 className="text-lg font-bold tracking-wider mb-6 flex items-center gap-2 relative">
            <span>📊</span> 預估計算結果
          </h3>

          <div className="space-y-6 relative">
            {/* Price section */}
            <div className="space-y-1">
              <span className="text-xs font-semibold text-white/80 tracking-widest uppercase">預估價格區間 (TWD)</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl md:text-4xl font-black">${low.toLocaleString()}</span>
                <span className="text-sm font-bold text-white/85 mx-1">~</span>
                <span className="text-3xl md:text-4xl font-black">${high.toLocaleString()}</span>
              </div>
            </div>

            {/* Time section */}
            <div className="space-y-1">
              <span className="flex items-center gap-2 text-xs font-semibold text-white/80 tracking-widest uppercase">
                <Image src="/assets/qchan/q_days.gif" alt="Q醬預估天數" width={32} height={32} className="rounded-full bg-white/90" />
                預估製作天數
              </span>
              <div className="text-2xl font-black flex items-baseline gap-1.5">
                <span>約 {days} 天</span>
                <span className="text-xs font-bold text-brand-yellow bg-white/15 px-2 py-0.5 rounded-md">
                  {isUrgent ? "⚡已加速" : "標準工期"}
                </span>
              </div>
            </div>

            {/* Parameter summary */}
            <div className="pt-5 border-t border-white/20 text-xs space-y-2 font-medium text-white/90">
              <div className="flex justify-between">
                <span>產品類型：</span>
                <span className="font-bold">{productType}</span>
              </div>
              <div className="flex justify-between">
                <span>規格尺寸：</span>
                <span className="font-bold">{size} | {quantity}</span>
              </div>
              <div className="flex justify-between">
                <span>建模/修圖：</span>
                <span className="font-bold">
                  {needModeling ? "需要建模" : "不需建模"} | {needRetouching ? "需要修圖" : "不需修圖"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>複雜度：</span>
                <span className="font-bold">{complexity}</span>
              </div>
              <div className="flex justify-between">
                <span>精緻包裝：</span>
                <span className="font-bold">{needPackaging ? "是" : "否"}</span>
              </div>
            </div>

            {/* Proceed to Official Inquiry button */}
            <div className="pt-4">
              <button
                type="button"
                onClick={handleGoToInquiry}
                className="w-full py-4 px-6 rounded-full text-base font-extrabold text-brand-orange bg-white hover:bg-brand-cream hover:text-brand-orange-hover shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
              >
                前往正式詢價 ➔
              </button>
            </div>
          </div>
        </div>

        {/* Warning notification */}
        <div className="bg-white rounded-2xl border border-brand-border/60 p-5 shadow-sm">
          <h4 className="text-xs font-extrabold text-brand-orange tracking-widest uppercase mb-2">
            ⚠️ 重要提示
          </h4>
          <p className="text-xs sm:text-sm text-brand-muted leading-relaxed font-semibold">
            「此為初步估價，實際報價會依照片清晰度、模型複雜度、尺寸、數量與製作方式確認。」
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CalculatorPage() {
  return (
    <div className="w-full py-12 md:py-16 bg-brand-cream/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-10">
          <span className="text-xs font-black tracking-widest text-brand-orange uppercase bg-brand-peach-light px-3 py-1 rounded-full">
            COST CALCULATOR
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-brand-dark">
            成本估價試算
          </h1>
          <p className="text-sm text-brand-muted font-medium">
            使用前台即時報價公式，拉動與點選以下規格，快速查看您的公仔預估費用與天數！
          </p>
        </div>

        {/* Mascot guide */}
        <div className="max-w-3xl mx-auto mb-12">
          <QChan
            image="/assets/qchan/q_calc.gif"
            text="來試算你的公仔製作預算吧！你可以依照尺寸、複雜度等選項來調整規格。Q醬特別提醒：如果已經有自己的 3D 模型 (.stl 格式)，「建模需求」要記得選「不需要」，這樣可以省下一大筆建模費用唷 🐾！試算好之後點擊「前往正式詢價」，會自動把資料帶過去，不用重新填寫唷！"
            position="left"
          />
        </div>

        <Suspense fallback={
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange" />
          </div>
        }>
          <CalculatorContent />
        </Suspense>
      </div>
    </div>
  );
}
