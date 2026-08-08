(function () {
  "use strict";
  const PP = window.PP, C = PP.C;
  let P = null;
  let qty = 1;

  function qtyOf() {
    qty = Math.min(99, Math.max(1, parseInt(PP.el("qty").value, 10) || 1));
    PP.el("qty").value = qty;
    return qty;
  }

  function render(c) {
    c = c || PP.cur();
    PP.el("gallery").textContent = PP.emojiFor(P.name);
    PP.el("pcat").textContent = P.catLabel;
    PP.el("pname").textContent = P.name;
    PP.el("pspec").textContent = P.spec + " · 1 box = " + (P.vials || 10) + " vials · SKU " + P.abbr;
    PP.el("prate").innerHTML = "★★★★★ <span>4.9 (2,318 ratings)</span>";
    PP.el("pnow").textContent = PP.fmt(PP.rate(P, c), c);
    PP.el("pold").textContent = PP.fmt(P.retail, c);
    const hp = PP.el("phook");
    if (hp) hp.innerHTML = P.id === "TR30-30mg" ? C.HOOK.tr30En : C.HOOK.en;
    const low = P.stock < 40;
    PP.el("pstock").innerHTML = P.stock >= 150
      ? `<span class="muted">In stock: <b style="color:var(--accent)">${P.stock}</b> boxes</span>`
      : `<span style="color:var(--red);font-weight:700">⚠ Only ${P.stock} boxes left</span>`;
    PP.el("pstockbar").innerHTML = `<i style="width:${Math.min(100, P.stock / 300 * 100)}%" class="${low ? "low" : ""}"></i>`;
    qtyOf();
  }

  function renderRelated(c) {
    const rel = window.PRODUCTS.filter(p => p.cat === P.cat && p.id !== P.id).slice(0, 3);
    PP.el("relGrid").innerHTML = PP.gridHTML(rel);
    PP.bindCards(PP.el("relGrid"));
  }

  function renderRecon() {
    const card = PP.el("reconCard");
    if (!card) return;
    const r = PP.reconFor(P);
    if (!r) { card.closest("#recon").classList.add("hide"); return; }
    card.innerHTML = `
      <div class="recon-head">
        <h3>🧪 ${r.title}</h3>
        <div class="small muted">Real protocol discussed with our repeat customers · customer-approved</div>
      </div>
      <div class="recon-body">
        <div class="recon-col">
          <h4>Reconstitution</h4>
          <ol>${r.recon.map(s => `<li>${s}</li>`).join("")}</ol>
        </div>
        <div class="recon-col">
          <h4>Dosing</h4>
          <ul>${r.dose.map(s => `<li>${s}</li>`).join("")}</ul>
        </div>
      </div>
      <div class="recon-note">${r.note}</div>
      <a class="btn btn-wa btn-block" style="margin-top:14px" href="${PP.wa(`Hi! I need help with reconstitution & dosing for ${P.name} ${P.spec} (${P.abbr}).`)}" target="_blank" rel="noopener">✆ Ask us on WhatsApp</a>
    `;
  }

  window.Page = {
    init() {
      const id = new URLSearchParams(location.search).get("id") || window.PRODUCTS[0].id;
      P = PP.byId(id);
      if (!P) { location.href = "products.html"; return; }
      document.title = P.name + " " + P.spec + " — PeptideMart";
      PP.el("crumb").textContent = P.name;
      PP.el("plus").onclick = () => { PP.el("qty").value = qtyOf() + 1; qtyOf(); render(); };
      PP.el("minus").onclick = () => { PP.el("qty").value = qtyOf() - 1; qtyOf(); render(); };
      PP.el("qty").oninput = () => { qtyOf(); render(); };
      PP.el("addBtn").onclick = () => PP.addToCart(P.id, qtyOf());
      PP.el("waBtn").onclick = () => {
        const c = PP.cur(), u = PP.rate(P, c);
        window.open(PP.wa(`Hi! I want to order:\n${qty}x ${P.name} ${P.spec} (${P.abbr}) × ${PP.fmt(u, c)}/box = ${PP.fmt(u * qty, c)}\n\nPlease confirm availability & shipping to my country.`), "_blank");
      };
      const hp = PP.el("waPrice");
      if (hp) hp.onclick = () => {
        window.open(PP.wa(`Hi! I'm interested in ${P.name} ${P.spec} (${P.abbr}). What's your best real deal price for ${qty} box(es)?`), "_blank");
      };
      render(); renderRelated(); renderRecon();
      document.addEventListener("pp:currency", e => { render(e.detail); renderRelated(e.detail); });
    }
  };
})();
