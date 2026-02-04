import prisma from "@/lib/prisma";                       // Prisma client for DB
import { getAuth } from "@clerk/nextjs/server";         // Clerk server-side auth
import { NextResponse } from "next/server";             // Next.js server response
import crypto from "crypto";                             // For generating unique receipt numbers

// Helper: Normalize Prisma Decimals
const normalize = (obj) => JSON.parse(
  JSON.stringify(obj, (key, value) => 
    (typeof value === 'object' && value !== null && value.type === 'Decimal') 
      ? Number(value) 
      : value
  )
);

/* ===================== GET GOAL DETAILS ===================== */
export async function GET(req, { params }) {
  const { goalId } = await params; 
  const { userId } = getAuth(req);

  if (!userId) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  
  try {
    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
      include: { 
        deposits: { orderBy: { createdAt: 'desc' } }, 
        product: { include: { store: true } }, // Include store details if needed
        // ✅ CRITICAL FIX: Include delivery info so frontend knows it's redeemed
        delivery: true 
      },
    });

    if (!goal) return NextResponse.json({ error: "Goal not found" }, { status: 404 });

    const saved = Number(goal.saved);
    const target = Number(goal.targetAmount);
    const progressPercent = target > 0 ? (saved / target) * 100 : 0;

    return NextResponse.json({ 
      goal: normalize({ ...goal, progressPercent }) 
    });
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

/* ===================== ADD DEPOSIT ===================== */
export async function POST(req, { params }) {
  const { goalId } = await params; 
  const { userId } = getAuth(req);

  if (!userId) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  try {
    const body = await req.json();
    const amount = Number(body.amount);

    // Validate amount
    if (!amount || amount <= 0) return NextResponse.json({ error: "Invalid amount" }, { status: 400 });

    // Fetch goal and its deposits
    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
      include: { deposits: true },
    });

    if (!goal) return NextResponse.json({ error: "Goal not found" }, { status: 404 });

    // Prevent deposits on completed goals
    if (goal.status === "COMPLETED") {
      return NextResponse.json({ error: "Goal already completed." }, { status: 400 });
    }

    // Create new deposit
    const deposit = await prisma.deposit.create({
      data: {
        goalId,
        userId,
        amount,
        paymentMethod: body.paymentMethod || "STRIPE",
        status: "COMPLETED",
        receiptNumber: crypto.randomUUID(), // Unique receipt
      },
    });

    // Recalculate total saved
    const totalSaved = await prisma.deposit.aggregate({
      _sum: { amount: true },
      where: { goalId },
    });
    const totalSavedAmount = totalSaved._sum.amount || 0;

    // Update goal status if completed
    const newStatus = totalSavedAmount >= Number(goal.targetAmount) ? "COMPLETED" : goal.status;

    const updatedGoal = await prisma.goal.update({
      where: { id: goalId },
      data: {
        saved: totalSavedAmount,
        status: newStatus,
        endDate: newStatus === "COMPLETED" ? new Date() : null,
      },
      include: { deposits: true, product: true },
    });

    // Send completion notification if goal finished
    if (newStatus === "COMPLETED") {
      await prisma.notification.create({
        data: {
          userId,
          goalId,
          type: "GOAL_COMPLETE",
          title: "Goal Completed 🎉",
          message: "Congratulations! Your savings goal is now complete.",
        },
      });
    }

    return NextResponse.json({
      success: true,
      goalCompleted: newStatus === "COMPLETED",
      goal: normalize(updatedGoal),
      deposit: normalize(deposit),
    });
  } catch (error) {
    console.error("Deposit Error:", error);
    return NextResponse.json({ error: "Failed to process deposit" }, { status: 500 });
  }
}

/* ===================== DELETE GOAL ===================== */
export async function DELETE(req, { params }) {
  const { goalId } = await params;
  const { userId } = getAuth(req);

  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const goal = await prisma.goal.findUnique({ where: { id: goalId } });

    if (!goal) return NextResponse.json({ error: "Goal not found" }, { status: 404 });

    // Delete goal completely if it is draft or has no funds
    if (goal.status === "SAVED" || Number(goal.saved) === 0) {
      await prisma.$transaction([
        prisma.priceLock.deleteMany({ where: { goalId } }),
        prisma.deposit.deleteMany({ where: { goalId } }),
        prisma.goal.delete({ where: { id: goalId } }),
      ]);
      return NextResponse.json({ message: "Goal deleted successfully" });
    } 
    // If goal has funds, mark it as REFUNDED instead
    else {
      await prisma.goal.update({
        where: { id: goalId },
        data: { status: "REFUNDED" },
      });
      return NextResponse.json({ message: "Goal cancelled. Refund pending." });
    }
  } catch (error) {
    console.error("Delete Goal Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
