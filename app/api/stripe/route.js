import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("mode");

  /* =====================================================
     1️⃣ CHECKOUT SESSION CREATION
  ===================================================== */
  if (mode === "checkout") {
    try {
      // ✅ FIX: ROBUST URL DETECTION
      const protocol = request.headers.get("x-forwarded-proto") || "https";
      const host = request.headers.get("host");
      const baseUrl = request.headers.get("origin") || `${protocol}://${host}`;

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
              currency: "pkr", 
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
        // ✅ USE 'baseUrl' HERE
        success_url: `${baseUrl}/cart`,
        cancel_url: `${baseUrl}/goals?cancel=1`,
      });

      return NextResponse.json({ checkoutUrl: session.url });
    } catch (err) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  /* =====================================================
     2️⃣ WEBHOOK HANDLING (Unchanged)
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
      const amountPerGoal = Number(amountPaid) / goalIdsArray.length; 

      await Promise.all(
        goalIdsArray.map(async (goalId) => {
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

          const goal = await prisma.goal.findUnique({ where: { id: goalId } });
          if (!goal) return;

          const totalSavedAgg = await prisma.deposit.aggregate({
             _sum: { amount: true },
             where: { goalId },
          });
          const newSavedTotal = totalSavedAgg._sum.amount || 0;

          const status = newSavedTotal >= Number(goal.targetAmount) ? "COMPLETED" : "ACTIVE";
          
          await prisma.goal.update({
            where: { id: goalId },
            data: { saved: newSavedTotal, status },
          });
        })
      );

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