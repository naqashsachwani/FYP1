import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        let products = await prisma.product.findMany({
            // 🔴 REMOVED: where: {inStock: true}, 
            // We want all products, stock status will be handled in UI
            
            include: {
                ratings: {  
                    select: {
                        createdAt: true, 
                        rating: true, 
                        review: true,
                        user: {select: {name: true, image: true}}
                    }
                },
                store: true,
            },
            orderBy: {createdAt: 'desc'}
        })

        // Keep this: Remove products if the STORE itself is inactive
        products = products.filter(product => product.store.isActive)
        return NextResponse.json({products})
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "An internal server error occurred"}, {status: 500});
    }
}