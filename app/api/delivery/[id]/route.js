import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  const { id } = await params;

  try {
    const delivery = await prisma.delivery.findUnique({
      where: { id: id },
      include: {
        deliveryTrackings: { orderBy: { recordedAt: 'desc' } },
        goal: { include: { product: { include: { store: true } } } }
      }
    });

    if (!delivery) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const sanitized = JSON.parse(JSON.stringify(delivery, (key, value) => 
      (typeof value === 'object' && value !== null && value.s) ? Number(value) : value
    ));

    return NextResponse.json(sanitized);
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

// POST: Handle Status Updates
export async function POST(request, { params }) {
  const { id } = await params;
  
  try {
    const body = await request.json();
    const { status, latitude, longitude, location } = body;

    // 1. If this is a Driver/GPS Update (Has Coordinates)
    if (latitude && longitude) {
      const newTracking = await prisma.deliveryTracking.create({
        data: {
          deliveryId: id,
          latitude,
          longitude,
          location: location || 'En Route',
          status: status || 'IN_TRANSIT',
        }
      });
      
      // Update parent status too
      await prisma.delivery.update({
        where: { id: id },
        data: { status: status || 'IN_TRANSIT' }
      });

      // Sanitize BigInt
      const sanitizedTracking = JSON.parse(JSON.stringify(newTracking, (key, value) => 
         (typeof value === 'object' && value !== null && value.s) ? Number(value) : value
      ));

      return NextResponse.json({ success: true, data: sanitizedTracking });
    }

    // 2. If this is a Dashboard Manual Update (No Coordinates)
    if (status) {
       const dataToUpdate = { status };
       
       // If marking as DELIVERED, set the delivery timestamp
       if (status === 'DELIVERED') {
         dataToUpdate.deliveryDate = new Date();
       }

       const updatedDelivery = await prisma.delivery.update({
        where: { id: id },
        data: dataToUpdate
      });
      
      return NextResponse.json({ success: true, data: updatedDelivery });
    }

    // If neither, return error
    return NextResponse.json({ error: "Invalid Action: Missing status or coordinates" }, { status: 400 });

  } catch (error) {
    console.error("Update Error:", error);
    return NextResponse.json({ error: "Update Failed" }, { status: 500 });
  }
}