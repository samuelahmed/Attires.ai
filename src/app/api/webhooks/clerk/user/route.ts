import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { Webhook, WebhookRequiredHeaders } from "svix";
import { IncomingHttpHeaders } from "http";
import prismadb from "@/lib/prismadb";

/*
    This hook will create a db entry for User on account creation
    Info comes from clerk and is passed to planetscale db
    Test locally with ngrok
    Issue: creates two rows per user - one at creation and a second at first login. The first 
    one seems to have the proper userID, whereas duplicate is unused after its creation.
*/

const webhookSecret = process.env.WEBHOOK_SECRET || "";

async function handler(request: Request) {

  const payload = await request.json();
  const headersList = headers();
  const heads = {
    "svix-id": headersList.get("svix-id"),
    "svix-timestamp": headersList.get("svix-timestamp"),
    "svix-signature": headersList.get("svix-signature"),
  };
  const wh = new Webhook(webhookSecret);
  let evt: Event | null = null;

  try {
    evt = wh.verify(
      JSON.stringify(payload),
      heads as IncomingHttpHeaders & WebhookRequiredHeaders
    ) as Event;
  } catch (err) {
    console.error((err as Error).message);
    return NextResponse.json({}, { status: 400 });
  }

  const eventType: EventType = evt.type;
  if (eventType === "user.created") {
    const { id, ...attributes } = evt.data;
    await prismadb.user.upsert({
      where: { externalId: id as string },
      create: {
        externalId: id as string,
        attributes,
      },
      update: { attributes },
    });
  }
  return new NextResponse("success");
}

type EventType = "user.created";

type Event = {
  data: Record<string, string | number>;
  object: "event";
  type: EventType;
};

export const GET = handler;
export const POST = handler;
export const PUT = handler;
