// mebel.uz — interaktiv funksiyalar
document.addEventListener("DOMContentLoaded", () => {
  /* 1. KATALOG: kategoriya filtri + qidiruv */
  const catalogGrid = document.querySelector(".catalog-grid");
  const cards = Array.from(document.querySelectorAll(".product-card"));

  if (catalogGrid && cards.length) {
    const categories = ["Hammasi", ...new Set(
      cards.map((c) => c.querySelector(".category-tag").textContent.trim())
    )];

    const toolbar = document.createElement("div");
    toolbar.className = "catalog-toolbar";

    const filters = document.createElement("div");
    filters.className = "filter-buttons";

    const search = document.createElement("input");
    search.type = "search";
    search.className = "catalog-search";
    search.placeholder = "Mahsulot qidirish...";

    const emptyMsg = document.createElement("p");
    emptyMsg.className = "catalog-empty";
    emptyMsg.textContent = "Hech narsa topilmadi.";
    emptyMsg.hidden = true;

    let activeCategory = "Hammasi";

    const applyFilter = () => {
      const q = search.value.trim().toLowerCase();
      let visible = 0;
      cards.forEach((card) => {
        const cat = card.querySelector(".category-tag").textContent.trim();
        const name = card.querySelector(".product-name").textContent.toLowerCase();
        const match =
          (activeCategory === "Hammasi" || cat === activeCategory) &&
          name.includes(q);
        card.style.display = match ? "" : "none";
        if (match) visible++;
      });
      emptyMsg.hidden = visible !== 0;
    };

    categories.forEach((cat) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "filter-btn" + (cat === "Hammasi" ? " active" : "");
      btn.textContent = cat;
      btn.addEventListener("click", () => {
        activeCategory = cat;
        filters.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        applyFilter();
      });
      filters.appendChild(btn);
    });

    search.addEventListener("input", applyFilter);

    toolbar.append(filters, search);
    catalogGrid.before(toolbar);
    catalogGrid.after(emptyMsg);
  }

  /* 2. BUYURTMA OYNASI (modal) + forma tekshiruvi */
  const modal = document.createElement("div");
  modal.className = "order-modal";
  modal.hidden = true;
  modal.innerHTML = `
    <div class="order-box" role="dialog" aria-modal="true">
      <button type="button" class="order-close" aria-label="Yopish">&times;</button>
      <h3>Buyurtma berish</h3>
      <p class="order-product"></p>
      <form class="order-form" novalidate>
        <input type="text" name="name" placeholder="Ismingiz" />
        <input type="tel" name="phone" placeholder="+998 90 123 45 67" />
        <p class="order-error"></p>
        <button type="submit" class="btn btn-primary">Yuborish</button>
      </form>
    </div>`;
  document.body.appendChild(modal);

  const orderProduct = modal.querySelector(".order-product");
  const orderForm = modal.querySelector(".order-form");
  const orderError = modal.querySelector(".order-error");

  const closeModal = () => {
    modal.hidden = true;
    document.body.style.overflow = "";
  };

  document.querySelectorAll(".product-card .card-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const card = btn.closest(".product-card");
      const name = card.querySelector(".product-name").textContent;
      const price = card.querySelector(".price").textContent;
      orderProduct.textContent = `${name} — ${price}`;
      orderError.textContent = "";
      orderForm.reset();
      modal.hidden = false;
      document.body.style.overflow = "hidden";
      orderForm.elements.name.focus();
    });
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal || e.target.classList.contains("order-close")) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) closeModal();
  });

  orderForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = orderForm.elements.name.value.trim();
    const phone = orderForm.elements.phone.value.replace(/[\s()-]/g, "");

    if (name.length < 2) {
      orderError.textContent = "Iltimos, ismingizni kiriting.";
      return;
    }
    if (!/^\+?998\d{9}$/.test(phone)) {
      orderError.textContent = "Telefon raqami noto'g'ri. Masalan: +998 90 123 45 67";
      return;
    }
    orderError.textContent = "";
    alert(`Rahmat, ${name}! Buyurtmangiz qabul qilindi. Tez orada siz bilan bog'lanamiz.`);
    closeModal();
  });

  /* 3. HEADER soyasi va scroll-spy (aktiv menyu) */
  const header = document.querySelector(".header");
  const navLinks = Array.from(document.querySelectorAll(".nav-links a"));
  const sections = navLinks
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  const onScroll = () => {
    header.classList.toggle("scrolled", window.scrollY > 20);
    topBtn.classList.toggle("show", window.scrollY > 500);

    const pos = window.scrollY + 120;
    let current = sections[0];
    sections.forEach((s) => {
      if (s.offsetTop <= pos) current = s;
    });
    navLinks.forEach((a) =>
      a.classList.toggle("active", a.getAttribute("href") === "#" + current.id)
    );
  };

  /* 4. Tepaga qaytish tugmasi */
  const topBtn = document.createElement("button");
  topBtn.type = "button";
  topBtn.className = "back-to-top";
  topBtn.setAttribute("aria-label", "Tepaga qaytish");
  topBtn.textContent = "↑";
  topBtn.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: "smooth" })
  );
  document.body.appendChild(topBtn);

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* 5. Mobil menyu: havolani bosganda yopiladi */
  const menuToggle = document.getElementById("menu-toggle");
  navLinks.forEach((a) =>
    a.addEventListener("click", () => {
      if (menuToggle) menuToggle.checked = false;
    })
  );

  /* 6. Statistika raqamlari animatsiyasi */
  const counters = document.querySelectorAll(".stat-number");
  const animateCounter = (el) => {
    const text = el.textContent.trim();
    const target = parseInt(text.replace(/[^\d]/g, ""), 10);
    const suffix = text.replace(/[\d,]/g, "");
    const useComma = text.includes(",");
    const duration = 1500;
    const start = performance.now();

    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const value = Math.floor(target * p);
      el.textContent = (useComma ? value.toLocaleString("en-US") : value) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  /* 7. Bo'limlar ko'rinishga kelganda paydo bo'lishi */
  if ("IntersectionObserver" in window) {
    const counterObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((c) => counterObserver.observe(c));

    const revealEls = document.querySelectorAll(
      ".category-card, .product-card, .feature-card, .testimonial-card"
    );
    revealEls.forEach((el) => el.classList.add("reveal"));
    const revealObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  }
});
