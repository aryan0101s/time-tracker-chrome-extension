function renderData() {
  chrome.storage.local.get(null, (items) => {
    const siteList = document.getElementById("siteList");
    siteList.innerHTML = ""; // clear previous

    const entries = Object.entries(items);
    const totalMs = entries.reduce((sum, [, ms]) => sum + ms, 0);

    entries.sort((a, b) => b[1] - a[1]);

    for (const [domain, ms] of entries) {
      const percent = totalMs > 0 ? ((ms / totalMs) * 100).toFixed(1) : 0;

      const container = document.createElement("div");
      container.className = "site-container";

      const label = document.createElement("div");
      label.className = "label";
      label.textContent = `${domain} - ${(ms / 1000 / 60).toFixed(1)} min (${percent}%)`;

      const barContainer = document.createElement("div");
      barContainer.className = "bar-container";

      const bar = document.createElement("div");
      bar.className = "bar";
      bar.style.width = `${percent}%`;

      barContainer.appendChild(bar);
      container.appendChild(label);
      container.appendChild(barContainer);

      siteList.appendChild(container);
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderData();

  document.getElementById("reset").addEventListener("click", () => {
    chrome.storage.local.clear(() => {
      renderData();
    });
  });
});