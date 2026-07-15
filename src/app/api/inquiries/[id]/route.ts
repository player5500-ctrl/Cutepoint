import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/adminAuth";
// 與父路由共用同一套 Blob 雙軌儲存（避免兩處邏輯不一致）
import { readInquiries, saveInquiries } from "../route";

// PUT: Update single inquiry fields
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
    
    const inquiries = await readInquiries();
    const index = inquiries.findIndex((inq: any) => inq.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }

    // Update fields
    const current = inquiries[index];
    inquiries[index] = {
      ...current,
      status: body.status !== undefined ? body.status : current.status,
      assignee: body.assignee !== undefined ? body.assignee : current.assignee,
      officialQuote: body.officialQuote !== undefined ? Number(body.officialQuote) : current.officialQuote,
      internalNotes: body.internalNotes !== undefined ? body.internalNotes : current.internalNotes,
    };

    await saveInquiries(inquiries);

    return NextResponse.json({ success: true, data: inquiries[index] });
  } catch (error) {
    console.error("Error updating inquiry", error);
    return NextResponse.json({ error: "Failed to update inquiry" }, { status: 500 });
  }
}
