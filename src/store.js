const sessions = {};

function getSession(phone) {
  return sessions[phone] || null;
}

function setSession(phone, data) {
  sessions[phone] = data;
}

function clearSession(phone) {
  delete sessions[phone];
}

function getAllSessions() {
  return { ...sessions };
}

module.exports = { getSession, setSession, clearSession, getAllSessions };
