import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * POST
 * - mode=checkout → create checkout session
 * - no mode       → stripe webhook
 */
export async function POST(request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("mode");

  /* =====================================================
     1️⃣ CREATE STRIPE CHECKOUT SESSION (FRONTEND)
  ===================================================== */
  if (mode === "checkout") {
    try {
      const { goalIds, userId, amount } = await request.json();

      if (!goalIds?.length || !userId || !amount) {
        return NextResponse.json(
          { error: "goalIds, userId, amount required" },
          { status: 400 }
        );
      }

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
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
      console.error("Checkout error:", err);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  /* =====================================================
     2️⃣ STRIPE WEBHOOK
  ===================================================== */
  try {
    const sig = request.headers.get("stripe-signature");

    // 🚨 CRITICAL FIX
    if (!sig) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

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

      await Promise.all(
        goalIdsArray.map(async (goalId) => {
          const goal = await prisma.goal.findUnique({ where: { id: goalId } });
          if (!goal) return;

          const newSaved = Number(goal.saved) + Number(amountPaid);
          const status =
            newSaved >= Number(goal.targetAmount)
              ? "COMPLETED"
              : "ACTIVE";

          await prisma.goal.update({
            where: { id: goalId },
            data: { saved: newSaved, status },
          });
        })
      );

      // Clear cart after payment success
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
