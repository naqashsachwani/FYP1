import prisma from "@/lib/prisma";                     // Prisma client for DB operations
import { getAuth } from "@clerk/nextjs/server";       // Server-side authentication
import { NextResponse } from "next/server";           // Response helper
import crypto from "crypto";                           // Generate unique receipt IDs

export async function POST(req, { params }) {
  const { goalId } = await params;                     // Get goalId from route params
  const { userId } = getAuth(req);                    // Get authenticated user

  // Authentication check
  if (!userId) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const { amount } = await req.json();                // Extract deposit amount
  // Validate amount
  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  // 1. Fetch the goal to validate
  const goal = await prisma.goal.findUnique({ where: { id: goalId } });

  if (!goal) {
    return NextResponse.json({ error: "Goal not found" }, { status: 404 });
  }

  // Prevent deposits on completed goals
  if (goal.status === "COMPLETED") {
    return NextResponse.json(
      { error: "Goal already completed. Deposits are locked." },
      { status: 400 }
    );
  }

  try {
    // 2. Perform all writes atomically using a Prisma transaction
    const result = await prisma.$transaction(async (tx) => {
      
      // A. Create deposit record
      const newDeposit = await tx.deposit.create({
        data: {
          goalId,
          userId,
          amount,
          paymentMethod: "STRIPE",
          status: "COMPLETED",
          receiptNumber: crypto.randomUUID(),  // Unique receipt
        },
      });

      // B. Record transaction in transactions table for bookkeeping
      await tx.transaction.create({
        data: {
          userId,
          goalId,
          amount,
          currency: "PKR",
          provider: "STRIPE",
          status: "COMPLETED",
          providerPaymentId: newDeposit.receiptNumber,
          metadata: {
            type: "GOAL_DEPOSIT",
            source: "STRIPE_CHECKOUT",
          },
        },
      });

      // C. Recalculate total saved
      const totalSaved = await tx.deposit.aggregate({
        _sum: { amount: true },
        where: { goalId },
      });
      const totalSavedAmount = totalSaved._sum.amount || 0;

      // D. Determine new goal status
      const newStatus =
        totalSavedAmount >= Number(goal.targetAmount) ? "COMPLETED" : "ACTIVE";

      // Prepare update object safely
      const updateData = {
        saved: totalSavedAmount,
        status: newStatus,
      };
      if (newStatus === "COMPLETED") {
        updateData.endDate = new Date(); // Only set endDate if goal completes
      }

      // E. Update goal record
      const updatedGoal = await tx.goal.update({
        where: { id: goalId },
        data: updateData,
        include: { deposits: true, product: true }, // Include deposits & product for front-end
      });

      // F. Create completion notification if goal finished
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

    // 3. Helper to normalize Prisma Decimal types for JSON
    const normalize = (obj) =>
      JSON.parse(
        JSON.stringify(obj, (key, value) =>
          typeof value === "object" && value !== null && value.type === "Decimal"
            ? Number(value)
            : value
        )
      );

    // 4. Calculate progress %
    const normalizedGoal = {
      ...normalize(result),
      progressPercent:
        Number(result.targetAmount) > 0
          ? (Number(result.saved) / Number(result.targetAmount)) * 100
          : 0,
    };

    // 5. Return success response
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