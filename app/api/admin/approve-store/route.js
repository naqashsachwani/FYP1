import prisma from "@/lib/prisma";
import authAdmin from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// ✅ Approve / Reject Seller (Transactional Update)
export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    const isAdmin = await authAdmin(userId);

    if (!isAdmin) {
      return NextResponse.json({ error: "not-authorized" }, { status: 401 });
    }

    const { storeId, status } = await request.json(); // status = 'approved' or 'rejected'

    await prisma.$transaction(async (tx) => {
        // 1. Update Store Status
        const storeUpdateData = {
            status: status,
            isActive: status === "approved" // Only active if approved
        };
        await tx.store.update({
            where: { id: storeId },
            data: storeUpdateData
        });

        // 2. Update Application Status
        // We look for the application associated with this storeId
        const appStatus = status === "approved" ? "APPROVED" : "REJECTED";
        
        // Note: Prisma updateMany is used here in case of edge cases, but logic dictates one app per store
        await tx.storeApplication.updateMany({
            where: { storeId: storeId },
            data: { 
                status: appStatus,
                reviewedBy: userId,
                reviewedAt: new Date()
            }
        });
    });

    return NextResponse.json({ message: `Store ${status} successfully` });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 }
    );
  }
}

// ✅ Get all pending and rejected stores
export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    const isAdmin = await authAdmin(userId);

    if (!isAdmin) {
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    // Include StoreApplication data if you want to show CNIC/Bank info in the admin panel
    const stores = await prisma.store.findMany({
      where: { status: { in: ["pending", "rejected"] } },
      include: { 
          user: true,
          storeApplication: true // Fetch application details to show Admin
      },
    });

    return NextResponse.json({ stores });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 }
    );
  }
}