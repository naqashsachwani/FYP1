import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req, { params }) {
  const { goalId } = params;
  const { userId } = getAuth(req);

  if (!userId)
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const { amount } = await req.json();
  if (!amount || amount <= 0)
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });

  // Fetch goal including deposits
  const goal = await prisma.goal.findUnique({
    where: { id: goalId },
    include: { deposits: true },
  });

  if (!goal)
    return NextResponse.json({ error: "Goal not found" }, { status: 404 });

  // Block if goal completed
  if (goal.status === "COMPLETED") {
    return NextResponse.json(
      { error: "Goal already completed. Deposits are locked." },
      { status: 400 }
    );
  }

  // Save deposit
  const deposit = await prisma.deposit.create({
    data: {
      goalId,
      userId,
      amount,
      paymentMethod: "STRIPE",
      status: "COMPLETED",
      receiptNumber: crypto.randomUUID(),
    },
  });

  // Recalculate total saved
  const totalSaved = await prisma.deposit.aggregate({
    _sum: { amount: true },
    where: { goalId },
  });
  const totalSavedAmount = totalSaved._sum.amount || 0;

  // Auto-complete goal if target reached
  const newStatus = totalSavedAmount >= Number(goal.targetAmount) ? "COMPLETED" : "ACTIVE";

  // Update goal
  const updatedGoal = await prisma.goal.update({
    where: { id: goalId },
    data: {
      saved: totalSavedAmount,
      status: newStatus,
      endDate: newStatus === "COMPLETED" ? new Date() : null,
    },
    include: { deposits: true },
  });

  // Normalize deposits and calculate progressPercent for frontend
  const normalizedGoal = {
    ...updatedGoal,
    saved: Number(updatedGoal.saved),
    targetAmount: Number(updatedGoal.targetAmount),
    progressPercent:
      updatedGoal.targetAmount > 0
        ? (Number(updatedGoal.saved) / Number(updatedGoal.targetAmount)) * 100
        : 0,
    deposits: updatedGoal.deposits.map(d => ({ ...d, amount: Number(d.amount) })),
  };

  // Create notification if goal completed
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
    goal: normalizedGoal,
  });
}
