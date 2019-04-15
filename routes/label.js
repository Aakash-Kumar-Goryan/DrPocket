let express = require('express');
let router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    let rawdata = fs.readFileSync('./disease_freq.json');
    let lables = Object.keys(JSON.parse(rawdata));
    // res.send(JSON.stringify(lables));
    res.send('hello');
});

module.exports = router;