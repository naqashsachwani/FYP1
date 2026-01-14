import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// ------------------------------
// POST: Update user cart
// ------------------------------
export async function POST(request) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    const { cart } = await request.json();

    if (!cart) {
      return NextResponse.json(
        { error: "Cart data is required" },
        { status: 400 }
      );
    }

    // Update the user's cart
    const user = await prisma.user.update({
      where: { id: userId },
      data: { cart },
    });

    return NextResponse.json({
      message: "Cart updated successfully",
      cart: user.cart || [],
    });
  } catch (error) {
    console.error("POST /api/cart error:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// ------------------------------
// GET: Retrieve user cart
// ------------------------------
export async function GET(request) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ cart: user.cart || [] });
  } catch (error) {
    console.error("GET /api/cart error:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
