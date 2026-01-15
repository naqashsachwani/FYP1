import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req, context) {
  // ✅ FIX: ROBUST URL DETECTION
  // 1. Try 'origin' first.
  // 2. Fallback to 'host' header (Vercel always provides this).
  // 3. Default to HTTPS.
  const protocol = req.headers.get("x-forwarded-proto") || "https";
  const host = req.headers.get("host");
  const baseUrl = req.headers.get("origin") || `${protocol}://${host}`;

  // ✅ Next.js 15: Await params
  const { goalId } = await context.params;
  
  const { userId } = getAuth(req);

  if (!userId)
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  if (!goalId)
    return NextResponse.json({ error: "Goal ID missing" }, { status: 400 });

  const { amount } = await req.json();
  const numericAmount = Number(amount);

  if (!numericAmount || numericAmount <= 0)
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });

  const goal = await prisma.goal.findUnique({
    where: { id: goalId },
    include: { product: true },
  });

  if (!goal)
    return NextResponse.json({ error: "Goal not found" }, { status: 404 });

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "pkr", 
            product_data: {
              name: goal.product?.name || "Savings Goal Deposit",
            },
            unit_amount: Math.round(numericAmount * 100),
          },
          quantity: 1,
        },
      ],
      // ✅ USE THE ROBUST 'baseUrl' VARIABLE
      success_url: `${baseUrl}/goals/${goalId}?payment=success&amount=${numericAmount}`,
      cancel_url: `${baseUrl}/goals/${goalId}?payment=cancel`,
    });

    return NextResponse.json({ checkoutUrl: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    return NextResponse.json({ error: "Stripe checkout failed" }, { status: 500 });
  }
}