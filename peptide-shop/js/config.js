window.CONFIG = {
  // ============ 真实号码（国际格式，去掉+号）============
  WHATSAPP: "639606355653", // Rena Jin（所有下单/咨询入口统一走此号码直接对话，不再经二维码）
  EMAIL: "putraaudioppsn@gmail.com",

  // 定价口径：产品价格总表 6 个源取中间值(中位数) × 1.15 作为划线公示价，再立减 8.8% 作为成交价；
  // NEW95 / EURASIA5 在成交价之上再叠加。
  // 币种：仅 USD（其他币种均折算 USD）
  CURRENCIES: { USD: { sym: "$", label: "USD" } },

  // 运费：满 $666 免邮；未满按 SHIPPING_FLAT 计（占位，请改成真实运费）
  FREE_SHIPPING: 666,
  SHIPPING_FLAT: 25,

  // 优惠券：NEW95 新客95折 / EURASIA5 欧美及东南亚额外5%
  COUPONS: {
    NEW95: { off: 0.05, label: "New customer 5% OFF (95折)" },
    EURASIA5: { off: 0.05, label: "EU / US / SE Asia extra 5% OFF" }
  },
  EXIT_COUPON: "NEW95",

  // 组合套餐：不设虚构折扣，量大价优按量议价
  BUNDLES: [
    {
      id: "starter",
      name: "Starter Kit",
      tag: "For First Timers",
      desc: "Everything to start safely: 1 box Tirzepatide 5mg + 1 box BAC water.",
      products: ["TR5-5mg", "WA10-10ml"],
      bonus: "1 box = wholesale price · ask us for the best deal"
    },
    {
      id: "cycle8",
      name: "8-Week Fat Loss Cycle",
      tag: "Best Value",
      desc: "The stack our repeat customers order most: Retatrutide 20mg + Cagrilintide 5mg + Lipo-C.",
      products: ["RT20-20mg", "CGL5-5mg", "LC216-10ml"],
      bonus: "Bigger order = better price · ask for bulk rate"
    },
    {
      id: "glow",
      name: "Glow Rejuvenation",
      tag: "Skin & Repair",
      desc: "GLOW (BPC-157 + TB500 + GHK-CU) + KPV for the complete skin & tissue repair protocol.",
      products: ["GLOW-70mg", "KPV10-10mg"],
      bonus: "Bulk pricing available — message us"
    },
    {
      id: "growth",
      name: "Muscle Growth Stack",
      tag: "For Builders",
      desc: "Ipamorelin 5mg + CJC-1295 (no DAC) 5mg + HGH Fragment 176-191 2mg.",
      products: ["IP5-5mg", "CND5-5mg", "FR2-2mg"],
      bonus: "1 box = wholesale price · ask for the best deal"
    }
  ],

  // 营销钩子（TR30 专属 + 全站通用），中文版用于落地页文案
  HOOK: {
    en: "1 box = wholesale price · bigger orders = better price · 💬 tap chat for your real deal price",
    tr30En: "Not <b>$109</b> · Not <b>$99</b> · Not <b>$89</b> — TR30 30mg at real wholesale price. Tap chat for your best deal.",
    zh: "一盒也是批发价 · 采购越多价格越给力 · 点击对话框获取真实成交底价",
    tr30Zh: "不是 $109、不是 $99、不是 $89 —— TR30 30mg 一盒只要批发价，点击对话框获取真实成交底价"
  },

  // 复配/用量说明：按产品名关键字匹配。源自真实客户沟通中客户认可的口径（Reta15 = 15mg + 3ml BAC = 5mg/ml 等）。
  RECON: [
    {
      match: ["retatrutide"],
      title: "Retatrutide — reconstitution & dosing",
      recon: [
        "15mg vial + 3ml bacteriostatic water = 5mg per ml.",
        "Inject the water slowly along the vial wall, swirl gently to dissolve — do NOT shake hard.",
        "Store in the fridge after mixing; finish within 28 days."
      ],
      dose: [
        "Start at 50 units once a week.",
        "Adjust up or down based on your body's reaction."
      ],
      note: "General guidance for reference — confirm with a nurse or pharmacist before use."
    },
    {
      match: ["tirzepatide"],
      title: "Tirzepatide — reconstitution & dosing",
      recon: [
        "Typical: add 2ml bacteriostatic water per 10mg vial = 5mg per ml.",
        "Inject the water slowly along the vial wall, swirl gently to dissolve — do NOT shake hard.",
        "Store in the fridge after mixing; finish within 28 days."
      ],
      dose: [
        "Start low and titrate up gradually.",
        "Typical weekly dosing: begin ~2.5mg, increase slowly over weeks."
      ],
      note: "General guidance for reference — confirm with a nurse or pharmacist before use."
    },
    {
      match: ["semaglutide", "cagrilintide", "cagri", "liraglutide", "mazdutide", "survodutide", "glp-1"],
      title: "GLP-1 peptides — reconstitution & dosing",
      recon: [
        "Typical: add 2ml bacteriostatic water per 10mg vial = 5mg per ml.",
        "Inject water slowly along the vial wall, swirl gently — do NOT shake.",
        "Refrigerate after mixing; finish within 28 days."
      ],
      dose: [
        "Start at the lowest dose, titrate up slowly.",
        "Your exact schedule depends on the specific product and your response."
      ],
      note: "General guidance for reference — confirm with a nurse or pharmacist before use."
    },
    {
      match: ["glow", "klow", "bpc", "tb-500", "tb500", "ss-31", "ll-37", "kpv", "ara", "thymosin"],
      title: "Repair & healing peptides — reconstitution & dosing",
      recon: [
        "Typical: add 1–2ml bacteriostatic water per vial.",
        "Inject water slowly, swirl gently — do NOT shake.",
        "Refrigerate after mixing; use within 28 days."
      ],
      dose: [
        "Typical doses are low and often split into daily shots.",
        "Adjust slowly based on your response."
      ],
      note: "General guidance for reference — confirm with a nurse or pharmacist before use."
    },
    {
      match: ["ghk", "ahk"],
      title: "GHK-Cu / AHK-Cu — reconstitution & dosing",
      recon: [
        "GHK-Cu 100mg vial + ~2ml bacteriostatic water (or 10ml BAC bottle for more dilution).",
        "Inject water slowly, swirl gently until fully dissolved.",
        "Refrigerate after mixing; use within 28 days."
      ],
      dose: [
        "Typical doses are low (mg range) — split into small daily or every-other-day shots.",
        "Dose depends on your goal; adjust slowly."
      ],
      note: "General guidance for reference — confirm with a nurse or pharmacist before use."
    },
    {
      match: ["tesamorelin", "tesa"],
      title: "Tesamorelin — reconstitution & dosing",
      recon: [
        "Typical: add 2ml bacteriostatic water per 5mg vial = 2.5mg per ml.",
        "Inject water slowly, swirl gently — do NOT shake.",
        "Refrigerate after mixing; finish within 28 days."
      ],
      dose: [
        "Typical daily dose ~2mg, injected once a day.",
        "Adjust based on response; cycle as advised."
      ],
      note: "General guidance for reference — confirm with a nurse or pharmacist before use."
    },
    {
      match: ["glutathione", "gtt"],
      title: "Glutathione — reconstitution & dosing",
      recon: [
        "Reconstitute with bacteriostatic water — typical 7.5ml BAC per vial.",
        "Inject water slowly, swirl gently until dissolved.",
        "Refrigerate after mixing; use within 28 days."
      ],
      dose: [
        "Typical dosing in the 600–1500mg range per shot, 1–2x per week.",
        "Adjust slowly based on response."
      ],
      note: "General guidance for reference — confirm with a nurse or pharmacist before use."
    },
    {
      match: ["ipamorelin", "cjc", "sermorelin", "ghrp", "hexarelin", "fragment", "igf", "mgf", "hmg", "somatropin", "hgh", "hcg", "epo", "follistatin", "ace-031"],
      title: "Growth, GH & gonadotropins — reconstitution & dosing",
      recon: [
        "Typical: add 2ml bacteriostatic water per 5mg vial = 2.5mg per ml (follow the specific product's ratio).",
        "Inject water slowly, swirl gently — do NOT shake.",
        "Refrigerate after mixing; finish within 28 days."
      ],
      dose: [
        "Usually small daily doses (mcg–iu range), typically before bed or as advised.",
        "Adjust based on response; cycle as advised."
      ],
      note: "General guidance for reference — confirm with a nurse or pharmacist before use."
    },
    {
      match: ["semax", "selank", "oxytocin", "dsip", "5-amino", "pinealon", "epithalon", "cerebrolysin", "melatonin", "foxo"],
      title: "Nootropics & mood peptides — reconstitution & dosing",
      recon: [
        "Typical: add 1–2ml bacteriostatic water per vial.",
        "Inject water slowly, swirl gently — do NOT shake.",
        "Refrigerate after mixing; use within 28 days."
      ],
      dose: [
        "Small doses, often daily or as advised.",
        "Adjust slowly based on response."
      ],
      note: "General guidance for reference — confirm with a nurse or pharmacist before use."
    },
    {
      match: ["bac water", "acetic", "benzyl alcohol"],
      title: "Diluent & solvents — ready to use",
      recon: [
        "This is the diluent used to reconstitute lyophilized peptide vials.",
        "No mixing required — use directly to dissolve your peptide powder."
      ],
      dose: [
        "Use the amount given in each peptide's recon instruction (e.g. 3ml per 15mg Retatrutide vial).",
        "Keep refrigerated after opening."
      ],
      note: "General guidance for reference."
    },
    {
      match: ["b12", "l-carnitine", "lipo", "mk-677", "insulin", "lemon bottle", "humanin", "hyaluronic", "botulinum", "cartalax", "healthy hair"],
      title: "Pre-mixed & specialty — no recon needed",
      recon: [
        "This product is sold ready-to-use as a liquid / oral / cosmetic.",
        "No mixing required — keep refrigerated as labeled and use by the date."
      ],
      dose: [
        "Follow the label / as advised — this varies by product.",
        "Confirm with a nurse or pharmacist before use."
      ],
      note: "General guidance for reference."
    }
  ],

  // 兜底复配说明（未匹配到具体品类的通用冻干肽）
  RECON_DEFAULT: {
    match: [],
    title: "Lyophilized peptide — general reconstitution & dosing",
    recon: [
      "Typical: add 1–2ml bacteriostatic water per vial.",
      "Inject water slowly along the vial wall, swirl gently — do NOT shake.",
      "Refrigerate after mixing; use within 28 days."
    ],
    dose: [
      "Start at the lowest dose, titrate up slowly.",
      "Adjust based on your response; confirm with a nurse or pharmacist."
    ],
    note: "General guidance for reference — confirm with a nurse or pharmacist before use."
  }
};
