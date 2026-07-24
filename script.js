
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

const bookingForm = document.querySelector("#booking-form");
const formNote = document.querySelector("#form-note");

if (bookingForm) {
  bookingForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButton = bookingForm.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;

    submitButton.disabled = true;
    submitButton.textContent = "Sending...";

    if (formNote) {
      formNote.textContent = "";
    }

    try {
      const response = await fetch(bookingForm.action, {
        method: "POST",
        body: new FormData(bookingForm),
        headers: {
          Accept: "application/json"
        }
      });

      if (response.ok) {
  const formData = Object.fromEntries(
    new FormData(bookingForm).entries()
  );

  try {
  await fetch("https://eood29yfydq3s42.m.pipedream.net", {
    method: "POST",
    body: new FormData(bookingForm),
    mode: "no-cors"
  });
} catch (automationError) {
  console.error("Confirmation automation failed:", automationError);
}
  window.location.href = "/thank-you.html";
  return;
      }

      if (formNote) {
        formNote.textContent =
          "We could not send your request. Please check your information and try again.";
      }
    } catch (error) {
      if (formNote) {
        formNote.textContent =
          "There was a connection problem. Please try again.";
      }
    }

    submitButton.disabled = false;
    submitButton.textContent = originalButtonText;
  });
}
