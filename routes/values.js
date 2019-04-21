let express = require('express');
let router = express.Router();
let fs = require('fs');
/* GET users listing. */
router.get('/', function(req, res) {
    let rawdata = fs.readFileSync('./disease_freq.json');
    let Symptoms_freq = JSON.parse(rawdata);
    let values = [];
    Object.keys(Symptoms_freq).forEach(function(key) {
        values.push(Symptoms_freq[key]);
    });
    res.send(values);
});

module.exports = router;