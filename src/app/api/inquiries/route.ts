import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/adminAuth";
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "src/data/inquiries.json");

// In-memory cache fallback for Vercel/serverless environments where fs is read-only
let memoryInquiries: any[] = [];

function getInquiries() {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Failed to read inquiries file, using memory cache", error);
  }
  
  if (memoryInquiries.length === 0) {
    // Return empty or mock default if file read completely fails
    return [];
  }
  return memoryInquiries;
}

function saveInquiries(inquiries: any[]) {
  memoryInquiries = inquiries;
  try {
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(inquiries, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Failed to write to inquiries file, saved in memory only", error);
    return false;
  }
}

// GET: Retrieve all inquiries（需後台密碼）
export async function GET(request: Request) {
  if (!isAuthed(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const inquiries = getInquiries();
  return NextResponse.json(inquiries);
}

// POST: Add new inquiry
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.clientName) {
      return NextResponse.json({ error: "Client name is required" }, { status: 400 });
    }

    const inquiries = getInquiries();
    
    // Generate inquiry ID CP-XXXXX
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const id = `CP-${randomNum}`;
    const createdAt = new Date().toISOString();

    // Parse estimated prices
    let estLow = 0;
    let estHigh = 0;
    if (body.estPriceRange) {
      const numbers = body.estPriceRange.replace(/[^0-9~]/g, "").split("~");
      if (numbers.length === 2) {
        estLow = parseInt(numbers[0]) || 0;
        estHigh = parseInt(numbers[1]) || 0;
      }
    }

    const newInquiry = {
      id,
      createdAt,
      clientName: body.clientName,
      lineId: body.lineId || "",
      phone: body.phone || "",
      email: body.email || "",
      productType: body.productType || "Q版人像公仔",
      size: body.size || "10cm",
      quantity: body.quantity || "1 件",
      needModeling: body.needModeling !== false,
      needRetouching: body.needRetouching === true,
      complexity: body.complexity || "一般",
      isUrgent: body.isUrgent === true,
      needPackaging: body.needPackaging === true,
      estLow,
      estHigh,
      purpose: body.purpose || "",
      expectedDelivery: body.expectedDelivery || "",
      fileNames: body.fileNames || [],
      // Administrative fields
      status: "待回覆",
      assignee: "",
      officialQuote: 0,
      internalNotes: body.notes || "",
    };

    inquiries.unshift(newInquiry); // Add to the beginning
    saveInquiries(inquiries);

    // Google Sheets Integration forwarding (if configured)
    const sheetsWebhook = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
    if (sheetsWebhook) {
      try {
        await fetch(sheetsWebhook, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inquiryId: id,
            createdAt: new Date(createdAt).toLocaleString("zh-TW", { hour12: false }),
            clientName: newInquiry.clientName,
            lineId: newInquiry.lineId,
            phone: newInquiry.phone,
            email: newInquiry.email,
            productType: newInquiry.productType,
            size: newInquiry.size,
            quantity: newInquiry.quantity,
            needModeling: newInquiry.needModeling ? "是" : "否",
            needRetouching: newInquiry.needRetouching ? "是" : "否",
            complexity: newInquiry.complexity,
            isUrgent: newInquiry.isUrgent ? "是" : "否",
            needPackaging: newInquiry.needPackaging ? "是" : "否",
            estLow: newInquiry.estLow,
            estHigh: newInquiry.estHigh,
            purpose: newInquiry.purpose,
            expectedDelivery: newInquiry.expectedDelivery,
            fileNames: newInquiry.fileNames.join(", "),
            status: newInquiry.status,
            assignee: newInquiry.assignee,
            officialQuote: newInquiry.officialQuote,
            internalNotes: newInquiry.internalNotes,
          }),
        });
      } catch (e) {
        console.error("Failed to forward inquiry to Google Sheets webhook:", e);
      }
    }

    return NextResponse.json({ success: true, id, name: body.clientName });
  } catch (error) {
    console.error("Error creating inquiry", error);
    return NextResponse.json({ error: "Failed to create inquiry" }, { status: 500 });
  }
}
