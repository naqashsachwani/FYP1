import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { userId } = getAuth(request);
  if (!userId) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const goals = await prisma.goal.findMany({ where: { userId }, include: { product: true } });

  const goalsWithProgress = goals.map(goal => ({
    ...goal,
    progressPercent: goal.targetAmount > 0 ? (Number(goal.saved) / Number(goal.targetAmount)) * 100 : 0,
    remaining: Number(goal.targetAmount) - Number(goal.saved),
  }));

  return NextResponse.json({ goals: goalsWithProgress });
}
