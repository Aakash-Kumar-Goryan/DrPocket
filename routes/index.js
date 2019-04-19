'use strict';
let express = require('express');
let fs = require('fs');
const {WebhookClient} = require('dialogflow-fulfillment');
const Permission = require('actions-on-google');
process.env.DEBUG = 'dialogflow:*'; // It enables lib debugging statements
let router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', { title: 'Express'});
});

router.post('/', function(request, response) {
    console.log(request.body);
    const agent = new WebhookClient({ request, response });
    console.log('Inside Router');

    let intentMap = new Map();
    intentMap.set('Signs_and_Symptoms', SendDiseases);
    intentMap.set('Signs_and_Symptoms - yes',SendAboutDiseases);
    intentMap.set('location',requestPermission);
    intentMap.set('user_info',userInfo);

    console.log('Router Ends');
    agent.handleRequest(intentMap).then(function (data) {
        console.log('WebhookClient successfully responded' + data);
    }).catch(function (err) {
        console.log(err);
    });
});
const requestPermission = (agent) => {
    agent.askForPermission('To locate you', app.SupportedPermissions.DEVICE_PRECISE_LOCATION);
};
const userInfo = (app) => {
    if (app.isPermissionGranted()) {
        const address = app.getDeviceLocation().address;
        if (address) {
            app.tell(`You are at ${address}`);
        }
        else {
            // Note: Currently, precise locaton only returns lat/lng coordinates on phones and lat/lng coordinates
            // and a geocoded address on voice-activated speakers.
            // Coarse location only works on voice-activated speakers.
            app.tell('Sorry, I could not figure out where you are.');
        }
    } else {
        app.tell('Sorry, I could not figure out where you are.');
    }
};
function SendDiseases (agent) {
    let curr_symptoms = agent.parameters.Symptoms;
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
    let Symp = JSON.stringify(agent.parameters.Symptoms);
    console.log('here: '+ Symp);
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
    console.log('i am here');
    let raw_keyword = agent.context.get('signs_and_symptoms-followup').parameters.Diseases;
    let Search_keyword = raw_keyword.split(':')[1].split(',');
    console.log("Wikipedia Search: " + Search_keyword[1]);
    console.log(Search_keyword);
    console.log(typeof(Search_keyword[0]));
    return GetAboutDiseases(Search_keyword[0].trim()).then(async function (data) {
        console.log(data.toString());
        agent.add(data.toString());
        await temp(agent, Search_keyword[1],Search_keyword[0])
    }).catch(function (err) {
        console.log(err);
        agent.add('Error');
    });
}
function temp(agent,s,s2) {
    return GetAboutDiseases(s.trim()).then(function (data) {
        console.log('Wikipedia: ' + data);
        agent.add(data.toString());
        console.log(typeof(s.trim()));
        console.log('b ' + s2.trim());
        if (s.trim() == 'Heart attack') {
            agent.add('Do you have your blood report?');
        } else if (s2.trim() == 'Heart attack') {
            agent.add('Do you have your blood report?');
        }
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
