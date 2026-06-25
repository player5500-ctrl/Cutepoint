"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import QChan from "@/components/QChan";

const productTypes = [
  "Q版人像公仔",
  "寵物公仔",
  "角色/AI圖轉公仔",
  "企業展示樣品",
  "大量列印服務",
  "文創模型",
];

const sizes = ["4cm", "6cm", "8cm", "10cm", "12cm", "15cm", "18cm"];
const quantities = ["1 件", "2–5 件", "6–20 件", "20 件以上"];
const complexities = ["簡單", "一般", "複雜"];

function InquiryFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [name, setName] = useState("");
  const [lineId, setLineId] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  
  const [productType, setProductType] = useState("Q版人像公仔");
  const [size, setSize] = useState("10cm");
  const [quantity, setQuantity] = useState("1 件");
  const [needModeling, setNeedModeling] = useState(true);
  const [needRetouching, setNeedRetouching] = useState(false);
  const [complexity, setComplexity] = useState("一般");
  const [isUrgent, setIsUrgent] = useState(false);
  const [needPackaging, setNeedPackaging] = useState(false);
  const [needGlassCase, setNeedGlassCase] = useState(false);
  const [needNameBase, setNeedNameBase] = useState(false);
  
  const [estPriceRange, setEstPriceRange] = useState("");
  const [purpose, setPurpose] = useState("");
  const [expectedDelivery, setExpectedDelivery] = useState("");
  const [notes, setNotes] = useState("");
  
  // File uploads
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; size: string; previewUrl?: string }[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Prepopulate from calculator URL queries
  useEffect(() => {
    const typeFromQuery = searchParams.get("type");
    if (typeFromQuery) setProductType(typeFromQuery);

    const sizeFromQuery = searchParams.get("size");
    if (sizeFromQuery) setSize(sizeFromQuery);

    const qtyFromQuery = searchParams.get("qty");
    if (qtyFromQuery) setQuantity(qtyFromQuery);

    const modelingFromQuery = searchParams.get("modeling");
    if (modelingFromQuery) setNeedModeling(modelingFromQuery === "true");

    const retouchingFromQuery = searchParams.get("retouching");
    if (retouchingFromQuery) setNeedRetouching(retouchingFromQuery === "true");

    const complexityFromQuery = searchParams.get("complexity");
    if (complexityFromQuery) setComplexity(complexityFromQuery);

    const urgentFromQuery = searchParams.get("urgent");
    if (urgentFromQuery) setIsUrgent(urgentFromQuery === "true");

    const pkgFromQuery = searchParams.get("pkg");
    if (pkgFromQuery) setNeedPackaging(pkgFromQuery === "true");

    const glassFromQuery = searchParams.get("glass");
    if (glassFromQuery) setNeedGlassCase(glassFromQuery === "true");

    const baseFromQuery = searchParams.get("base");
    if (baseFromQuery) setNeedNameBase(baseFromQuery === "true");

    const lowFromQuery = searchParams.get("low");
    const highFromQuery = searchParams.get("high");
    if (lowFromQuery && highFromQuery) {
      setEstPriceRange(`$${Number(lowFromQuery).toLocaleString()} ~ $${Number(highFromQuery).toLocaleString()} TWD`);
    } else {
      setEstPriceRange("尚未試算，直接填寫");
    }
  }, [searchParams]);

  const priceBasisItems = [
    `產品：${productType}`,
    `尺寸：${size}`,
    `數量：${quantity}`,
    `複雜度：${complexity}`,
    needModeling ? "含基本 3D 建模" : "自備 3D 檔",
    needRetouching ? "需要 3D 修圖" : "",
    isUrgent ? "急件加速" : "",
    needGlassCase ? "加購玻璃罩" : "",
    needNameBase ? "加購名牌底座" : "",
    needPackaging ? "加購包裝" : "",
  ].filter(Boolean);

  // File selection handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(e.target.files);
    }
  };

  const addFiles = (filesList: FileList) => {
    const newFiles = Array.from(filesList).map((file) => {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      const isImage = file.type.startsWith("image/");
      return {
        name: file.name,
        size: `${sizeMb} MB`,
        previewUrl: isImage ? URL.createObjectURL(file) : undefined,
      };
    });
    setUploadedFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => {
      const fileToRemove = prev[index];
      if (fileToRemove.previewUrl) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      addFiles(e.dataTransfer.files);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // Submit Inquiry Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!name.trim()) {
      setFormError("請填寫姓名/聯絡人");
      return;
    }
    if (!lineId.trim() && !phone.trim() && !email.trim()) {
      setFormError("LINE ID、電話、Email 請至少填寫一項，以便後續與您回覆！");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientName: name,
          lineId,
          phone,
          email,
          productType,
          size,
          quantity,
          needModeling,
          needRetouching,
          complexity,
          isUrgent,
          needPackaging,
          needGlassCase,
          needNameBase,
          estPriceRange,
          purpose,
          expectedDelivery,
          notes,
          fileNames: uploadedFiles.map((f) => f.name),
        }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || "送出失敗，請重試或聯絡客服");
      }
      
      // Navigate to Success Page
      router.push(`/success?id=${result.id}&name=${encodeURIComponent(name)}`);
    } catch (err: any) {
      setFormError(err.message || "發生未知錯誤，請重試");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Form Fields: Contact and Specs (8 cols) */}
      <div className="lg:col-span-8 bg-white rounded-3xl border border-brand-border/60 p-6 md:p-8 shadow-sm space-y-8">
        
        {/* Section 1: Customer Contact */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-brand-dark pb-2 border-b border-brand-border/40 flex items-center gap-2">
            <span className="text-brand-orange">👤</span> 1. 客戶聯絡資料
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="name" className="text-xs font-bold text-brand-dark">姓名 / 聯絡人 <span className="text-brand-orange">*</span></label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如：王小明"
                className="w-full px-4 py-2.5 rounded-xl border border-brand-border/80 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange outline-none text-sm"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="lineId" className="text-xs font-bold text-brand-dark">LINE ID <span className="text-brand-muted text-[10px]">(建議)</span></label>
              <input
                id="lineId"
                type="text"
                value={lineId}
                onChange={(e) => setLineId(e.target.value)}
                placeholder="方便快速傳照片核對進度"
                className="w-full px-4 py-2.5 rounded-xl border border-brand-border/80 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange outline-none text-sm"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="phone" className="text-xs font-bold text-brand-dark">電話號碼</label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="例如：0912-345-678"
                className="w-full px-4 py-2.5 rounded-xl border border-brand-border/80 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange outline-none text-sm"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="email" className="text-xs font-bold text-brand-dark">Email 帳號</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="例如：service@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-brand-border/80 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange outline-none text-sm"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Specs Review */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-brand-dark pb-2 border-b border-brand-border/40 flex items-center gap-2">
            <span className="text-brand-orange">🛍</span> 2. 訂製產品規格
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label htmlFor="productType" className="text-xs font-bold text-brand-dark">產品類型</label>
              <select
                id="productType"
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-brand-border/80 focus:border-brand-orange outline-none text-sm"
              >
                {productTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="size" className="text-xs font-bold text-brand-dark">尺寸高度</label>
              <select
                id="size"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-brand-border/80 focus:border-brand-orange outline-none text-sm"
              >
                {sizes.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="quantity" className="text-xs font-bold text-brand-dark">數量範圍</label>
              <select
                id="quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-brand-border/80 focus:border-brand-orange outline-none text-sm"
              >
                {quantities.map((q) => (
                  <option key={q} value={q}>{q}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Booleans */}
            <div className="p-3 bg-brand-cream/35 border border-brand-border/40 rounded-xl space-y-2">
              <span className="text-xs font-bold text-brand-dark block">建模與修圖需求</span>
              <div className="flex gap-4">
                <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={needModeling}
                    onChange={(e) => setNeedModeling(e.target.checked)}
                    className="rounded border-gray-300 text-brand-orange focus:ring-brand-orange h-4 w-4"
                  />
                  需要 3D 建模
                </label>
                <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={needRetouching}
                    onChange={(e) => setNeedRetouching(e.target.checked)}
                    className="rounded border-gray-300 text-brand-orange focus:ring-brand-orange h-4 w-4"
                  />
                  需要 3D 修圖
                </label>
              </div>
            </div>

            {/* Packaging and Urgent */}
            <div className="p-3 bg-brand-cream/35 border border-brand-border/40 rounded-xl space-y-2">
              <span className="text-xs font-bold text-brand-dark block">其它加選項目</span>
              <div className="flex gap-4">
                <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isUrgent}
                    onChange={(e) => setIsUrgent(e.target.checked)}
                    className="rounded border-gray-300 text-brand-orange focus:ring-brand-orange h-4 w-4"
                  />
                  設為急件
                </label>
                <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={needPackaging}
                    onChange={(e) => setNeedPackaging(e.target.checked)}
                    className="rounded border-gray-300 text-brand-orange focus:ring-brand-orange h-4 w-4"
                  />
                  需要包裝
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="complexity" className="text-xs font-bold text-brand-dark">模型複雜度</label>
              <select
                id="complexity"
                value={complexity}
                onChange={(e) => setComplexity(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-brand-border/80 focus:border-brand-orange outline-none text-sm"
              >
                {complexities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="estPriceRange" className="text-xs font-bold text-brand-dark">試算預估價格區間</label>
              <input
                id="estPriceRange"
                type="text"
                readOnly
                value={estPriceRange}
                className="w-full px-4 py-2.5 rounded-xl border border-brand-border/60 bg-gray-50 text-gray-500 cursor-not-allowed outline-none text-sm font-bold"
              />
              <div className="rounded-xl border border-brand-border/50 bg-brand-cream/35 px-3 py-2.5">
                <p className="text-[11px] font-bold text-brand-dark mb-2">價格依據</p>
                <div className="flex flex-wrap gap-1.5">
                  {priceBasisItems.map((item) => (
                    <span
                      key={item}
                      className="px-2 py-1 rounded-full bg-white text-[11px] font-semibold text-brand-muted border border-brand-border/50"
                    >
                      {item}
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-brand-muted">
                  實際報價會依照片、檔案與製作細節確認後微調。
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Extra Request Info */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-brand-dark pb-2 border-b border-brand-border/40 flex items-center gap-2">
            <span className="text-brand-orange">📝</span> 3. 用途與交期說明
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="purpose" className="text-xs font-bold text-brand-dark">公仔/列印用途 <span className="text-brand-muted text-[10px]">(例如: 送禮/收藏/商品樣品)</span></label>
              <input
                id="purpose"
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="例如：送給朋友的結婚禮物、自家貓咪留念"
                className="w-full px-4 py-2.5 rounded-xl border border-brand-border/80 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange outline-none text-sm"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="expectedDelivery" className="text-xs font-bold text-brand-dark">期望交期</label>
              <input
                id="expectedDelivery"
                type="date"
                value={expectedDelivery}
                onChange={(e) => setExpectedDelivery(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-brand-border/80 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange outline-none text-sm text-brand-dark font-medium"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="notes" className="text-xs font-bold text-brand-dark">備註說明 / 其它要求</label>
            <textarea
              id="notes"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="有任何細節要求（如上色風格、指定姿勢或配件）都可以在這裡告訴 Q醬 唷！"
              className="w-full px-4 py-3 rounded-xl border border-brand-border/80 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange outline-none text-sm leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* Right: File Upload & Submit Button (4 cols) */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Upload Container */}
        <div className="bg-white rounded-3xl border border-brand-border/60 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-brand-dark tracking-wider flex items-center gap-1.5">
            <span>📎</span> 上傳參考圖片或檔案
          </h3>
          <p className="text-xs text-brand-muted font-medium">
            請上傳您需要參考的手繪平面稿、AI產圖、寵物照片或已有之 3D 模型檔案 (.stl / .obj)。
          </p>

          {/* Drag & Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerFileSelect}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
              isDragging
                ? "border-brand-orange bg-brand-peach-light/30"
                : "border-brand-border hover:border-brand-orange/60 bg-brand-cream/10"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="space-y-2">
              <span className="text-3xl block">📤</span>
              <p className="text-xs font-bold text-brand-dark">點擊此處或拖曳檔案至此</p>
              <p className="text-[10px] text-brand-muted font-semibold">支援 JPG, PNG, STL, OBJ (最大 20MB)</p>
            </div>
          </div>

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-2 pt-2">
              <span className="text-xs font-extrabold text-brand-dark block">已上傳檔案 ({uploadedFiles.length})</span>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {uploadedFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2 bg-brand-cream/30 border border-brand-border/40 rounded-xl text-xs justify-between group">
                    <div className="flex items-center gap-2 overflow-hidden">
                      {file.previewUrl ? (
                        <div className="relative w-8 h-8 rounded-md overflow-hidden bg-white border border-brand-border flex-shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={file.previewUrl} alt="預覽" className="object-cover w-full h-full" />
                        </div>
                      ) : (
                        <span className="text-base flex-shrink-0">📄</span>
                      )}
                      <div className="truncate flex flex-col">
                        <span className="font-bold truncate text-brand-dark">{file.name}</span>
                        <span className="text-[9px] text-brand-muted">{file.size}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="text-brand-muted hover:text-red-500 font-extrabold px-1 text-sm"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submit Actions */}
        <div className="space-y-4">
          {formError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs font-bold text-red-500 leading-relaxed">
              ⚠️ {formError}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 rounded-full text-base font-extrabold text-white bg-brand-orange shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 ${
              isSubmitting ? "opacity-75 cursor-wait bg-brand-orange-hover" : "hover:bg-brand-orange-hover"
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                正在送出詢價單...
              </>
            ) : (
              "送出正式詢價單 ➔"
            )}
          </button>
          
          <p className="text-[11px] text-brand-muted text-center leading-relaxed font-semibold">
            送出後 Q醬 將與專業團隊會在 24 小時內處理，並透過您填寫的 LINE / 電話 / Email 提供正式報價單！
          </p>
        </div>
      </div>
    </form>
  );
}

export default function InquiryPage() {
  return (
    <div className="w-full py-12 md:py-16 bg-brand-cream/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-10">
          <span className="text-xs font-black tracking-widest text-brand-orange uppercase bg-brand-peach-light px-3 py-1 rounded-full">
            REQUEST A QUOTE
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-brand-dark">
            正式詢價表單
          </h1>
          <p className="text-sm text-brand-muted font-medium">
            請填寫您的基本資訊與聯絡方式，Q醬 會帶領團隊為您做精細估價並提供正式合約與報價單。
          </p>
        </div>

        {/* Q-chan guide */}
        <div className="max-w-3xl mx-auto mb-12">
          <QChan
            image="/assets/qchan/q_fill.gif"
            text="哇！估價需求已經帶過來囉。你只要補上姓名、LINE 或 Email，再上傳參考照片或檔案，Q醬 就會協助交給 3D處理人員評估排程🐾！若有姿勢、表情、包裝或用途上的想法，也可以寫在備註欄。"
            position="left"
          />
        </div>

        <Suspense fallback={
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange" />
          </div>
        }>
          <InquiryFormContent />
        </Suspense>
      </div>
    </div>
  );
}
