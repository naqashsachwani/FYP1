import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { PaymentMethod } from "@prisma/client";
import Stripe from "stripe";

export async function POST(request) {
  try {
    const { userId, has } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    const { addressId, items, couponCode, paymentMethod } = await request.json();

    // Check for missing order details
    if (!addressId || !paymentMethod || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Missing order details" }, { status: 400 });
    }

    // Handle coupon logic
    let coupon = null;
    if (couponCode) {
      coupon = await prisma.coupon.findFirst({
        where: { code: couponCode },
      });

      if (!coupon) {
        return NextResponse.json({ error: "Invalid or expired coupon" }, { status: 400 });
      }
    }

    // Check coupon for new users
    if (couponCode && coupon.forNewUser) {
      const userOrders = await prisma.order.findMany({ where: { userId } });
      if (userOrders.length > 0) {
        return NextResponse.json({ error: "Coupon valid for new users only" }, { status: 400 });
      }
    }

    // Check if user is Plus member
    const isPlusMember = has({ plan: "plus" });

    // Check coupon for Plus members
    if (couponCode && coupon.forMember && !isPlusMember) {
      return NextResponse.json({ error: "Coupon valid for members only" }, { status: 400 });
    }

    // Group products by storeId
    const orderByStore = new Map();

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.id } });
      if (!product) continue;

      const storeId = product.storeId;
      if (!orderByStore.has(storeId)) {
        orderByStore.set(storeId, []);
      }
      orderByStore.get(storeId).push({ ...item, price: product.price });
    }

    let orderIds = [];
    let fullAmount = 0;
    let isShippingFeeAdded = false;

    // Create order per store
    for (const [storeId, sellerItems] of orderByStore.entries()) {
      let total = sellerItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

      if (couponCode) {
        total -= (total * coupon.discount) / 100;
      }

      if (!isPlusMember && !isShippingFeeAdded) {
        total += 250; // add shipping once
        isShippingFeeAdded = true;
      }

      fullAmount += parseFloat(total.toFixed(2));

      const order = await prisma.order.create({
        data: {
          userId,
          storeId,
          addressId,
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
        },
      });

      orderIds.push(order.id);
    }

    // ✅ Handle Stripe Payments
    if (paymentMethod === "STRIPE") {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      const origin = request.headers.get("origin");

      try {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: "Order",
                },
                unit_amount: Math.round(fullAmount * 100), // amount in cents
              },
              quantity: 1,
            },
          ],
          expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 mins
          mode: "payment",
          success_url: `${origin}/loading?nextUrl=orders`,
          cancel_url: `${origin}/cart`,
          metadata: {
            orderIds: orderIds.join(","),
            userId,
            appId: "dreamsaver",
          },
        });

        return NextResponse.json({ session });
      } catch (err) {
        console.error("Stripe error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: { cart: {} },
    });

    return NextResponse.json({ message: "Orders placed successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.code || error.message }, { status: 400 });
  }
}

// ==========================
// ✅ GET METHOD - Fetch User Orders
// ==========================
export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: {
        userId,
        OR: [
          { paymentMethod: PaymentMethod.COD },
          { AND: [{ paymentMethod: PaymentMethod.STRIPE }, { isPaid: true }] },
        ],
      },
      include: {
        orderItems: { include: { product: true } },
        address: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
