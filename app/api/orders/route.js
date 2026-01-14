import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { PaymentMethod } from "@prisma/client";
import Stripe from "stripe";

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    const { addressId, items, couponCode, paymentMethod, goalId, depositAmount } = await request.json();

    // Allow checkout if items exist OR a deposit amount exists
    if ((!items || items.length === 0) && (!depositAmount || depositAmount <= 0)) {
      return NextResponse.json({ error: "Cart is empty and no deposit amount set" }, { status: 400 });
    }

    // Handle coupon
    let coupon = null;
    if (couponCode) {
      coupon = await prisma.coupon.findFirst({ where: { code: couponCode } });
    }

    // Group items by store
    const orderByStore = new Map();
    if (items && Array.isArray(items)) {
      for (const item of items) {
        const product = await prisma.product.findUnique({ where: { id: item.id } });
        if (!product) continue;
        const storeId = product.storeId;
        if (!orderByStore.has(storeId)) orderByStore.set(storeId, []);
        orderByStore.get(storeId).push({ ...item, price: product.price });
      }
    }

    let orderIds = [];
    let fullAmount = 0;
    if (depositAmount) fullAmount += Number(depositAmount);

    // Create Orders in DB
    for (const [storeId, sellerItems] of orderByStore.entries()) {
      let total = sellerItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
      if (coupon) total -= (total * coupon.discount) / 100;
      fullAmount += parseFloat(total.toFixed(2));

      const orderData = {
        userId,
        storeId,
        total: parseFloat(total.toFixed(2)),
        paymentMethod,
        isCouponUsed: !!coupon,
        coupon: coupon ? coupon : {},
        orderItems: {
          create: sellerItems.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      };
      if (addressId) orderData.addressId = addressId;

      const order = await prisma.order.create({ data: orderData });
      orderIds.push(order.id);
    }

    // ✅ STRIPE HANDLER
    if (paymentMethod === "STRIPE") {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      const origin = request.headers.get("origin");

      const line_items = [];

      // 1. Add Items
      if (items) {
        for (const [storeId, sellerItems] of orderByStore.entries()) {
             sellerItems.forEach(item => {
                 line_items.push({
                    price_data: {
                      currency: "pkr", // ✅ PKR Currency
                      product_data: { name: item.name },
                      unit_amount: Math.round(item.price * 100),
                    },
                    quantity: item.quantity,
                 });
             });
        }
      }

      // 2. Add Deposit
      if (depositAmount > 0) {
        line_items.push({
          price_data: {
            currency: "pkr", // ✅ PKR Currency
            product_data: { name: "Savings Goal Deposit" },
            unit_amount: Math.round(depositAmount * 100),
          },
          quantity: 1,
        });
      }

      try {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items,
          expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
          mode: "payment",
          // ✅ FIX: Redirect to Cart Page on Success
          success_url: `${origin}/cart?payment=success`, 
          cancel_url: `${origin}/cart?payment=cancelled`,
          metadata: {
            orderIds: orderIds.join(","),
            userId,
            goalId: goalId || "",
            depositAmount: depositAmount || 0,
            appId: "dreamsaver",
          },
        });

        return NextResponse.json({ session });
      } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
      }
    }

    // Clear cart if not Stripe (e.g. COD)
    await prisma.user.update({
      where: { id: userId },
      data: { cart: {} },
    });

    return NextResponse.json({ message: "Orders placed successfully" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}