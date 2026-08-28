"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import QChan from "@/components/QChan";
import { safeTrackEvent } from "@/lib/analytics";
import { LINE_URL } from "@/lib/site";

// ====== 定價資料（依 2026-08-26 最新「3D 模型價目表」對齊，官網 calculator）======
// 官網「Q版人物・寵物 3D 公仔」單一價目表，7~15cm 每 1cm 一檔、單一定價（非區間）。
// low/high 暫時維持相同值（= 官網定價），只是沿用既有 {low,high} 型別以降低改動範圍；
// ponytail: 若之後需要恢復「區間報價」，只要讓 low < high 即可，畫面已支援兩種顯示。
const sizePricing: Record<string, { low: number; high: number; tag: string }> = {
  "7cm": { low: 1699, high: 1699, tag: "入門款" },
  "8cm": { low: 1999, high: 1999, tag: "基本款" },
  "9cm": { low: 2499, high: 2499, tag: "主力款" },
  "10cm": { low: 2999, high: 2999, tag: "禮品款" },
  "11cm": { low: 3499, high: 3499, tag: "質感款" },
  "12cm": { low: 3999, high: 3999, tag: "珍藏款" },
  "13cm": { low: 4499, high: 4499, tag: "典藏款" },
  "14cm": { low: 4999, high: 4999, tag: "頂級款" },
  "15cm": { low: 5499, high: 5499, tag: "旗艦款" },
};

// 尺寸級距：0=小(7-9cm) 1=中(10-12cm) 2=大(13-15cm)——沿用既有 3 級距精神，改對應新尺寸表
const sizeTier = (size: string) =>
  size === "7cm" || size === "8cm" || size === "9cm" ? 0 : size === "10cm" || size === "11cm" || size === "12cm" ? 1 : 2;

// 表11：加價項目
// 2026-08-26 對齊最新價目表圖：玻璃罩改為使用者自選小/大（與公仔尺寸無關）；
// 禮盒改為固定金額、不再限定旗艦尺寸；新增相框展示套組／磁鐵貼／寵物名牌。
const glassSmallFee = 300; // 玻璃罩（小）
const glassLargeFee = 600; // 玻璃罩（大）
const giftBoxFee = 500; // 禮盒包裝（固定，不再限定最大尺寸）
const nameBaseFees = [200, 400, 600]; // 名牌底座（依尺寸級距，價目表圖未列，沿用既有金額）
const frameLargeFee = 150; // 質感相框（大）12×12cm，固定加價
const frameSmallFee = 100; // 質感相框（小）8×10.5cm，固定加價
const frameSetSmallFee = 750; // 相框展示套組（小）模型4×4cm／相框8×10.5cm
const frameSetLargeFee = 1250; // 相框展示套組（大）模型8×8cm／相框12×12cm
const magnetStickerFee = 149; // 磁鐵貼
const petNameTagFee = 699; // 寵物名牌
const urgentFee = 300; // 加急費（每張訂單，單一價；2026-08-28 Vanny 拍板依價目表拉平，原為依尺寸級距 300/500/800）
const sceneFees: [number, number][] = [
  [300, 800],
  [500, 1000],
  [800, 1500],
]; // 場景/配件費（複雜度選「複雜」時，每件；價目表圖未列，沿用既有金額）

// 2026-08-28 Vanny 拍板：產品類型只留「Q版公仔（寵物/人像）」統一價格；
// 大量列印服務（自備檔代印）改為另外洽談，不在試算器內。
const productTypes = [
  { name: "Q版公仔（寵物/人像）", factor: 1.0, defaultOwnFile: false },
];

const sizes = ["7cm", "8cm", "9cm", "10cm", "11cm", "12cm", "13cm", "14cm", "15cm"];
const quantities = ["1 件", "2–5 件", "6–20 件", "20 件以上"];
const complexities = [
  { label: "簡單", desc: "少數細節、平滑面多" },
  { label: "一般", desc: "標準細節、中度紋理" },
  { label: "複雜", desc: "職業道具、場景配件（另計配件費）" },
];

function CalculatorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State initialization
  const [productType, setProductType] = useState("Q版公仔（寵物/人像）");
  const [size, setSize] = useState("10cm");
  const [quantity, setQuantity] = useState("1 件");
  const [hasOwnFile, setHasOwnFile] = useState(false); // 自備 3D 檔
  const [complexity, setComplexity] = useState("一般");
  const [isUrgent, setIsUrgent] = useState(false);
  const [needGlassSmall, setNeedGlassSmall] = useState(false); // 玻璃罩（小）
  const [needGlassLarge, setNeedGlassLarge] = useState(false); // 玻璃罩（大）
  const [needNameBase, setNeedNameBase] = useState(false); // 名牌底座
  const [needGiftBox, setNeedGiftBox] = useState(false); // 禮盒包裝
  const [needFrameLarge, setNeedFrameLarge] = useState(false); // 質感相框（大）
  const [needFrameSmall, setNeedFrameSmall] = useState(false); // 質感相框（小）
  const [needFrameSetSmall, setNeedFrameSetSmall] = useState(false); // 相框展示套組（小）
  const [needFrameSetLarge, setNeedFrameSetLarge] = useState(false); // 相框展示套組（大）
  const [needMagnetSticker, setNeedMagnetSticker] = useState(false); // 磁鐵貼
  const [needPetNameTag, setNeedPetNameTag] = useState(false); // 寵物名牌

  // Load category from URL query if present
  useEffect(() => {
    const typeFromQuery = searchParams.get("type");
    if (typeFromQuery) {
      const matched = productTypes.find((t) => t.name === typeFromQuery);
      if (matched) {
        // 由網址 query 預填規格，屬於一次性同步，非串聯渲染
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setProductType(matched.name);
        setHasOwnFile(matched.defaultOwnFile);
      }
    }
  }, [searchParams]);

  // 進入試算頁
  useEffect(() => {
    safeTrackEvent("view_calculator", { page_path: "/calculator" });
  }, []);

  // Adjust defaults when product type changes
  const handleTypeChange = (typeName: string) => {
    setProductType(typeName);
    const matched = productTypes.find((t) => t.name === typeName);
    if (matched) {
      setHasOwnFile(matched.defaultOwnFile);
    }
  };

  const isBulkProject = quantity === "20 件以上"; // 大量訂單採專案另估

  // ====== 估價公式（依企劃書 V7）======
  const calculateEstimate = () => {
    const tier = sizeTier(size);
    const selectedType = productTypes.find((t) => t.name === productType) || productTypes[0];

    // 1. 尺寸基礎售價（含照片轉 Q 版建模）
    let unitLow = sizePricing[size].low * selectedType.factor;
    let unitHigh = sizePricing[size].high * selectedType.factor;

    // 2. 自備 3D 檔（售價已含基本建模，自備檔不另調整價格）

    // 3. 複雜款加收場景/配件費（表11：300–1,500）
    if (complexity === "複雜") {
      unitLow += sceneFees[tier][0];
      unitHigh += sceneFees[tier][1];
    }

    // 4. 加購項目（表11，每件）
    if (needGlassSmall) {
      unitLow += glassSmallFee;
      unitHigh += glassSmallFee;
    }
    if (needGlassLarge) {
      unitLow += glassLargeFee;
      unitHigh += glassLargeFee;
    }
    if (needNameBase) {
      unitLow += nameBaseFees[tier];
      unitHigh += nameBaseFees[tier];
    }
    if (needGiftBox) {
      unitLow += giftBoxFee;
      unitHigh += giftBoxFee;
    }
    if (needFrameLarge) {
      unitLow += frameLargeFee;
      unitHigh += frameLargeFee;
    }
    if (needFrameSmall) {
      unitLow += frameSmallFee;
      unitHigh += frameSmallFee;
    }
    if (needFrameSetSmall) {
      unitLow += frameSetSmallFee;
      unitHigh += frameSetSmallFee;
    }
    if (needFrameSetLarge) {
      unitLow += frameSetLargeFee;
      unitHigh += frameSetLargeFee;
    }
    if (needMagnetSticker) {
      unitLow += magnetStickerFee;
      unitHigh += magnetStickerFee;
    }
    if (needPetNameTag) {
      unitLow += petNameTagFee;
      unitHigh += petNameTagFee;
    }

    // （2026-07-15 移除「企業禮品組 NT$5,000 起」下限：企業展示樣品比照文創模型計價）

    // 5. 數量（以區間代表值估算；20 件以上專案另估）
    let qtyNumber = 1;
    if (quantity === "2–5 件") {
      qtyNumber = 3; // 區間代表值
    } else if (quantity === "6–20 件") {
      qtyNumber = 12; // 區間代表值
    }

    let totalLow = Math.round(unitLow * qtyNumber);
    let totalHigh = Math.round(unitHigh * qtyNumber);

    // 6. 加急費（單一價 NT$300，每張訂單）
    if (isUrgent) {
      totalLow += urgentFee;
      totalHigh += urgentFee;
    }

    // 7. 交期（標準 7 個工作天起，依複雜度/數量/建模方式遞增減）
    let baseDays = 7;
    if (complexity === "簡單") baseDays -= 1;
    else if (complexity === "複雜") baseDays += 3;
    if (hasOwnFile) baseDays -= 2; // 自備 3D 檔可省去建模與確認往返
    if (quantity === "2–5 件") baseDays += 2;
    else if (quantity === "6–20 件") baseDays += 4;
    let finalDays = baseDays;
    if (finalDays < 3) finalDays = 3;

    // 最低價保護
    if (totalLow < 500) totalLow = 500;
    if (totalHigh < totalLow + 200) totalHigh = totalLow + 300;

    return { low: totalLow, high: totalHigh, days: finalDays };
  };

  const { low, high, days } = calculateEstimate();

  const [lineCopied, setLineCopied] = useState(false);

  // ====== calculate_price 追蹤 ======
  // 觸發時機：使用者調整規格、試算結果穩定後（0.8 秒無再變動）才送出，
  // 或在按下 LINE / 詢價 CTA 時補送。同一組規格只送一次，避免重複觸發。
  // 只傳非個資欄位（產品類型、尺寸、數量、複雜度…），不含金額與聯絡資料。
  const specKey = [
    productType,
    size,
    quantity,
    complexity,
    hasOwnFile,
    isUrgent,
    needGlassSmall,
    needGlassLarge,
    needNameBase,
    needGiftBox,
    needFrameLarge,
    needFrameSmall,
    needFrameSetSmall,
    needFrameSetLarge,
    needMagnetSticker,
    needPetNameTag,
  ].join("|");

  const trackedSpecRef = useRef<string>("");
  const readyRef = useRef(false);

  // 進站後 1.2 秒才開始追蹤，避開網址 query 預填造成的初始變動
  useEffect(() => {
    const t = setTimeout(() => {
      readyRef.current = true;
    }, 1200);
    return () => clearTimeout(t);
  }, []);

  const trackCalculateOnce = useCallback(
    (source: string) => {
      if (trackedSpecRef.current === specKey) return; // 同一組規格不重複送
      trackedSpecRef.current = specKey;
      safeTrackEvent("calculate_price", {
        product_type: productType,
        size,
        quantity,
        complexity,
        own_file: hasOwnFile,
        urgent: isUrgent,
        source,
        page_path: "/calculator",
      });
    },
    [specKey, productType, size, quantity, complexity, hasOwnFile, isUrgent]
  );

  // 規格變動 → 試算完成（防抖 0.8 秒）
  useEffect(() => {
    if (!readyRef.current) {
      trackedSpecRef.current = specKey; // 初始 / 預填值不算一次試算
      return;
    }
    const t = setTimeout(() => trackCalculateOnce("spec_change"), 800);
    return () => clearTimeout(t);
  }, [specKey, trackCalculateOnce]);

  // 一鍵把試算結果帶到 LINE，縮短轉換路徑
  const handleAskOnLine = () => {
    trackCalculateOnce("line_cta");
    safeTrackEvent("click_line", { source: "calculator", page_path: "/calculator" });
    const addons = [
      needGlassSmall && "玻璃罩(小)",
      needGlassLarge && "玻璃罩(大)",
      needNameBase && "名牌底座",
      needGiftBox && "禮盒",
      needFrameLarge && "質感相框(大)",
      needFrameSmall && "質感相框(小)",
      needFrameSetSmall && "相框展示套組(小)",
      needFrameSetLarge && "相框展示套組(大)",
      needMagnetSticker && "磁鐵貼",
      needPetNameTag && "寵物名牌",
    ].filter(Boolean).join("、");
    const summary = isBulkProject
      ? `Hi Q醬！我想詢問大量訂單：${productType}，尺寸 ${size}，數量 ${quantity}，想請你幫我專案報價，謝謝！`
      : `Hi Q醬！我用萌點3D網站試算好了：\n・產品：${productType}\n・尺寸：${size}\n・數量：${quantity}\n・複雜度：${complexity}${addons ? `\n・加購：${addons}` : ""}\n・預估：NT$${low.toLocaleString()}～${high.toLocaleString()}，約 ${days} 個工作天\n想進一步詢問，麻煩你囉！`;
    try {
      navigator.clipboard?.writeText(summary);
      setLineCopied(true);
      setTimeout(() => setLineCopied(false), 5000);
    } catch {
      // 忽略剪貼簿錯誤，仍開啟 LINE
    }
    window.open(LINE_URL, "_blank", "noopener,noreferrer");
  };

  // Go to Official Inquiry Form and pass params
  const handleGoToInquiry = () => {
    trackCalculateOnce("inquiry_cta");
    const params = new URLSearchParams({
      type: productType,
      size,
      qty: quantity,
      modeling: (!hasOwnFile).toString(),
      retouching: "false",
      complexity,
      urgent: isUrgent.toString(),
      pkg: needGiftBox.toString(),
      glass: (needGlassSmall || needGlassLarge).toString(), // /inquiry 目前只認得單一玻璃罩布林值，暫不區分大小（見對話中的 non-scope 說明）
      base: needNameBase.toString(),
      frameL: needFrameLarge.toString(),
      frameS: needFrameSmall.toString(),
      frameSetS: needFrameSetSmall.toString(),
      frameSetL: needFrameSetLarge.toString(),
      magnet: needMagnetSticker.toString(),
      petTag: needPetNameTag.toString(),
      low: isBulkProject ? "0" : low.toString(),
      high: isBulkProject ? "0" : high.toString(),
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

        {/* 1. Product Type（統一價格，僅一種類型） */}
        <div className="space-y-3">
          <label className="text-sm font-extrabold text-brand-dark tracking-wider">1. 產品類型</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
          <p className="text-[11px] text-brand-muted/80">寵物與人像統一價格。大量列印／自備檔代印服務請直接洽詢，另外報價。</p>
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
                    className={`py-2 rounded-xl text-sm font-bold border transition-colors flex flex-col items-center ${
                      isSelected
                        ? "border-brand-orange bg-brand-orange text-white shadow-sm"
                        : "border-brand-border/80 bg-white hover:bg-brand-cream text-brand-muted"
                    }`}
                  >
                    <span>{s}</span>
                    <span className={`text-[9px] font-semibold ${isSelected ? "text-white/85" : "text-brand-muted/80"}`}>
                      {sizePricing[s].tag}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-brand-muted font-medium">
              {size} 建議售價 NT$
              {sizePricing[size].low === sizePricing[size].high
                ? sizePricing[size].low.toLocaleString()
                : `${sizePricing[size].low.toLocaleString()}–${sizePricing[size].high.toLocaleString()}`}
              （已含照片轉 Q 版建模）
            </p>
            <p className="text-[11px] text-brand-muted/80">更大尺寸另外報價，歡迎直接洽詢</p>
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
            {isBulkProject && (
              <p className="text-[11px] text-brand-orange font-bold">
                20 件以上為大量訂單，採專案報價（樣品確認＋階梯報價＋分批出貨）
              </p>
            )}
          </div>
        </div>

        {/* 4. Modeling source */}
        <div className="space-y-3">
          <label className="text-sm font-extrabold text-brand-dark tracking-wider flex items-center justify-between">
            <span>4. 建模方式</span>
            <span className="text-[10px] text-brand-orange font-bold bg-brand-peach-light px-2 py-0.5 rounded-full">售價已含基本建模</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setHasOwnFile(false)}
              className={`py-2.5 rounded-xl text-sm font-bold border transition-colors ${
                !hasOwnFile
                  ? "border-brand-orange bg-brand-orange text-white shadow-sm"
                  : "border-brand-border/80 bg-white hover:bg-brand-cream text-brand-muted"
              }`}
            >
              照片轉 Q 版建模（內含）
            </button>
            <button
              type="button"
              onClick={() => setHasOwnFile(true)}
              className={`py-2.5 rounded-xl text-sm font-bold border transition-colors ${
                hasOwnFile
                  ? "border-brand-orange bg-brand-orange text-white shadow-sm"
                  : "border-brand-border/80 bg-white hover:bg-brand-cream text-brand-muted"
              }`}
            >
              自備 3D 檔
            </button>
          </div>
        </div>

        {/* 5. Complexity */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-extrabold text-brand-dark tracking-wider">
            <Image src="/assets/qchan/q_complexity.gif" alt="Q醬檢視複雜度" width={36} height={36} className="rounded-full border border-brand-orange/40 bg-white" />
            5. 模型複雜度
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

        {/* 6. Add-ons（表11 加價項目） */}
        {(
          <div className="space-y-3">
            <label className="text-sm font-extrabold text-brand-dark tracking-wider flex items-center justify-between">
              <span>6. 加購項目（打造完整紀念禮）</span>
              <span className="text-[10px] text-amber-600 bg-brand-yellow-light px-2 py-0.5 rounded-full">依尺寸計價</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: "玻璃罩（小）", icon: "🫧", desc: "防塵防碰撞，提升收藏感", on: needGlassSmall, toggle: () => setNeedGlassSmall(!needGlassSmall), fee: glassSmallFee },
                { label: "玻璃罩（大）", icon: "🫧", desc: "防塵防碰撞，提升收藏感", on: needGlassLarge, toggle: () => setNeedGlassLarge(!needGlassLarge), fee: glassLargeFee },
                { label: "名牌底座", icon: "🏷️", desc: "可刻姓名、日期、祝福語", on: needNameBase, toggle: () => setNeedNameBase(!needNameBase), fee: nameBaseFees[sizeTier(size)] },
                { label: "質感相框（大）", icon: "🖼️", desc: "12×12cm，襯托擺設更有質感", on: needFrameLarge, toggle: () => setNeedFrameLarge(!needFrameLarge), fee: frameLargeFee },
                { label: "質感相框（小）", icon: "🖼️", desc: "8×10.5cm，桌上小巧收藏", on: needFrameSmall, toggle: () => setNeedFrameSmall(!needFrameSmall), fee: frameSmallFee },
                { label: "相框展示套組（大）", icon: "🖼️", desc: "模型8×8cm＋相框12×12cm，含模型與相框展示效果", on: needFrameSetLarge, toggle: () => setNeedFrameSetLarge(!needFrameSetLarge), fee: frameSetLargeFee },
                { label: "相框展示套組（小）", icon: "🖼️", desc: "模型4×4cm＋相框8×10.5cm，含模型與相框展示效果", on: needFrameSetSmall, toggle: () => setNeedFrameSetSmall(!needFrameSetSmall), fee: frameSetSmallFee },
                { label: "磁鐵貼", icon: "🧲", desc: "可愛磁鐵貼，冰箱、置物櫃都好收藏", on: needMagnetSticker, toggle: () => setNeedMagnetSticker(!needMagnetSticker), fee: magnetStickerFee },
                { label: "寵物名牌", icon: "🐾", desc: "刻上寵物名字，客製骨頭造型門牌", on: needPetNameTag, toggle: () => setNeedPetNameTag(!needPetNameTag), fee: petNameTagFee },
                { label: "禮盒包裝", icon: "🎁", desc: "禮盒＋保護材，送禮體面", on: needGiftBox, toggle: () => setNeedGiftBox(!needGiftBox), fee: giftBoxFee },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={item.toggle}
                  className={`p-3 rounded-2xl border transition-all duration-200 text-left ${
                    item.on
                      ? "border-brand-orange bg-brand-peach-light/45 shadow-sm"
                      : "border-brand-border/80 bg-white hover:bg-brand-cream hover:border-brand-orange/45"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-extrabold ${item.on ? "text-brand-orange" : "text-brand-dark"}`}>
                      {item.icon} {item.label}
                    </span>
                    <span className="text-[11px] font-bold text-brand-muted">+${item.fee}</span>
                  </div>
                  <span className="text-[11px] text-brand-muted mt-0.5 block">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 7. Urgent */}
        <div className="flex items-center justify-between p-4 bg-brand-cream/45 rounded-2xl border border-brand-border/40">
          <div className="space-y-0.5">
            <label className="text-sm font-extrabold text-brand-dark flex items-center gap-1.5">
              <span>⚡ 設為急件</span>
              <span className="text-[10px] text-brand-orange font-bold bg-brand-peach-light px-2 py-0.5 rounded-full">
                急件加價
              </span>
            </label>
            <p className="text-xs text-brand-muted font-medium">加急費 NT$300（每張訂單），優先安排製作</p>
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
      </div>

      {/* Right: Real-time Calculation Result */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-gradient-to-br from-brand-orange to-brand-peach text-white rounded-3xl p-6 md:p-8 shadow-md border border-brand-orange/20 relative overflow-hidden">
          {/* Decorative bubble background */}
          <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-white/10 filter blur-xl" />
          <div className="absolute top-10 left-10 w-24 h-24 rounded-full bg-white/10 filter blur-lg" />

          <h3 className="text-lg font-bold tracking-wider mb-6 flex items-center gap-2 relative">
            <Image src="/assets/qchan/q_quote.gif" alt="Q醬報價" width={40} height={40} className="rounded-full bg-white/90" />
            預估計算結果
          </h3>

          <div className="space-y-6 relative">
            {/* Price section */}
            <div className="space-y-1">
              <span className="text-xs font-semibold text-white/80 tracking-widest uppercase">預估價格區間 (TWD)</span>
              {isBulkProject ? (
                <div className="space-y-1">
                  <div className="text-2xl md:text-3xl font-black">專案報價</div>
                  <p className="text-xs text-white/85 font-medium leading-relaxed">
                    大量訂單由總部協助產能排程與批量列印，採樣品確認＋階梯報價，請直接填寫詢價單由專人為您報價。
                  </p>
                </div>
              ) : (
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl md:text-4xl font-black">${low.toLocaleString()}</span>
                  <span className="text-sm font-bold text-white/85 mx-1">~</span>
                  <span className="text-3xl md:text-4xl font-black">${high.toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* Time section */}
            <div className="space-y-1">
              <span className="flex items-center gap-2 text-xs font-semibold text-white/80 tracking-widest uppercase">
                <Image src="/assets/qchan/q_days.gif" alt="Q醬預估天數" width={32} height={32} className="rounded-full bg-white/90" />
                預估製作工作天
              </span>
              <div className="text-2xl font-black flex items-baseline gap-1.5">
                {isBulkProject ? (
                  <span>依專案排程</span>
                ) : (
                  <>
                    <span>約 {days} 個工作天</span>
                    <span className="text-xs font-bold text-brand-yellow bg-white/15 px-2 py-0.5 rounded-md">
                      {isUrgent ? "⚡已加速" : "標準工期"}
                    </span>
                  </>
                )}
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
                <span>建模方式：</span>
                <span className="font-bold">{hasOwnFile ? "自備 3D 檔" : "照片轉 Q 版（內含）"}</span>
              </div>
              <div className="flex justify-between">
                <span>複雜度：</span>
                <span className="font-bold">{complexity}</span>
              </div>
              <div className="flex justify-between">
                <span>加購：</span>
                <span className="font-bold">
                  {[
                    needGlassSmall && "玻璃罩(小)",
                    needGlassLarge && "玻璃罩(大)",
                    needNameBase && "名牌底座",
                    needGiftBox && "禮盒",
                    needFrameLarge && "質感相框(大)",
                    needFrameSmall && "質感相框(小)",
                    needFrameSetSmall && "相框展示套組(小)",
                    needFrameSetLarge && "相框展示套組(大)",
                    needMagnetSticker && "磁鐵貼",
                    needPetNameTag && "寵物名牌",
                  ].filter(Boolean).join("、") || "無"}
                </span>
              </div>
            </div>

            {/* Proceed to Official Inquiry button */}
            <div className="pt-4">
              <button
                type="button"
                onClick={handleGoToInquiry}
                className="w-full py-4 px-6 rounded-full text-base font-extrabold text-brand-orange bg-white hover:bg-brand-cream hover:text-brand-orange-hover shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
              >
                {isBulkProject ? "前往專案詢價 ➔" : "前往正式詢價 ➔"}
              </button>
            </div>
          </div>
        </div>

        {/* Q醬 一鍵 LINE 詢問：縮短轉換路徑 */}
        <div className="bg-white rounded-2xl border border-brand-orange/30 p-5 shadow-sm space-y-3">
          <div className="flex items-start gap-3">
            <Image src="/assets/qchan/q_wave.gif" alt="Q醬揮手" width={46} height={46} className="rounded-full border-2 border-brand-orange bg-white flex-shrink-0" />
            <div className="space-y-0.5">
              <p className="text-sm font-extrabold text-brand-dark">Q醬幫你預估好囉！</p>
              <p className="text-xs text-brand-muted font-medium leading-relaxed">
                要不要直接問問看？加 Q醬 LINE，把試算結果傳給我們，馬上幫你確認細節與正式報價 🐾
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAskOnLine}
            className="w-full py-3.5 px-6 rounded-full text-base font-extrabold text-white bg-[#06C755] hover:brightness-95 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            💬 加 Q醬 LINE 直接問
          </button>
          {lineCopied && (
            <p className="text-[11px] text-center text-brand-orange font-bold">
              ✅ 已幫你複製試算內容，加好友後貼給 Q醬就可以囉！
            </p>
          )}
        </div>

        {/* Warning notification */}
        <div className="bg-white rounded-2xl border border-brand-border/60 p-5 shadow-sm">
          <h4 className="text-xs font-extrabold text-brand-orange tracking-widest uppercase mb-2 flex items-center gap-2">
            <Image src="/assets/qchan/q_notice.gif" alt="Q醬提醒" width={32} height={32} className="rounded-full border border-brand-orange/40 bg-white" />
            重要提示
          </h4>
          <p className="text-xs sm:text-sm text-brand-muted leading-relaxed font-semibold">
            此為初步估價，實際報價會依照片清晰度、模型複雜度、尺寸、數量與製作方式確認。修改以免費小修 1 次為原則，第 2 次起酌收修改費；20 件以上大量訂單採專案報價。
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
            使用前台即時報價公式，拉動與點選以下規格，快速查看您的公仔預估費用與工作天數！
          </p>
        </div>

        {/* Mascot guide */}
        <div className="max-w-3xl mx-auto mb-12">
          <QChan
            image="/assets/qchan/q_calc.gif"
            text="來試算你的公仔製作預算吧！售價已包含照片轉 Q 版的基本建模；若你已準備好 3D 檔，也可以選擇「自備 3D 檔」，方便 3D處理人員更快確認檔案狀態🐾。想讓禮物更完整，還能加購玻璃罩、名牌底座與禮盒包裝。試算後點擊「前往正式詢價」，資料會自動帶入表單。"
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
