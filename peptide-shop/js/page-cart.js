(function () {
  "use strict";
  const PP = window.PP, C = PP.C;
  const byId = PP.byId;

  function state(c) {
    const items = PP.Store.get().map(i => ({ ...i, p: byId(i.id) })).filter(i => i.p);
    let sub = 0;
    for (const i of items) sub += PP.rate(i.p, c) * i.qty;
    const cp = PP.couponOff(sub);
    const freeShip = sub - (cp ? cp.off : 0) >= C.FREE_SHIPPING;
    const shipping = sub === 0 ? 0 : (freeShip ? 0 : C.SHIPPING_FLAT);
    const total = Math.max(0, sub - (cp ? cp.off : 0)) + shipping;
    return { items, sub, cp, freeShip, shipping, total };
  }

  function renderItems(c) {
    const { items } = state(c);
    const box = PP.el("items");
    if (!items.length) {
      box.innerHTML = `<div class="pcard" style="padding:40px;text-align:center;grid-column:1/-1">
        <div style="font-size:40px">🛒</div><h3 style="margin:10px 0 6px">Your cart is empty</h3>
        <div class="muted small">Find your products below — or start with a best seller.</div>
        <a href="products.html" class="btn btn-primary" style="margin-top:14px">Shop now</a></div>`;
      return;
    }
    box.innerHTML = items.map(i => {
      const u = PP.rate(i.p, c);
      return `<div class="citem" data-id="${i.p.id}">
        <div class="thumb">${PP.emojiFor(i.p.name)}</div>
        <div class="info">
          <h4>${i.p.name}</h4>
          <div class="spec">${i.p.spec} · ${i.p.abbr}</div>
          <div class="unit">${PP.fmt(u, c)}/box</div>
        </div>
        <div class="qty">
          <button data-step="-1">−</button>
          <input data-qty value="${i.qty}" type="number" min="1" max="99">
          <button data-step="1">+</button>
        </div>
        <div class="line">${PP.fmt(u * i.qty, c)}</div>
        <button class="del" data-del="${i.p.id}" title="Remove">✕</button>
      </div>`;
    }).join("");
    PP.qsa("[data-step]", box).forEach(b => b.onclick = () => {
      const id = b.closest(".citem").dataset.id;
      const it = PP.Store.get().find(x => x.id === id);
      it.qty = Math.min(99, Math.max(1, it.qty + (+b.dataset.step)));
      PP.Store.save(PP.Store.get());
      refresh();
    });
    PP.qsa("[data-qty]", box).forEach(inp => inp.oninput = () => {
      const id = inp.closest(".citem").dataset.id;
      const it = PP.Store.get().find(x => x.id === id);
      it.qty = Math.min(99, Math.max(1, parseInt(inp.value, 10) || 1));
      PP.Store.save(PP.Store.get());
      refresh();
    });
    PP.qsa("[data-del]", box).forEach(b => b.onclick = () => {
      PP.Store.save(PP.Store.get().filter(x => x.id !== b.dataset.del));
      refresh();
    });
  }

  function renderSummary(c) {
    const s = state(c);
    const sb = PP.el("shipTop");
    if (!s.items.length) { sb.style.display = "none"; return; }
    const pct = PP.freeShipPercent(s.sub, c);
    sb.style.display = "block";
    PP.el("shipFill").style.width = Math.min(100, pct) + "%";
    PP.el("shipTxt").innerHTML = s.freeShip
      ? `🚚 <b>You've unlocked FREE shipping!</b>`
      : `🚚 Spend <b>${PP.fmt(Math.max(0, C.FREE_SHIPPING - s.sub), c)}</b> more to unlock <b>free shipping</b> (${Math.round(pct)}% there)`;

    let rows = `
      <div class="sum-row"><span class="lab">Subtotal (${s.items.length} item${s.items.length > 1 ? "s" : ""})</span><span>${PP.fmt(s.sub, c)}</span></div>
      ${s.cp ? `<div class="sum-row disc"><span class="lab">${s.cp.label} (${s.cp.code})</span><span>−${PP.fmt(s.cp.off, c)}</span></div>` : ""}
      <div class="sum-row"><span class="lab">Shipping</span><span>${s.freeShip ? '<b style="color:var(--accent)">FREE</b>' : PP.fmt(s.shipping, c)}</span></div>
      <div class="sum-row grand"><span>Total</span><span>${PP.fmt(s.total, c)}</span></div>`;
    PP.el("sumRows").innerHTML = rows;
    PP.el("milestones").innerHTML = `<div class="t">💬 量大价优 · 按量议价</div>
      <div class="m">Bigger order = better price. Tell us your quantity on chat and get the best real deal price.</div>`;
  }

  function refresh() {
    const c = PP.cur();
    renderItems(c); renderSummary(c); PP.renderCartCount();
  }

  window.Page = {
    init() {
      const c = PP.cur();
      PP.el("couponBtn").onclick = () => {
        const code = PP.el("coupon").value.trim();
        const found = C.COUPONS[code.toUpperCase()];
        if (found) { localStorage.setItem("pp_coupon", code.toUpperCase()); PP.el("couponMsg").textContent = "✅ " + found.label + " applied!"; PP.toast(found.label + " applied", "🏷️"); }
        else { PP.el("couponMsg").textContent = "❌ Invalid code. Tip: try NEW95."; }
        refresh();
      };
      PP.el("checkoutWa").onclick = () => {
        const o = PP.buildOrder();
        if (!o) return;
        window.open(PP.waText(o.text), "_blank");
        PP.toast("Opening WhatsApp… confirm & pay there 💬", "✆");
      };
      PP.el("checkoutEmail").onclick = () => {
        const o = PP.buildOrder();
        if (!o) return;
        const body = o.text.replace(/\n/g, "%0D%0A");
        location.href = "mailto:" + C.EMAIL + "?subject=" + encodeURIComponent("Reseller / bulk inquiry") + "&body=" + body;
      };
      refresh();
      document.addEventListener("pp:currency", () => refresh());
      PP.qsa("[data-nav='products']").forEach(a => a.classList.add("on"));
    }
  };
})();
