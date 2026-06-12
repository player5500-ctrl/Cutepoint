import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/adminAuth";
import { readCases } from "../route";
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "src/data/cases.json");
const hasBlob = () => !!process.env.BLOB_READ_WRITE_TOKEN;

async function saveCases(cases: any[]) {
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
    const target = cases.find((c: any) => c.id === id);
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

    await saveCases(cases.filter((c: any) => c.id !== id));
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Error deleting case", e);
    return NextResponse.json({ error: "Failed to delete case" }, { status: 500 });
  }
}
