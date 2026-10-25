// Premier Rays — shared behaviour for every page

const icon = (name) =>
  `<svg class="icon" aria-hidden="true"><use href="/icons.svg#${name}"/></svg>`;

/* ---------- Mobile menu ---------- */
const toggle = document.querySelector(".menu-toggle");
const nav = document.getElementById("site-nav");

if (toggle && nav) {
  const setOpen = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    nav.classList.toggle("is-open", open);
    document.body.classList.toggle("nav-open", open);
  };
  toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("is-open")) {
      setOpen(false);
      toggle.focus();
    }
  });
  window.matchMedia("(min-width: 921px)").addEventListener("change", (e) => e.matches && setOpen(false));
}

/* ---------- Toast + copy phone number ---------- */
let toastEl;
let toastTimer;
function toast(message) {
  if (!toastEl) {
    toastEl = document.createElement("div");
    toastEl.className = "toast";
    toastEl.setAttribute("role", "status");
    document.body.appendChild(toastEl);
  }
  toastEl.textContent = message;
  toastEl.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("is-visible"), 2000);
}

document.addEventListener("click", async (e) => {
  const btn = e.target.closest("[data-copy]");
  if (!btn) return;
  try {
    await navigator.clipboard.writeText(btn.dataset.copy);
    toast(`Copied ${btn.dataset.copy}`);
  } catch {
    toast(btn.dataset.copy);
  }
});

