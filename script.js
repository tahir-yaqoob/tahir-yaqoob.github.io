document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  const themeToggle = document.querySelector("[data-theme-toggle]");
  const themeLabel = document.querySelector("[data-theme-label]");
  const mobileToggle = document.querySelector("[data-menu-toggle]");
  const siteHeader = document.querySelector(".site-header");
  const primaryNav = document.getElementById("primary-nav");

  const setTheme = (theme) => {
    root.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("portfolio-theme", theme);
    } catch (error) {}
    if (themeLabel) {
      themeLabel.textContent = theme === "light" ? "Light" : "Dark";
    }
  };

  const currentTheme = root.getAttribute("data-theme") || "dark";
  setTheme(currentTheme);

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const nextTheme = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      setTheme(nextTheme);
    });
  }

  if (mobileToggle && siteHeader && primaryNav) {
    mobileToggle.addEventListener("click", () => {
      const isOpen = siteHeader.classList.toggle("is-menu-open");
      mobileToggle.setAttribute("aria-expanded", String(isOpen));
    });

    primaryNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        siteHeader.classList.remove("is-menu-open");
        mobileToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  const postGrid = document.querySelector("[data-post-grid]");
  const filterBar = document.querySelector("[data-filter-bar]");

  if (postGrid && filterBar) {
    const cards = Array.from(postGrid.querySelectorAll(".post-card"));
    const formatTagLabel = (tag) => tag.split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
    const uniqueTags = [...new Set(cards.flatMap((card) => {
      const rawTags = card.dataset.tags || "";
      return rawTags.split(",").map((tag) => tag.trim()).filter(Boolean);
    }))].sort((a, b) => a.localeCompare(b));

    if (uniqueTags.length > 0) {
      const allButton = document.createElement("button");
      allButton.type = "button";
      allButton.className = "filter-chip is-active";
      allButton.dataset.filter = "all";
      allButton.textContent = "All";
      filterBar.appendChild(allButton);

      uniqueTags.forEach((tag) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "filter-chip";
        button.dataset.filter = tag;
        button.textContent = formatTagLabel(tag);
        filterBar.appendChild(button);
      });

      filterBar.addEventListener("click", (event) => {
        const button = event.target.closest(".filter-chip");
        if (!button) return;

        const selectedTag = button.dataset.filter;
        filterBar.querySelectorAll(".filter-chip").forEach((chip) => {
          chip.classList.toggle("is-active", chip === button);
        });

        cards.forEach((card) => {
          const cardTags = (card.dataset.tags || "").split(",").map((tag) => tag.trim()).filter(Boolean);
          const shouldShow = selectedTag === "all" || cardTags.includes(selectedTag);
          card.classList.toggle("is-hidden", !shouldShow);
        });
      });
    }
  }
});
