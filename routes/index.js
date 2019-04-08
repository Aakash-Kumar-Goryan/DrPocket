var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', { title: 'Express' });
});

router.post('/', function(req, res) {
    console.log(req.body.queryResult.queryText);
    console.log(req.body.queryResult.parameters.Symptoms);
    let spawn = require("child_process").spawn;
    let process = spawn('python',["./DrPocket.py",JSON.stringify(req.body.queryResult.parameters.Symptoms)] );
    // res.send("hello");
    process.stdout.on('data', function(data) {
        console.log(data.toString());
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
        }));
    })

});
module.exports = router;
