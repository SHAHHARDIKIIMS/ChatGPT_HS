function createZoomMeeting(name, datetime) {
  const meetingId = Math.random().toString(36).substring(2, 10);
  return {
    link: `https://zoom.us/j/${meetingId}`,
    meetingId,
    topic: `Appointment with ${name}`,
    startTime: datetime,
  };
}

module.exports = { createZoomMeeting };
