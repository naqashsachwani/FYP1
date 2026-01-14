import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request, context) {
  const { productId } = context.params; // ✅ fix here

  if (!productId) {
    return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      ratings: {
        select: {
          rating: true,
          review: true,
          user: { select: { name: true, image: true } },
        },
      },
      store: true,
    },
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  if (!product.store.isActive) {
    return NextResponse.json({ error: "Product store is not active" }, { status: 404 });
  }

  return NextResponse.json({ product });
}
