const { Router } = require("express");
const { getSession, setSession } = require("./store");
const { parseDatetime } = require("./gpt");
const { createZoomMeeting } = require("./zoom");
const { sendWhatsAppMessage } = require("./whatsapp");

const router = Router();

/**
 * Extract phone number and message text from the request body.
 * Supports two payload formats:
 *
 * 1. 8x8 ChatApps inbound webhook:
 *    { eventType: "inbound_message_received", payload: { user: { msisdn }, type: "Text", content: { text } } }
 *
 * 2. Simple/Twilio-style (for curl testing):
 *    { From: "+...", Body: "..." }
 */
function extractMessage(reqBody) {
  if (reqBody.eventType === "inbound_message_received" && reqBody.payload) {
    const p = reqBody.payload;
    const phone = p.user && p.user.msisdn;

    let text = "";
    if (p.type === "Text" && p.content) {
      text = p.content.text || "";
    } else if (p.type === "Interactive" && p.content && p.content.interactive) {
      const inter = p.content.interactive;
      if (inter.button_reply) {
        text = inter.button_reply.title || "";
      } else if (inter.list_reply) {
        text = inter.list_reply.title || "";
      }
    }

    return { phone, text: text.trim() };
  }

  const phone = reqBody.From || reqBody.from;
  const text = (reqBody.Body || reqBody.body || "").trim();
  return { phone, text };
}

router.post("/webhook/whatsapp", async (req, res) => {
  try {
    const { phone, text } = extractMessage(req.body);

    if (!phone || !text) {
      return res.status(400).json({ error: "Missing phone number or message text" });
    }

    const session = getSession(phone);
    let reply;

    if (!session || text.toLowerCase() === "hi" || text.toLowerCase() === "hello") {
      setSession(phone, { phone, step: "ask_name" });
      reply = "Hi! What is your name?";
    } else if (session.step === "ask_name") {
      session.name = text;
      session.step = "ask_datetime";
      setSession(phone, session);
      reply = `Thanks ${session.name}. What date and time works for your appointment?`;
    } else if (session.step === "ask_datetime") {
      const datetime = await parseDatetime(text);
      const meeting = createZoomMeeting(session.name, datetime);

      session.datetime = datetime;
      session.zoomLink = meeting.link;
      session.step = "done";
      setSession(phone, session);

      reply =
        `Your appointment is confirmed for ${datetime}.\n` +
        `Join here: ${meeting.link}`;
    } else {
      reply = 'Your appointment is already booked! Send "Hi" to start over.';
    }

    const result = await sendWhatsAppMessage(phone, reply);

    if (!result.success) {
      console.error(`[webhook] Failed to send WhatsApp message to ${phone}`);
      return res.status(502).json({ error: "Failed to send message", reply });
    }

    res.status(200).json({ reply });
  } catch (err) {
    console.error("[webhook] Unhandled error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
