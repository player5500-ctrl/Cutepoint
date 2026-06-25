"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { getAdminKey } from "@/components/AdminGate";

const categories = [
  "Q版人像公仔",
  "寵物公仔",
  "角色/AI圖轉公仔",
  "企業展示樣品",
  "大量列印服務",
  "文創模型",
];

const sizeOptions = ["4cm", "6cm", "8cm", "10cm", "12cm", "15cm", "18cm"];

interface CaseItem {
  id: string;
  title: string;
  category: string;
  size: string;
  days?: string;
  desc?: string;
  img: string;
  createdAt?: string;
}

// 將上傳照片縮到最大 1200px 並轉成 JPEG dataURL，避免檔案過大
function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        const maxSide = 1200;
        let { width, height } = img;
        if (Math.max(width, height) > maxSide) {
          const ratio = maxSide / Math.max(width, height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("canvas error"));
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// 作品案例管理區塊：新增（照片/名稱/類別/尺寸/文案）與刪除，前台作品集即時同步
export default function CaseManager() {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 表單欄位
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [size, setSize] = useState("10cm");
  const [days, setDays] = useState("");
  const [desc, setDesc] = useState("");
  const [imageData, setImageData] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  // 編輯既有案例用的狀態
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState(categories[0]);
  const [editSize, setEditSize] = useState(sizeOptions[2]);
  const [editDays, setEditDays] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editImageData, setEditImageData] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editMessage, setEditMessage] = useState("");

  const fetchCases = async () => {
    try {
      const res = await fetch("/api/cases", { cache: "no-store" });
      if (res.ok) setCases(await res.json());
    } catch (e) {
      console.error("Failed to load cases", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setImageData(await compressImage(file));
    } catch {
      setMessage("照片讀取失敗，請換一張試試");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imageData) {
      setMessage("請填寫名稱並上傳照片");
      return;
    }
    setSubmitting(true);
    setMessage("");
    try {
      const res = await fetch("/api/cases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": getAdminKey(),
        },
        body: JSON.stringify({ title, category, size, days, desc, imageData }),
      });
      if (res.ok) {
        setTitle("");
        setDays("");
        setDesc("");
        setImageData("");
        setMessage("✅ 已新增！作品集頁面即會顯示");
        fetchCases();
      } else {
        const data = await res.json().catch(() => ({}));
        setMessage(`新增失敗：${data.error || res.status}`);
      }
    } catch {
      setMessage("新增失敗，請稍後再試");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("確定要刪除這個案例嗎？")) return;
    try {
      const res = await fetch(`/api/cases/${id}`, {
        method: "DELETE",
        headers: { "x-admin-key": getAdminKey() },
      });
      if (res.ok) fetchCases();
    } catch (e) {
      console.error("Delete failed", e);
    }
  };

  // 開始編輯：把該筆資料帶入編輯表單
  const startEdit = (c: CaseItem) => {
    setEditId(c.id);
    setEditTitle(c.title);
    setEditCategory(categories.includes(c.category) ? c.category : categories[0]);
    setEditSize(c.size);
    setEditDays(c.days || "");
    setEditDesc(c.desc || "");
    setEditImageData("");
    setEditMessage("");
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditImageData("");
    setEditMessage("");
  };

  const handleEditFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setEditImageData(await compressImage(file));
    } catch {
      setEditMessage("照片讀取失敗，請換一張試試");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    if (!editTitle) {
      setEditMessage("請填寫作品名稱");
      return;
    }
    setEditSubmitting(true);
    setEditMessage("");
    try {
      const res = await fetch(`/api/cases/${editId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": getAdminKey(),
        },
        body: JSON.stringify({
          title: editTitle,
          category: editCategory,
          size: editSize,
          days: editDays,
          desc: editDesc,
          // 只有換了新圖才帶 imageData；沒換則後端沿用原圖
          ...(editImageData ? { imageData: editImageData } : {}),
        }),
      });
      if (res.ok) {
        setEditId(null);
        setEditImageData("");
        fetchCases();
      } else {
        const data = await res.json().catch(() => ({}));
        setEditMessage(`儲存失敗：${data.error || res.status}`);
      }
    } catch {
      setEditMessage("儲存失敗，請稍後再試");
    } finally {
      setEditSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-brand-border shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-brand-dark">🖼 作品案例管理</h2>
          <p className="text-xs text-brand-muted font-medium mt-1">
            新增的案例會即時顯示在前台「作品案例」頁面
          </p>
        </div>
        <a
          href="/showcase"
          target="_blank"
          className="text-xs font-bold text-brand-orange bg-brand-peach-light px-4 py-2 rounded-full hover:bg-brand-peach/30 transition-all"
        >
          查看前台作品集 ↗
        </a>
      </div>

      {/* Add Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 md:p-8 rounded-3xl border border-brand-border shadow-sm space-y-5"
      >
        <h3 className="text-base font-black text-brand-dark">➕ 新增作品案例</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Photo */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-brand-dark">作品照片 *</label>
            <label className="block w-full h-48 rounded-2xl border-2 border-dashed border-brand-border hover:border-brand-orange/60 cursor-pointer overflow-hidden relative bg-brand-cream/30">
              {imageData ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageData} alt="預覽" className="w-full h-full object-contain" />
              ) : (
                <span className="absolute inset-0 flex flex-col items-center justify-center text-xs text-brand-muted font-bold gap-1">
                  <span className="text-2xl">📷</span>
                  點擊上傳照片
                </span>
              )}
              <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
            </label>
          </div>

          {/* Fields */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-brand-dark">作品名稱 *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例：英國短毛貓「波波」紀念公仔"
                className="w-full px-4 py-2.5 rounded-xl border border-brand-border focus:border-brand-orange focus:outline-none text-sm font-medium"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-brand-dark">類別 *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-brand-border focus:border-brand-orange focus:outline-none text-sm font-medium bg-white"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-brand-dark">尺寸 *</label>
                <select
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-brand-border focus:border-brand-orange focus:outline-none text-sm font-medium bg-white"
                >
                  {sizeOptions.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-brand-dark">製作天數（選填）</label>
              <input
                type="text"
                value={days}
                onChange={(e) => setDays(e.target.value)}
                placeholder="例：7天"
                className="w-full px-4 py-2.5 rounded-xl border border-brand-border focus:border-brand-orange focus:outline-none text-sm font-medium"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-extrabold text-brand-dark">簡單文案（選填）</label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={2}
            placeholder="簡單介紹這件作品的故事或特色"
            className="w-full px-4 py-2.5 rounded-xl border border-brand-border focus:border-brand-orange focus:outline-none text-sm font-medium resize-none"
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <span className="text-xs font-bold text-brand-muted">{message}</span>
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3 rounded-full text-sm font-extrabold text-white bg-brand-orange hover:bg-brand-orange-hover shadow-sm transition-all disabled:opacity-50"
          >
            {submitting ? "上傳中…" : "新增案例"}
          </button>
        </div>
      </form>

      {/* Existing cases */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-brand-border shadow-sm space-y-5">
        <h3 className="text-base font-black text-brand-dark">
          已上架案例（{cases.length}）
        </h3>
        {loading ? (
          <div className="py-10 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange" />
          </div>
        ) : cases.length === 0 ? (
          <p className="text-xs text-brand-muted font-medium py-6 text-center">
            還沒有透過後台新增的案例。前台另有內建的範例案例，會一併顯示。
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cases.map((c) =>
              editId === c.id ? (
                // —— 編輯模式 ——
                <form
                  key={c.id}
                  onSubmit={handleUpdate}
                  className="border-2 border-brand-orange/60 rounded-2xl overflow-hidden bg-white p-3 space-y-2.5 sm:col-span-2 lg:col-span-3"
                >
                  <p className="text-xs font-black text-brand-orange">✏️ 編輯案例</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* 圖片 */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-extrabold text-brand-dark">作品照片（不換則留空）</label>
                      <label className="block w-full h-40 rounded-xl border-2 border-dashed border-brand-border hover:border-brand-orange/60 cursor-pointer overflow-hidden relative bg-brand-cream/30">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={editImageData || c.img}
                          alt="預覽"
                          className="w-full h-full object-contain"
                        />
                        <input type="file" accept="image/*" onChange={handleEditFile} className="hidden" />
                      </label>
                    </div>
                    {/* 欄位 */}
                    <div className="space-y-2.5">
                      <div className="space-y-1">
                        <label className="text-[11px] font-extrabold text-brand-dark">作品名稱 *</label>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-brand-border focus:border-brand-orange focus:outline-none text-sm font-medium"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[11px] font-extrabold text-brand-dark">類別 *</label>
                          <select
                            value={editCategory}
                            onChange={(e) => setEditCategory(e.target.value)}
                            className="w-full px-2 py-2 rounded-lg border border-brand-border focus:border-brand-orange focus:outline-none text-sm font-medium bg-white"
                          >
                            {categories.map((cat) => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-extrabold text-brand-dark">尺寸 *</label>
                          <select
                            value={editSize}
                            onChange={(e) => setEditSize(e.target.value)}
                            className="w-full px-2 py-2 rounded-lg border border-brand-border focus:border-brand-orange focus:outline-none text-sm font-medium bg-white"
                          >
                            {sizeOptions.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                            {/* 保留原本不在清單中的舊尺寸值 */}
                            {!sizeOptions.includes(editSize) && (
                              <option value={editSize}>{editSize}</option>
                            )}
                          </select>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-extrabold text-brand-dark">製作天數</label>
                        <input
                          type="text"
                          value={editDays}
                          onChange={(e) => setEditDays(e.target.value)}
                          placeholder="例：7天"
                          className="w-full px-3 py-2 rounded-lg border border-brand-border focus:border-brand-orange focus:outline-none text-sm font-medium"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold text-brand-dark">文案</label>
                    <textarea
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg border border-brand-border focus:border-brand-orange focus:outline-none text-sm font-medium resize-none"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[11px] font-bold text-brand-muted">{editMessage}</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="px-4 py-2 rounded-full text-xs font-bold text-brand-muted bg-brand-cream hover:bg-brand-border/40 transition-all"
                      >
                        取消
                      </button>
                      <button
                        type="submit"
                        disabled={editSubmitting}
                        className="px-6 py-2 rounded-full text-xs font-extrabold text-white bg-brand-orange hover:bg-brand-orange-hover shadow-sm transition-all disabled:opacity-50"
                      >
                        {editSubmitting ? "儲存中…" : "儲存變更"}
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                // —— 顯示模式 ——
                <div
                  key={c.id}
                  className="border border-brand-border/60 rounded-2xl overflow-hidden bg-brand-cream/20"
                >
                  <div className="relative w-full h-36 bg-white">
                    <Image src={c.img} alt={c.title} fill className="object-cover" />
                  </div>
                  <div className="p-3 space-y-1">
                    <p className="text-sm font-black text-brand-dark truncate">{c.title}</p>
                    <p className="text-[11px] text-brand-muted font-bold">
                      {c.category}｜{c.size}{c.days ? `｜${c.days}` : ""}
                    </p>
                    <div className="flex gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => startEdit(c)}
                        className="text-[11px] font-bold text-brand-orange hover:text-brand-orange-hover"
                      >
                        ✏️ 編輯
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(c.id)}
                        className="text-[11px] font-bold text-red-500 hover:text-red-600"
                      >
                        🗑 刪除
                      </button>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
