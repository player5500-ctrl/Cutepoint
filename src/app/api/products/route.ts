import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { isAuthed } from "@/lib/adminAuth";

const filePath = path.join(process.cwd(), "src/data/products.json");
const PRODUCTS_BLOB = "products.json";

// 是否已設定 Vercel Blob（線上永久儲存）
const hasBlob = () => !!process.env.BLOB_READ_WRITE_TOKEN;

// 無 Blob 時的記憶體備援（Vercel 上重啟即消失）
let memoryProducts: ProductItem[] | null = null;

export interface ProductSpec {
  label: string;
  value: string;
}

export interface ProductItem {
  id: string;
  name: string;
  desc: string;
  specs: ProductSpec[];
  image: string;
  bg?: string;
  tagColor?: string;
  createdAt?: string;
}

// 前台「產品與服務類別」內建的 6 大項目，作為後台尚未編輯前的預設種子
export const DEFAULT_PRODUCTS: ProductItem[] = [
  {
    id: "chibi",
    name: "Q版人像公仔",
    desc: "把您或親友的照片，轉化為風格活潑、五官討喜的 Q 版立體公仔。最適合婚禮小物、生日賀禮、畢業紀念或個人收藏。",
    specs: [
      { label: "建議尺寸", value: "4cm / 8cm / 10cm / 12cm" },
      { label: "建模需求", value: "通常需要 (由提供之 2D 照片進行 3D 建模)" },
      { label: "製作天數", value: "約 10 - 15 個工作天" },
      { label: "注意事項", value: "照片請儘量提供正側面、清晰且五官輪廓無遮擋之影像。" },
    ],
    bg: "bg-brand-peach-light",
    tagColor: "text-brand-orange bg-brand-peach-light",
    image: "/assets/q_jiang.jpg",
  },
  {
    id: "pet",
    name: "寵物公仔",
    desc: "為您心愛的貓咪、狗狗或各類毛孩製作專屬的仿真或萌化公仔，讓可愛的身影永遠陪伴身旁。",
    specs: [
      { label: "建議尺寸", value: "4cm / 6cm / 8cm / 10cm" },
      { label: "建模需求", value: "通常需要 (需呈現寵物獨特神韻)" },
      { label: "製作天數", value: "約 12 - 18 個工作天" },
      { label: "注意事項", value: "歡迎提供多角度的細節照，有助於更精準還原。" },
    ],
    bg: "bg-brand-yellow-light",
    tagColor: "text-amber-600 bg-brand-yellow-light",
    image: "/assets/q_jiang.jpg",
  },
  {
    id: "ai-character",
    name: "角色/AI圖轉公仔",
    desc: "無論是自創的插畫人設、二次元角色，還是近期透過 Midjourney / Stable Diffusion 等 AI 生成的精美圖像，我們都能將 2D 平面視覺轉化為 3D 立體模型！",
    specs: [
      { label: "建議尺寸", value: "10cm / 12cm / 15cm / 18cm" },
      { label: "建模需求", value: "需要 (從平面圖像建立完整三維骨架與面網)" },
      { label: "製作天數", value: "約 14 - 20 個工作天" },
      { label: "注意事項", value: "若有細部設定(如背面、配件)請一併附上，或由我們為您做延伸設計。" },
    ],
    bg: "bg-orange-50",
    tagColor: "text-brand-orange bg-orange-100",
    image: "/assets/q_jiang.jpg",
  },
  {
    id: "corporate",
    name: "企業展示樣品",
    desc: "專為企業品牌設計！包含品牌吉祥物實體化、產品結構原型、展覽大型公仔樣品等。提供展示級模型製作服務。",
    specs: [
      { label: "建議尺寸", value: "15cm / 18cm 或更大客製規格" },
      { label: "建模需求", value: "視情況 (若有原廠 3D CAD 檔則不需重新建模)" },
      { label: "製作天數", value: "約 7 - 14 個工作天" },
      { label: "注意事項", value: "可提供 STL 檔案進行直接處理與列印。" },
    ],
    bg: "bg-brand-peach-light/40",
    tagColor: "text-pink-600 bg-pink-50",
    image: "/assets/q_jiang.jpg",
  },
  {
    id: "bulk",
    name: "大量列印服務",
    desc: "針對文創商品、工作室配件、學生畢業製作或桌遊棋子等，提供小批量或大批量的快速代印服務。多台設備同時運作，確保產能與速度。",
    specs: [
      { label: "適用尺寸", value: "4cm ~ 18cm 皆可" },
      { label: "建模需求", value: "不需要 (客戶需自行提供 STL/OBJ 格式之 3D 檔案)" },
      { label: "製作天數", value: "視數量而定 (3 - 10 工作天起)" },
      { label: "注意事項", value: "請確保提供的檔案已完成閉合(Manifold)，且無破面結構。" },
    ],
    bg: "bg-brand-yellow-light/40",
    tagColor: "text-yellow-700 bg-yellow-100",
    image: "/assets/q_jiang.jpg",
  },
  {
    id: "cultural-creative",
    name: "文創模型",
    desc: "將地方特色、品牌 IP 與文創設計轉化為立體模型！舉凡吉祥物、桌遊配件、活動限定紀念品與地方觀光商品，我們都能協助商品化，小量到批量皆可承接。",
    specs: [
      { label: "建議尺寸", value: "4cm ~ 18cm 皆可" },
      { label: "建模需求", value: "視情況 (可由平面設計圖建模，或自備 3D 檔)" },
      { label: "製作天數", value: "約 7 - 14 個工作天" },
      { label: "注意事項", value: "歡迎學校、工作室與地方單位提案合作，批量訂單可採專案報價。" },
    ],
    bg: "bg-emerald-50",
    tagColor: "text-emerald-600 bg-emerald-100",
    image: "/assets/q_jiang.jpg",
  },
];

