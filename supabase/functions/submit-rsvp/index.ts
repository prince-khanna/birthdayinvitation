import { createClient } from "npm:@supabase/supabase-js@2.110.7";

const productionOrigin = "https://prince-khanna.github.io";
const sitesOrigin = "https://anvika-berry-birthday.prince-khanna13.chatgpt.site";
const allowedOrigins = new Set(
  [productionOrigin, sitesOrigin, Deno.env.get("ALLOWED_ORIGIN")].filter(
    (origin): origin is string => Boolean(origin),
  ),
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
    const photo = form.get("photo");

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
