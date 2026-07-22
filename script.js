
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

const form = document.querySelector("#booking-form");
const note = document.querySelector("#form-note");

if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const details = [
      `Name: ${data.get("name")}`,
      `Email: ${data.get("email")}`,
      `Phone: ${data.get("phone")}`,
      `Service: ${data.get("service")}`,
      `Preferred date: ${data.get("date")}`,
      `Preferred time: ${data.get("time")}`,
      `Location: ${data.get("location") || ""}`,
      "",
      `Project notes: ${data.get("message")}`,
    ].join("\n");
    const subject = encodeURIComponent("JPC Design consultation request");
    const body = encodeURIComponent(details);
    window.location.href = `mailto:jpcdesign1996@gmail.com?subject=${subject}&body=${body}`;
    if (note) {
      note.textContent = "Your email app is opening with the request details ready to send.";
    }
  });
}
