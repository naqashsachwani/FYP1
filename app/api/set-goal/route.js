import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// ✅ FORCE DYNAMIC: Prevents Next.js from caching the response
export const dynamic = 'force-dynamic';

const normalize = (obj) => JSON.parse(JSON.stringify(obj, (key, value) => 
  (typeof value === 'object' && value !== null && value.type === 'Decimal') ? Number(value) : value
));

// GET: Fetch user goals
export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    if (!userId) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

    const goals = await prisma.goal.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { product: true, deposits: true },
    });

    const goalsWithProgress = goals.map(goal => ({
      ...goal,
      progressPercent: goal.targetAmount > 0 ? (Number(goal.saved) / Number(goal.targetAmount)) * 100 : 0,
      remainingAmount: Number(goal.targetAmount) - Number(goal.saved),
    }));

    return NextResponse.json({ goals: normalize(goalsWithProgress) });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Something went wrong" }, { status: 500 });
  }
}

// POST: Create or Update Goal
export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    if (!userId) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

    const body = await request.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

    const { productId, targetAmount, targetDate, status = "ACTIVE" } = body;

    console.log(`[API] Goal Request for Product: ${productId} | Status: ${status}`);

    if (!productId) return NextResponse.json({ error: "productId is required" }, { status: 400 });
    const amountNum = Number(targetAmount);
    if (!amountNum || amountNum <= 0) return NextResponse.json({ error: "targetAmount must be positive" }, { status: 400 });

    // ============================================================
    // 🛑 LOGIC SPLIT
    // ============================================================

    // CASE 1: UPDATING A DRAFT
    // Only if status is explicitly "SAVED", we look for an existing draft to update.
    if (status === "SAVED") {
        const existingDraft = await prisma.goal.findFirst({
            where: { 
                userId, 
                productId,
                status: "SAVED" 
            } 
        });

        if (existingDraft) {
            console.log("[API] Updating existing DRAFT...");
            const updatedDraft = await prisma.goal.update({
                where: { id: existingDraft.id },
                data: {
                    targetAmount: amountNum,
                    endDate: targetDate ? new Date(targetDate) : existingDraft.endDate,
                },
            });
            return NextResponse.json({ message: "Draft updated", goal: normalize(updatedDraft) });
        }
    }

    // CASE 2: STARTING A GOAL (ACTIVE)
    // We intentionally SKIP looking for existing goals.
    // This forces the creation of a BRAND NEW GOAL ID.
    console.log("[API] --- CREATING FRESH GOAL ---");

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create NEW Goal
      const newGoal = await tx.goal.create({
        data: {
          userId,
          productId,
          targetAmount: amountNum,
          endDate: targetDate ? new Date(targetDate) : null,
          status: status, // "ACTIVE"
          saved: 0,
          lockedPrice: product.price,
          priceLocked: true,
        },
      });

      // 2. Create NEW PriceLock
      await tx.priceLock.create({
        data: {
          productId,
          goalId: newGoal.id,
          lockedPrice: product.price,
          originalPrice: product.price,
          lockedBy: userId,
          status: "ACTIVE",
          storeId: product.storeId,
          expiresAt: targetDate ? new Date(targetDate) : null,
        },
      });

      return newGoal;
    });

    console.log("[API] New Goal Created ID:", result.id);
    return NextResponse.json({ message: "New goal created", goal: normalize(result) });

  } catch (err) {
    console.error("set-goal POST error:", err);
    return NextResponse.json({ error: err.message || "Something went wrong" }, { status: 500 });
  }
}