const Q_VERSION_PERSON_PRODUCT: ProductItem = {
  id: "q-version-person",
  name: "Q版人物",
  desc: "將照片中的人物轉化為專屬 Q版公仔，保留表情、髮型、服裝與代表性細節，製作成可收藏的立體紀念。",
  specs: [
    { label: "建議尺寸", value: "6cm / 8cm / 10cm" },
    { label: "建模需求", value: "通常需要（依照片建立 Q版立體模型）" },
    { label: "製作天數", value: "約 12 - 18 個工作天" },
    { label: "注意事項", value: "建議提供正面清晰照片與喜愛的姿勢參考。" },
  ],
  image: "/assets/q-version-person-figure-cropped.jpg",
  bg: "bg-brand-peach-light",
  tagColor: "text-brand-orange bg-brand-peach-light",
};

// 讀取已儲存的產品；若尚未有任何資料則回傳內建 6 項預設
export async function readProducts(): Promise<ProductItem[]> {
  let stored: ProductItem[] | null = null;

  if (hasBlob()) {
    try {
      const { list } = await import("@vercel/blob");
      const { blobs } = await list({ prefix: PRODUCTS_BLOB });
      const target = blobs.find((b) => b.pathname === PRODUCTS_BLOB);
      if (target) {
        const res = await fetch(target.url, { cache: "no-store" });
        if (res.ok) stored = await res.json();
      }
    } catch (e) {
      console.error("Failed to read products from Blob", e);
      stored = memoryProducts;
    }
  } else {
    try {
      if (fs.existsSync(filePath)) {
        stored = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      } else {
        stored = memoryProducts;
      }
    } catch (e) {
      console.error("Failed to read products file", e);
      stored = memoryProducts;
    }
  }

  // 空陣列或讀不到 → 回傳預設種子，確保前台永遠有內容
  if (!Array.isArray(stored) || stored.length === 0) return DEFAULT_PRODUCTS;

  // 規格欄位格式自動相容與規格化（處理舊格式例如 {"建議尺寸": "..."} 轉為 {"label": "建議尺寸", "value": "..."}）
  const normalized = stored.map((product) => {
    const specs = Array.isArray(product.specs)
      ? (product.specs as unknown[]).map((spec) => {
          if (spec && typeof spec === "object") {
            const specRecord = spec as Record<string, unknown>;
            if (specRecord.label !== undefined && specRecord.value !== undefined) {
              return {
                label: String(specRecord.label || ""),
                value: String(specRecord.value || ""),
              };
            }
            const otherKeys = Object.keys(specRecord).filter((k) => k !== "label" && k !== "value");
            if (otherKeys.length > 0) {
              const label = otherKeys[0];
              return { label, value: String(specRecord[label] || "") };
            }
          }
          return { label: "", value: "" };
        })
      : [];
    return { ...product, specs };
  });

  return normalized;
}

