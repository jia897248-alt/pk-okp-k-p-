// 反馈组件：所有页面底部注入反馈入口 + 弹出式表单
(function () {
  var CSS = `
#fb-trigger{position:fixed;bottom:84px;right:20px;z-index:90;background:var(--accent,#22c55e);color:#06240f;border:none;border-radius:40px;padding:11px 18px;font-weight:700;font-size:13px;box-shadow:0 8px 24px rgba(0,0,0,.4);cursor:pointer;display:flex;align-items:center;gap:7px;transition:.2s}
#fb-trigger:hover{transform:translateY(-2px);filter:brightness(1.08)}
#fb-overlay{position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:95;display:none;align-items:flex-end;justify-content:center}
#fb-overlay.open{display:flex}
#fb-panel{width:100%;max-width:440px;background:var(--panel,#111820);border:1px solid var(--line,#223042);border-radius:18px 18px 0 0;padding:22px;max-height:88vh;overflow-y:auto;box-shadow:0 -10px 40px rgba(0,0,0,.5)}
#fb-panel h3{margin:0 0 4px;font-size:17px}
#fb-panel .fb-sub{color:var(--muted,#8fa1b3);font-size:12.5px;margin-bottom:16px}
#fb-panel label{display:block;font-size:12px;font-weight:700;color:var(--muted,#8fa1b3);margin:12px 0 5px;text-transform:uppercase;letter-spacing:.5px}
#fb-panel input,#fb-panel select,#fb-panel textarea{width:100%;background:var(--bg2,#0e141b);border:1px solid var(--line,#223042);color:var(--text,#e8eef5);border-radius:9px;padding:9px 11px;font-size:13.5px;font-family:inherit}
#fb-panel textarea{min-height:90px;resize:vertical}
#fb-stars{display:flex;gap:4px;font-size:22px;cursor:pointer}
#fb-stars span{filter:grayscale(1);opacity:.5;transition:.15s}
#fb-stars span.on{filter:none;opacity:1}
#fb-close{position:absolute;top:14px;right:16px;background:none;border:none;color:var(--muted,#8fa1b3);font-size:20px;cursor:pointer}
#fb-panel{position:relative}
.fb-row{display:flex;gap:10px}
.fb-row>div{flex:1}
#fb-send{width:100%;margin-top:16px;background:var(--accent,#22c55e);color:#06240f;border:none;border-radius:10px;padding:12px;font-weight:800;font-size:14px;cursor:pointer}
#fb-send:hover{filter:brightness(1.1)}
#fb-msg{margin-top:12px;font-size:13px;display:none;border-radius:8px;padding:9px 11px}
#fb-msg.ok{display:block;background:rgba(34,197,94,.15);color:#4ade80}
#fb-msg.err{display:block;background:rgba(239,68,68,.15);color:#f87171}
@media (min-width:480px){#fb-overlay{align-items:center;justify-content:flex-end;padding:20px}#fb-panel{border-radius:18px}}
`;

  function injectStyles() {
    var s = document.createElement("style");
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function render() {
    var t = document.createElement("div");
    t.id = "fb-root";
    t.innerHTML = `
<button id="fb-trigger">💬 Feedback</button>
<div id="fb-overlay">
  <div id="fb-panel">
    <button id="fb-close">✕</button>
    <h3>How can we improve?</h3>
    <div class="fb-sub">Found a bug, want a product, or have feedback? Tell us — it takes 10 seconds.</div>
    <label>Your rating</label>
    <div id="fb-stars"><span data-v="1">★</span><span data-v="2">★</span><span data-v="3">★</span><span data-v="4">★</span><span data-v="5">★</span></div>
    <div class="fb-row">
      <div><label>Name (optional)</label><input id="fb-name" maxlength="80" placeholder="Your name"></div>
      <div><label>Contact (optional)</label><input id="fb-contact" maxlength="120" placeholder="WhatsApp or email"></div>
    </div>
    <label>Type</label>
    <select id="fb-type">
      <option value="general">General feedback</option>
      <option value="bug">Bug report</option>
      <option value="product">Product request</option>
      <option value="shipping">Shipping / order</option>
      <option value="suggestion">Suggestion</option>
    </select>
    <label>Message</label>
    <textarea id="fb-message" maxlength="2000" placeholder="Tell us what happened or what you'd like..."></textarea>
    <button id="fb-send">Send feedback</button>
    <div id="fb-msg"></div>
  </div>
</div>`;
    document.body.appendChild(t);

    var overlay = t.querySelector("#fb-overlay");
    var trigger = t.querySelector("#fb-trigger");
    var close = t.querySelector("#fb-close");
    var stars = t.querySelectorAll("#fb-stars span");
    var rating = 5;

    trigger.onclick = function () { overlay.classList.add("open"); };
    close.onclick = function () { overlay.classList.remove("open"); };
    overlay.onclick = function (e) { if (e.target === overlay) overlay.classList.remove("open"); };

    stars.forEach(function (s) {
      s.onclick = function () {
        rating = parseInt(s.dataset.v, 10);
        stars.forEach(function (x) { x.classList.toggle("on", parseInt(x.dataset.v, 10) <= rating); });
      };
    });
    stars.forEach(function (x, i) { if (i < 4) x.classList.add("on"); });

    t.querySelector("#fb-send").onclick = async function () {
      var msg = document.getElementById("fb-msg");
      var message = document.getElementById("fb-message").value.trim();
      if (!message) {
        msg.className = "err"; msg.textContent = "Please write a message first.";
        return;
      }
      var btn = this;
      btn.disabled = true; btn.textContent = "Sending…";
      try {
        var res = await fetch("/api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: document.getElementById("fb-name").value.trim(),
            email: document.getElementById("fb-contact").value.trim(),
            rating: rating,
            type: document.getElementById("fb-type").value,
            message: message,
            page: location.pathname + location.search,
          }),
        });
        var data = await res.json();
        if (data.ok) {
          msg.className = "ok"; msg.textContent = "Thanks! Your feedback has been sent.";
          document.getElementById("fb-message").value = "";
          setTimeout(function () { overlay.classList.remove("open"); msg.className = "err"; msg.style.display = "none"; msg.textContent = ""; }, 1600);
        } else {
          msg.className = "err"; msg.textContent = data.error || "Something went wrong. Try again.";
        }
      } catch (e) {
        msg.className = "err"; msg.textContent = "Network error. Please try again.";
      }
      btn.disabled = false; btn.textContent = "Send feedback";
    };
  }

  injectStyles();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();
