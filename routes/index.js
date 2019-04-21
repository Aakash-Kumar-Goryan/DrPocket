'use strict';
let express = require('express');
let fs = require('fs');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Text, Card, Image, Suggestion, Payload} = require('dialogflow-fulfillment');
const imageUrl = `https://assistant.google.com/static/images/molecule/Molecule-Formation-stop.png`;
const linkUrl = 'https://dr-pocket.herokuapp.com/form';
const {Permission} = require('actions-on-google');
// const {BasicCard, Button,Image} = require('actions-on-google');
process.env.DEBUG = 'dialogflow:*'; // It enables lib debugging statements
let router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', { title: 'Express'});
});

router.post('/', function(request, response) {
    const agent = new WebhookClient({ request, response });
    let intentMap = new Map();
    intentMap.set('Signs_and_Symptoms', SendDiseases);
    intentMap.set('Temp', EMP);
    intentMap.set('Signs_and_Symptoms - yes',SendAboutDiseases);
    intentMap.set('Signs_and_Symptoms - yes - yes', requestPermission);
    intentMap.set('location', requestPermission);
    intentMap.set('user_info',userInfo);
    agent.handleRequest(intentMap).then(function (data) {
        console.log('SUCCESSFULLY RESPONDED');
    }).catch(function (err) {
        console.log(err);
    });
});
const EMP = (agent) => {
    console.log('Inside EMP');
    // let conv = agent.conv();
    // conv.ask(new Image({
    //     url: 'https://developers.google.com/web/fundamentals/accessibility/semantics-builtin/imgs/160204193356-01-cat-500.jpg',
    //     alt: 'A cat',
    // }));
    // conv.ask(new BasicCard({
    //     title: 'Card Title',
    //     text: 'Description',
    //     image: {
    //         url: 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png',
    //         accessibilityText: 'Google Logo',
    //     },
    //     buttons: new Button({
    //         title: 'Button Title',
    //         url: 'https://www.google.com',
    //     }),
    // }));
    // agent.add(conv);
    // let card = new Card();
    // card.setTitle('sample card title');
    // card.setImage('https://assistant.google.com/static/images/molecule/Molecule-Formation-stop.png');
    // card.setButton({ text: 'button text', url: 'https://assistant.google.com/' });
    //
    // agent.add(card);

    // agent.add(new Image('https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png'));
    // agent.add(new Suggestion('sample reply'));
    // agent.add('here');
    // const googlePayload = {
    //     expectUserResponse: true,
    //     isSsml: false,
    //     noInputPrompts: [],
    //     richResponse: {
    //         items: [{simpleResponse: {textToSpeech: 'hello', displayText: 'hi'}}],
    //         suggestions: [{title: 'Say this'}, {title: 'or this'}],
    //     },
    //     systemIntent: {
    //         intent: 'actions.intent.OPTION',
    //         data: {
    //             '@type': 'type.googleapis.com/google.actions.v2.OptionValueSpec',
    //             'listSelect': {
    //                 items: [
    //                     {
    //                         optionInfo: {key: 'key1', synonyms: ['key one']},
    //                         title: 'must not be empty',
    //                     },
    //                     {
    //                         optionInfo: {key: 'key2', synonyms: ['key two']},
    //                         title: 'must not be empty, but unquie, for some reason',
    //                     },
    //                 ],
    //             },
    //         },
    //     },
    // };
    // agent.add(new Payload(agent.ACTIONS_ON_GOOGLE, googlePayload));
    agent.add(new Card({
            title: 'card title',
            text: 'card text',
            imageUrl: imageUrl,
            buttonText: 'button text',
            buttonUrl: linkUrl,
        }),
    );
    // agent.add(new Card({
    //     title: 'Card Title',
    //     text: 'Description',
    //     image: {
    //         url: 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png',
    //         accessibilityText: 'Google Logo',
    //     },
    //     buttons: new Button({
    //         title: 'Button Title',
    //         url: 'https://www.google.com',
    //     }),
    // }));
};
const requestPermission = (agent) => {
    let conv = agent.conv();
    const options = {
        context: 'To get hospitals near your location',
        permissions: ['DEVICE_PRECISE_LOCATION'],
    };
    conv.ask(new Permission(options));
    agent.add(conv);
    // agent.add(new Suggestion('yes'));
    // agent.add(new Suggestion('no'));
};
const userInfo = (agent)=> {
    let conv = agent.conv() ;
    if(typeof conv.request.user.permissions !== "undefined") {
        const {coordinates} = conv.device.location;
        if (coordinates) {
            return get_nearby_hospitals(coordinates.latitude,coordinates.longitude).then(function (data) {
                agent.add(new Card({
                        title: 'Nearby Hospitals',
                        text: data.toString(),
                        buttonText: 'If you have your Blood Report Click Here',
                        buttonUrl: linkUrl
                    }),
                );
                // agent.add(data.toString());
            }).catch(function (err) {
                console.log(err);
                agent.add('Sorry, I could not able to find Nearby Hospital.');
            });
        } else {
            conv.ask('Sorry, I could not figure out where you are.');
        }
    } else {
        conv.ask("Sorry, permission denied. Can't find Nearby Hospital without you location access");
    }
    agent.add(conv);
};
const get_nearby_hospitals = (latitude,longitude) => {
    return new Promise(function(resolve, reject) {
        let spawn = require("child_process").spawn;
        let process = spawn('python',["./nearHospital.py",latitude,longitude] );

        process.stdout.on('data', function(data) {
            console.log("Nearby Hospital Received From Python Successfully");
            resolve(data);
        });
        process.stderr.on('data', (err) => {
            console.log(`stderr: ${err}`);
            reject(err);
        });
    })
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
        agent.add(new Suggestion('yes'));
        agent.add(new Suggestion('no'));
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
        let disease1 = data.toString();
        // agent.add(data.toString());
        await temp(agent, Search_keyword[1],Search_keyword[0],disease1)
    }).catch(function (err) {
        console.log(err);
        agent.add('Error');
    });
}
function temp(agent,s,s2,disease1) {
    return GetAboutDiseases(s.trim()).then(function (data) {
        console.log('Wikipedia: ' + data);
        agent.add(disease1 + '\n' + data.toString());
        agent.add('Do you want to see Nearby Hospitals?');
        agent.add(new Suggestion('yes'));
        agent.add(new Suggestion('no'));
        console.log(typeof(s.trim()));
        console.log('b ' + s2.trim());
        // if (s.trim() == 'Heart attack') {
        //     agent.add('Do you have your blood report?');
        // } else if (s2.trim() == 'Heart attack') {
        //     agent.add('Do you have your blood report?');
        // }
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
