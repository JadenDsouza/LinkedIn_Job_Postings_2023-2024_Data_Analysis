(function () {
  "use strict";
  const D = window.DASHBOARD_DATA;
  const tooltip = document.getElementById("tooltip");

  // ---------- Theme ----------
  const THEME_KEY = "linkedin-dashboard-theme";
  const themeBtn = document.getElementById("theme-toggle");
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    themeBtn.textContent = theme === "dark" ? "Light mode" : "Dark mode";
  }
  function initTheme() {
    let saved = "dark";
    try {
      saved = localStorage.getItem(THEME_KEY) || "dark";
    } catch (e) {}
    applyTheme(saved);
  }
  themeBtn.addEventListener("click", function () {
    const current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
    try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
  });
  initTheme();

  // ---------- Formatters ----------
  const fmtInt = (n) => n.toLocaleString("en-US");
  const fmtUsd = (n) => "$" + Math.round(n).toLocaleString("en-US");
  const fmtPct = (n) => n.toFixed(1) + "%";

  // ---------- Tooltip helpers ----------
  function showTooltip(evt, html) {
    tooltip.innerHTML = html;
    tooltip.style.display = "block";
    positionTooltip(evt);
  }
  function positionTooltip(evt) {
    const pad = 14;
    let x = evt.clientX + pad;
    let y = evt.clientY + pad;
    if (x + 220 > window.innerWidth) x = evt.clientX - 220;
    tooltip.style.left = x + "px";
    tooltip.style.top = y + "px";
  }
  function hideTooltip() { tooltip.style.display = "none"; }

  // ---------- Generic horizontal bar chart ----------
  // data: [{label, value, tooltip, warning}]
  function renderHBarChart(svgEl, data, opts) {
    opts = opts || {};
    const valueFmt = opts.valueFmt || fmtInt;
    const labelWidth = opts.labelWidth || 46;
    const rowHeight = opts.rowHeight || 20;
    const gap = 6;
    const padTop = 10, padRight = opts.padRight || 84;
    const width = svgEl.clientWidth || 560;
    const height = data.length * (rowHeight + gap) + padTop;
    svgEl.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svgEl.setAttribute("height", height);
    svgEl.innerHTML = "";

    const maxVal = Math.max(...data.map((d) => d.value), 1);
    const barAreaWidth = width - labelWidth - padRight;

    data.forEach((d, i) => {
      const y = padTop + i * (rowHeight + gap);
      const barW = Math.max((d.value / maxVal) * barAreaWidth, 2);

      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("x", labelWidth - 8);
      label.setAttribute("y", y + rowHeight / 2 + 4);
      label.setAttribute("text-anchor", "end");
      label.setAttribute("class", "bar-label");
      label.textContent = d.label;
      svgEl.appendChild(label);

      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", labelWidth);
      rect.setAttribute("y", y);
      rect.setAttribute("width", barW);
      rect.setAttribute("height", rowHeight);
      rect.setAttribute("rx", 4);
      rect.setAttribute("class", "bar-rect" + (d.warning ? " warning" : ""));
      svgEl.appendChild(rect);

      const valueLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
      valueLabel.setAttribute("x", labelWidth + barW + 8);
      valueLabel.setAttribute("y", y + rowHeight / 2 + 4);
      valueLabel.setAttribute("class", "bar-value");
      valueLabel.textContent = valueFmt(d.value);
      svgEl.appendChild(valueLabel);

      const hitArea = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      hitArea.setAttribute("x", labelWidth);
      hitArea.setAttribute("y", y - gap / 2);
      hitArea.setAttribute("width", barAreaWidth + padRight);
      hitArea.setAttribute("height", rowHeight + gap);
      hitArea.setAttribute("fill", "transparent");
      hitArea.style.cursor = "pointer";
      hitArea.addEventListener("mouseenter", () => rect.classList.add("hovered"));
      hitArea.addEventListener("mouseleave", () => { rect.classList.remove("hovered"); hideTooltip(); });
      hitArea.addEventListener("mousemove", (evt) => {
        showTooltip(evt, d.tooltip || `<b>${d.label}</b><br>${valueFmt(d.value)}`);
      });
      svgEl.appendChild(hitArea);
    });
  }

  // ---------- KPIs ----------
  function renderKpis() {
    const remotePct = (D.remote.remoteCount / D.remote.total) * 100;
    const kpis = [
      { label: "Total postings", value: fmtInt(D.meta.totalPostings) },
      { label: "US states covered", value: String(D.stateCounts.length) },
      { label: "Remote-friendly", value: fmtPct(remotePct) },
      { label: "Median annual salary", value: fmtUsd(D.salary.median) },
      { label: "Avg. description length", value: Math.round(D.descriptionWordCount.mean) + " words" },
    ];
    const grid = document.getElementById("kpi-grid");
    grid.innerHTML = kpis.map((k) => `
      <div class="kpi-tile">
        <div class="value">${k.value}</div>
        <div class="label">${k.label}</div>
      </div>
    `).join("");
  }

  // ---------- Data quality panel ----------
  function renderDataQuality() {
    const panel = document.getElementById("dq-panel");
    const iconFor = { critical: "!", moderate: "▲", minor: "✓" };
    panel.innerHTML = D.dataQualityFlags.map((f) => `
      <div class="dq-item">
        <div class="dq-icon ${f.severity}">${iconFor[f.severity] || "i"}</div>
        <div>
          <div class="dq-title">${f.title}<span class="dq-severity">${f.severity}</span></div>
          <div class="dq-detail">${f.detail}</div>
        </div>
      </div>
    `).join("");
  }

  // ---------- State chart + slicers ----------
  let stateSearch = "";
  let topN = 15;
  function filteredStates() {
    let rows = D.stateCounts.slice();
    if (stateSearch.trim()) {
      const q = stateSearch.trim().toUpperCase();
      rows = rows.filter((r) => r[0].includes(q));
    }
    rows.sort((a, b) => b[1] - a[1]);
    return rows.slice(0, topN);
  }
  function renderStateChart() {
    const rows = filteredStates();
    const totalSelected = rows.reduce((s, r) => s + r[1], 0);
    document.getElementById("state-filter-summary").textContent =
      rows.length + " states shown · " + fmtInt(totalSelected) + " postings";
    renderHBarChart(document.getElementById("state-chart"), rows.map(([state, count]) => ({
      label: state,
      value: count,
      tooltip: `<b>${state}</b><br>${fmtInt(count)} postings<br>${((count / D.meta.totalPostings) * 100).toFixed(1)}% of total`,
    })), { valueFmt: fmtInt });
  }

  // ---------- Salary & description charts ----------
  function renderSalaryChart() {
    const s = D.salary;
    renderHBarChart(document.getElementById("salary-chart"), [
      { label: "P25", value: s.p25, tooltip: `<b>25th percentile</b><br>${fmtUsd(s.p25)}` },
      { label: "Median", value: s.median, tooltip: `<b>Median</b><br>${fmtUsd(s.median)}` },
      { label: "P75", value: s.p75, tooltip: `<b>75th percentile</b><br>${fmtUsd(s.p75)}` },
    ], { valueFmt: fmtUsd, labelWidth: 68 });
  }
  function renderDescChart() {
    const w = D.descriptionWordCount;
    renderHBarChart(document.getElementById("desc-chart"), [
      { label: "P25", value: w.p25, tooltip: `<b>25th percentile</b><br>${w.p25} words` },
      { label: "Median", value: w.median, tooltip: `<b>Median</b><br>${w.median} words` },
      { label: "P75", value: w.p75, tooltip: `<b>75th percentile</b><br>${w.p75} words` },
    ], { valueFmt: (n) => n + "w", labelWidth: 68 });
  }

  // ---------- Keywords ----------
  function renderKeywordChart(source) {
    const rows = D.keywords[source];
    renderHBarChart(document.getElementById("keyword-chart"), rows.map(([word, count]) => ({
      label: word,
      value: count,
      tooltip: `<b>${word}</b><br>${fmtInt(count)} occurrences`,
    })), { valueFmt: fmtInt, labelWidth: 128 });
  }

  // ---------- Segmentation ----------
  function renderSegments() {
    const grid = document.getElementById("segment-grid");
    grid.innerHTML = D.segmentation.clusters.map((c) => `
      <div class="segment-card ${c.corrupted ? "flagged" : ""}">
        <div class="seg-title">Cluster ${c.id} — ${c.label} ${c.corrupted ? '<span class="seg-flag">data quality</span>' : ""}</div>
        <div class="seg-metric"><span>Avg. salary</span><b>${fmtUsd(c.avgSalary)}</b></div>
        <div class="seg-metric"><span>Avg. views</span><b>${c.avgViews}</b></div>
        <div class="seg-metric"><span>Remote share</span><b>${fmtPct(c.remoteShare * 100)}</b></div>
      </div>
    `).join("");
  }

  // ---------- Model ----------
  function renderModel() {
    const m = D.model;
    document.getElementById("model-result-list").innerHTML = `
      <li>Features: ${m.features.join(", ")}</li>
      <li>Mean squared error: ${fmtInt(Math.round(m.mse))}</li>
      <li>R² score: ${m.r2.toFixed(2)}</li>
      <li>Interpretation: engagement metrics alone barely explain salary variance — this is a genuine finding, not a bug. Adding title/seniority/state features would meaningfully improve the model.</li>
    `;
    renderHBarChart(document.getElementById("model-chart"), m.importance.map(([feat, coef]) => ({
      label: feat,
      value: Math.abs(coef),
      warning: coef < 0,
      tooltip: `<b>${feat}</b><br>coefficient: ${coef.toFixed(2)}`,
    })), { valueFmt: (n) => n.toFixed(0), labelWidth: 90 });
  }

  // ---------- Insights / Recommendations ----------
  function renderTextLists() {
    document.getElementById("insights-list").innerHTML = D.insights.map((t) => `<li>${t}</li>`).join("");
    document.getElementById("recommendations-list").innerHTML = D.recommendations.map((t) => `<li>${t}</li>`).join("");
  }

  // ---------- Wire up filters ----------
  document.getElementById("state-search").addEventListener("input", (e) => {
    stateSearch = e.target.value;
    renderStateChart();
  });
  const topnSlider = document.getElementById("topn-slider");
  topnSlider.addEventListener("input", (e) => {
    topN = parseInt(e.target.value, 10);
    document.getElementById("topn-value").textContent = topN;
    renderStateChart();
  });

  const keywordToggle = document.getElementById("keyword-toggle");
  keywordToggle.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-src]");
    if (!btn) return;
    keywordToggle.querySelectorAll("button").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    renderKeywordChart(btn.dataset.src);
  });

  window.addEventListener("resize", () => {
    renderStateChart();
    renderSalaryChart();
    renderDescChart();
    renderKeywordChart(document.querySelector("#keyword-toggle button.active").dataset.src);
    renderModel();
  });

  // ---------- Init ----------
  renderKpis();
  renderDataQuality();
  renderStateChart();
  renderSalaryChart();
  renderDescChart();
  renderKeywordChart("description");
  renderSegments();
  renderModel();
  renderTextLists();
})();
