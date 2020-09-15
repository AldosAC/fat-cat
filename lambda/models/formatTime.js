module.exports.formatTime = (timeStamp) => {
  let hour = timeStamp.getHours();
  let minutes = timeStamp.getMinutes();
  let amPm;

  if (hours > 12) {
    hour = hour - 12;
    amPm = "PM";
  } else {
    amPm = "AM";
  }

  return { hour, minutes, amPm };
}