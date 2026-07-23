
const menuButton = document.querySelector(".menu-button");
const siteNav = document.querySelector(".site-nav");

if (menuButton && siteNav) {
  menuButton.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });
}

const dateInput = document.querySelector('input[type="date"]');
if (dateInput) {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  dateInput.min = local.toISOString().slice(0, 10);
}

const params = new URLSearchParams(window.location.search);
const requestedService = params.get("service");
const serviceSelect = document.querySelector('select[name="service"]');
if (requestedService && serviceSelect) {
  serviceSelect.value = requestedService;
}


