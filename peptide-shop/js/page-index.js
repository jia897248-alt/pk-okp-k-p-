(function () {
  "use strict";
  const PP = window.PP, C = PP.C;

  const CATS = [
    { id: "fatloss", name: "Fat Loss & Metabolism", ic: "⚖️" },
    { id: "growth", name: "Growth & Hormone Peptides", ic: "💪" },
    { id: "recovery", name: "Recovery & Healing", ic: "🩹" },
    { id: "cognition", name: "Cognition & Mood", ic: "🧠" },
    { id: "immune", name: "Immune & NAD+ Boosters", ic: "🔋" },
    { id: "sexual", name: "Sexual Health", ic: "🔥" },
    { id: "research", name: "Research Compounds", ic: "🧫" },
    { id: "supplies", name: "Lab Supplies & Solvents", ic: "💧" }
  ];

  const byId = PP.byId;

  function renderCats() {
    PP.el("catGrid").innerHTML = CATS.map(c => {
      const n = window.PRODUCTS.filter(p => p.cat === c.id).length;
      return `<a class="cat-card" href="products.html?cat=${c.id}">
        <div class="ic">${c.ic}</div><div class="n">${c.name}</div><div class="c">${n} products</div>
      </a>`;
    }).join("");
  }

  function renderBundles() {
    PP.el("bundleGrid").innerHTML = C.BUNDLES.map(b => {
      const c = PP.cur();
      const items = b.products.map(byId).filter(Boolean);
      const sum = items.reduce((s, p) => s + PP.rate(p, c), 0);
      return `<div class="bundle">
        <div class="b-tag">${b.tag}</div>
        <h3 style="font-size:18px;font-weight:800">${b.name}</h3>
        <p class="small muted" style="margin-top:6px">${b.desc}</p>
        <ul class="items">${items.map(p => `<li>${p.name} ${p.spec} — ${PP.fmt(PP.rate(p, c), c)}</li>`).join("")}</ul>
        <div class="small muted">💬 ${b.bonus}</div>
        <div class="sum"><span class="b-price">${PP.fmt(sum, c)}</span><span class="b-save">1 box = wholesale · ask for best price</span></div>
        <button class="btn btn-primary btn-block" data-bundle="${b.id}">Add this stack to cart</button>
        <button class="btn btn-wa btn-block" style="margin-top:8px" data-bwa="${b.id}">Order on WhatsApp</button>
      </div>`;
    }).join("");
    PP.qsa("[data-bundle]").forEach(b => b.onclick = () => {
      const bundle = C.BUNDLES.find(x => x.id === b.dataset.bundle);
      bundle.products.forEach(id => PP.addToCart(id, 1));
      PP.toast(`${bundle.name} added to cart 🎉`, "🎯");
    });
    PP.qsa("[data-bwa]").forEach(b => b.onclick = () => {
      const bundle = C.BUNDLES.find(x => x.id === b.dataset.bwa);
      const c = PP.cur();
      const items = bundle.products.map(byId).filter(Boolean);
      const sum = items.reduce((s, p) => s + PP.rate(p, c), 0);
      const lines = items.map(p => `1x ${p.name} ${p.spec} (${p.abbr})`).join("\n");
      window.open(PP.wa(`Hi! I want the ${bundle.name} stack:\n${lines}\n\nTotal: ${PP.fmt(sum, c)} (${c}) — please give me your best bulk price.`), "_blank");
    });
  }

  function renderBest() {
    const list = window.PRODUCTS.filter(p => p.best).sort((a, b) => PP.rate(a, PP.cur()) - PP.rate(b, PP.cur())).slice(0, 6);
    PP.el("bestGrid").innerHTML = PP.gridHTML(list);
    PP.bindCards(PP.el("bestGrid"));
  }

  function bindFAQ() {
    PP.qsa(".faq-item .q").forEach(q => q.onclick = () => q.parentElement.classList.toggle("open"));
  }

  function bindReseller() {
    const btn = PP.el("resellerWa");
    if (!btn) return;
    btn.href = PP.wa("Hi! I'm interested in the reseller & partnership program. What's your best real deal price for bulk quantities?");
    btn.target = "_blank";
    btn.rel = "noopener";
  }

  window.Page = {
    init() {
      PP.qsa("[data-nav='home']").forEach(a => a.classList.add("on"));
      renderCats(); renderBundles(); renderBest(); bindFAQ(); bindReseller();
      if (window.Showcase) window.Showcase.init();
      document.addEventListener("pp:currency", () => { renderBundles(); renderBest(); });
    }
  };
})();
