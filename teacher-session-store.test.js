"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const {
  createTeacherSessionStore,
  SESSION_DURATION_MS
} = require("./teacher-session-store");

function mockDatabase() {
  const records = new Map();

  const supabase = {
    from(table) {
      assert.equal(table, "teacher_sessions");

      return {
        async insert(record) {
          records.set(record.token_hash, { ...record, revoked_at: null });
          return { error: null };
        },

        select() {
          let hash;

          return {
            eq(column, value) {
              assert.equal(column, "token_hash");
              hash = value;

              return {
                async maybeSingle() {
                  return {
                    data: records.get(hash) || null,
                    error: null
                  };
                }
              };
            }
          };
        },

        update(changes) {
          return {
            async eq(column, hash) {
              assert.equal(column, "token_hash");

              const record = records.get(hash);

              if (record) Object.assign(record, changes);

              return { error: null };
            }
          };
        }
      };
    }
  };

  return { supabase, records };
}

test("session remains valid after store recreation", async () => {
  const db = mockDatabase();
  let time = 1000000;

  const first = createTeacherSessionStore({
    supabase: db.supabase,
    now: () => time
  });

  const session = await first.create();

  const second = createTeacherSessionStore({
    supabase: db.supabase,
    now: () => time
  });

  assert.equal(
    (await second.verify(session.token)).authenticated,
    true
  );

  assert.equal(session.expiresAt, time + SESSION_DURATION_MS);
});

test("session expires after eight hours", async () => {
  const db = mockDatabase();
  let time = 1000000;

  const store = createTeacherSessionStore({
    supabase: db.supabase,
    now: () => time
  });

  const session = await store.create();

  time += SESSION_DURATION_MS;

  assert.equal(
    (await store.verify(session.token)).authenticated,
    false
  );
});

test("logout revokes session immediately", async () => {
  const db = mockDatabase();

  const store = createTeacherSessionStore({
    supabase: db.supabase
  });

  const session = await store.create();

  await store.revoke(session.token);

  assert.equal(
    (await store.verify(session.token)).authenticated,
    false
  );
});

test("invalid tokens are rejected", async () => {
  const db = mockDatabase();

  const store = createTeacherSessionStore({
    supabase: db.supabase
  });

  assert.equal(
    (await store.verify("invalid")).authenticated,
    false
  );

  assert.equal(
    (await store.verify("")).authenticated,
    false
  );
});

test("database failures do not authenticate teachers", async () => {
  const supabase = {
    from() {
      return {
        select() {
          return {
            eq() {
              return {
                async maybeSingle() {
                  return {
                    data: null,
                    error: new Error("Database unavailable")
                  };
                }
              };
            }
          };
        }
      };
    }
  };

  const store = createTeacherSessionStore({ supabase });

  await assert.rejects(
    store.verify("a".repeat(64)),
    /Database unavailable/
  );
});