import authSeller from "@/middlewares/authSeller"; // Middleware to verify if the user is a seller
import { getAuth } from "@clerk/nextjs/server"; // Clerk function to get authenticated user info
import { NextResponse } from "next/server"; // Next.js response helper
import prisma from "@/lib/prisma"; // Prisma client for database access

// GET API route to fetch seller dashboard data
export async function GET(request) {
    try {
        // Get the authenticated user's ID from the request
        const { userId } = getAuth(request);

        // Verify the user is a seller and get their store ID
        const storeId = await authSeller(userId);

        // Fetch all orders associated with the seller's store
        const orders = await prisma.order.findMany({
            where: { storeId }
        });

        // Fetch all products associated with the seller's store
        const products = await prisma.product.findMany({
            where: { storeId }
        });

        // Fetch all ratings for the seller's products, including related user and product info
        const ratings = await prisma.rating.findMany({
            where: { productId: { in: products.map(product => product.id) } },
            include: { user: true, product: true } // Include full user and product details for each rating
        });

        // Prepare the dashboard data
        const dashboardData = {
            ratings, // Array of all ratings for seller's products
            totalOrders: orders.length, // Total number of orders for the seller
            totalEarnings: Math.round(orders.reduce((acc, order) => acc + order.total, 0)), // Sum of all order totals, rounded
            totalProducts: products.length // Total number of products the seller has
        };

        // Return the dashboard data as a JSON response
        return NextResponse.json({ dashboardData });

    } catch (error) {
        // Log the error for debugging
        console.error(error);

        // Return a JSON response with the error message and 400 status code
        return NextResponse.json(
            { error: error.code || error.message }, 
            { status: 400 }
        );
    }
}
