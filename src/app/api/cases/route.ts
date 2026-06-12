import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { isAuthed } from "@/lib/adminAuth";

const filePath = path.join(process.cwd(), "src/data/cases.json");
const CASES_BLOB = "cases.json";

// 是否已設定 Vercel Blob（線上永久儲存）
const hasBlob = () => !!process.env.BLOB_READ_WRITE_TOKEN;

// 無 Blob 時的記憶體備援（Vercel 上重啟即消失）
let memoryCases: any[] = [];

export async function readCases(): Promise<any[]> {
  if (hasBlob()) {
    try {
      const { list } = await import("@vercel/blob");
      const { blobs } = await list({ prefix: CASES_BLOB });
      const target = blobs.find((b) => b.pathname === CASES_BLOB);
      if (!target) return [];
      const res = await fetch(target.url, { cache: "no-store" });
      if (!res.ok) return [];
      return await res.json();
    } catch (e) {
      console.error("Failed to read cases from Blob", e);
      return memoryCases;
    }
  }
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    }
  } catch (e) {
    console.error("Failed to read cases file", e);
  }
  return memoryCases;
}

async function saveCases(cases: any[]) {
  memoryCases = cases;
  if (hasBlob()) {
    const { put } = await import("@vercel/blob");
    await put(CASES_BLOB, JSON.stringify(cases, null, 2), {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
    });
    return;
  }
  try {
    fs.writeFileSync(filePath, JSON.stringify(cases, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to write cases file, saved in memory only", e);
  }
}

// GET：取得所有作品案例（公開，作品集頁面使用）
export async function GET() {
  const cases = await readCases();
  return NextResponse.json(cases);
}

// POST：新增作品案例（需後台密碼）
export async function POST(request: Request) {
  if (!isAuthed(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { title, category, size, days, desc, imageData } = body;

    if (!title || !category || !size || !imageData) {
      return NextResponse.json({ error: "缺少必填欄位" }, { status: 400 });
    }

    const id = `case-${Date.now()}`;
    let img: string = imageData;

    // 有 Blob 時把照片上傳成獨立檔案，取得永久網址
    if (hasBlob() && typeof imageData === "string" && imageData.startsWith("data:")) {
      const match = imageData.match(/^data:(image\/(\w+));base64,(.+)$/);
      if (!match) {
        return NextResponse.json({ error: "照片格式錯誤" }, { status: 400 });
      }
      const ext = match[2] === "jpeg" ? "jpg" : match[2];
      const buffer = Buffer.from(match[3], "base64");
      const { put } = await import("@vercel/blob");
      const blob = await put(`cases/${id}.${ext}`, buffer, {
        access: "public",
        contentType: match[1],
      });
      img = blob.url;
    }

    const newCase = {
      id,
      title,
      category,
      size,
      days: days || "",
      desc: desc || "",
      img,
      createdAt: new Date().toISOString(),
    };

    const cases = await readCases();
    cases.unshift(newCase);
    await saveCases(cases);

    return NextResponse.json({ success: true, data: newCase });
  } catch (e) {
    console.error("Error creating case", e);
    return NextResponse.json({ error: "Failed to create case" }, { status: 500 });
  }
}
