// GET /api/traffic — 从 Cloudflare GraphQL 拉取 Web Analytics 数据
// 需要 Pages 环境变量: CF_API_TOKEN, CF_ACCOUNT_ID, CF_SITE_TAG
// 可选: CF_ZONE_ID

const JSON_HEADERS = { "Content-Type": "application/json; charset=utf-8" };

const DAYS = 30;

function dateRange(days) {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  const fmt = (d) => d.toISOString().slice(0, 10);
  return { start: fmt(start), end: fmt(end) };
}

// GraphQL 聚合查询
function buildQuery(siteTag, start, end) {
  return `
  {
    viewer {
      accounts(filter: {accountTag: "__ACCOUNT__"}) {
        rumPageloadEventsAdaptiveGroups(
          limit: 100
          filter: {date_geq: "${start}", date_leq: "${end}", siteTag: "${siteTag}"}
        ) {
          dimensions { date countryName }
          count
        }
      }
    }
  }`;
}

async function fetchGraphQL(env, query) {
  const resp = await fetch("https://api.cloudflare.com/client/v4/graphql", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + env.CF_API_TOKEN,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });
  const data = await resp.json();
  if (!resp.ok || data.errors) {
    return { error: data.errors || ("HTTP " + resp.status) };
  }
  return { data: data.data };
}

export async function onRequest(context) {
  const { env, request } = context;
  if (!env.CF_API_TOKEN || !env.CF_ACCOUNT_ID || !env.CF_SITE_TAG) {
    return new Response(
      JSON.stringify({ ok: false, error: "missing env config" }),
      { status: 500, headers: JSON_HEADERS }
    );
  }

  const url = new URL(request.url);
  const days = Math.min(90, Math.max(1, parseInt(url.searchParams.get("days") || String(DAYS), 10)));
  const { start, end } = dateRange(days);

  // 用 accountTag 查询所有来源
  let query = buildQuery(env.CF_SITE_TAG, start, end).replace("__ACCOUNT__", env.CF_ACCOUNT_ID);
  const result = await fetchGraphQL(env, query);
  if (result.error) {
    return new Response(JSON.stringify({ ok: false, error: result.error }), { status: 500, headers: JSON_HEADERS });
  }

  const groups = result.data?.viewer?.accounts?.[0]?.rumPageloadEventsAdaptiveGroups || [];
  const byDay = {};
  const byCountry = {};
  let total = 0;

  for (const g of groups) {
    const date = g.dimensions.date;
    const country = g.dimensions.countryName || "unknown";
    const c = g.count || 0;
    total += c;
    byDay[date] = (byDay[date] || 0) + c;
    byCountry[country] = (byCountry[country] || 0) + c;
  }

  return new Response(
    JSON.stringify({
      ok: true,
      days,
      start,
      end,
      total,
      byDay: Object.entries(byDay).sort((a, b) => a[0].localeCompare(b[0])).map(([date, count]) => ({ date, count })),
      byCountry: Object.entries(byCountry).sort((a, b) => b[1] - a[1]).map(([country, count]) => ({ country, count })),
    }),
    { headers: JSON_HEADERS }
  );
}
