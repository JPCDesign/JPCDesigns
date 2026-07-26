/**
 * JPC Designs website email receiver.
 * Handles both virtual room-photo uploads and advertising landing-page leads.
 * After editing this file, update/redeploy the existing Web App deployment.
 */
const JPC_RECEIVING_EMAIL = "jpcdesign1996@gmail.com";
const JPC_BOOKING_URL = "https://www.jpcdesigns.com/contact.html";

function doGet() {
  return ContentService
    .createTextOutput("JPC Designs website receiver is active.")
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  try {
    const data = JSON.parse((e && e.postData && e.postData.contents) || "{}");

    if (data.requestType === "landingLead") {
      return handleLandingLead_(data);
    }

    return handlePhotoUpload_(data);
  } catch (error) {
    console.error(error);
    return jsonResponse_({ ok: false, error: String(error.message || error) });
  }
}

function handleLandingLead_(data) {
  if (!data.name || !data.email || !data.phone) {
    throw new Error("Name, email and phone are required.");
  }

  const ownerSubject = `New Ads Landing Page Lead — ${data.name}`;
  const ownerBody = [
    "A new lead submitted the JPC Designs advertising landing page.",
    "",
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Phone: ${data.phone}`,
    `City/State: ${data.city_state || "Not provided"}`,
    `Service: ${data.service_type || "Not provided"}`,
    `Space: ${data.space || "Not provided"}`,
    `Budget: ${data.budget || "Not provided"}`,
    `Ad source: ${data.source || data.utm_source || "Direct"}`,
    `Campaign: ${data.utm_campaign || "Not provided"}`,
    `Ad: ${data.utm_ad || "Not provided"}`,
    `Submitted: ${data.submittedAt || new Date().toISOString()}`,
    "",
    "What the client would like to change:",
    data.message || "No message provided"
  ].join("\n");

  MailApp.sendEmail({
    to: JPC_RECEIVING_EMAIL,
    replyTo: data.email,
    subject: ownerSubject,
    body: ownerBody,
    name: "JPC Designs Website"
  });

  const firstName = String(data.name).trim().split(/\s+/)[0] || data.name;
  const clientSubject = "We received your request — choose a time with JPC Designs";
  const clientBody = [
    `Hello ${firstName},`,
    "",
    "Thank you for contacting JPC Designs. We received your project information and look forward to learning more about your space.",
    "",
    "Next step: choose your preferred date and time for a complimentary introduction call using the link below:",
    JPC_BOOKING_URL,
    "",
    "Appointments are available Monday through Friday, 10:00 AM–6:00 PM. Your appointment is confirmed after our team replies.",
    "",
    "JPC Designs",
    "Interior Decoration — Tampa Bay & Virtual Nationwide",
    "Phone: (727) 303-8715",
    "Email: jpcdesign1996@gmail.com",
    "Website: https://www.jpcdesigns.com"
  ].join("\n");

  MailApp.sendEmail({
    to: data.email,
    replyTo: JPC_RECEIVING_EMAIL,
    subject: clientSubject,
    body: clientBody,
    name: "JPC Designs"
  });

  return jsonResponse_({ ok: true });
}

function handlePhotoUpload_(data) {
  if (!data.name || !data.email || !data.phone || !Array.isArray(data.photos) || !data.photos.length) {
    throw new Error("Required client information or photos are missing.");
  }

  const attachments = data.photos.slice(0, 5).map((photo, index) => {
    const bytes = Utilities.base64Decode(photo.data);
    const safeName = String(photo.name || `room-photo-${index + 1}.jpg`)
      .replace(/[^a-zA-Z0-9._-]/g, "_");
    return Utilities.newBlob(bytes, photo.type || "application/octet-stream", safeName);
  });

  const subject = `New Virtual Decoration Request — ${data.name}`;
  const body = [
    "A new client uploaded room photos through the JPC Designs website.",
    "",
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Phone: ${data.phone}`,
    `Room/Area: ${data.roomType || "Not provided"}`,
    `Budget: ${data.budget || "Not provided"}`,
    `Preferred Style: ${data.style || "Not provided"}`,
    `Photo permission confirmed: ${data.photoPermission || "No"}`,
    `Submitted: ${data.submittedAt || new Date().toISOString()}`,
    "",
    "What the client would like to change:",
    data.message || "No message provided",
    "",
    `Photos attached: ${attachments.length}`
  ].join("\n");

  MailApp.sendEmail({
    to: JPC_RECEIVING_EMAIL,
    replyTo: data.email,
    subject: subject,
    body: body,
    attachments: attachments,
    name: "JPC Designs Website"
  });

  const firstName = String(data.name).trim().split(/\s+/)[0] || data.name;
  MailApp.sendEmail({
    to: data.email,
    replyTo: JPC_RECEIVING_EMAIL,
    subject: "We received your room photos — JPC Designs",
    body: [
      `Hello ${firstName},`,
      "",
      "Thank you for sharing your space with JPC Designs. Your room photos and project details were received.",
      "",
      "Choose your preferred date and time for a complimentary introduction call here:",
      JPC_BOOKING_URL,
      "",
      "Appointments are available Monday through Friday, 10:00 AM–6:00 PM. Your appointment is confirmed after our team replies.",
      "",
      "JPC Designs",
      "Phone: (727) 303-8715",
      "Email: jpcdesign1996@gmail.com"
    ].join("\n"),
    name: "JPC Designs"
  });

  return jsonResponse_({ ok: true });
}

function jsonResponse_(value) {
  return ContentService
    .createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
