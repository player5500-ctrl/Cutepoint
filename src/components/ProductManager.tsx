"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { getAdminKey } from "@/components/AdminGate";

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

const emptyForm = {
  name: "",
  desc: "",
  specs: [
    { label: "", value: "" },
    { label: "", value: "" },
    { label: "", value: "" },
    { label: "", value: "" },
  ] as ProductSpec[],
  imageData: "", // 新上傳的照片（data URL）
  image: "", // 既有照片網址
};

// 產品服務管理區塊：完全接管前台「產品與服務類別」頁，可新增/編輯/刪除/排序
export default function ProductManager() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [reordering, setReordering] = useState(false);

  // 編輯/新增的 Modal 表單
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products", { cache: "no-store" });
      if (res.ok) setProducts(await res.json());
    } catch (e) {
      console.error("Failed to load products", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...emptyForm, specs: emptyForm.specs.map((s) => ({ ...s })) });
    setModalOpen(true);
  };

  const openEdit = (p: ProductItem) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      desc: p.desc,
      specs: p.specs.length ? p.specs.map((s) => ({ ...s })) : [{ label: "", value: "" }],
      imageData: "",
      image: p.image,
    });
    setModalOpen(true);
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await compressImage(file);
      setForm((f) => ({ ...f, imageData: data }));
    } catch {
      setMessage("照片讀取失敗，請換一張試試");
    }
  };

  const updateSpec = (i: number, key: keyof ProductSpec, val: string) => {
    setForm((f) => {
      const specs = f.specs.map((s, idx) => (idx === i ? { ...s, [key]: val } : s));
      return { ...f, specs };
    });
  };

  const addSpecRow = () =>
    setForm((f) => ({ ...f, specs: [...f.specs, { label: "", value: "" }] }));

  const removeSpecRow = (i: number) =>
    setForm((f) => ({ ...f, specs: f.specs.filter((_, idx) => idx !== i) }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setMessage("請填寫產品名稱");
      return;
    }
    setSubmitting(true);
    setMessage("");
    const cleanSpecs = form.specs.filter((s) => s.label.trim() || s.value.trim());
    const payload = {
      name: form.name,
      desc: form.desc,
      specs: cleanSpecs,
      imageData: form.imageData,
      image: form.image,
    };
    try {
      const isEdit = !!editingId;
      const res = await fetch(
        isEdit ? `/api/products/${editingId}` : "/api/products",
        {
          method: isEdit ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            "x-admin-key": getAdminKey(),
          },
          body: JSON.stringify(payload),
        }
      );
      if (res.ok) {
        setModalOpen(false);
        setMessage(isEdit ? "✅ 已更新！前台產品頁即會同步" : "✅ 已新增！前台產品頁即會顯示");
        fetchProducts();
      } else {
        const data = await res.json().catch(() => ({}));
        setMessage(`儲存失敗：${data.error || res.status}`);
      }
    } catch {
      setMessage("儲存失敗，請稍後再試");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("確定要刪除這個產品項目嗎？前台會立即移除。")) return;
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: { "x-admin-key": getAdminKey() },
      });
      if (res.ok) {
        setMessage("已刪除");
        fetchProducts();
      }
    } catch (e) {
      console.error("Delete failed", e);
    }
  };

  // 上下排序：交換後整批送出
  const move = async (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= products.length) return;
    const next = [...products];
    [next[index], next[target]] = [next[target], next[index]];
    setProducts(next);
    setReordering(true);
    try {
      await fetch("/api/products", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": getAdminKey(),
        },
        body: JSON.stringify({ products: next }),
      });
    } catch (e) {
      console.error("Reorder failed", e);
      fetchProducts();
    } finally {
      setReordering(false);
    }
  };

  const previewImg = form.imageData || form.image;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-brand-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-brand-dark">🛍 產品服務管理</h2>
          <p className="text-xs text-brand-muted font-medium mt-1">
            這裡的項目會完整呈現在前台「產品與服務類別」頁面，可新增、編輯、刪除與調整順序
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href="/products"
            target="_blank"
            className="text-xs font-bold text-brand-orange bg-brand-peach-light px-4 py-2 rounded-full hover:bg-brand-peach/30 transition-all whitespace-nowrap"
          >
            查看前台 ↗
          </a>
          <button
            type="button"
            onClick={openAdd}
            className="text-xs font-extrabold text-white bg-brand-orange px-4 py-2 rounded-full hover:bg-brand-orange-hover shadow-sm transition-all whitespace-nowrap"
          >
            ➕ 新增產品
          </button>
        </div>
      </div>

      {message && (
        <p className="text-xs font-bold text-brand-orange px-2">{message}</p>
      )}

      {/* Product list */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-brand-border shadow-sm space-y-5">
        <h3 className="text-base font-black text-brand-dark flex items-center gap-2">
          目前上架產品（{products.length}）
          {reordering && (
            <span className="text-[10px] font-bold text-brand-muted">排序儲存中…</span>
          )}
        </h3>
        {loading ? (
          <div className="py-10 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange" />
          </div>
        ) : products.length === 0 ? (
          <p className="text-xs text-brand-muted font-medium py-6 text-center">
            目前沒有任何產品項目，請點「新增產品」建立第一筆。
          </p>
        ) : (
          <div className="space-y-3">
            {products.map((p, idx) => (
              <div
                key={p.id}
                className="flex items-center gap-4 border border-brand-border/60 rounded-2xl p-3 bg-brand-cream/20"
              >
                {/* Order controls */}
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => move(idx, -1)}
                    disabled={idx === 0 || reordering}
                    className="w-6 h-6 rounded-md border border-brand-border bg-white text-brand-muted hover:text-brand-orange disabled:opacity-30 text-xs font-bold"
                    title="上移"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => move(idx, 1)}
                    disabled={idx === products.length - 1 || reordering}
                    className="w-6 h-6 rounded-md border border-brand-border bg-white text-brand-muted hover:text-brand-orange disabled:opacity-30 text-xs font-bold"
                    title="下移"
                  >
                    ▼
                  </button>
                </div>

                {/* Thumbnail */}
                <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-brand-border bg-white shrink-0">
                  <Image src={p.image} alt={p.name} fill className="object-cover" />
                </div>

                {/* Info */}
                <div className="flex-grow min-w-0">
                  <p className="text-sm font-black text-brand-dark truncate">
                    {idx + 1}. {p.name}
                  </p>
                  <p className="text-[11px] text-brand-muted font-medium line-clamp-2">
                    {p.desc || "（尚無說明）"}
                  </p>
                  <p className="text-[10px] text-brand-muted/80 font-bold mt-0.5">
                    {p.specs.length} 項規格
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEdit(p)}
                    className="px-3 py-1.5 rounded-lg border border-brand-orange text-brand-orange hover:bg-brand-peach-light/45 transition-colors font-bold text-[11px]"
                  >
                    編輯
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(p.id)}
                    className="px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors font-bold text-[11px]"
                  >
                    🗑 刪除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl border border-brand-border max-w-2xl w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Modal header */}
            <div className="p-5 border-b border-gray-100 bg-gray-50/80 flex justify-between items-center">
              <h3 className="text-base font-black text-brand-dark">
                {editingId ? "✏️ 編輯產品" : "➕ 新增產品"}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Modal body */}
            <div className="flex-grow p-6 overflow-y-auto space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Photo */}
                <div className="space-y-2">
                  <label className="text-xs font-extrabold text-brand-dark">產品照片</label>
                  <label className="block w-full h-44 rounded-2xl border-2 border-dashed border-brand-border hover:border-brand-orange/60 cursor-pointer overflow-hidden relative bg-brand-cream/30">
                    {previewImg ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={previewImg} alt="預覽" className="w-full h-full object-contain" />
                    ) : (
                      <span className="absolute inset-0 flex flex-col items-center justify-center text-xs text-brand-muted font-bold gap-1">
                        <span className="text-2xl">📷</span>
                        點擊上傳照片
                      </span>
                    )}
                    <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
                  </label>
                  <p className="text-[10px] text-brand-muted">未上傳時沿用原圖；新項目預設為萌點示意圖。</p>
                </div>

                {/* Name + desc */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-brand-dark">產品名稱 *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="例：Q版人像公仔"
                      className="w-full px-4 py-2.5 rounded-xl border border-brand-border focus:border-brand-orange focus:outline-none text-sm font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-brand-dark">產品說明</label>
                    <textarea
                      value={form.desc}
                      onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))}
                      rows={5}
                      placeholder="介紹這個產品/服務的特色與適用場合"
                      className="w-full px-4 py-2.5 rounded-xl border border-brand-border focus:border-brand-orange focus:outline-none text-sm font-medium resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Specs */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-brand-dark">規格欄位</label>
                  <button
                    type="button"
                    onClick={addSpecRow}
                    className="text-[11px] font-bold text-brand-orange hover:underline"
                  >
                    ➕ 新增一列
                  </button>
                </div>
                <div className="space-y-2">
                  {form.specs.map((s, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={s.label}
                        onChange={(e) => updateSpec(i, "label", e.target.value)}
                        placeholder="標題（例：建議尺寸）"
                        className="w-1/3 px-3 py-2 rounded-xl border border-brand-border focus:border-brand-orange focus:outline-none text-xs font-medium"
                      />
                      <input
                        type="text"
                        value={s.value}
                        onChange={(e) => updateSpec(i, "value", e.target.value)}
                        placeholder="內容（例：8cm / 10cm / 12cm）"
                        className="flex-grow px-3 py-2 rounded-xl border border-brand-border focus:border-brand-orange focus:outline-none text-xs font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => removeSpecRow(i)}
                        className="text-red-400 hover:text-red-600 text-sm font-bold px-1 shrink-0"
                        title="刪除此列"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="p-5 border-t border-gray-100 bg-gray-50/80 flex items-center justify-between gap-4">
              <span className="text-xs font-bold text-brand-muted">{message}</span>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-6 py-2.5 rounded-full border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-bold text-sm"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-2.5 rounded-full text-sm font-extrabold text-white bg-brand-orange hover:bg-brand-orange-hover shadow-sm transition-all disabled:opacity-50"
                >
                  {submitting ? "儲存中…" : editingId ? "儲存修改" : "新增產品"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
