// POST /api/feedback — 保存用户反馈到 KV
// GET  /api/feedback — 列出所有反馈（admin 用）

const JSON_HEADERS = { "Content-Type": "application/json; charset=utf-8" };

async function addFeedback(env, data) {
  const now = new Date().toISOString();
  const record = {
    id: "fb_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    name: (data.name || "").toString().slice(0, 80),
    email: (data.email || "").toString().slice(0, 120),
    rating: Math.min(5, Math.max(1, parseInt(data.rating, 10) || 5)),
    type: (data.type || "general").toString().slice(0, 40),
    message: (data.message || "").toString().slice(0, 2000),
    page: (data.page || "").toString().slice(0, 200),
    status: "new",
    created_at: now,
  };
  if (!record.message.trim()) {
    return { ok: false, error: "message is required" };
  }
  if (env.FEEDBACK_KV) {
    const list = JSON.parse((await env.FEEDBACK_KV.get("feedback_list", "text")) || "[]");
    list.unshift(record);
    if (list.length > 500) list.length = 500;
    await env.FEEDBACK_KV.put("feedback_list", JSON.stringify(list));
    await env.FEEDBACK_KV.put("feedback_" + record.id, JSON.stringify(record));
    return { ok: true, record };
  }
  return { ok: false, error: "storage not configured" };
}

async function listFeedback(env) {
  if (env.FEEDBACK_KV) {
    const list = JSON.parse((await env.FEEDBACK_KV.get("feedback_list", "text")) || "[]");
    return { ok: true, records: list };
  }
  return { ok: false, error: "storage not configured" };
}

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const method = request.method;

  if (url.pathname.endsWith("/feedback")) {
    if (method === "POST") {
      let body;
      try {
        body = await request.json();
      } catch {
        return new Response(JSON.stringify({ ok: false, error: "invalid json" }), { status: 400, headers: JSON_HEADERS });
      }
      const res = await addFeedback(env, body || {});
      return new Response(JSON.stringify(res), {
        status: res.ok ? 201 : 400,
        headers: JSON_HEADERS,
      });
    }
    if (method === "GET") {
      if (!env.ADMIN_PIN || url.searchParams.get("pin") !== env.ADMIN_PIN) {
        return new Response(JSON.stringify({ ok: false, error: "unauthorized" }), { status: 401, headers: JSON_HEADERS });
      }
      const res = await listFeedback(env);
      return new Response(JSON.stringify(res), { status: res.ok ? 200 : 503, headers: JSON_HEADERS });
    }
  }

  return new Response(JSON.stringify({ ok: false, error: "not found" }), { status: 404, headers: JSON_HEADERS });
}
