const Alexa = require('ask-sdk-core');

module.exports.getTimeStamp = async (handlerInput) => {
  const deviceId = Alexa.getDeviceId(handlerInput.requestEnvelope);
  let userTimeZone;

  try {
      const upsServiceClient = handlerInput.serviceClientFactory.getUpsServiceClient();
      userTimeZone = await upsServiceClient.getSystemTimeZone(deviceId);
  } catch (error) {
  
      if (error.name !== 'ServiceError') {
          return handlerInput.responseBuilder.speak("There was a problem connecting to the service.").getResponse();
      }
      console.log('error', error.message);
  }

  return new Date(new Date().toLocaleString("en-US", {timeZone: userTimeZone}));
}