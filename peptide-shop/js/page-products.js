(function () {
  "use strict";
  const PP = window.PP;

  const CATS = [
    { id: "all", name: "All products", ic: "🗂️" },
    { id: "fatloss", name: "Fat Loss & Metabolism", ic: "⚖️" },
    { id: "growth", name: "Growth & Hormone Peptides", ic: "💪" },
    { id: "recovery", name: "Recovery & Healing", ic: "🩹" },
    { id: "cognition", name: "Cognition & Mood", ic: "🧠" },
    { id: "immune", name: "Immune & NAD+ Boosters", ic: "🔋" },
    { id: "sexual", name: "Sexual Health", ic: "🔥" },
    { id: "research", name: "Research Compounds", ic: "🧫" },
    { id: "supplies", name: "Lab Supplies & Solvents", ic: "💧" }
  ];

  const PAGE_SIZE = 24;
  let state = { cat: "all", q: "", sort: "reco", page: 1 };

  function apply() {
    const u = new URL(location.href);
    state.cat = u.searchParams.get("cat") || state.cat;
    state.q = u.searchParams.get("q") || state.q;
    if (state.q) PP.el("search").value = state.q;
  }

  function filtered() {
    let list = window.PRODUCTS.slice();
    if (state.cat !== "all") list = list.filter(p => p.cat === state.cat);
    if (state.q) {
      const q = state.q.toLowerCase();
      list = list.filter(p => (p.name + " " + p.abbr + " " + p.spec).toLowerCase().includes(q));
    }
    const c = PP.cur();
    switch (state.sort) {
      case "price-asc": list.sort((a, b) => PP.rate(a, c) - PP.rate(b, c)); break;
      case "price-desc": list.sort((a, b) => PP.rate(b, c) - PP.rate(a, c)); break;
      case "name": list.sort((a, b) => a.name.localeCompare(b.name)); break;
      default: list.sort((a, b) => (b.best ? 1 : 0) - (a.best ? 1 : 0) || PP.rate(a, c) - PP.rate(b, c));
    }
    return list;
  }

  function renderCats() {
    PP.el("catList").innerHTML = CATS.map(c => {
      const n = c.id === "all" ? window.PRODUCTS.length : window.PRODUCTS.filter(p => p.cat === c.id).length;
      return `<button data-cat="${c.id}" class="${state.cat === c.id ? "on" : ""}">${c.ic} ${c.name} <span style="float:right;opacity:.6">${n}</span></button>`;
    }).join("");
    PP.qsa("[data-cat]").forEach(b => b.onclick = () => {
      state.cat = b.dataset.cat;
      state.page = 1;
      const crumb = CATS.find(c => c.id === state.cat);
      PP.el("crumb").textContent = crumb.name;
      renderCats(); render();
      history.replaceState(null, "", "products.html?cat=" + state.cat);
      PP.el("grid").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function renderPager(list) {
    const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
    const page = Math.min(state.page, totalPages);
    state.page = page;
    const start = (page - 1) * PAGE_SIZE;
    const pageList = list.slice(start, start + PAGE_SIZE);

    PP.el("grid").innerHTML = pageList.length
      ? PP.gridHTML(pageList)
      : `<div class="muted" style="grid-column:1/-1;text-align:center;padding:40px">No products match your search.</div>`;
    PP.bindCards(PP.el("grid"));

    const from = list.length ? start + 1 : 0;
    const to = Math.min(start + PAGE_SIZE, list.length);
    PP.el("count").textContent = list.length ? `Showing ${from}–${to} of ${list.length}` : "0 products";

    if (totalPages <= 1) { PP.el("pagination").innerHTML = ""; return; }
    const pages = [];
    const startIdx = Math.max(1, page - 2);
    const endIdx = Math.min(totalPages, startIdx + 4);
    for (let i = startIdx; i <= endIdx; i++) pages.push(i);
    let html = `<button class="pbtn" data-page="${page - 1}" ${page <= 1 ? "disabled" : ""}>‹ Prev</button>`;
    if (startIdx > 1) html += `<button class="pbtn" data-page="1">1</button>${startIdx > 2 ? '<span class="pgap">…</span>' : ""}`;
    html += pages.map(i => `<button class="pbtn ${i === page ? "on" : ""}" data-page="${i}">${i}</button>`).join("");
    if (endIdx < totalPages) html += `${endIdx < totalPages - 1 ? '<span class="pgap">…</span>' : ""}<button class="pbtn" data-page="${totalPages}">${totalPages}</button>`;
    html += `<button class="pbtn" data-page="${page + 1}" ${page >= totalPages ? "disabled" : ""}>Next ›</button>`;
    PP.el("pagination").innerHTML = html;
    PP.qsa(".pbtn[data-page]", PP.el("pagination")).forEach(b => b.onclick = () => {
      state.page = Math.min(totalPages, Math.max(1, +b.dataset.page));
      render();
      PP.el("grid").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function render() {
    renderPager(filtered());
  }

  window.Page = {
    init() {
      apply();
      renderCats(); render();
      PP.el("search").addEventListener("input", e => { state.q = e.target.value; state.page = 1; render(); });
      PP.el("sort").addEventListener("change", e => { state.sort = e.target.value; state.page = 1; render(); });
      document.addEventListener("pp:currency", render);
      PP.qsa("[data-nav='products']").forEach(a => a.classList.add("on"));
    }
  };
})();
