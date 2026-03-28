const { OpenAI } = require("openai");

let client = null;

function getClient() {
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}

async function parseDatetime(userInput) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.warn("[GPT] OPENAI_API_KEY not set — using fallback datetime parser");
    return fallbackParseDatetime(userInput);
  }

  try {
    const openai = getClient();
    const today = new Date().toISOString().split("T")[0];

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0,
      messages: [
        {
          role: "system",
          content:
            `Today's date is ${today}. Convert the user's input into an ISO 8601 datetime string. ` +
            "Return ONLY the ISO string, nothing else.",
        },
        { role: "user", content: userInput },
      ],
    });

    const iso = response.choices[0].message.content.trim();
    if (!iso || Number.isNaN(Date.parse(iso))) {
      throw new Error(`Invalid ISO string from GPT: ${iso}`);
    }
    return iso;
  } catch (err) {
    console.error("[GPT] Error calling OpenAI:", err.message);
    return fallbackParseDatetime(userInput);
  }
}

function fallbackParseDatetime(userInput) {
  const now = new Date();
  const lower = userInput.toLowerCase();

  const date = new Date(now);
  if (lower.includes("tomorrow")) {
    date.setDate(date.getDate() + 1);
  }

  const timeMatch = lower.match(/(\d{1,2})\s*(am|pm)/i);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1], 10);
    if (timeMatch[2].toLowerCase() === "pm" && hours < 12) hours += 12;
    if (timeMatch[2].toLowerCase() === "am" && hours === 12) hours = 0;
    date.setHours(hours, 0, 0, 0);
  } else {
    date.setHours(10, 0, 0, 0);
  }

  return date.toISOString();
}

module.exports = { parseDatetime, fallbackParseDatetime };
