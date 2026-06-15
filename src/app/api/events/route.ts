import { currentUser } from "@/lib/server/auth";
import { subscribe } from "@/lib/server/events";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const u = await currentUser();
  if (!u) return new Response("unauthorized", { status: 401 });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const send = (event: { type: string; [k: string]: unknown }) => {
        try {
          const line = `data: ${JSON.stringify({ ...event, at: Date.now() })}\n\n`;
          controller.enqueue(encoder.encode(line));
        } catch {}
      };
      // Initial hello so the client knows the stream is live.
      send({ type: "hello", userId: u.id });
      const unsubscribe = subscribe(send);
      // Keepalive every 25s.
      const ping = setInterval(() => send({ type: "ping" }), 25000);
      const close = () => {
        clearInterval(ping);
        unsubscribe();
        try {
          controller.close();
        } catch {}
      };
      // @ts-expect-error Node-specific abort hookup
      controller.signal?.addEventListener?.("abort", close);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
