// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');
const persistenceAdapter = require('ask-sdk-s3-persistence-adapter');
const { Pet } = require('./data/Pet');
const { getTimeStamp } = require('./models/getTimeStamp');
const { compareDates } = require('./controllers/compareDates');

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
  },
  async handle(handlerInput) {
    const attributesManager = handlerInput.attributesManager;
    const sessionAttributes = await attributesManager.getSessionAttributes();

    console.log(`Session Attributes: ${JSON.stringify(sessionAttributes)}`);

    if (sessionAttributes.pets.length > 0) {
      const speakOutput = `Hello, welcome back to Fat Cat.  Is it time to feed your pet?`;
      const repromptOutput = `I'm sorry, I didn't understand.  
      I can log a new event or tell you about an existing event.  Which would you like?`;

      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt(repromptOutput)
        .getResponse();
    } else {
      const speakOutput = 'Hello, welcome to Fat Cat.  To begin, introduce me to your pet!';
      const repromptOutput = `I'm sorry, I didn't understand that.  My pet's name is Tango, what's yours?`;
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt(repromptOutput)
        .getResponse();
    }
  }
};

const RegisterPetIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' 
    && handlerInput.requestEnvelope.request.intent.name === 'RegisterPetIntent';
  },
  async handle(handlerInput) {
    const name = handlerInput.requestEnvelope.request.intent.slots.name.value;
    const attributesManager = handlerInput.attributesManager;
    const sessionAttributes = await attributesManager.getSessionAttributes();

    if (sessionAttributes.pets[name]) {
      const existsOutput = `I think we've already met, hello ${name}`
      console.log(`Register conflict: Pet exists`);

      return handlerInput.responseBuilder
        .speak(existsOutput)
        .getResponse();
    } else {
      sessionAttributes.pets.push(name);
      sessionAttributes.logs[name] = new Pet(name);
      console.log(`Registered new pet`);

      console.log(`S3 Bucket Name: ${process.env.S3_PERSISTENCE_BUCKET}`)
      await attributesManager.setPersistentAttributes(sessionAttributes);
      await attributesManager.savePersistentAttributes();

      const speakOutput = `It's nice to meet you ${name}!`
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .getResponse();
    }
  }
};

const LogEventIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'LogEventIntent';
  },
  async handle(handlerInput) {
    const name = handlerInput.requestEnvelope.request.intent.slots.name.value;
    const attributesManager = handlerInput.attributesManager;
    const sessionAttributes = await attributesManager.getSessionAttributes();
    const timeStamp = getTimeStamp(handlerInput);

    //if getTimeStamp returned an error...
    if (timeStamp.name) {
      return handlerInput.responseBuilder.speak("There was a problem connecting to the service.").getResponse();
    }

    sessionAttributes.logs[name].events.push({ type: "fed", time: timeStamp });
    attributesManager.setPersistentAttributes(sessionAttributes);
    await attributesManager.savePersistentAttributes();

    const speakOutput = `You got it!  ${name}, it's time to eat!`;

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
  }
};

// Queries

const HasEatenTodayIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'HasEatenTodayIntent';
  },
  async handle (handlerInput) {
    const name = handlerInput.requestEnvelope.request.intent.slots.name.value;
    const attributesManager = handlerInput.attributesManager;
    const sessionAttributes = await attributesManager.getSessionAttributes();
    const { events } = sessionAttributes.logs[name];
    const lastFedTime = new Date(events[events.length - 1].time);
    const timeStamp = getTimeStamp(handlerInput);

    //if getTimeStamp returned an error...
    if (timeStamp.name) {
      return handlerInput.responseBuilder.speak("There was a problem connecting to the service.").getResponse();
    }

    if (compareDates(timeStamp, lastFedTime) === 0) {
      return handlerInput.responseBuilder
        .speak(`Yes, ${name} has eaten today.`)
        .getResponse();
    } else {
      return handlerInput.responseBuilder
        .speak(`No, ${name} has not eaten today.`)
        .getResponse();
    }
  }
}

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speakOutput = 'You can say hello to me! How can I help?';

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  }
};
const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
        || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speakOutput = 'Goodbye!';
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
  }
};
const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
  },
  async handle(handlerInput) {
    // Any cleanup logic goes here.
    const sessionAttributes = await handlerInput.attributesManager.getPersistentAttributes();
    console.log(`Final attributes: ${JSON.stringify(sessionAttributes)}`);

    await handlerInput.attributesManager.savePersistentAttributes();
    return handlerInput.responseBuilder.getResponse();
  }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.stack}`);
        const speakOutput = `Sorry, I had trouble doing what you asked. Please try again.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const LoadPetInfoInterceptor = {
  async process(handlerInput) {
    const attributesManager = handlerInput.attributesManager;
    const sessionAttributes = await attributesManager.getPersistentAttributes();

    if (!sessionAttributes.pets) {
      console.log(`Session attributes are empty, initializing`)
      sessionAttributes.pets = [];
      sessionAttributes.logs = {};
    }

    console.log(`Session Attributes: ${JSON.stringify(sessionAttributes)}`);
    attributesManager.setSessionAttributes(sessionAttributes);
  }
}

// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .withApiClient(new Alexa.DefaultApiClient())
    .withPersistenceAdapter(
      new persistenceAdapter.S3PersistenceAdapter({bucketName:process.env.S3_PERSISTENCE_BUCKET})
    )
    .addRequestHandlers(
      LaunchRequestHandler,
      RegisterPetIntentHandler,
      LogEventIntentHandler,
      HasEatenTodayIntentHandler,
      HelpIntentHandler,
      CancelAndStopIntentHandler,
      SessionEndedRequestHandler,
      IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    )
    .addRequestInterceptors(
      LoadPetInfoInterceptor,
    )
    .addErrorHandlers(
      ErrorHandler,
    )
    .lambda();
