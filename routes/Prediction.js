let express = require('express');
let router = express.Router();

router.get('/', function(req, res) {
    res.render('Prediction', {data: 'Error Occurred'});
});

router.post('/', function(req, res) {
    console.log(req.body);
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
    ]);

    process.stdout.on('data', function(data) {
        res.render('Prediction', { data: data.toString()+ ' (in any major vessel)'});
    });
    process.stderr.on('data', (err) => {
        console.log(`stderr: ${err}`);
        res.render('Prediction', { data: 'Error Occurred'});
    });
});
module.exports = router;