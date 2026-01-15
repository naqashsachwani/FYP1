// app/api/stripe/route.js

import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("mode");

  /* =====================================================
     1️⃣ CHECKOUT SESSION CREATION
     (This part was fine, just keeping the currency fix)
  ===================================================== */
  if (mode === "checkout") {
    try {
      const { goalIds, userId, amount } = await request.json();

      if (!goalIds?.length || !userId || !amount) {
        return NextResponse.json({ error: "Missing data" }, { status: 400 });
      }

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "pkr", // Ensure this is PKR
              unit_amount: Math.round(Number(amount) * 100),
              product_data: { name: "Goal Deposit" },
            },
            quantity: 1,
          },
        ],
        metadata: {
          appId: "dreamsaver",
          goalIds: goalIds.join(","),
          userId,
          amountPaid: amount,
        },
        success_url: `${process.env.NEXT_PUBLIC_URL}/cart`,
        cancel_url: `${process.env.NEXT_PUBLIC_URL}/goals?cancel=1`,
      });

      return NextResponse.json({ checkoutUrl: session.url });
    } catch (err) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  /* =====================================================
     2️⃣ WEBHOOK HANDLING (CRITICAL FIXES HERE)
  ===================================================== */
  try {
    const sig = request.headers.get("stripe-signature");
    if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 });

    const body = await request.text();
    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const { goalIds, userId, appId, amountPaid } = session.metadata;

      if (appId !== "dreamsaver") return NextResponse.json({ received: true });

      const goalIdsArray = goalIds.split(",");
      const amountPerGoal = Number(amountPaid) / goalIdsArray.length; // Split if multiple goals

      await Promise.all(
        goalIdsArray.map(async (goalId) => {
          
          // 1. FIX: Create the Deposit Record FIRST
          await prisma.deposit.create({
            data: {
              goalId,
              userId,
              amount: amountPerGoal,
              paymentMethod: "STRIPE_CHECKOUT",
              status: "COMPLETED",
              receiptNumber: session.id, 
            },
          });

          // 2. Fetch fresh goal data
          const goal = await prisma.goal.findUnique({ where: { id: goalId } });
          if (!goal) return;

          // 3. Recalculate total directly from Deposit table (safest way)
          const totalSavedAgg = await prisma.deposit.aggregate({
             _sum: { amount: true },
             where: { goalId },
          });
          const newSavedTotal = totalSavedAgg._sum.amount || 0;

          // 4. Update Goal
          const status = newSavedTotal >= Number(goal.targetAmount) ? "COMPLETED" : "ACTIVE";
          
          await prisma.goal.update({
            where: { id: goalId },
            data: { 
              saved: newSavedTotal, 
              status 
            },
          });
        })
      );

      // Clear cart
      await prisma.user.update({
        where: { id: userId },
        data: { cart: {} },
      });
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export const config = {
  api: { bodyParser: false },
};