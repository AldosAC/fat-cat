module.exports.formatTime = (timeStamp) => {
  let hour = timeStamp.getHours();
  let minutes = timeStamp.getMinutes();
  let amPm;

  if (hour >= 12) {
    hour = hour - 12;
    amPm = "PM";
  } else {
    amPm = "AM";
  }

  return { hour, minutes, amPm };
}