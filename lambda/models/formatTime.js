module.exports.formatTime = (timeStamp) => {
  let hours = timeStamp.getHours();
  let minutes = timeStamp.getMinutes();
  let amPm;

  if (hours > 12) {
    hours = hours - 12;
    amPm = "PM";
  } else {
    amPm = "AM";
  }

  return { hours, minutes, amPm };
}