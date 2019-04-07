let express = require('express');
let router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    let spawn = require("child_process").spawn;
    let process = spawn('python',["./hello.py",
        req.query.firstname,
        req.query.lastname] );

    process.stdout.on('data', function(data) {
        res.send(data.toString());
    } )
});

module.exports = router;