/* ---------- Lightbox ---------- */
const lightbox = (() => {
  let items = [];
  let index = 0;
  let lastFocus = null;
  let el;

  function build() {
    el = document.createElement("div");
    el.className = "lightbox";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "true");
    el.setAttribute("aria-label", "Photo viewer");
    el.innerHTML = `
      <div class="lb-top">
        <span class="lb-counter" aria-live="polite"></span>
        <button class="lb-btn lb-close" type="button" aria-label="Close">${icon("close")}</button>
      </div>
      <div class="lb-stage">
        <button class="lb-btn lb-prev" type="button" aria-label="Previous photo">${icon("chevron-left")}</button>
        <img alt="">
        <button class="lb-btn lb-next" type="button" aria-label="Next photo">${icon("chevron-right")}</button>
      </div>
      <div class="lb-bottom"><span class="lb-caption"></span><a class="lb-link" hidden></a></div>`;
    document.body.appendChild(el);

    el.querySelector(".lb-close").addEventListener("click", close);
    el.querySelector(".lb-prev").addEventListener("click", () => go(-1));
    el.querySelector(".lb-next").addEventListener("click", () => go(1));
    el.querySelector(".lb-stage").addEventListener("click", (e) => {
      if (e.target.classList.contains("lb-stage")) close();
    });

    // Swipe on touch screens
    let startX = null;
    el.addEventListener("touchstart", (e) => (startX = e.touches[0].clientX), { passive: true });
    el.addEventListener("touchend", (e) => {
      if (startX === null) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
      startX = null;
    });

    document.addEventListener("keydown", (e) => {
      if (!el.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "Tab") {
        // keep focus inside the viewer
        const focusables = [...el.querySelectorAll("button:not([hidden]), a:not([hidden])")];
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  function render() {
    const item = items[index];
    const img = el.querySelector(".lb-stage img");
    img.src = item.src;
    img.alt = item.caption || "";
    el.querySelector(".lb-counter").textContent = `${index + 1} / ${items.length}`;
    el.querySelector(".lb-caption").textContent = item.caption || "";
    const link = el.querySelector(".lb-link");
    link.hidden = !item.href;
    if (item.href) {
      link.href = item.href;
      link.textContent = item.linkText || "View details";
    }
    const single = items.length < 2;
    el.querySelector(".lb-prev").hidden = single;
    el.querySelector(".lb-next").hidden = single;
    // Preload neighbours
    [1, -1].forEach((d) => {
      const n = items[(index + d + items.length) % items.length];
      if (n) new Image().src = n.src;
    });
  }

  function go(delta) {
    index = (index + delta + items.length) % items.length;
    render();
  }

  function open(list, start = 0) {
    if (!el) build();
    items = list;
    index = start;
    lastFocus = document.activeElement;
    render();
    el.classList.add("is-open");
    document.body.style.overflow = "hidden";
    el.querySelector(".lb-close").focus();
  }

  function close() {
    el.classList.remove("is-open");
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }

  return { open };
})();

/* Photo sets on detail pages: <div data-photos="id"><a href="full.jpg" data-caption="..."> */
document.querySelectorAll("[data-photos]").forEach((group) => {
  const links = [...group.querySelectorAll("a[href]")];
  const items = links.map((a) => ({ src: a.getAttribute("href"), caption: a.dataset.caption }));
  links.forEach((a, i) =>
    a.addEventListener("click", (e) => {
      e.preventDefault();
      lightbox.open(items, i);
    })
  );
  document.querySelectorAll(`[data-open-photos="${group.dataset.photos}"]`).forEach((btn) =>
    btn.addEventListener("click", () => lightbox.open(items, 0))
  );
});

/* ---------- Gallery page ---------- */
const galleryEl = document.getElementById("gallery");

if (galleryEl) {
  // Folder name in images.json -> how it is shown on the site
  const SETS = {
    ecostay: { label: "Eco Stay", group: "tourism", page: "/ecostay.html" },
    "nature-treks": { label: "Nature Treks", group: "tourism", page: "/treks.html" },
    "coffee-estate": { label: "Coffee Estate Villa", group: "tourism", page: "/coffeevilla.html" },
    courts: { label: "Courts", group: "sports", page: "/sports.html" },
    accessories: { label: "Accessories", group: "sports", page: "/accessories.html" },
    innova: { label: "Innova Crysta", group: "travels", page: "/innova.html" },
    urbania: { label: "Urbania", group: "travels", page: "/urbania.html" },
  };
  const GROUPS = { all: "All", tourism: "Tourism", sports: "Sports", travels: "Travels" };

  const mainRow = document.getElementById("mainFilters");
  const subRow = document.getElementById("subFilters");
  const status = document.getElementById("galleryStatus");
  let images = [];

  const chip = (label, count, pressed, data) =>
    `<button type="button" class="filter-chip" aria-pressed="${pressed}" ${data}>${label} <span class="count">${count}</span></button>`;

  function readHash() {
    const key = decodeURIComponent(location.hash.slice(1));
    if (SETS[key]) return { group: SETS[key].group, set: key };
    if (GROUPS[key]) return { group: key, set: null };
    return { group: "all", set: null };
  }

  function render() {
    const { group, set } = readHash();
    const inGroup = (img) => group === "all" || SETS[img.category]?.group === group;

    mainRow.innerHTML = Object.entries(GROUPS)
      .map(([key, label]) => chip(label, images.filter((img) => key === "all" || SETS[img.category]?.group === key).length, key === group, `data-hash="${key}"`))
      .join("");

    const sets = Object.entries(SETS).filter(([key, s]) => s.group === group && images.some((img) => img.category === key));
    subRow.hidden = group === "all";
    subRow.innerHTML = group === "all" ? "" :
      chip(`All ${GROUPS[group]}`, images.filter(inGroup).length, !set, `data-hash="${group}"`) +
      sets.map(([key, s]) => chip(s.label, images.filter((img) => img.category === key).length, key === set, `data-hash="${key}"`)).join("");

    const shown = images.filter((img) => (set ? img.category === set : inGroup(img)));
    const items = shown.map((img) => {
      const s = SETS[img.category];
      return { src: img.url, caption: s?.label ?? img.category, href: s?.page, linkText: s ? `View ${s.label} details & contact` : "" };
    });

    status.innerHTML = set
      ? `${shown.length} photos of ${SETS[set].label} · <a href="${SETS[set].page}">View details &amp; contact</a>`
      : `${shown.length} photos`;

    galleryEl.innerHTML = "";
    if (!shown.length) {
      galleryEl.innerHTML = "<p>No images available for this category.</p>";
      return;
    }
    shown.forEach((img, i) => {
      const label = SETS[img.category]?.label ?? img.category;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "photo-tile";
      btn.setAttribute("aria-label", `Open photo ${i + 1}: ${label}`);
      btn.innerHTML = `<img src="${encodeURI(img.url)}" alt="${label}" loading="lazy" decoding="async">${set ? "" : `<span class="tile-label">${label}</span>`}`;
      btn.addEventListener("click", () => lightbox.open(items.map((it) => ({ ...it, src: encodeURI(it.src) })), i));
      galleryEl.appendChild(btn);
    });
  }

  document.addEventListener("click", (e) => {
    const c = e.target.closest(".filter-chip[data-hash]");
    if (!c) return;
    const hash = c.dataset.hash === "all" ? "" : c.dataset.hash;
    history.replaceState(null, "", hash ? `#${hash}` : location.pathname);
    render();
  });
  window.addEventListener("hashchange", render);

  fetch("/images.json")
    .then((res) => res.json())
    .then((data) => {
      images = data;
      render();
    })
    .catch(() => {
      galleryEl.innerHTML = "<p>Unable to load images.</p>";
    });
}
