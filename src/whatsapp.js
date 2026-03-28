function sendWhatsAppMessage(to, body) {
  console.log(`[WhatsApp → ${to}] ${body}`);
  return { success: true, to, body };
}

module.exports = { sendWhatsAppMessage };
