import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

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

    // ✅ DEBUG LOG: Check terminal to see if date is coming
    console.log(`[API] Create Goal - Product: ${productId}, Date: ${targetDate}`);

    if (!productId) return NextResponse.json({ error: "productId is required" }, { status: 400 });
    const amountNum = Number(targetAmount);

    // CASE 1: UPDATING A DRAFT (SAVED)
    if (status === "SAVED") {
        const existingDraft = await prisma.goal.findFirst({
            where: { userId, productId, status: "SAVED" } 
        });

        if (existingDraft) {
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

    // CASE 2: STARTING A NEW GOAL (ACTIVE)
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    // ✅ Ensure valid date object or null
    const finalEndDate = targetDate ? new Date(targetDate) : null;

    const result = await prisma.$transaction(async (tx) => {
      const newGoal = await tx.goal.create({
        data: {
          userId,
          productId,
          targetAmount: amountNum,
          endDate: finalEndDate, // ✅ Saving the date
          status: status,
          saved: 0,
          lockedPrice: product.price,
          priceLocked: true,
        },
      });

      await tx.priceLock.create({
        data: {
          productId,
          goalId: newGoal.id,
          lockedPrice: product.price,
          originalPrice: product.price,
          lockedBy: userId,
          status: "ACTIVE",
          storeId: product.storeId,
          expiresAt: finalEndDate, // ✅ Syncing PriceLock expiry
        },
      });

      return newGoal;
    });

    return NextResponse.json({ message: "New goal created", goal: normalize(result) });

  } catch (err) {
    console.error("set-goal POST error:", err);
    return NextResponse.json({ error: err.message || "Something went wrong" }, { status: 500 });
  }
}