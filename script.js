
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
  // Earliest booking is tomorrow, so same-day appointments cannot be selected.
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const localTomorrow = new Date(tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60000);
  dateInput.min = localTomorrow.toISOString().slice(0, 10);
}

const params = new URLSearchParams(window.location.search);
const requestedService = params.get("service");
const serviceSelect = document.querySelector('select[name="service"]');
if (requestedService && serviceSelect) {
  serviceSelect.value = requestedService;
}

// Prefill the booking form after a successful virtual-photo upload.
const savedVirtualLead = sessionStorage.getItem("jpcVirtualLead");
if (savedVirtualLead) {
  try {
    const lead = JSON.parse(savedVirtualLead);
    const nameField = document.querySelector('input[name="name"]');
    const emailField = document.querySelector('input[name="email"]');
    const phoneField = document.querySelector('input[name="phone"]');
    if (nameField && lead.name) nameField.value = lead.name;
    if (emailField && lead.email) emailField.value = lead.email;
    if (phoneField && lead.phone) phoneField.value = lead.phone;
    if (serviceSelect) serviceSelect.value = "Virtual Interior Decoration";
  } catch (error) {
    console.error("Could not restore virtual lead details:", error);
  }
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

const virtualUploadForm = document.querySelector("#virtual-upload-form");
const uploadNote = document.querySelector("#upload-note");
const roomPhotos = document.querySelector("#room-photos");
const fileCount = document.querySelector("#file-count");

// FREE PHOTO EMAIL SETUP:
// Paste your deployed Google Apps Script Web App URL between the quotation marks.
const JPC_PHOTO_UPLOAD_ENDPOINT = "https://script.google.com/macros/s/AKfycbzOp4_wqqqf1qdeU_EdmSVHkadoncNAnKipYdPcA3YqgFz238LFe5_2YSAB_NmHZsgj/exec";

if (roomPhotos && fileCount) {
  roomPhotos.addEventListener("change", () => {
    const count = roomPhotos.files.length;
    fileCount.textContent = count ? `${count} photo${count === 1 ? "" : "s"} selected` : "No photos selected";
  });
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      resolve(result.includes(",") ? result.split(",")[1] : result);
    };
    reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
    reader.readAsDataURL(file);
  });
}

if (virtualUploadForm) {
  virtualUploadForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (JPC_PHOTO_UPLOAD_ENDPOINT.includes("PASTE_YOUR")) {
      uploadNote.textContent = "Photo email setup is not complete yet. Please connect the Google Apps Script link.";
      return;
    }

    const files = roomPhotos ? Array.from(roomPhotos.files) : [];
    if (!files.length) {
      uploadNote.textContent = "Please choose at least one room photo.";
      return;
    }
    if (files.length > 5) {
      uploadNote.textContent = "Please upload no more than 5 photos.";
      return;
    }

    const maxIndividualSize = 5 * 1024 * 1024;
    const maxCombinedSize = 10 * 1024 * 1024;
    const combinedSize = files.reduce((total, file) => total + file.size, 0);

    if (files.some(file => file.size > maxIndividualSize)) {
      uploadNote.textContent = "Each photo must be smaller than 5 MB.";
      return;
    }
    if (combinedSize > maxCombinedSize) {
      uploadNote.textContent = "The combined photo size must be smaller than 10 MB.";
      return;
    }

    const submitButton = virtualUploadForm.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = "Sending photos...";
    uploadNote.textContent = "Please keep this page open while your photos are sent.";

    try {
      const formData = new FormData(virtualUploadForm);
      const photoPayload = await Promise.all(files.map(async file => ({
        name: file.name,
        type: file.type || "application/octet-stream",
        data: await fileToBase64(file)
      })));

      const payload = {
        name: formData.get("name"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        roomType: formData.get("room_type"),
        budget: formData.get("budget"),
        style: formData.get("style"),
        message: formData.get("message"),
        photoPermission: formData.get("photo_permission"),
        submittedAt: new Date().toISOString(),
        photos: photoPayload
      };

      sessionStorage.setItem("jpcVirtualLead", JSON.stringify({
        name: payload.name,
        email: payload.email,
        phone: payload.phone
      }));

      await fetch(JPC_PHOTO_UPLOAD_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
      });

      sessionStorage.setItem("jpcVirtualUploadComplete", "true");
      uploadNote.textContent = "Photos sent. Opening the complimentary introduction form...";
      setTimeout(() => {
        window.location.href = "contact.html?service=Virtual%20Interior%20Decoration&photos=received#booking-form";
      }, 1200);
      return;
    } catch (error) {
      console.error(error);
      uploadNote.textContent = "We could not send your photos. Please check your connection and try again.";
    }

    submitButton.disabled = false;
    submitButton.textContent = originalText;
  });
}

if (window.location.pathname.endsWith("contact.html") && params.get("photos") === "received") {
  if (formNote) {
    formNote.textContent = "Your room photos were submitted. Now choose your preferred introduction date and time.";
    formNote.classList.add("success-note");
  }
}
