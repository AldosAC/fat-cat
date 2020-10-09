### Fat Cat

Fat Cat is the Alexa skill for fact checking your fat cat.  Think your girlfriend fed your cat this morning, but your cat's acting like it hasn't eaten in a week?  Fat Cat can help get to the bottom of it.

## Table of Contents
1. Installation
2. Usage

## Installation

While fat cat is in development the best way to install and try the app is by using the Alexa Developer Console and creating a new custom project.  Then copy and paste the link to this repo to import the code and you should be good to launch it in the test environment on the Alexa Developer Console.

I'll update the Readme with clearer instructions soon.

## Usage

Once you've completed the installation, click on the "Test" tab to give it a try!

Start by typing or (if you have a mic connected) saying "open Fat Cat".

From there, Alexa will prompt you to introduce your pet to her.  This registers your pet in the app, allowing you to log events and make queries about that pet.

Currently, the following events/queries are supported:
"feed <pet>" - Logs a "feed" event for that pet.
"when was the last time <pet> ate?" - Queries the time/date of the last "feed" event for that pet.
"has <pet> eaten today?" - Queries whether or not a "feed" event has been logged today for that pet.

The interaction model is designed to be as flexible as possible, so the phrases don't need to be exact!  "When did <pet> eat last?" should behave the same as "when was the last time <pet> ate?".  Give it a try and let me know what you think!
