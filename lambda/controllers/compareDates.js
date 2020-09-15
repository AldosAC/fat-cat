module.exports.compareDates = (dateOne, dateTwo) => {
  const oneDay = 24*60*60*1000;

  // Remove time as we just want to compare dates
  dateOne = new Date(dateOne.getFullYear(), dateOne.getMonth(), dateOne.getDate());
  dateTwo = new Date(dateTwo.getFullYear(), dateTwo.getMonth(), dateTwo.getDate());

  return Math.floor(Math.abs((dateOne.getTime() - dateTwo.getTime()) / oneDay));
}