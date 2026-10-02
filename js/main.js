(function () {
  "use strict";

  const root = document.documentElement;
  const progress = document.getElementById("progress");
  const toTop = document.getElementById("to-top");
  const themeBtn = document.getElementById("theme-toggle");
  const tocToggle = document.getElementById("toc-toggle");
  const tocDrawer = document.getElementById("toc-drawer");
  const tocClose = document.getElementById("toc-close");

  // Theme
  const saved = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  root.setAttribute("data-theme", saved || (prefersDark ? "dark" : "light"));
  function syncThemeLabel() {
    if (!themeBtn) return;
    const dark = root.getAttribute("data-theme") === "dark";
    themeBtn.setAttribute("aria-label", dark ? "切换浅色模式" : "切换深色模式");
    themeBtn.textContent = dark ? "☀️" : "🌙";
  }
  syncThemeLabel();
  themeBtn?.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    syncThemeLabel();
  });

  // Reading progress + back to top
  function onScroll() {
    const doc = document.documentElement;
    const scrollable = doc.scrollHeight - doc.clientHeight;
    const pct = scrollable > 0 ? (doc.scrollTop / scrollable) * 100 : 0;
    if (progress) progress.style.width = pct + "%";
    if (toTop) toTop.classList.toggle("show", doc.scrollTop > 400);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  toTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  // Mobile TOC drawer
  function openToc() {
    tocDrawer?.classList.add("open");
    tocDrawer?.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeToc() {
    tocDrawer?.classList.remove("open");
    tocDrawer?.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
  tocToggle?.addEventListener("click", openToc);
  tocClose?.addEventListener("click", closeToc);
  tocDrawer?.querySelector(".toc-drawer-backdrop")?.addEventListener("click", closeToc);
  tocDrawer?.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeToc));

  // Active TOC highlight
  const tocLinks = Array.from(document.querySelectorAll(".toc a, .toc-drawer-panel a"));
  const sections = tocLinks
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);
  function highlightToc() {
    let current = sections[0];
    const y = window.scrollY + 80;
    for (const s of sections) {
      if (s.offsetTop <= y) current = s;
    }
    tocLinks.forEach((a) => {
      a.classList.toggle("active", a.getAttribute("href") === "#" + current?.id);
    });
  }
  window.addEventListener("scroll", highlightToc, { passive: true });
  highlightToc();

  // Copy buttons
  document.querySelectorAll(".pre-wrap").forEach((wrap) => {
    const pre = wrap.querySelector("pre");
    if (!pre) return;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "copy-btn";
    btn.textContent = "复制";
    btn.setAttribute("aria-label", "复制代码");
    btn.addEventListener("click", async () => {
      const text = pre.innerText;
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
      }
      btn.textContent = "已复制";
      btn.classList.add("copied");
      setTimeout(() => {
        btn.textContent = "复制";
        btn.classList.remove("copied");
      }, 1600);
    });
    wrap.appendChild(btn);
  });

  // “我应该用哪个？” selector
  const result = document.getElementById("selector-result");
  const resultText = document.getElementById("selector-result-text");
  const map = {
    office: {
      title: "建议：继续用 WorkBuddy + DeepSeek",
      body: "日常办公、写文案、整理资料，先把 WorkBuddy 用熟就够了。下面从「已内置怎么用」开始。",
      href: "#builtin",
    },
    coding: {
      title: "建议：了解 PI-Desktop",
      body: "如果你以后主要写代码、要更强的 Agent / 多模型，可以看「何时装 PI-Desktop」。小白请先把 WorkBuddy 跑通。",
      href: "#pi-desktop",
    },
    harness: {
      title: "建议：了解 DeepSeek Harness",
      body: "想用官方 Agent 工作流时再看 Harness。不是必须安装，先完成 WorkBuddy 主线。",
      href: "#harness",
    },
    first: {
      title: "建议：先留在 WorkBuddy",
      body: "第一次用就选这条：别急着装别的。按首页「已有 WorkBuddy 直接开始」往下走就行。",
      href: "#builtin",
    },
  };
  document.querySelectorAll("[data-selector]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-selector]").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const key = btn.getAttribute("data-selector");
      const item = map[key];
      if (!item || !result || !resultText) return;
      resultText.innerHTML =
        "<strong>" +
        item.title +
        "</strong><p>" +
        item.body +
        '</p><p><a class="btn" href="' +
        item.href +
        '">下一步</a></p>';
      result.classList.add("show");
      result.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  });
})();
