let express = require('express');
const axios = require("axios");
let router = express.Router();

let getImage = require('./api/getImage');
let getTagData = require('./api/getTagData');
let getTagInfo = require('./api/getTagInfo');

router.use('/getArtworksData',getImage);
router.get('/getImageData/*', (req, res) => {
    res.redirect(301,`/api/${req.url.replace('getImageData','getArtworksData')}`);
});
router.use('/getTagData',getTagData);
router.use('/getTagInfo',getTagInfo);

module.exports = router;
