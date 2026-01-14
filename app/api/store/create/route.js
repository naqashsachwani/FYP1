import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

export async function POST(req, { params }) {
  const { userId } = getAuth(req);
  const goalId = params.goalId;

  if (!userId)
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const { amount, stripePaymentId } = await req.json();
  const depositAmount = Number(amount);

  if (!depositAmount || depositAmount <= 0)
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });

  const goal = await prisma.goal.findUnique({
    where: { id: goalId },
    include: { product: true },
  });

  if (!goal)
    return NextResponse.json({ error: "Goal not found" }, { status: 404 });

  if (goal.status !== "ACTIVE")
    return NextResponse.json({ error: "Goal not active" }, { status: 400 });

  /* ================= TRANSACTION ================= */
  const transaction = await prisma.transaction.create({
    data: {
      userId,
      goalId,
      amount: depositAmount,
      provider: "stripe",
      providerPaymentId: stripePaymentId,
      status: "COMPLETED",
    },
  });

  /* ================= DEPOSIT ================= */
  await prisma.deposit.create({
    data: {
      goalId,
      productId: goal.productId,
      userId,
      amount: depositAmount,
      paymentMethod: "STRIPE",
      status: "COMPLETED",
      receiptNumber: randomUUID(),
      stripePaymentId,
    },
  });

  /* ================= UPDATE GOAL ================= */
  const newSaved = Number(goal.saved) + depositAmount;

  const updatedGoal = await prisma.goal.update({
    where: { id: goalId },
    data: {
      saved: newSaved,
      status:
        newSaved >= Number(goal.targetAmount)
          ? "COMPLETED"
          : "ACTIVE",
    },
  });

  /* ================= INVOICE ================= */
  await prisma.invoice.create({
    data: {
      invoiceNumber: `INV-${Date.now()}`,
      userId,
      goalId,
      amount: depositAmount,
      status: "PAID",
      paidAt: new Date(),
    },
  });

  /* ================= NOTIFICATION ================= */
  await prisma.notification.create({
    data: {
      userId,
      goalId,
      type: "PAYMENT_CONFIRMATION",
      title: "Deposit Successful",
      message: `Your deposit of ${depositAmount} has been added.`,
    },
  });

  return NextResponse.json({ success: true });
}
