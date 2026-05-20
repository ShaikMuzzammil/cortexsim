import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const experiment = await prisma.experiment.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!experiment) {
      return NextResponse.json(
        { message: "Experiment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(experiment);
  } catch (error) {
    console.error("Get experiment error:", error);
    return NextResponse.json(
      { message: "Failed to fetch experiment" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const experiment = await prisma.experiment.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!experiment) {
      return NextResponse.json(
        { message: "Experiment not found" },
        { status: 404 }
      );
    }

    await prisma.experiment.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Experiment deleted" });
  } catch (error) {
    console.error("Delete experiment error:", error);
    return NextResponse.json(
      { message: "Failed to delete experiment" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, config } = body;

    const experiment = await prisma.experiment.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!experiment) {
      return NextResponse.json(
        { message: "Experiment not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.experiment.update({
      where: { id: params.id },
      data: {
        name: name || experiment.name,
        description: description !== undefined ? description : experiment.description,
        config: config || experiment.config,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update experiment error:", error);
    return NextResponse.json(
      { message: "Failed to update experiment" },
      { status: 500 }
    );
  }
}