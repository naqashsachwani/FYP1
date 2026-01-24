import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req, { params }) {
  const { goalId } = await params;
  const { userId } = getAuth(req);

  if (!userId) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const { amount } = await req.json();
  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  // 1. Fetch goal to validate
  const goal = await prisma.goal.findUnique({
    where: { id: goalId },
  });

  if (!goal) {
    return NextResponse.json({ error: "Goal not found" }, { status: 404 });
  }

  if (goal.status === "COMPLETED") {
    return NextResponse.json(
      { error: "Goal already completed. Deposits are locked." },
      { status: 400 }
    );
  }

  try {
    // 2. Perform all DB writes in a Single Transaction
    const result = await prisma.$transaction(async (tx) => {
      
      // A. Create DEPOSIT Record
      const newDeposit = await tx.deposit.create({
        data: {
          goalId,
          userId,
          amount,
          paymentMethod: "STRIPE",
          status: "COMPLETED",
          receiptNumber: crypto.randomUUID(),
        },
      });

      // B. Create TRANSACTION Record (Added this)
      await tx.transaction.create({
        data: {
          userId,
          goalId,
          amount,
          currency: "PKR",
          provider: "STRIPE",
          status: "COMPLETED", 
          providerPaymentId: newDeposit.receiptNumber, // Link via receipt
          metadata: {
            type: "GOAL_DEPOSIT",
            source: "STRIPE_CHECKOUT"
          }
        },
      });

      // C. Recalculate total saved
      const totalSaved = await tx.deposit.aggregate({
        _sum: { amount: true },
        where: { goalId },
      });
      const totalSavedAmount = totalSaved._sum.amount || 0;

      // D. Check for Completion
      const newStatus = totalSavedAmount >= Number(goal.targetAmount) ? "COMPLETED" : "ACTIVE";

      // E. Update Goal Status
      const updatedGoal = await tx.goal.update({
        where: { id: goalId },
        data: {
          saved: totalSavedAmount,
          status: newStatus,
          endDate: newStatus === "COMPLETED" ? new Date() : null,
        },
        include: { deposits: true, product: true },
      });

      // F. Send Notification if Complete
      if (newStatus === "COMPLETED") {
        await tx.notification.create({
          data: {
            userId,
            goalId,
            type: "GOAL_COMPLETE",
            title: "Goal Completed 🎉",
            message: "Congratulations! Your savings goal is now complete.",
          },
        });
      }

      return updatedGoal;
    });

    // 3. Helper to normalize Decimal types for JSON response
    const normalize = (obj) => JSON.parse(JSON.stringify(obj, (key, value) => 
      (typeof value === 'object' && value !== null && value.type === 'Decimal') 
      ? Number(value) 
      : value
    ));

    // 4. Prepare Response Data
    const normalizedGoal = {
      ...normalize(result),
      progressPercent:
        Number(result.targetAmount) > 0
          ? (Number(result.saved) / Number(result.targetAmount)) * 100
          : 0,
    };

    return NextResponse.json({
      success: true,
      goalCompleted: result.status === "COMPLETED",
      goal: normalizedGoal,
    });

  } catch (error) {
    console.error("Confirm Error:", error);
    return NextResponse.json({ error: "Failed to process deposit" }, { status: 500 });
  }
}