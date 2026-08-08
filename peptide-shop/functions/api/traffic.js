// GET /api/traffic — 从 Cloudflare GraphQL 拉取 Web Analytics 数据
// 需要 Pages 环境变量: CF_API_TOKEN, CF_ACCOUNT_ID, CF_SITE_TAG
// 按天拆分查询再聚合, 避免 ABR 采样导致的大范围数据不一致

const JSON_HEADERS = { "Content-Type": "application/json; charset=utf-8" };

const MAX_DAYS = 30;

function fmt(d) {
  return d.toISOString().slice(0, 10);
}

// 单个日期的查询 (小范围 -> 100% 采样, 最准确)
function buildQuery(account, siteTag, day) {
  return `query {
    viewer {
      accounts(filter: {accountTag: "${account}"}) {
        rumPageloadEventsAdaptiveGroups(
          limit: 1000
          orderBy: [date_ASC]
          filter: {date: "${day}", siteTag: "${siteTag}"}
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
  const days = Math.min(MAX_DAYS, Math.max(1, parseInt(url.searchParams.get("days") || String(MAX_DAYS), 10)));
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));

  // 生成每一天的日期列表
  const dayList = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dayList.push(fmt(d));
  }

  // 并行请求每一天 (小范围查询 -> 采样最精确)
  const results = await Promise.all(
    dayList.map((day) => fetchGraphQL(env, buildQuery(env.CF_ACCOUNT_ID, env.CF_SITE_TAG, day)))
  );

  const errors = results.filter((r) => r.error);
  if (errors.length) {
    return new Response(JSON.stringify({ ok: false, error: errors[0].error }), { status: 500, headers: JSON_HEADERS });
  }

  const byDay = {};
  const byCountry = {};
  let total = 0;

  for (const res of results) {
    const groups = res.data?.viewer?.accounts?.[0]?.rumPageloadEventsAdaptiveGroups || [];
    for (const g of groups) {
      const date = g.dimensions.date;
      const country = g.dimensions.countryName || "unknown";
      const c = g.count || 0;
      total += c;
      byDay[date] = (byDay[date] || 0) + c;
      byCountry[country] = (byCountry[country] || 0) + c;
    }
  }

  // 调试模式: 返回每个查询的原始分组, 用于核对数据真实性
  if (url.searchParams.get("raw") === "1") {
    const raw = [];
    results.forEach((res, i) => {
      const groups = res.data?.viewer?.accounts?.[0]?.rumPageloadEventsAdaptiveGroups || [];
      raw.push({ day: dayList[i], groups });
    });
    return new Response(JSON.stringify({ ok: true, days, start: fmt(start), end: fmt(end), total, raw }, null, 2), {
      headers: JSON_HEADERS,
    });
  }

  return new Response(
    JSON.stringify({
      ok: true,
      days,
      start: fmt(start),
      end: fmt(end),
      total,
      byDay: Object.entries(byDay).sort((a, b) => a[0].localeCompare(b[0])).map(([date, count]) => ({ date, count })),
      byCountry: Object.entries(byCountry).sort((a, b) => b[1] - a[1]).map(([country, count]) => ({ country, count })),
    }),
    { headers: JSON_HEADERS }
  );
}
