(() => {
  const steps = [
    { slug: "index.html", title: "Start Here" },
    { slug: "steps/01-overview.html", title: "Project Overview" },
    { slug: "steps/02-server-access.html", title: "Private Server Access" },
    { slug: "steps/03-data-layout.html", title: "LEARN Data Layout" },
    { slug: "steps/04-afni-primer.html", title: "AFNI Primer" },
    { slug: "steps/05-beta-maps.html", title: "What Beta Maps Are" },
    { slug: "steps/06-pipeline-overview.html", title: "Pipeline Overview" },
    { slug: "steps/07-single-subject.html", title: "Run One Subject" },
    { slug: "steps/08-batch.html", title: "Batch Runs" },
    { slug: "steps/09-qa.html", title: "QA and Troubleshooting" },
    { slug: "steps/10-next-steps.html", title: "Next Steps" }
  ];

  const isStepsPage = window.location.pathname.includes("/steps/");
  const base = isStepsPage ? ".." : ".";

  const resolveUrl = (slug) => `${base}/${slug}`.replace(/\/\./g, ".");

  const toc = document.getElementById("toc");
  if (toc) {
    const list = document.createElement("ul");
    list.className = "toc-list";
    steps.forEach((step) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = resolveUrl(step.slug);
      a.textContent = step.title;

      const here = window.location.pathname.endsWith(`/${step.slug}`) ||
        (step.slug === "index.html" && window.location.pathname.endsWith("/undergrad_guide/"));
      if (here) a.classList.add("active");

      li.appendChild(a);
      list.appendChild(li);
    });
    toc.appendChild(list);
  }

  const pager = document.getElementById("pager");
  if (pager) {
    const current = steps.findIndex((s) => window.location.pathname.endsWith(`/${s.slug}`));
    const prev = current > 0 ? steps[current - 1] : null;
    const next = current >= 0 && current < steps.length - 1 ? steps[current + 1] : null;

    if (prev) {
      const a = document.createElement("a");
      a.href = resolveUrl(prev.slug);
      a.textContent = `Prev: ${prev.title}`;
      a.className = "pager-link";
      pager.appendChild(a);
    }

    if (next) {
      const a = document.createElement("a");
      a.href = resolveUrl(next.slug);
      a.textContent = `Next: ${next.title}`;
      a.className = "pager-link";
      pager.appendChild(a);
    }
  }

  const config = {
    TERMINAL_URL: typeof TERMINAL_URL === "string" ? TERMINAL_URL : "",
    FILE_BROWSER_URL: typeof FILE_BROWSER_URL === "string" ? FILE_BROWSER_URL : "",
    DATA_ROOT: typeof DATA_ROOT === "string" ? DATA_ROOT : "",
    DATA_ALIAS: typeof DATA_ALIAS === "string" ? DATA_ALIAS : ""
  };

  document.querySelectorAll("[data-config]").forEach((el) => {
    const key = el.getAttribute("data-config");
    if (key && config[key]) el.textContent = config[key];
  });

  const setEmbed = (selector, url, emptyLabel) => {
    const container = document.querySelector(selector);
    if (!container) return;
    const iframe = container.querySelector("iframe");
    const overlay = container.querySelector(".embed-overlay");

    if (!url || url.includes("YOUR_")) {
      if (overlay) overlay.textContent = emptyLabel;
      if (iframe) iframe.removeAttribute("src");
      return;
    }

    if (overlay) overlay.remove();
    if (iframe) iframe.src = url;
  };

  setEmbed("[data-embed=terminal]", config.TERMINAL_URL, "Terminal not configured yet.");
  setEmbed("[data-embed=file-browser]", config.FILE_BROWSER_URL, "File browser not configured yet.");
})();
