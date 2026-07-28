import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/adminAuth";
import { readCases, type CaseRecord } from "../route";
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "src/data/cases.json");
const hasBlob = () => !!process.env.BLOB_READ_WRITE_TOKEN;

async function saveCases(cases: CaseRecord[]) {
  if (hasBlob()) {
    const { put } = await import("@vercel/blob");
    await put("cases.json", JSON.stringify(cases, null, 2), {
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
    console.error("Failed to write cases file", e);
  }
}

// 將上傳的 data URL 圖片存成 Blob 獨立檔，回傳永久網址；無 Blob 時原樣保留
async function persistCaseImage(imageData: string, id: string): Promise<string> {
  if (hasBlob() && typeof imageData === "string" && imageData.startsWith("data:")) {
    const match = imageData.match(/^data:(image\/(\w+));base64,(.+)$/);
    if (!match) throw new Error("照片格式錯誤");
    const ext = match[2] === "jpeg" ? "jpg" : match[2];
    const buffer = Buffer.from(match[3], "base64");
    const { put } = await import("@vercel/blob");
    const blob = await put(`cases/${id}-${Date.now()}.${ext}`, buffer, {
      access: "public",
      contentType: match[1],
    });
    return blob.url;
  }
  return imageData;
}

// PUT：編輯已上架案例（需後台密碼）— 可改名稱／類別／尺寸／製作天數／文案／圖片
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthed(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, category, size, days, desc, imageData } = body;

    const cases = await readCases();
    const idx = cases.findIndex((c) => c.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    const current = cases[idx];
    let img: string = current.img ?? "";

    // 若有帶入新的照片 data URL 才更新圖片，並嘗試清掉舊圖
    if (typeof imageData === "string" && imageData.startsWith("data:")) {
      img = await persistCaseImage(imageData, id);
      if (
        hasBlob() &&
        typeof current.img === "string" &&
        current.img.includes("blob.vercel-storage.com") &&
        current.img !== img
      ) {
        try {
          const { del } = await import("@vercel/blob");
          await del(current.img);
        } catch (e) {
          console.error("Failed to delete old case image blob", e);
        }
      }
    }

    const updated = {
      ...current,
      title: title ?? current.title,
      category: category ?? current.category,
      size: size ?? current.size,
      days: days ?? current.days ?? "",
      desc: desc ?? current.desc ?? "",
      img,
      updatedAt: new Date().toISOString(),
    };

    cases[idx] = updated;
    await saveCases(cases);
    return NextResponse.json({ success: true, data: updated });
  } catch (e) {
    console.error("Error updating case", e);
    return NextResponse.json({ error: "Failed to update case" }, { status: 500 });
  }
}

// DELETE：刪除作品案例（需後台密碼）
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthed(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const cases = await readCases();
    const target = cases.find((c) => c.id === id);
    if (!target) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    // 連同 Blob 上的照片一併刪除
    if (hasBlob() && typeof target.img === "string" && target.img.includes("blob.vercel-storage.com")) {
      try {
        const { del } = await import("@vercel/blob");
        await del(target.img);
      } catch (e) {
        console.error("Failed to delete case image blob", e);
      }
    }

    await saveCases(cases.filter((c) => c.id !== id));
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Error deleting case", e);
    return NextResponse.json({ error: "Failed to delete case" }, { status: 500 });
  }
}
