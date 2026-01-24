import prisma from "@/lib/prisma"
import { getAuth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function GET(request) {
  const { userId } = getAuth(request)
  if (!userId) return NextResponse.json({ exists: false })

  const store = await prisma.store.findUnique({
    where: { userId },
    select: { status: true, isActive: true }
  })

  if (store) {
    return NextResponse.json({ exists: true, store })
  }

  return NextResponse.json({ exists: false })
}