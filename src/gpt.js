const chrono = require("chrono-node");

function parseDatetime(userInput) {
  const results = chrono.parse(userInput, new Date(), { forwardDate: true });

  if (results.length > 0) {
    return results[0].start.date().toISOString();
  }

  console.warn(`[datetime] Could not parse "${userInput}", defaulting to tomorrow 10am`);
  const fallback = new Date();
  fallback.setDate(fallback.getDate() + 1);
  fallback.setHours(10, 0, 0, 0);
  return fallback.toISOString();
}

module.exports = { parseDatetime };
