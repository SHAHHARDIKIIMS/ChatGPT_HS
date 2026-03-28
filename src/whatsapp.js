const https = require("node:https");

const EIGHTX8_BASE_HOST = "chatapps.8x8.com";

function getConfig() {
  return {
    apiKey: process.env.EIGHTX8_API_KEY || "",
    subAccountId: process.env.EIGHTX8_SUBACCOUNT_ID || "",
  };
}

function sendWhatsAppMessage(to, body) {
  const { apiKey, subAccountId } = getConfig();

  if (!apiKey || !subAccountId) {
    console.log(`[WhatsApp MOCK → ${to}] ${body}`);
    return Promise.resolve({ success: true, to, body, mock: true });
  }

  const payload = JSON.stringify({
    user: { msisdn: to },
    type: "text",
    content: { text: body },
  });

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: EIGHTX8_BASE_HOST,
        path: `/api/v1/subaccounts/${encodeURIComponent(subAccountId)}/messages`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${apiKey}`,
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => { data += chunk; });
        res.on("end", () => {
          const status = res.statusCode;
          console.log(`[8x8 → ${to}] status=${status}`);
          if (status >= 200 && status < 300) {
            try {
              resolve({ success: true, to, body, response: JSON.parse(data) });
            } catch {
              resolve({ success: true, to, body, response: data });
            }
          } else {
            console.error(`[8x8 ERROR] status=${status} body=${data}`);
            resolve({ success: false, to, body, status, error: data });
          }
        });
      },
    );

    req.on("error", (err) => {
      console.error("[8x8 ERROR]", err.message);
      reject(err);
    });

    req.write(payload);
    req.end();
  });
}

module.exports = { sendWhatsAppMessage };
