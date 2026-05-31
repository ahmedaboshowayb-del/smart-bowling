// SERVER-ONLY — this file is never bundled into the client.
// The reward code is stored exclusively here and only returned
// after server-side validation of 4 consecutive strikes.

const REWARD_CODE = 'PS-2026-Ahmed';

const MIN_THROW_INTERVAL_MS = 1_500; // Minimum realistic time between throws

interface Session {
  consecutiveStrikes: number;
  lastThrowAt: number;
  sessionStart: number;
  rewarded: boolean;
}

// In-memory store — lives for the lifetime of the server process.
// A fresh session is created each time the user opens the page.
const sessions = new Map<string, Session>();

function pruneOldSessions(): void {
  if (sessions.size < 500) return;
  const cutoff = Date.now() - 3_600_000; // 1 h TTL
  for (const [id, s] of sessions) {
    if (s.sessionStart < cutoff) sessions.delete(id);
  }
}

function newToken(): string {
  // crypto.randomUUID is available in Node 19+ (Next 16 baseline)
  return crypto.randomUUID().replace(/-/g, '') + Date.now().toString(36);
}

function badJson(msg: string, status: number): Response {
  return Response.json({ error: msg }, { status });
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json() as {
      action?: string;
      sessionToken?: string;
      isStrike?: boolean;
    };
    const { action, sessionToken } = body;

    // ── INIT ─────────────────────────────────────────────────────────────────
    if (action === 'init') {
      pruneOldSessions();
      const token = newToken();
      sessions.set(token, {
        consecutiveStrikes: 0,
        lastThrowAt: 0,           // 0 so the very first throw is never "too soon"
        sessionStart: Date.now(),
        rewarded: false,
      });
      return Response.json({ sessionToken: token });
    }

    // ── Common validation ────────────────────────────────────────────────────
    if (!sessionToken || typeof sessionToken !== 'string' || sessionToken.length < 8) {
      return badJson('bad_token', 400);
    }
    const session = sessions.get(sessionToken);
    if (!session) return badJson('no_session', 401);

    // ── THROW ─────────────────────────────────────────────────────────────────
    if (action === 'throw') {
      const now = Date.now();

      // Anti-spam: block rapid-fire programmatic calls
      if (now - session.lastThrowAt < MIN_THROW_INTERVAL_MS) {
        return badJson('too_soon', 429);
      }

      const isStrike = body.isStrike === true;
      session.consecutiveStrikes = isStrike ? session.consecutiveStrikes + 1 : 0;
      session.lastThrowAt = now;
      sessions.set(sessionToken, session);

      return Response.json({
        strikes: session.consecutiveStrikes,
        qualified: session.consecutiveStrikes >= 4,
      });
    }

    // ── CLAIM ─────────────────────────────────────────────────────────────────
    if (action === 'claim') {
      if (session.rewarded) return badJson('already_claimed', 409);
      if (session.consecutiveStrikes < 4) return badJson('not_qualified', 403);

      session.rewarded = true;
      sessions.set(sessionToken, session);

      // Code is returned only once, only after server confirms qualification
      return Response.json({ code: REWARD_CODE });
    }

    return badJson('unknown_action', 400);
  } catch {
    return badJson('server_error', 500);
  }
}
