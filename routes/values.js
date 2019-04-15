let express = require('express');
let router = express.Router();

/* GET users listing. */
router.get('/', function(req, res) {
    console.log('her');
    let rawdata = fs.readFileSync('./disease_freq.json');
    let Symptoms_freq = JSON.parse(rawdata);
    let values = [];
    Object.keys(Symptoms_freq).forEach(function(key) {
        values.push(Symptoms_freq[key]);
    });
    // res.send(JSON.stringify(values));
    res.send('hello');
});

module.exports = router;