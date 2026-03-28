const express = require("express");
const webhookRouter = require("./webhook");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use(webhookRouter);

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`WhatsApp Appointment Bot running on port ${PORT}`);
  });
}

module.exports = { app };
