'use strict';
let express = require('express');
let fs = require('fs');
const {WebhookClient} = require('dialogflow-fulfillment');

process.env.DEBUG = 'dialogflow:*'; // It enables lib debugging statements
let router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    let rawdata = fs.readFileSync('./disease_freq.json');
    let Symptoms_freq = JSON.parse(rawdata);
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
    let curr_symptoms = agent.parameters.Symptoms;
    console.log('here: '+ Symp);
    fs.readFile('./disease_freq.json',function (err,rawdata) {
        if(err){
            throw err;
        }
        let Symptoms_freq = JSON.parse(rawdata);
        for (let i = 0; i <curr_symptoms.length; i++) {
            Symptoms_freq[curr_symptoms[i]] += 1;
        }
        let data = JSON.stringify(Symptoms_freq, null, 2);
        fs.writeFile('./disease_freq.json', data, (err) => {
            if (err) throw err;
            console.log('Data written to file');
        });
    });
    return GetDiseases(Symp).then(function (data) {
        console.log('You might be suffering from: ' + data);
        let Curr_symp = data.toString().split('$');
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
    console.log('i am here');
    let raw_keyword = agent.context.get('signs_and_symptoms-followup').parameters.Diseases;
    let Search_keyword = raw_keyword.split(':')[1].split(',');
    console.log("Wikipedia Search: " + Search_keyword[1]);
    console.log(Search_keyword);
    console.log(typeof(Search_keyword[0]));
    return GetAboutDiseases(Search_keyword[0].trim()).then(async function (data) {
        console.log('Wikipedia: ' + Search_keyword[1]);
        agent.add(data.toString());
        await temp(agent, Search_keyword[1])
    }).catch(function (err) {
        console.log(err);
        agent.add('Error');
    });
}
function temp(agent,s) {
    return GetAboutDiseases(s.trim()).then(function (data) {
        console.log('Wikipedia: ' + data);
        agent.add(data.toString());
    }).catch(function (err) {
        console.log(err);
        agent.add('Error');
    })
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
