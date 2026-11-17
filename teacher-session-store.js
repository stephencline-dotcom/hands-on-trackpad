"use strict";

const crypto = require("node:crypto");

const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;
const TABLE = "teacher_sessions";

function hashToken(token) {
  return crypto.createHash("sha256")
    .update(token, "utf8")
    .digest("hex");
}

function createTeacherSessionStore({ supabase, now = Date.now }) {
  if (!supabase) {
    throw new Error("Persistent teacher session storage is required.");
  }

  async function create() {
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(now() + SESSION_DURATION_MS);

    const { error } = await supabase.from(TABLE).insert({
      token_hash: hashToken(token),
      expires_at: expiresAt.toISOString()
    });

    if (error) throw error;

    return { token, expiresAt: expiresAt.getTime() };
  }

  async function verify(token) {
    if (!token || !/^[a-f0-9]{64}$/.test(token)) {
      return { authenticated: false };
    }

    const { data, error } = await supabase
      .from(TABLE)
      .select("expires_at,revoked_at")
      .eq("token_hash", hashToken(token))
      .maybeSingle();

    if (error) throw error;

    if (!data || data.revoked_at) {
      return { authenticated: false };
    }

    const expiresAt = Date.parse(data.expires_at);

    if (!Number.isFinite(expiresAt) || now() >= expiresAt) {
      return { authenticated: false };
    }

    return { authenticated: true, expiresAt };
  }

  async function revoke(token) {
    if (!token || !/^[a-f0-9]{64}$/.test(token)) {
      return;
    }

    const { error } = await supabase
      .from(TABLE)
      .update({ revoked_at: new Date(now()).toISOString() })
      .eq("token_hash", hashToken(token));

    if (error) throw error;
  }

  return Object.freeze({
    create,
    verify,
    revoke
  });
}

module.exports = {
  createTeacherSessionStore,
  SESSION_DURATION_MS
};