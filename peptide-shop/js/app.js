(function () {
  "use strict";
  const C = window.CONFIG;

  /* ================= Cart store ================= */
  const Store = {
    key: "pp_cart_v1",
    get() { try { return JSON.parse(localStorage.getItem(this.key)) || []; } catch (e) { return []; } },
    save(list) { localStorage.setItem(this.key, JSON.stringify(list)); },
    count() { return this.get().reduce((s, i) => s + i.qty, 0); }
  };

  const byId = id => window.PRODUCTS.find(p => p.id === id);

  const USD = "USD";
  const cur = () => "USD";
  const setCur = c => {};
  const rate = (p, c) => p.usd;
  const fmt = (v, c) => "$" + v.toFixed(2);

  const perBox = (p, qty, c) => rate(p, c);
  const unitPrice = (p, c) => rate(p, c);

  const cartSub = (c) => {
    let s = 0;
    for (const i of Store.get()) { const p = byId(i.id); if (p) s += rate(p, c) * i.qty; }
    return s;
  };
  const couponOff = (sub) => {
    const code = localStorage.getItem("pp_coupon") || "";
    const c = C.COUPONS[code.toUpperCase()];
    return c ? { code: code.toUpperCase(), label: c.label, off: sub * c.off } : null;
  };

  /* ================= Helpers ================= */
  const el = id => document.getElementById(id);
  const qs = (s, r) => (r || document).querySelector(s);
  const qsa = (s, r) => Array.from((r || document).querySelectorAll(s));
  const money = v => v.toFixed(2);
  const wa = msg => C.WA_BUSINESS;
  const waText = msg => "https://wa.me/" + C.WHATSAPP + "?text=" + encodeURIComponent(msg);

  const addToCart = (id, qty) => {
    qty = Math.max(1, qty || 1);
    const list = Store.get();
    const it = list.find(i => i.id === id);
    if (it) it.qty += qty; else list.push({ id, qty });
    Store.save(list);
    renderCartCount();
    toast("✓ Added to cart", "🛒");
  };

  const renderCartCount = () => {
    const n = Store.count();
    qsa(".cart-count").forEach(e => { e.textContent = n; e.classList.toggle("hide", n === 0); });
  };

  const toast = (msg, ic) => {
    let box = qs(".toast-box");
    if (!box) { box = document.createElement("div"); box.className = "toast-box"; document.body.appendChild(box); }
    const t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = `<span class="ic">${ic || "🔔"}</span><div>${msg}</div>`;
    box.appendChild(t);
    setTimeout(() => { t.style.transition = "opacity .3s"; t.style.opacity = "0"; setTimeout(() => t.remove(), 300); }, 3800);
  };

  const COUNTRIES = ["Australia", "United States", "United Kingdom", "Canada", "Germany", "New Zealand", "UAE", "Singapore", "Norway", "Sweden", "Netherlands", "Switzerland", "Denmark", "Ireland", "Spain"];
  const socialProof = () => {
    setInterval(() => {
      const p = window.PRODUCTS[Math.floor(Math.random() * window.PRODUCTS.length)];
      const who = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
      const ago = [1, 2, 3, 4, 5, 7, 9, 12][Math.floor(Math.random() * 8)];
      toast(`<b>${p.name} (${p.abbr})</b><span class="dim">${who} · ${ago} min ago</span>`, "🛍️");
    }, 20000);
  };

  const freeShipPercent = (sub, c) => Math.min(100, sub / C.FREE_SHIPPING * 100);

  /* ================= Exit intent ================= */
  const exitPopup = () => {
    if (sessionStorage.getItem("pp_exit")) return;
    const build = () => {
      const m = document.createElement("div");
      m.className = "modal";
      m.innerHTML = `
        <div class="modal-card">
          <div class="ic">🎁</div>
          <h3>Wait! New customer bonus</h3>
          <p>New customers get <b>5% OFF</b> (95折) with code <b>NEW95</b>. Ordering more? Tap chat and we'll give you our real bottom price.</p>
          <div class="code" id="exitCode">NEW95</div>
          <button class="btn btn-primary btn-block btn-lg" id="exitUse">Apply & start shopping</button>
          <p class="small" style="margin:12px 0 0;cursor:pointer" id="exitNo">No thanks, I'll pay full price</p>
        </div>`;
      document.body.appendChild(m);
      m.querySelector("#exitUse").onclick = () => {
        localStorage.setItem("pp_coupon", "NEW95");
        sessionStorage.setItem("pp_exit", "1");
        m.remove(); toast("Code NEW95 applied! 5% OFF 🎉", "🏷️");
      };
      m.querySelector("#exitNo").onclick = () => { sessionStorage.setItem("pp_exit", "1"); m.remove(); };
    };
    document.addEventListener("mouseleave", e => { if (e.clientY <= 0) { build(); } });
    setTimeout(() => { if (!sessionStorage.getItem("pp_exit")) build(); }, 45000);
  };

  /* ================= Currency ================= */
  const toggleCur = (btn) => {
    toast("Prices in USD only", "💱");
  };

  /* ================= Product card ================= */
  const EMOJIS = {
    retatrutide:"⚖️", tirzepatide:"⚖️", semaglutide:"⚖️", cagrilintide:"⚖️", mazdutide:"⚖️", survodutide:"⚖️",
    bpc:"🩹", tb500:"🩹", glow:"✨", klow:"✨", ghk:"✨", "ss-31":"⚡", kpv:"🩹", "ll-37":"🛡️", ara:"🩹", rtd:"🧬",
    sermorelin:"💪", tesamorelin:"💪", ipamorelin:"💪", cjc:"💪", ghrp:"💪", hexarelin:"💪", hgh:"💪",
    fragment:"💪", igf:"💪", mgf:"💪", epitalon:"🕰️", foxo:"🕰️", hmg:"💪", mots:"⏳",
    nad:"🔋", thymosin:"🛡️", glutathione:"🛡️", "b-12":"💉", vitamin:"💊", vip:"🛡️",
    semax:"🧠", selank:"🧠", oxytocin:"💗", dsip:"😴", "5-amino":"🧫",
    melanotan:"☀️", "pt-141":"🔥", kisspeptin:"🔥", dermorphin:"💊", gonadore:"💊",
    aod:"⚖️", slu:"🏃", adipotide:"🏃", "super shred":"🏃", ggh:"🏃", aicar:"🏃", "l-carnitine":"🏃", lipo:"🔥",
    water:"💧", acetic:"💧", sterile:"💧", bac:"💧", mk677:"💤", cbl:"🔥", lemon:"🍋",
    super:"🏃", cartalax:"⚖️", sx:"🧬", adama:"💊"
  };
  const emojiFor = (name) => {
    const n = name.toLowerCase();
    for (const k in EMOJIS) if (n.includes(k)) return EMOJIS[k];
    return "🧪";
  };

  const reconFor = (p) => {
    const n = (p.name + " " + p.spec).toLowerCase();
    for (const r of C.RECON) if (r.match.some(k => n.includes(k))) return r;
    return C.RECON_DEFAULT || null;
  };

  const cardHTML = (p) => {
    const c = cur(), u = rate(p, c);
    const badges = [];
    if (p.best) badges.push('<span class="tag best">Best Seller</span>');
    else if (p.flash) badges.push('<span class="tag best">Top Seller</span>');
    if (p.new) badges.push('<span class="tag new">New</span>');
    const stockPct = Math.min(100, p.stock / 300 * 100);
    const low = p.stock < 40;
    const hook = p.id === "TR30-30mg" ? C.HOOK.tr30En.replace(/<[^>]+>/g, "") : C.HOOK.en;
    return `
    <div class="pcard" data-id="${p.id}">
      <div class="badges">${badges.join("")}</div>
      <div class="thumb">${p.emoji || emojiFor(p.name)}</div>
      <div class="cat">${p.catLabel}</div>
      <h3><a href="product.html?id=${p.id}">${p.name}</a></h3>
      <div class="spec">${p.spec} · ${p.abbr}</div>
      <div class="meta">
        <div class="price"><span class="now">${fmt(u, c)}</span><span class="was">${fmt(p.retail, c)}</span></div>
        <div class="stock ${low ? "low" : ""}">${p.stock} left</div>
      </div>
      <div class="stockbar"><i style="width:${stockPct}%" class="${low ? "low" : ""}"></i></div>
      <a class="hook" data-hook="${p.id}" href="#" onclick="return false">${hook}</a>
      <div class="actions">
        <button class="btn btn-primary" data-add="${p.id}">Add to cart</button>
        <button class="btn btn-wa icon-btn" data-wa="${p.id}" title="Order on WhatsApp">✆</button>
      </div>
    </div>`;
  };

  const gridHTML = (list) => list.map(cardHTML).join("");

  const bindCards = (root) => {
    qsa("[data-add]", root).forEach(b => b.onclick = () => addToCart(b.dataset.add, 1));
    qsa("[data-wa]", root).forEach(b => b.onclick = () => {
      const p = byId(b.dataset.wa);
      window.open(wa(`Hi! I want to order:\n1x ${p.name} ${p.spec} (${p.abbr}) = ${fmt(rate(p, cur()), cur())}\n\nPlease confirm availability & shipping.`), "_blank");
    });
    qsa("[data-hook]", root).forEach(a => a.onclick = () => {
      const p = byId(a.dataset.hook);
      window.open(wa(`Hi! I'm interested in ${p.name} ${p.spec} (${p.abbr}). What's your best real deal price for 1 box / bulk quantity?`), "_blank");
    });
  };

  /* ================= Order text (cart → WhatsApp) ================= */
  const buildOrder = (c) => {
    c = c || cur();
    const list = Store.get();
    let lines = [];
    let sub = 0;
    for (const i of list) {
      const p = byId(i.id); if (!p) continue;
      const u = rate(p, c);
      sub += u * i.qty;
      lines.push(`${i.qty}x ${p.name} ${p.spec} (${p.abbr}) × ${fmt(u, c)}/box = ${fmt(u * i.qty, c)}`);
    }
    if (!lines.length) return null;
    const cp = couponOff(sub);
    const freeShip = sub - (cp ? cp.off : 0) >= C.FREE_SHIPPING;
    const shipping = freeShip ? 0 : C.SHIPPING_FLAT;
    const total = Math.max(0, sub - (cp ? cp.off : 0)) + shipping;
    let msg = "🧪 *New Order* 🧪\n\n" + lines.join("\n") + "\n\n";
    msg += `Subtotal: ${fmt(sub, c)}\n`;
    if (cp) msg += `${cp.label} (${cp.code}): −${fmt(cp.off, c)}\n`;
    msg += `Shipping: ${freeShip ? "FREE 🚚" : fmt(shipping, c)}\n`;
    msg += `\n💳 *Total: ${fmt(total, c)} (${c})*\n`;
    msg += `\n量大价优：采购数量越多价格越给力。请告诉我数量，我给你最优成交价。\n`;
    msg += `\nName / Country / Zip:\n`;
    return { text: msg, total };
  };

  const checkOut = () => {
    const o = buildOrder();
    if (!o) { toast("Your cart is empty", "🛒"); return; }
    window.open(waText(o.text), "_blank");
  };

  /* ================= Shell (header/footer/floaters) ================= */
  const footerHTML = () => `
    <footer>
      <div class="wrap">
        <div class="foot-grid">
          <div>
            <a class="logo" href="index.html"><span class="mark">🧬</span> PEPTIDE<span style="color:var(--accent)">MART</span></a>
            <p class="small muted" style="margin-top:12px;max-width:300px">Wholesale & retail peptides with third-party COA testing, discreet worldwide shipping and 24/7 WhatsApp support. Bulk pricing for clinics & resellers.</p>
          </div>
          <div><h5>Shop</h5>
            <a href="products.html">All products</a><a href="products.html?cat=fatloss">Fat loss & metabolism</a>
            <a href="products.html?cat=growth">Growth & hormone</a><a href="products.html?cat=recovery">Recovery & healing</a>
            <a href="products.html?cat=supplies">Lab supplies</a>
          </div>
          <div><h5>Support</h5>
            <a href="cart.html">Cart & checkout</a><a href="index.html#faq">FAQ</a>
            <a href="index.html#compare">Which product?</a><a href="#waFloat">Live WhatsApp</a>
            <a href="mailto:${C.EMAIL}">Email us</a>
          </div>
          <div><h5>Why us</h5>
            <a href="#">COA batch reports</a><a href="#">Discreet shipping</a><a href="#">Bulk & reseller pricing</a>
            <a href="#">New customer 95折 · EU/US/SEA extra 5%</a>
          </div>
        </div>
        <div class="foot-bottom">Prices in USD; 1 box = 10 vials. Free shipping over ${fmt(C.FREE_SHIPPING, cur())}. Final price confirmed on the checkout chat. © ${new Date().getFullYear()} PeptideMart.</div>
      </div>
    </footer>`;

  const renderShell = () => {
    if (qs(".site")) return;
    const c = cur();
    const nav = `
    <div class="topbar"><div class="inner">
      <div class="msg"><span>🎁</span> New customer <b>95折 / 5% OFF</b> (code NEW95)</div>
      <div class="msg"><span>🌍</span> EU · US · SE Asia get <b>extra 5%</b> (EURASIA5)</div>
      <div class="msg"><span>🚚</span> Free shipping over ${fmt(C.FREE_SHIPPING, c)}</div>
    </div></div>
    <header class="site">
      <div class="wrap nav">
        <a class="logo" href="index.html"><span class="mark">🧬</span> PEPTIDE<span style="color:var(--accent)">MART</span></a>
        <nav class="nav-links">
          <a href="index.html" data-nav="home">Home</a>
          <a href="products.html" data-nav="products">Shop All</a>
          <a href="products.html?cat=fatloss" data-nav="fatloss">Fat Loss</a>
          <a href="products.html?cat=growth" data-nav="growth">Growth</a>
          <a href="products.html?cat=recovery" data-nav="recovery">Recovery</a>
          <a href="#bundles" data-nav="bundles">Stacks</a>
        </nav>
        <div class="nav-cta">
          <button class="cur-btn" id="curBtn">${c}</button>
          <a href="cart.html" class="cart-btn" title="Cart">🛒<span class="count cart-count hide">0</span></a>
        </div>
      </div>
    </header>
    <a class="wa-float" id="waFloat" target="_blank" rel="noopener" title="Chat on WhatsApp"><span class="pulse"></span><span class="wa-ic">✆</span><span class="wa-txt"><b>Chat With Our Specialist</b><i>Available 24/7</i></span></a>`;
    document.body.insertAdjacentHTML("afterbegin", nav);
    document.body.insertAdjacentHTML("beforeend", footerHTML());
    document.body.insertAdjacentHTML("beforeend", '<div class="toast-box"></div>');
    el("waFloat").href = wa("Hi! I have a question about your peptides.");
    el("curBtn").onclick = e => toggleCur(e.target);
    renderCartCount();
    socialProof();
    exitPopup();
  };

  /* ================= Export ================= */
  window.PP = {
    C, Store, byId, cur, fmt, rate, perBox, unitPrice, cartSub, couponOff,
    addToCart, renderCartCount, toast, cardHTML, gridHTML, bindCards, buildOrder, checkOut,
    renderShell, freeShipPercent, wa, waText, money, emojiFor, reconFor,
    el, qs, qsa
  };

  document.addEventListener("DOMContentLoaded", () => {
    renderShell();
    if (window.Page) window.Page.init();
  });
})();
