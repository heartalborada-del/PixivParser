let express = require('express');
const axios = require("axios");
let router = express.Router();

/* GET tag info */
router.get('/:tagName/', function (req, res, next) {
    res.json({
        code: -1,
        msg: 'coming soon'
    });
})

module.exports = router;
