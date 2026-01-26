import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        // 1. Get username from URL
        const { searchParams } = new URL(request.url);
        const username = searchParams.get('username')?.toLowerCase();

        // 2. Validate input
        if (!username) {
            return NextResponse.json({ error: "Missing username" }, { status: 400 });
        }

        // 3. Query Database
        // FIXED: Changed 'Product' to 'products' to match Prisma Schema
        const store = await prisma.store.findUnique({
            where: { username, isActive: true },
            include: {
                products: { 
                    include: { rating: true } 
                }
            }
        });

        // 4. Handle Not Found
        if (!store) {
            return NextResponse.json({ error: "Store not found" }, { status: 404 });
        }

        // 5. Return Data
        return NextResponse.json({ store });

    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" }, 
            { status: 500 }
        );
    }
}