export async function saveProducts(products: ProductItem[]) {
  memoryProducts = products;
  if (hasBlob()) {
    const { put } = await import("@vercel/blob");
    await put(PRODUCTS_BLOB, JSON.stringify(products, null, 2), {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
    });
    return;
  }
  try {
    fs.writeFileSync(filePath, JSON.stringify(products, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to write products file, saved in memory only", e);
  }
}

// 將上傳的 data URL 圖片存成 Blob 獨立檔，回傳永久網址；無 Blob 時原樣保留
export async function persistImage(imageData: string, id: string): Promise<string> {
  if (hasBlob() && typeof imageData === "string" && imageData.startsWith("data:")) {
    const match = imageData.match(/^data:(image\/(\w+));base64,(.+)$/);
    if (!match) throw new Error("照片格式錯誤");
    const ext = match[2] === "jpeg" ? "jpg" : match[2];
    const buffer = Buffer.from(match[3], "base64");
    const { put } = await import("@vercel/blob");
    const blob = await put(`products/${id}-${Date.now()}.${ext}`, buffer, {
      access: "public",
      contentType: match[1],
    });
    return blob.url;
  }
  return imageData;
}

// GET：取得所有產品（公開，前台產品頁使用）
export async function GET() {
  const products = await readProducts();
  const list = products.some((product) => product.id === Q_VERSION_PERSON_PRODUCT.id)
    ? products
    : [Q_VERSION_PERSON_PRODUCT, ...products];
  return NextResponse.json(list);
}

// POST：新增單一產品（需後台密碼）
export async function POST(request: Request) {
  if (!isAuthed(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { name, desc, specs, imageData, image, bg, tagColor } = body;

    if (!name) {
      return NextResponse.json({ error: "缺少產品名稱" }, { status: 400 });
    }

    const id = `prod-${Date.now()}`;
    const src: string = imageData || image || "/assets/q_jiang.jpg";
    const img = await persistImage(src, id);

    const newProduct: ProductItem = {
      id,
      name,
      desc: desc || "",
      specs: Array.isArray(specs) ? specs.filter((s) => s && (s.label || s.value)) : [],
      image: img,
      bg: bg || "",
      tagColor: tagColor || "",
      createdAt: new Date().toISOString(),
    };

    const products = await readProducts();
    products.push(newProduct);
    await saveProducts(products);

    return NextResponse.json({ success: true, data: newProduct });
  } catch (e) {
    console.error("Error creating product", e);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}

// PUT：批次覆寫整個產品清單（需後台密碼），用於排序或整批儲存
export async function PUT(request: Request) {
  if (!isAuthed(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const incoming = Array.isArray(body) ? body : body.products;
    if (!Array.isArray(incoming)) {
      return NextResponse.json({ error: "格式錯誤：需提供產品陣列" }, { status: 400 });
    }

    // 逐筆處理可能夾帶的新照片 data URL
    const normalized: ProductItem[] = [];
    for (const p of incoming) {
      const id = p.id || `prod-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const src: string = p.imageData || p.image || "/assets/q_jiang.jpg";
      const image = await persistImage(src, id);
      normalized.push({
        id,
        name: p.name || "",
        desc: p.desc || "",
        specs: Array.isArray(p.specs) ? p.specs.filter((s: ProductSpec) => s && (s.label || s.value)) : [],
        image,
        bg: p.bg || "",
        tagColor: p.tagColor || "",
        createdAt: p.createdAt || new Date().toISOString(),
      });
    }

    await saveProducts(normalized);
    return NextResponse.json({ success: true, data: normalized });
  } catch (e) {
    console.error("Error replacing products", e);
    return NextResponse.json({ error: "Failed to update products" }, { status: 500 });
  }
}
