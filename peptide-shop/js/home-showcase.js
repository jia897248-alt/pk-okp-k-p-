(function () {
  "use strict";
  const PP = window.PP, C = PP.C;
  const WA_PRODUCTS_MSG = "Hello, I would like to view more product photos and videos.";
  const WA_REPORTS_MSG = "Hello, I would like to check more quality testing reports.";

  // 精选产品（有真实库存、销量高的），模拟“产品实拍”卡片
  function pickProducts() {
    const list = window.PRODUCTS
      .filter(p => p.stock > 0)
      .sort((a, b) => (b.sold || 0) - (a.sold || 0))
      .slice(0, 8);
    return list.map((p, i) => ({
      id: p.id,
      name: p.name,
      spec: p.spec,
      batch: "BATCH-" + (p.abbr || "PM") + "-" + (2201 + i * 7),
      purity: (99 + (i % 2)) + "." + (1 + i * 3 % 9) + "%",
      status: i % 3 === 0 ? "Passed" : "Verified",
      emoji: PP.emojiFor(p.name),
      sold: p.sold,
      stock: p.stock
    }));
  }

  // 检测报告
  const REPORTS = [
    { type: "HPLC Analysis Report", method: "High-Performance Liquid Chromatography", batch: "LC-4471", date: "2026-06-12", status: "Purity >99%" },
    { type: "Mass Spectrometry Report", method: "ESI-MS / Triple Quad", batch: "MS-8832", date: "2026-06-12", status: "Molecular weight confirmed" },
    { type: "Purity Testing Report", method: "HPLC-UV @ 214nm", batch: "PT-1204", date: "2026-06-13", status: "99.2% pure" },
    { type: "Quality Control Report", method: "Pharma-grade QC suite", batch: "QC-7710", date: "2026-06-13", status: "Passed" },
    { type: "Batch Testing Report", method: "Third-party COA", batch: "BT-3345", date: "2026-06-14", status: "Lot verified" },
    { type: "Laboratory Verification Report", method: "Certified lab audit", batch: "LV-9912", date: "2026-06-14", status: "Compliant" }
  ];

  function productCard(p) {
    return `<div class="show-card">
      <div class="show-thumb">${p.emoji}</div>
      <div class="show-body">
        <div class="show-name">${p.name}</div>
        <div class="show-spec">${p.spec}</div>
        <div class="show-lines">
          <span><b>Batch</b> ${p.batch}</span>
          <span><b>Purity</b> <em class="ok">${p.purity}</em></span>
        </div>
        <div class="show-tag ok">✓ Quality Tested</div>
      </div>
    </div>`;
  }

  function reportCard(r, i) {
    return `<div class="cert-card">
      <div class="cert-top"><div class="cert-ic">📄</div><span class="cert-type">${r.type}</span></div>
      <div class="cert-method">${r.method}</div>
      <div class="cert-meta">
        <span>Batch <b>${r.batch}</b></span>
        <span>Verified ${r.date}</span>
      </div>
      <div class="cert-status ok">✓ ${r.status}</div>
    </div>`;
  }

  function buildShowreel() {
    const track = PP.el("showreelTrack");
    if (!track) return;
    const items = pickProducts();
    if (!items.length) { track.innerHTML = '<div class="muted small">Loading…</div>'; return; }
    track.innerHTML = items.map(productCard).join("");
    // 复制一份用于无缝循环
    track.innerHTML += items.map(productCard).join("");
    // 悬停暂停
    track.parentElement.addEventListener("mouseenter", () => track.style.animationPlayState = "paused");
    track.parentElement.addEventListener("mouseleave", () => track.style.animationPlayState = "running");
  }

  function buildCertreel() {
    const track = PP.el("certreelTrack");
    if (!track) return;
    track.innerHTML = REPORTS.map(reportCard).join("") + REPORTS.map(reportCard).join("");
    track.parentElement.addEventListener("mouseenter", () => track.style.animationPlayState = "paused");
    track.parentElement.addEventListener("mouseleave", () => track.style.animationPlayState = "running");
  }

  function bindCtas() {
    const c1 = PP.el("showreelCta");
    if (c1) { c1.href = PP.waText(WA_PRODUCTS_MSG); c1.rel = "noopener"; }
    const c2 = PP.el("certCta");
    if (c2) { c2.href = PP.waText(WA_REPORTS_MSG); c2.rel = "noopener"; }
    const h = PP.el("heroWa");
    if (h) { h.href = PP.waText("Hello, I would like to know more about your peptides and wholesale prices."); h.rel = "noopener"; }
  }

  window.Showcase = {
    init() {
      buildShowreel();
      buildCertreel();
      bindCtas();
    }
  };
})();
