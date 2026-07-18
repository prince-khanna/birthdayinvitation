import { createClient } from "npm:@supabase/supabase-js@2.110.7";

const productionOrigin = "https://prince-khanna.github.io";
const allowedOrigins = new Set(
  [productionOrigin, Deno.env.get("ALLOWED_ORIGIN")].filter(
    (origin): origin is string => Boolean(origin),
  ),
);
const expectedTokenHashes = new Set(
  [
    Deno.env.get("INVITATION_TOKEN_SHA256"),
    "f4678f6876d9f5568f23bc31795116bccfdaf922ab7c670bac13f13010bbe085",
    "58fd208614a6e9ad4a44841dc233b977a461efb5bac2f781a0b581d6297199c5",
  ].filter((hash): hash is string => Boolean(hash)),
);
const allowedPhotoTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

function corsHeaders(origin: string | null) {
  const permittedOrigin =
    origin && allowedOrigins.has(origin) ? origin : productionOrigin;
  return {
    "Access-Control-Allow-Origin": permittedOrigin,
    "Access-Control-Allow-Headers": "content-type, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
}

function timingSafeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return mismatch === 0;
}

function getSupabaseSecretKey() {
  const configuredKeys = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (configuredKeys) {
    const defaultKey = JSON.parse(configuredKeys)?.default;
    if (typeof defaultKey === "string" && defaultKey) return defaultKey;
  }

  const legacyKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!legacyKey) throw new Error("Supabase secret key is unavailable");
  return legacyKey;
}

Deno.serve(async (request) => {
  const origin = request.headers.get("Origin");
  const headers = corsHeaders(origin);

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  if (request.method !== "POST" || !origin || !allowedOrigins.has(origin)) {
    return Response.json({ error: "Request not allowed" }, { status: 403, headers });
  }

  try {
    const form = await request.formData();
    const guestName = String(form.get("guest_name") ?? "").trim();
    const invitationToken = String(form.get("invitation_token") ?? "");
    const photo = form.get("photo");
    const suppliedTokenHash = await sha256(invitationToken);

    const validInvitation = Array.from(expectedTokenHashes).some((expectedHash) =>
      timingSafeEqual(suppliedTokenHash, expectedHash)
    );
    if (!validInvitation) {
      return Response.json({ error: "Invalid invitation" }, { status: 401, headers });
    }

    if (!guestName || guestName.length > 120 || !(photo instanceof File)) {
      return Response.json({ error: "Name and photo are required" }, { status: 400, headers });
    }

    if (!allowedPhotoTypes.has(photo.type) || photo.size > 5 * 1024 * 1024) {
      return Response.json({ error: "Photo must be an image under 5 MB" }, { status: 400, headers });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      getSupabaseSecretKey(),
      { auth: { persistSession: false, autoRefreshToken: false } },
    );

    const extension = photo.type === "image/png" ? "png" : photo.type === "image/webp" ? "webp" : "jpg";
    const path = `${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from("rsvp-selfies")
      .upload(path, photo, { contentType: photo.type, upsert: false });

    if (uploadError) throw uploadError;

    const { error: insertError } = await supabase
      .from("rsvps")
      .insert({ guest_name: guestName, photo_path: path });

    if (insertError) {
      await supabase.storage.from("rsvp-selfies").remove([path]);
      throw insertError;
    }

    return Response.json({ ok: true }, { status: 201, headers });
  } catch (error) {
    console.error("submit-rsvp failed", error);
    return Response.json({ error: "Unable to save RSVP" }, { status: 500, headers });
  }
});
