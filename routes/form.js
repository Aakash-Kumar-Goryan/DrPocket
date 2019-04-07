let express = require('express');
let router = express.Router();

/* GET home page. */
router.post('/', function(req, res, next) {
    console.log(req.body);
    // res.send('sens');
    let spawn = require("child_process").spawn;
    let process = spawn('python',["./hello.py",
        req.body.Age,
        req.body.Sex,
        req.body.cp,
        req.body.trestbps,
        req.body.chol,
        req.body.fbs,
        req.body.restecg,
        req.body.thalach,
        req.body.exang,
        req.body.oldpeak,
        req.body.slope
        ] );

    process.stdout.on('data', function(data) {
        res.send(data.toString());
    } )
});

module.exports = router;
