import prisma from "@/lib/prisma"; // Prisma client for DB operations
import authAdmin from "@/middlewares/authAdmin"; // Middleware to verify admin access
import { getAuth } from "@clerk/nextjs/server"; // Clerk server-side auth
import { NextResponse } from "next/server"; // Next.js server response helper

// ================= GET DASHBOARD DATA =================
// Returns total orders, total stores, total products, total revenue, and all orders
export async function GET(request) {
    try {
        // Get authenticated user ID
        const { userId } = getAuth(request);

        // Verify if the user is an admin
        const isAdmin = await authAdmin(userId);
        if (!isAdmin) {
            return NextResponse.json({ error: 'not authorized' }, { status: 401 });
        }

        // ------------------- DATA FETCH -------------------
        // Count total orders
        const orders = await prisma.order.count();

        // Count total stores
        const stores = await prisma.store.count();

        // Fetch all orders (only createdAt & total) to calculate revenue
        const allOrders = await prisma.order.findMany({
            select: {
                createdAt: true,
                total: true,
            }
        });

        // Calculate total revenue by summing order totals
        let totalRevenue = 0;
        allOrders.forEach(order => {
            totalRevenue += order.total;
        });
        const revenue = totalRevenue.toFixed(2); // Convert to string with 2 decimals

        // Count total products
        const products = await prisma.product.count();

        // Construct dashboard data object
        const dashboardData = {
            orders,
            stores,
            products,
            revenue,
            allOrders, // Include orders for analytics or charts
        };

        // Return the data as JSON
        return NextResponse.json({ dashboardData });

    } catch (error) {
        console.error(error); // Log error for debugging
        return NextResponse.json(
            { error: error.code || error.message }, 
            { status: 400 }
        );
    }
}
