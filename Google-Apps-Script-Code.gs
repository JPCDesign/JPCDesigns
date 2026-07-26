/**
 * JPC Design — Free virtual-decoration photo receiver
 * Deploy this file as a Google Apps Script Web App.
 */
const JPC_RECEIVING_EMAIL = "jpcdesign1996@gmail.com";

function doGet() {
  return ContentService
    .createTextOutput("JPC Design photo receiver is active.")
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents || "{}");

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
      "A new client uploaded room photos through the JPC Design website.",
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
      name: "JPC Design Website"
    });

    MailApp.sendEmail({
      to: data.email,
      subject: "We received your room photos — JPC Design",
      body: [
        `Hello ${data.name},`,
        "",
        "Thank you for sharing your space with JPC Design. Your room photos and project details were received.",
        "",
        "Please complete the complimentary virtual introduction scheduling form that opened after your upload.",
        "",
        "JPC Design",
        "727-303-8715",
        "JPC Designs Office"
      ].join("\n"),
      name: "JPC Design"
    });

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    console.error(error);
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(error.message || error) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
