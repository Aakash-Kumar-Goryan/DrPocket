let express = require('express');
let router = express.Router();
let fs = require('fs');
/* GET users listing. */
router.get('/', function(req, res) {
    let rawdata = fs.readFileSync('./disease_freq.json');
    console.log(rawdata);
    let labels = Object.keys(JSON.parse(rawdata));
    res.send(labels);
});

module.exports = router;