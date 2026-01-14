import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    if (!userId) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

    const goals = await prisma.goal.findMany({
      where: { userId },
      include: { product: true, deposits: true },
      orderBy: { createdAt: "desc" },
    });

    const goalsWithProgress = goals.map(goal => ({
      ...goal,
      progressPercent: goal.targetAmount > 0 ? (Number(goal.saved) / Number(goal.targetAmount)) * 100 : 0,
      remaining: Number(goal.targetAmount) - Number(goal.saved),
    }));

    return NextResponse.json({ goals: goalsWithProgress });
  } catch (err) {
    console.error("GET /api/goals error:", err);
    return NextResponse.json({ error: err.message || "Something went wrong" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    if (!userId) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

    const body = await request.json();
    const { productId, targetAmount, targetDate, acceptTerms } = body;

    if (!acceptTerms) return NextResponse.json({ error: "You must accept Terms & Conditions" }, { status: 400 });
    if (!productId) return NextResponse.json({ error: "productId is required" }, { status: 400 });

    const amountNum = Number(targetAmount);
    if (!amountNum || amountNum <= 0) return NextResponse.json({ error: "targetAmount must be positive" }, { status: 400 });

    // Check existing goal
    const existingGoal = await prisma.goal.findFirst({ where: { userId, productId } });

    if (existingGoal) {
      const updatedGoal = await prisma.goal.update({
        where: { id: existingGoal.id },
        data: { targetAmount: amountNum, endDate: targetDate ? new Date(targetDate) : existingGoal.endDate },
      });
      return NextResponse.json({ message: "Goal updated", goal: updatedGoal });
    }

    // Create new goal
    const newGoal = await prisma.goal.create({
      data: {
        userId,
        productId,
        targetAmount: amountNum,
        endDate: targetDate ? new Date(targetDate) : null,
        status: "ACTIVE",
        saved: 0,
        lockedPrice: amountNum,
      },
    });

    return NextResponse.json({ message: "Goal created", goal: newGoal });
  } catch (err) {
    console.error("POST /api/goals error:", err);
    return NextResponse.json({ error: err.message || "Something went wrong" }, { status: 500 });
  }
}
