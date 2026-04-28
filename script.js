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
  const filterToolbar = document.querySelector("[data-filter-toolbar]");
  const folderCards = Array.from(document.querySelectorAll("[data-folder-card]"));
  const folderPlaceholder = document.querySelector("[data-folder-placeholder]");
  const folderSummary = document.querySelector("[data-folder-summary]");
  const folderLabel = document.querySelector("[data-folder-summary-label]");
  const folderTitle = document.querySelector("[data-folder-summary-title]");
  const folderDescription = document.querySelector("[data-folder-summary-description]");
  const folderReset = document.querySelector("[data-folder-reset]");

  if (postGrid && filterBar && filterToolbar && folderCards.length > 0) {
    const cards = Array.from(postGrid.querySelectorAll(".post-card"));
    const formatTagLabel = (tag) => tag.split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
    const folderMeta = folderCards.reduce((collection, card) => {
      collection[card.dataset.folder] = {
        label: card.dataset.folderLabel || "",
        title: card.dataset.folderTitle || "",
        description: card.dataset.folderDescription || ""
      };
      return collection;
    }, {});

    let activeFolder = "";
    let activeTag = "all";

    const getCardTags = (card) => {
      const rawTags = card.dataset.tags || "";
      return rawTags.split(",").map((tag) => tag.trim()).filter(Boolean);
    };

    const getCardsForFolder = (folder) => cards.filter((card) => card.dataset.folder === folder);

    const getTagsForFolder = (folder) => [...new Set(getCardsForFolder(folder).flatMap(getCardTags))]
      .sort((a, b) => a.localeCompare(b));

    const syncUrl = () => {
      if (!window.history || typeof window.history.replaceState !== "function") return;

      const url = new URL(window.location.href);

      if (activeFolder) {
        url.searchParams.set("folder", activeFolder);
      } else {
        url.searchParams.delete("folder");
      }

      if (activeFolder && activeTag !== "all") {
        url.searchParams.set("tag", activeTag);
      } else {
        url.searchParams.delete("tag");
      }

      window.history.replaceState({}, "", `${url.pathname}${url.search}`);
    };

    const renderFilterChips = () => {
      filterBar.innerHTML = "";

      if (!activeFolder) {
        filterToolbar.hidden = true;
        return;
      }

      const availableTags = getTagsForFolder(activeFolder);

      if (availableTags.length === 0) {
        filterToolbar.hidden = true;
        return;
      }

      filterToolbar.hidden = false;

      const allButton = document.createElement("button");
      allButton.type = "button";
      allButton.className = `filter-chip${activeTag === "all" ? " is-active" : ""}`;
      allButton.dataset.filter = "all";
      allButton.textContent = "All Tags";
      filterBar.appendChild(allButton);

      availableTags.forEach((tag) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `filter-chip${activeTag === tag ? " is-active" : ""}`;
        button.dataset.filter = tag;
        button.textContent = formatTagLabel(tag);
        filterBar.appendChild(button);
      });
    };

    const updateFolderSummary = () => {
      const hasSelection = Boolean(activeFolder && folderMeta[activeFolder]);

      folderCards.forEach((card) => {
        const isActive = card.dataset.folder === activeFolder;
        card.classList.toggle("is-active", isActive);
        card.setAttribute("aria-pressed", String(isActive));
      });

      if (folderPlaceholder) {
        folderPlaceholder.hidden = hasSelection;
      }

      if (folderSummary && folderLabel && folderTitle && folderDescription) {
        folderSummary.hidden = !hasSelection;

        if (hasSelection) {
          folderLabel.textContent = folderMeta[activeFolder].label;
          folderTitle.textContent = folderMeta[activeFolder].title;
          folderDescription.textContent = folderMeta[activeFolder].description;
        }
      }
    };

    const updateVisibleCards = () => {
      cards.forEach((card) => {
        const matchesFolder = activeFolder && card.dataset.folder === activeFolder;
        const matchesTag = activeTag === "all" || getCardTags(card).includes(activeTag);
        const shouldShow = Boolean(matchesFolder && matchesTag);

        card.classList.toggle("is-hidden", !shouldShow);
      });
    };

    const applyFilters = () => {
      if (activeFolder && !folderMeta[activeFolder]) {
        activeFolder = "";
      }

      if (activeFolder) {
        const availableTags = getTagsForFolder(activeFolder);
        if (activeTag !== "all" && !availableTags.includes(activeTag)) {
          activeTag = "all";
        }
      } else {
        activeTag = "all";
      }

      updateFolderSummary();
      renderFilterChips();
      updateVisibleCards();
      syncUrl();
    };

    const clearFolderSelection = () => {
      activeFolder = "";
      activeTag = "all";
      applyFilters();
    };

    folderCards.forEach((card) => {
      card.addEventListener("click", () => {
        activeFolder = activeFolder === card.dataset.folder ? "" : card.dataset.folder;
        activeTag = "all";
        applyFilters();
      });
    });

    filterBar.addEventListener("click", (event) => {
      const button = event.target.closest(".filter-chip");
      if (!button) return;

      activeTag = button.dataset.filter || "all";
      applyFilters();
    });

    if (folderReset) {
      folderReset.addEventListener("click", clearFolderSelection);
    }

    const params = new URLSearchParams(window.location.search);
    const initialFolder = params.get("folder") || "";
    const initialTag = (params.get("tag") || "all").toLowerCase();

    if (initialFolder && folderMeta[initialFolder]) {
      activeFolder = initialFolder;
      activeTag = initialTag;
    }

    applyFilters();
  }
});
