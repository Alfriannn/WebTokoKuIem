import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const isFeatured = request.nextUrl.searchParams.get("featured");
  let where = {};

  if (isFeatured === "true") {
    where = { featured: true };
  }

  const products = await prisma.product.findMany({ where });
  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, description, price, stock, imageUrl, featured } = body;

  if (!name || !price || !stock) {
    return NextResponse.json({ error: "Field wajib tidak boleh kosong" }, { status: 400 });
  }

  const product = await prisma.product.create({
    data: {
      name,
      description,
      price: Number(price),
      stock: Number(stock),
      imageUrl: imageUrl || "",
      featured: !!featured, // <-- tambahkan ini!
    },
  });

  return NextResponse.json(product);
}
