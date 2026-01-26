import prisma from "@/lib/prisma"; // Import Prisma client for database operations
import { getAuth } from "@clerk/nextjs/server"; // Import Clerk server-side authentication
import { NextResponse } from "next/server"; // Import Next.js Response helper
import Stripe from "stripe"; // Import Stripe SDK

// Initialize Stripe with your secret key from environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Define POST handler for creating a Stripe checkout session
export async function POST(req, context) {
  // ================== URL BUILDING ==================
  // Detect the base URL dynamically:
  // 1. Use 'origin' header if available (from browser)
  // 2. Fall back to 'host' header + protocol (Vercel always provides host)
  // 3. Default protocol to 'https' if not present
  const protocol = req.headers.get("x-forwarded-proto") || "https"; 
  const host = req.headers.get("host"); 
  const baseUrl = req.headers.get("origin") || `${protocol}://${host}`; 

  // ================== PARAMS & AUTH ==================
  // Next.js 15 requires awaiting params from context
  const { goalId } = await context.params; // Extract goalId from URL params

  // Get authenticated user's ID using Clerk
  const { userId } = getAuth(req); 

  // If user is not logged in, return 401
  if (!userId)
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  // If no goalId is provided in URL, return 400
  if (!goalId)
    return NextResponse.json({ error: "Goal ID missing" }, { status: 400 });

  // ================== REQUEST BODY VALIDATION ==================
  const { amount } = await req.json(); // Extract amount from request body
  const numericAmount = Number(amount); // Convert to number

  // Validate amount: must be positive number
  if (!numericAmount || numericAmount <= 0)
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });

  // ================== FETCH GOAL ==================
  // Fetch the goal from database including related product details
  const goal = await prisma.goal.findUnique({
    where: { id: goalId },
    include: { product: true }, // Include associated product if exists
  });

  // If goal does not exist, return 404
  if (!goal)
    return NextResponse.json({ error: "Goal not found" }, { status: 404 });

  // ================== CREATE STRIPE CHECKOUT ==================
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"], // Accept only card payments
      mode: "payment", // One-time payment
      line_items: [
        {
          price_data: {
            currency: "pkr", // Currency in Pakistani Rupees
            product_data: {
              name: goal.product?.name || "Savings Goal Deposit", // Use product name if available
            },
            unit_amount: Math.round(numericAmount * 100), // Stripe expects amount in smallest currency unit (e.g., cents)
          },
          quantity: 1, // Single unit
        },
      ],
      // Success & Cancel URLs
      success_url: `${baseUrl}/goals/${goalId}?payment=success&amount=${numericAmount}`, // Redirect on success
      cancel_url: `${baseUrl}/goals/${goalId}?payment=cancel`, // Redirect on cancel
    });

    // Return the Stripe checkout URL to the client
    return NextResponse.json({ checkoutUrl: session.url });
  } catch (err) {
    // Log Stripe errors for debugging
    console.error("Stripe error:", err);

    // Return 500 if Stripe checkout creation fails
    return NextResponse.json({ error: "Stripe checkout failed" }, { status: 500 });
  }
}
