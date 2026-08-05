import { createClient } from "npm:@supabase/supabase-js@2.110.7";

const productionOrigin = "https://prince-khanna.github.io";
const sitesOrigin = "https://anvika-berry-birthday.prince-khanna13.chatgpt.site";
const localOrigin = "http://localhost:4173";
const localPreviewOrigin = "http://localhost:4174";
const allowedOrigins = new Set(
  [
    productionOrigin,
    sitesOrigin,
    localOrigin,
    localPreviewOrigin,
    Deno.env.get("ALLOWED_ORIGIN"),
  ].filter(
    (origin): origin is string => Boolean(origin),
  ),
);
const validTeamSlugs = new Set([
  "baby-olympics",
  "precious-balloon",
  "animal-madness",
  "copy-anvika",
  "terrible-karaoke",
  "baby-charades",
  "dont-laugh",
  "baby-brain-test",
  "freeze-dance",
  "anvika-says",
]);

function corsHeaders(origin: string | null) {
  const permittedOrigin =
    origin && allowedOrigins.has(origin) ? origin : productionOrigin;
  return {
    "Access-Control-Allow-Origin": permittedOrigin,
    "Access-Control-Allow-Headers": "accept, content-type, x-client-info",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Cache-Control": "no-store, max-age=0",
    "Content-Type": "application/json",
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

  if (
    !["GET", "POST"].includes(request.method) ||
    !origin ||
    !allowedOrigins.has(origin)
  ) {
    return Response.json({ error: "Request not allowed" }, { status: 403, headers });
  }

  try {
    const url = new URL(request.url);
    const body = request.method === "POST" ? await request.json() : null;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      getSupabaseSecretKey(),
      { auth: { persistSession: false, autoRefreshToken: false } },
    );

    const { data: gameSettings, error: settingsError } = await supabase
      .from("birthday_game_settings")
      .select("enabled")
      .eq("id", "birthday_game")
      .maybeSingle();

    if (settingsError) throw settingsError;
    const gameEnabled = Boolean(gameSettings?.enabled);

    if (request.method === "GET" && url.searchParams.get("scope") === "game") {
      return Response.json({ enabled: gameEnabled }, { status: 200, headers });
    }

    const team = String(body?.team ?? url.searchParams.get("team") ?? "").trim();

    if (!validTeamSlugs.has(team)) {
      return Response.json({ error: "Unknown team" }, { status: 400, headers });
    }

    const { data, error } = await supabase
      .from("game_team_approvals")
      .select("approved, riddle_intro, riddle_clues, riddle_question, riddle_answer")
      .eq("team_slug", team)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return Response.json({ error: "Unknown team" }, { status: 404, headers });
    }
    if (!data.approved) {
      return Response.json(
        { gameEnabled, approved: false },
        { status: 200, headers },
      );
    }

    if (request.method === "POST") {
      const answer = String(body?.answer ?? "").trim().toLocaleLowerCase();
      if (!answer || answer.length > 120) {
        return Response.json({ error: "Answer is required" }, { status: 400, headers });
      }
      return Response.json(
        {
          gameEnabled,
          approved: true,
          correct: answer === data.riddle_answer.toLocaleLowerCase(),
        },
        { status: 200, headers },
      );
    }

    if (url.searchParams.get("reveal") !== "1") {
      return Response.json(
        { gameEnabled, approved: true },
        { status: 200, headers },
      );
    }

    return Response.json(
      {
        gameEnabled,
        approved: true,
        riddle: {
          intro: data.riddle_intro,
          clues: data.riddle_clues,
          question: data.riddle_question,
        },
      },
      { status: 200, headers },
    );
  } catch (error) {
    console.error("game-team-status failed", error);
    return Response.json(
      { error: "Unable to check team approval" },
      { status: 500, headers },
    );
  }
});
