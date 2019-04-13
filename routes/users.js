let express = require('express');
let router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    let spawn = require("child_process").spawn;
    let process = spawn('python',["./hello.py",
        req.query.firstname,
        req.query.lastname] );

    process.stdout.on('data', function(data) {
        res.send(data.toString());
    } )
});

module.exports = router;

// 'use strict';
// const functions = require('firebase-functions');
// const {WebhookClient} = require('dialogflow-fulfillment');
// const {Card, Suggestion} = require('dialogflow-fulfillment');
//
// process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

// exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
//     const agent = new WebhookClient({ request, response });
//     console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
//     console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
//
//     function welcome(agent) {
//         agent.add(`Welcome to my agent!`);
//     }
//
//     function fallback(agent) {
//         agent.add(`I didn't understand`);
//         agent.add(`I'm sorry, can you try again?`);
//     }
//     let intentMap = new Map();
//     intentMap.set('Default Welcome Intent', welcome);
//     intentMap.set('Default Fallback Intent', fallback);
//     // intentMap.set('your intent name here', yourFunctionHandler);
//     // intentMap.set('your intent name here', googleAssistantHandler);
//     agent.handleRequest(intentMap);
// });
