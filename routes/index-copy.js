let express = require('express');
const dialogflow = require('dialogflow');
const uuid = require('uuid');
let router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', { title: 'Express' });
});

async function runSample(projectId = 'pocketdoctor-8418d') {
    const sessionId = uuid.v4();
    const sessionClient = new dialogflow.SessionsClient();
    const sessionPath = sessionClient.sessionPath(projectId, sessionId);
    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: 'hello',
                languageCode: 'en-US',
            },
        },
    };
    // Send request and log result
    const responses = await sessionClient.detectIntent(request);
    console.log('Detected intent');
    const result = responses[0].queryResult;
    console.log(`  Query: ${result.queryText}`);
    console.log(`  Response: ${result.fulfillmentText}`);
    if (result.intent) {
        console.log(`  Intent: ${result.intent.displayName}`);
    } else {
        console.log(`  No intent matched.`);
    }
}

router.post('/', function(req, res) {
    console.log(req.body.session);
    // console.log(req.body.queryResult.queryText);
    // console.log(req.body.queryResult.parameters.Symptoms);
    let spawn = require("child_process").spawn;
    console.log(JSON.stringify(req.body.queryResult.parameters.Symptoms));
    let process = spawn('python',["./DrPocket.py",JSON.stringify(req.body.queryResult.parameters.Symptoms)] );

    console.log("blah blah");

    process.stdout.on('data', function(data) {
        console.log(data.toString());
        console.log("Called !");
        try{
            res.send(JSON.stringify({
                "payload": {
                    "google": {
                        "expectUserResponse": false,
                        "richResponse": {
                            "items": [
                                {
                                    "simpleResponse": {
                                        "textToSpeech": "This is a python response",
                                        "displayText": data.toString()
                                    }
                                }
                            ]
                        }
                    }
                }
                // "outputContexts": [
                //     {
                //         "name": req.body.session + 'contexts/diseases',
                //         "lifespanCount": 5,
                //         "parameters": {
                //             "abc": "AIDS"
                //         }
                //     }
                // ]
            }));
        }
        catch(e){
            console.error(e);
        }

    });
    process.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`);
    });
});
module.exports = router;
