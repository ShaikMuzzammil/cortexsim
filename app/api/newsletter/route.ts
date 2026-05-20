import { NextResponse } from "next/server";
import { sendNewsletterEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/utils";
import { z } from "zod";

const emailSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  try {
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";

    if (!checkRateLimit(ip, 5, 3600000)) {
      return NextResponse.json(
        { message: "Too many requests" },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = emailSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid email" },
        { status: 400 }
      );
    }

    await sendNewsletterEmail(parsed.data.email);

    return NextResponse.json(
      { message: "Subscribed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Newsletter error:", error);
    return NextResponse.json(
      { message: "Failed to subscribe" },
      { status: 500 }
    );
  }
}