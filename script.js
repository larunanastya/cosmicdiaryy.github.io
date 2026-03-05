document.addEventListener("DOMContentLoaded", () => {
  updateNavigation();
  setupMobileMenu();
  setupLinks();
  setupGalaxy();

  if (typeof loadEntries === "function") {
    loadEntries();
  }
});

function setupLinks() {
  document.querySelectorAll("a[href]").forEach((link) => {
    const href = link.getAttribute("href");
    if (!href || href.startsWith("#") || link.target === "_blank") return;

    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin) return;

    link.addEventListener("click", function (e) {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      document.body.classList.add("fade-out");
      setTimeout(() => {
        location.href = this.href;
      }, 350);
    });
  });
}

function setupGalaxy() {
  if (document.getElementById("galaxy-bg")) return;
  const bg = document.createElement("div");
  bg.id = "galaxy-bg";
  bg.innerHTML = '<div class="star-layer layer1"></div><div class="star-layer layer2"></div><div class="star-layer layer3"></div>';
  document.body.prepend(bg);
}

function setupMobileMenu() {
  const header = document.querySelector("header");
  const navLeft = header?.querySelector(".nav-left");
  const mainNav = header?.querySelector(".main-nav");
  const navRight = header?.querySelector(".nav-right");

  if (!header || !navLeft || !mainNav || !navRight) return;

  let toggle = header.querySelector(".menu-toggle");
  if (!toggle) {
    toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "menu-toggle";
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Открыть меню");
    toggle.textContent = "Меню";
    header.insertBefore(toggle, navLeft);
  }

  const closeMenu = () => {
    header.classList.remove("menu-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Открыть меню");
    toggle.textContent = "Меню";
  };

  toggle.addEventListener("click", () => {
    const isOpen = header.classList.toggle("menu-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Закрыть меню" : "Открыть меню");
    toggle.textContent = isOpen ? "Закрыть" : "Меню";
  });

  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  navRight.addEventListener("click", (e) => {
    if (e.target.closest("a")) closeMenu();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      closeMenu();
    }
  });
}

function updateNavigation() {
  const nav = document.getElementById("navArea");
  if (!nav) return;

  const navLeft = document.querySelector(".nav-left .main-nav");
  const user = localStorage.getItem("currentUser");
  const existingDiaryButton = document.getElementById("diaryBtn");

  if (user) {
    if (navLeft && !existingDiaryButton) {
      const diaryLink = document.createElement("a");
      diaryLink.href = "diary.html";
      diaryLink.id = "diaryBtn";
      diaryLink.className = "nav-btn";
      diaryLink.textContent = "Мой дневник";
      navLeft.appendChild(diaryLink);
    }

    nav.innerHTML = '<a href="#" class="nav-btn" data-action="logout">Выйти</a>';

    const logoutLink = nav.querySelector('[data-action="logout"]');
    if (logoutLink) {
      logoutLink.addEventListener("click", (e) => {
        e.preventDefault();
        logout();
      });
    }
  } else {
    if (existingDiaryButton) existingDiaryButton.remove();
    nav.innerHTML = '<a href="auth.html" class="nav-btn">Войти</a>';
  }
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.innerText = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

function register() {
  const regUsername = document.getElementById("regUsername");
  const regPassword = document.getElementById("regPassword");

  const u = regUsername?.value.trim();
  const p = regPassword?.value;

  if (!u || !p) return showToast("Заполните поля");

  const users = JSON.parse(localStorage.getItem("users")) || [];
  if (users.find((item) => item.username === u)) {
    return showToast("Пользователь уже существует");
  }

  users.push({ username: u, password: p });
  localStorage.setItem("users", JSON.stringify(users));
  showToast("Регистрация успешна");
  setTimeout(() => {
    location.href = "auth.html";
  }, 900);
}

function login() {
  const loginUsername = document.getElementById("loginUsername");
  const loginPassword = document.getElementById("loginPassword");

  const u = loginUsername?.value.trim();
  const p = loginPassword?.value;

  const users = JSON.parse(localStorage.getItem("users")) || [];
  const user = users.find((item) => item.username === u && item.password === p);

  if (!user) return showToast("Неверные данные");

  localStorage.setItem("currentUser", u);
  showToast("Добро пожаловать");
  setTimeout(() => {
    location.href = "diary.html";
  }, 900);
}

function logout() {
  localStorage.removeItem("currentUser");
  location.href = "index.html";
}

function addEntry() {
  const user = localStorage.getItem("currentUser");
  if (!user) return;

  const title = document.getElementById("title")?.value;
  const date = document.getElementById("eventDate")?.value;
  const content = document.getElementById("content")?.value;

  if (!title || !date || !content) return showToast("Заполните все поля");

  const entries = JSON.parse(localStorage.getItem(user)) || [];
  entries.unshift({ title, date, content });
  localStorage.setItem(user, JSON.stringify(entries));

  showToast("Запись сохранена");
  loadEntries();
}

function loadEntries() {
  const user = localStorage.getItem("currentUser");
  const container = document.getElementById("entries");
  if (!user || !container) return;

  const entries = JSON.parse(localStorage.getItem(user)) || [];
  container.innerHTML = "";

  entries.forEach((entry, i) => {
    container.innerHTML += `<div class="entry"><h3>${entry.title}</h3><p>${entry.content}</p><small>${new Date(entry.date).toLocaleString()}</small><button onclick="deleteEntry(${i})">Удалить</button></div>`;
  });
}

function deleteEntry(i) {
  const user = localStorage.getItem("currentUser");
  if (!user) return;

  const entries = JSON.parse(localStorage.getItem(user)) || [];
  entries.splice(i, 1);
  localStorage.setItem(user, JSON.stringify(entries));

  showToast("Запись удалена");
  loadEntries();
}