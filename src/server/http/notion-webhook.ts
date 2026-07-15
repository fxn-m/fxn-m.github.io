import { HTTPException } from "hono/http-exception";
import { z } from "zod";

const VerificationSchema = z.object({ verification_token: z.string().min(1) });

const EventSchema = z.object({
  data: z
    .object({
      parent: z
        .object({
          data_source_id: z.string().optional(),
          database_id: z.string().optional(),
          id: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
  entity: z.object({ id: z.string().min(1) }),
});

export type NotionWebhook =
  | { kind: "verification"; token: string }
  | { dataSourceId?: string; kind: "event"; pageId: string };

const bytesToHex = (value: ArrayBuffer): string =>
  [...new Uint8Array(value)].map((byte) => byte.toString(16).padStart(2, "0")).join("");

const constantTimeEqual = (left: string, right: string): boolean => {
  if (left.length !== right.length) {
    return false;
  }

  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
};

const verifySignature = async (body: string, signature: string | null, secret: string) => {
  if (!signature?.startsWith("sha256=")) {
    return false;
  }

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { hash: "SHA-256", name: "HMAC" },
    false,
    ["sign"],
  );
  const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return constantTimeEqual(signature, `sha256=${bytesToHex(digest)}`);
};

export const parseNotionWebhook = async (
  request: Request,
  getVerificationSecret: () => string,
): Promise<NotionWebhook> => {
  const rawBody = await request.text();
  let body: unknown;

  try {
    body = JSON.parse(rawBody);
  } catch {
    throw new HTTPException(400, { message: "Invalid webhook payload" });
  }

  const verification = VerificationSchema.safeParse(body);
  if (verification.success) {
    return { kind: "verification", token: verification.data.verification_token };
  }

  if (
    !(await verifySignature(
      rawBody,
      request.headers.get("X-Notion-Signature"),
      getVerificationSecret(),
    ))
  ) {
    throw new HTTPException(401, { message: "Invalid webhook signature" });
  }

  const event = EventSchema.safeParse(body);
  if (!event.success) {
    throw new HTTPException(400, { message: "Invalid webhook payload" });
  }

  const parent = event.data.data?.parent;
  return {
    dataSourceId: parent?.data_source_id ?? parent?.id ?? parent?.database_id,
    kind: "event",
    pageId: event.data.entity.id,
  };
};
