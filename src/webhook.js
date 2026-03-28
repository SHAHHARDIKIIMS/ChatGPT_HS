const { Router } = require("express");
const { getSession, setSession } = require("./store");
const { parseDatetime } = require("./gpt");
const { createZoomMeeting } = require("./zoom");
const { sendWhatsAppMessage } = require("./whatsapp");

const router = Router();

router.post("/webhook/whatsapp", async (req, res) => {
  const phone = req.body.From || req.body.from;
  const body = (req.body.Body || req.body.body || "").trim();

  if (!phone || !body) {
    return res.status(400).json({ error: "Missing 'From' or 'Body' in request" });
  }

  const session = getSession(phone);
  let reply;

  if (!session || body.toLowerCase() === "hi" || body.toLowerCase() === "hello") {
    setSession(phone, { phone, step: "ask_name" });
    reply = "Hi! What is your name?";
  } else if (session.step === "ask_name") {
    session.name = body;
    session.step = "ask_datetime";
    setSession(phone, session);
    reply = `Thanks ${session.name}. What date and time works for your appointment?`;
  } else if (session.step === "ask_datetime") {
    const datetime = await parseDatetime(body);
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

  sendWhatsAppMessage(phone, reply);
  return res.json({ reply });
});

module.exports = router;
