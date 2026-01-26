import prisma from "@/lib/prisma"; // Import the Prisma client to interact with your database
import { getAuth } from "@clerk/nextjs/server"; // Import Clerk server-side auth helper
import { NextResponse } from "next/server"; // Next.js Response helper for API routes

// ===========================
// POST: Add a new address
// ===========================
export async function POST(request) {
    try {
        // Get authenticated user ID from the request
        const { userId } = getAuth(request);

        // Parse request body to get address data
        const { address } = await request.json();

        // Attach the authenticated user's ID to the address
        address.userId = userId;

        // Create a new address record in the database
        const newAddress = await prisma.address.create({
            data: address
        });

        // Return success response with the created address
        return NextResponse.json({
            newAddress,
            message: 'Address added successfully'
        });
    } catch (error) {
        // Log the error on the server
        console.error(error);

        // Return error response with status 400
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

// ===========================
// GET: Fetch all addresses for the authenticated user
// ===========================
export async function GET(request) {
    try {
        // Get authenticated user ID from the request
        const { userId } = getAuth(request);

        // Fetch all addresses from the database that belong to this user
        const addresses = await prisma.address.findMany({
            where: { userId }
        });

        // Return success response with addresses
        return NextResponse.json({ addresses });
    } catch (error) {
        // Log the error on the server
        console.error(error);

        // Return error response with status 400
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
