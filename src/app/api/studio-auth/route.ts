import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/adminAuth";

// 驗證後台密碼用
export async function POST(request: Request) {
  if (!isAuthed(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
