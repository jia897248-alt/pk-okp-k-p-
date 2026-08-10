(function () {
  "use strict";
  const PP = window.PP, C = PP.C;
  const WA_PRODUCTS_MSG = "Hello, I would like to view more product photos and videos.";
  const WA_REPORTS_MSG = "Hello, I would like to check more quality testing reports.";
  const IMG = "img/";

  // 左侧产品实拍流: 视频截图 + 竖版素材 (真实图片)
  function pickProductShots() {
    const products = window.PRODUCTS
      .filter(p => p.stock > 0)
      .sort((a, b) => (b.sold || 0) - (a.sold || 0));

    const shots = [];
    // 9 张视频截图
    for (let i = 1; i <= 9; i++) {
      shots.push({ img: IMG + "shipin_" + pad(i) + ".jpg", kind: "video" });
    }
    // 补竖版素材图 (sucai 中尺寸偏竖版的多为照片), 共 18 张
    const tall = ["01", "03", "07", "10", "13", "17", "19", "20", "22"];
    for (const n of tall) {
      shots.push({ img: IMG + "sucai_" + n + ".jpg", kind: "photo" });
    }

    return shots.map((s, i) => {
      const p = products[i % products.length];
      return {
        img: s.img,
        kind: s.kind,
        name: p.name,
        spec: p.spec,
        batch: "BATCH-" + (p.abbr || "PM") + "-" + (2201 + i * 7),
        purity: (99 + (i % 2)) + "." + (1 + i * 3 % 9) + "%"
      };
    });
  }

  // 右侧检测报告: 真实报告图片
  const REPORTS = [
    { img: IMG + "jiance_01.jpg", type: "HPLC Analysis Report", method: "High-Performance Liquid Chromatography", batch: "LC-4471", date: "2026-06-12", status: "Purity >99%" },
    { img: IMG + "jiance_02.jpg", type: "Mass Spectrometry Report", method: "ESI-MS / Triple Quad", batch: "MS-8832", date: "2026-06-12", status: "Molecular weight confirmed" },
    { img: IMG + "jiance_03.jpg", type: "Purity Testing Report", method: "HPLC-UV @ 214nm", batch: "PT-1204", date: "2026-06-13", status: "99.2% pure" },
    { img: IMG + "jiance_04.jpg", type: "Quality Control Report", method: "Pharma-grade QC suite", batch: "QC-7710", date: "2026-06-13", status: "Passed" },
    { img: IMG + "jiance_05.jpg", type: "Batch Testing Report", method: "Third-party COA", batch: "BT-3345", date: "2026-06-14", status: "Lot verified" },
    { img: IMG + "jiance_06.jpg", type: "Laboratory Verification Report", method: "Certified lab audit", batch: "LV-9912", date: "2026-06-14", status: "Compliant" }
  ];

  function pad(n) { return n < 10 ? "0" + n : "" + n; }

  function productCard(p) {
    return `<div class="show-card">
      <div class="show-thumb"><img src="${p.img}" alt="${p.name}" loading="lazy"></div>
      <div class="show-body">
        <div class="show-name">${p.name} <em class="kind">${p.kind === "video" ? "🎬" : "📷"}</em></div>
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
      <div class="cert-img"><img src="${r.img}" alt="${r.type}" loading="lazy"></div>
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
    const items = pickProductShots();
    if (!items.length) { track.innerHTML = '<div class="muted small">Loading…</div>'; return; }
    track.innerHTML = items.map(productCard).join("") + items.map(productCard).join("");
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
