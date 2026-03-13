(() => {

  const navToggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-nav]");

  /* -----------------------------
  Navigation toggle
  ----------------------------- */

  if (navToggle && nav) {

    navToggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    document.addEventListener("click", (e) => {

      const target = e.target;

      if (!(target instanceof Element)) return;

      const insideNav = nav.contains(target);
      const insideToggle = navToggle.contains(target);

      if (!insideNav && !insideToggle) {
        nav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      }

    });

  }

  /* -----------------------------
  Lightbox for food images
  ----------------------------- */

  const ensureLightbox = () => {

    let overlay = document.querySelector("[data-lightbox-overlay]");

    if (overlay) return overlay;

    overlay = document.createElement("div");

    overlay.className = "lightbox-overlay";
    overlay.setAttribute("data-lightbox-overlay", "");

    overlay.innerHTML = `
      <div class="lightbox-dialog">
        <button class="lightbox-close" data-lightbox-close>×</button>
        <img class="lightbox-img" data-lightbox-img alt="">
      </div>
    `;

    document.body.appendChild(overlay);

    return overlay;
  };

  const openLightbox = (img) => {

    const overlay = ensureLightbox();
    const preview = overlay.querySelector("[data-lightbox-img]");

    if (!(preview instanceof HTMLImageElement)) return;

    preview.src = img.src;
    preview.alt = img.alt;

    overlay.classList.add("is-open");

    const close = () => {
      overlay.classList.remove("is-open");
      preview.src = "";
    };

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });

    const closeBtn = overlay.querySelector("[data-lightbox-close]");
    closeBtn?.addEventListener("click", close);

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });

  };

  document.addEventListener("click", (e) => {

    const target = e.target;

    if (!(target instanceof Element)) return;

    const img = target.closest("img[data-lightbox]");

    if (img instanceof HTMLImageElement) {
      e.preventDefault();
      openLightbox(img);
    }

  });


  /* -----------------------------
  Footer year
  ----------------------------- */

  const year = document.querySelector("[data-year]");

  if (year) {
    year.textContent = new Date().getFullYear();
  }


  /* -----------------------------
  Reservation form
  ----------------------------- */

  const form = document.querySelector("[data-validate-form]");

  if (!form) return;

  const valueOf = (name) => {

    const el = form.querySelector(`[name="${name}"]`);

    if (
      el instanceof HTMLInputElement ||
      el instanceof HTMLSelectElement ||
      el instanceof HTMLTextAreaElement
    ) {
      return el.value.trim();
    }

    return "";
  };


  const setInvalid = (field, message) => {

    field.dataset.invalid = "true";

    const err = field.querySelector(".error");

    if (err) err.textContent = message;

  };


  const clearInvalid = (field) => {

    field.dataset.invalid = "false";

  };


  const validators = [

    {
      name: "fullName",
      message: "Please enter your name.",
      test: (v) => v.length >= 2,
    },

    {
      name: "email",
      message: "Please enter a valid email.",
      test: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    },

    {
      name: "date",
      message: "Please select a reservation date.",
      test: (v) => v.length > 0,
    },

    {
      name: "time",
      message: "Please select a reservation time.",
      test: (v) => v.length > 0,
    },

    {
      name: "guests",
      message: "Please select number of guests.",
      test: (v) => Number(v) >= 1,
    },

  ];


  const validate = () => {

    let ok = true;

    const fields = form.querySelectorAll("[data-field]");

    fields.forEach((f) => clearInvalid(f));

    validators.forEach((rule) => {

      const val = valueOf(rule.name);

      if (!rule.test(val)) {

        ok = false;

        const fieldEl = form.querySelector(`[data-field="${rule.name}"]`);

        if (fieldEl) setInvalid(fieldEl, rule.message);

      }

    });

    return ok;

  };


  /* -----------------------------
  Reservation API
  ----------------------------- */

  const RESERVATION_API_URL = "https://restaurant-api.onrender.com";


  form.addEventListener("submit", async (e) => {

    e.preventDefault();

    if (!validate()) {

      const firstInvalid = form.querySelector('[data-invalid="true"] input, select, textarea');

      if (firstInvalid instanceof HTMLElement) firstInvalid.focus();

      return;

    }

    const payload = {

      fullName: valueOf("fullName"),
      email: valueOf("email"),
      phone: valueOf("phone"),
      date: valueOf("date"),
      time: valueOf("time"),
      guests: valueOf("guests"),
      message: valueOf("message"),

    };


    const out = form.querySelector("[data-form-output]");

    if (out) out.textContent = "Sending reservation…";


    try {

      const url = `${RESERVATION_API_URL}/api/reservation`;

      const resp = await fetch(url, {

        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(payload),

      });


      const data = await resp.json().catch(() => ({}));

      if (!resp.ok || data.ok === false) {
        throw new Error(data.error || "Request failed.");
      }

      if (out) out.textContent = "Reservation request sent successfully.";

      form.reset();

    } catch (err) {

      if (out) {
        out.textContent = "Sorry — we couldn't send your reservation.";
      }

    }

  });

})();