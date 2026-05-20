import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const experimentSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  config: z.string(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const experiments = await prisma.experiment.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(experiments);
  } catch (error) {
    console.error("Get experiments error:", error);
    return NextResponse.json(
      { message: "Failed to fetch experiments" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = experimentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid experiment data" },
        { status: 400 }
      );
    }

    const experiment = await prisma.experiment.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        config: parsed.data.config,
        userId: session.user.id,
      },
    });

    return NextResponse.json(experiment, { status: 201 });
  } catch (error) {
    console.error("Create experiment error:", error);
    return NextResponse.json(
      { message: "Failed to create experiment" },
      { status: 500 }
    );
  }
}