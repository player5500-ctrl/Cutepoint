import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "src/data/inquiries.json");

function getInquiries() {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Failed to read inquiries file", error);
  }
  return [];
}

function saveInquiries(inquiries: any[]) {
  try {
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(inquiries, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Failed to write to inquiries file", error);
    return false;
  }
}

// PUT: Update single inquiry fields
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const inquiries = getInquiries();
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

    saveInquiries(inquiries);

    return NextResponse.json({ success: true, data: inquiries[index] });
  } catch (error) {
    console.error("Error updating inquiry", error);
    return NextResponse.json({ error: "Failed to update inquiry" }, { status: 500 });
  }
}
