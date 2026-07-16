import { createClient } from "npm:@supabase/supabase-js@2.110.7";

const allowedOrigin = Deno.env.get("ALLOWED_ORIGIN") ?? "";

function corsHeaders(origin: string | null) {
  const permittedOrigin = origin && origin === allowedOrigin ? origin : allowedOrigin;
  return {
    "Access-Control-Allow-Origin": permittedOrigin,
    "Access-Control-Allow-Headers": "content-type, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

Deno.serve(async (request) => {
  const origin = request.headers.get("Origin");
  const headers = corsHeaders(origin);

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  if (request.method !== "POST" || !origin || origin !== allowedOrigin) {
    return Response.json({ error: "Request not allowed" }, { status: 403, headers });
  }

  try {
    const form = await request.formData();
    const guestName = String(form.get("guest_name") ?? "").trim();
    const invitationToken = String(form.get("invitation_token") ?? "");
    const expectedToken = Deno.env.get("INVITATION_TOKEN") ?? "";
    const photo = form.get("photo");

    if (!expectedToken || invitationToken !== expectedToken) {
      return Response.json({ error: "Invalid invitation" }, { status: 401, headers });
    }

    if (!guestName || guestName.length > 120 || !(photo instanceof File)) {
      return Response.json({ error: "Name and photo are required" }, { status: 400, headers });
    }

    if (!photo.type.startsWith("image/") || photo.size > 5 * 1024 * 1024) {
      return Response.json({ error: "Photo must be an image under 5 MB" }, { status: 400, headers });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
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
