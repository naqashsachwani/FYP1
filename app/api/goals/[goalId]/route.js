import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import crypto from "crypto";

/* ===================== GET GOAL ===================== */
export async function GET(req, context) {
  const { goalId } = await context.params; // 🔑 App Router: await params
  const { userId } = getAuth(req);

  if (!userId) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  if (!goalId) return NextResponse.json({ error: "Goal ID missing" }, { status: 400 });

  const goal = await prisma.goal.findUnique({
    where: { id: goalId },
    include: { deposits: true, product: true },
  });

  if (!goal) return NextResponse.json({ error: "Goal not found" }, { status: 404 });

  const progressPercent = goal.targetAmount > 0 ? (Number(goal.saved) / Number(goal.targetAmount)) * 100 : 0;

  return NextResponse.json({ goal: { ...goal, progressPercent } });
}

/* ===================== ADD DEPOSIT ===================== */
export async function POST(req, context) {
  const { goalId } = await context.params; // 🔑 App Router
  const { userId } = getAuth(req);

  if (!userId) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  if (!goalId) return NextResponse.json({ error: "Goal ID missing" }, { status: 400 });

  const body = await req.json();
  const amount = Number(body.amount);

  if (!amount || amount <= 0) return NextResponse.json({ error: "Invalid amount" }, { status: 400 });

  // Fetch goal including deposits
  const goal = await prisma.goal.findUnique({
    where: { id: goalId },
    include: { deposits: true },
  });

  if (!goal) return NextResponse.json({ error: "Goal not found" }, { status: 404 });

  // Block if goal completed
  if (goal.status === "COMPLETED") {
    return NextResponse.json(
      { error: "Goal already completed. Deposits are locked." },
      { status: 400 }
    );
  }

  // ✅ Save deposit
  const deposit = await prisma.deposit.create({
    data: {
      goalId,
      userId,
      amount,
      paymentMethod: body.paymentMethod || "STRIPE",
      status: "COMPLETED",
      receiptNumber: crypto.randomUUID(),
    },
  });

  // ✅ Recalculate total saved
  const totalSaved = await prisma.deposit.aggregate({
    _sum: { amount: true },
    where: { goalId },
  });
  const totalSavedAmount = totalSaved._sum.amount || 0;

  // ✅ Auto-complete goal
  const newStatus = totalSavedAmount >= Number(goal.targetAmount) ? "COMPLETED" : goal.status;

  // ✅ Update goal with deposits
  const updatedGoal = await prisma.goal.update({
    where: { id: goalId },
    data: {
      saved: totalSavedAmount,
      status: newStatus,
      endDate: newStatus === "COMPLETED" ? new Date() : null,
    },
    include: { deposits: true, product: true },
  });

  // ✅ Create notification if completed
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
    goal: updatedGoal,
    deposit,
  });
}
