import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/adminAuth";
import {
  readProducts,
  saveProducts,
  persistImage,
  ProductItem,
  ProductSpec,
} from "../route";

const hasBlob = () => !!process.env.BLOB_READ_WRITE_TOKEN;

// PUT：更新單一產品欄位（需後台密碼）
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
    const products = await readProducts();
    const idx = products.findIndex((p) => p.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const current = products[idx];

    // 有上傳新照片才重新存圖；否則沿用原圖
    let image = current.image;
    if (typeof body.imageData === "string" && body.imageData.startsWith("data:")) {
      image = await persistImage(body.imageData, id);
    } else if (typeof body.image === "string" && body.image) {
      image = body.image;
    }

    const updated: ProductItem = {
      ...current,
      name: body.name ?? current.name,
      desc: body.desc ?? current.desc,
      specs: Array.isArray(body.specs)
        ? body.specs.filter((s: ProductSpec) => s && (s.label || s.value))
        : current.specs,
      bg: body.bg ?? current.bg,
      tagColor: body.tagColor ?? current.tagColor,
      image,
    };

    products[idx] = updated;
    await saveProducts(products);
    return NextResponse.json({ success: true, data: updated });
  } catch (e) {
    console.error("Error updating product", e);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

// DELETE：刪除單一產品（需後台密碼）
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthed(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const products = await readProducts();
    const target = products.find((p) => p.id === id);
    if (!target) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // 連同 Blob 上的照片一併刪除
    if (
      hasBlob() &&
      typeof target.image === "string" &&
      target.image.includes("blob.vercel-storage.com")
    ) {
      try {
        const { del } = await import("@vercel/blob");
        await del(target.image);
      } catch (e) {
        console.error("Failed to delete product image blob", e);
      }
    }

    await saveProducts(products.filter((p) => p.id !== id));
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Error deleting product", e);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
