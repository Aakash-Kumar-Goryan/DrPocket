'use strict';
let express = require('express');
const {WebhookClient} = require('dialogflow-fulfillment');

process.env.DEBUG = 'dialogflow:*'; // It enables lib debugging statements
let router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', { title: 'Express' });
});

router.post('/', function(request, response) {
    const agent = new WebhookClient({ request, response });
    console.log('Inside Router');

    let intentMap = new Map();
    intentMap.set('Signs_and_Symptoms', SendDiseases);
    intentMap.set('Signs_and_Symptoms - yes',SendAboutDiseases);

    console.log('Router Ends');

    agent.handleRequest(intentMap).then(function (data) {
        console.log('This is: '+ data);
    }).catch(function (err) {
        console.log(err);
    });
});
function SendDiseases (agent) {
    let Symp = JSON.stringify(agent.parameters.Symptoms);
    return GetDiseases(Symp).then(function (data) {
        console.log('You might be suffering from: ' + data);
        agent.add(data.toString());
        agent.add('Do you want learn more about it?');
        agent.context.set({
            'name':'Signs_and_Symptoms-followup',
            'lifespan': 2,
            'parameters':{
                'Diseases': data.toString()
            }
        });
    }).catch(function (err) {
        console.log(err);
        agent.add('Error');
    });
}
function GetDiseases(Symptoms) {
    return new Promise(function(resolve, reject) {
        let spawn = require("child_process").spawn;
        let process = spawn('python',["./DrPocket.py",Symptoms] );

        process.stdout.on('data', function(data) {
            console.log("Resolved promise");
            resolve(data);
        });
        process.stderr.on('data', (err) => {
            console.log(`stderr: ${err}`);
            reject(err);
        });
    })
}
function SendAboutDiseases (agent) {
    let Search_keyword = agent.context.get('signs_and_symptoms-followup').parameters.Diseases;
    console.log("Wikipedia Search: " + Search_keyword);
    return GetAboutDiseases(Search_keyword).then(function (data) {
        console.log('Wikipedia: ' + data);
        agent.add(data.toString());
    }).catch(function (err) {
        console.log(err);
        agent.add('Error');
    });
}
function GetAboutDiseases(Search_keyword) {
    return new Promise(function(resolve, reject) {
        let spawn = require("child_process").spawn;
        let process = spawn('python',["./Wikipedia.py",Search_keyword] );

        process.stdout.on('data', function(data) {
            console.log("Resolved Wiki promise");
            resolve(data);
        });
        process.stderr.on('data', (err) => {
            console.log(`stderr: ${err}`);
            reject(err);
        });
    })
}
module.exports = router;
