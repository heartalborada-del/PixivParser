let express = require('express');
const {createProxyMiddleware} = require("http-proxy-middleware");
let router = express.Router();

const proxyMiddleware = createProxyMiddleware({
    target: 'https://i.pximg.net',
    changeOrigin: true,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36 Edg/115.0.1901.170',
        'Referer': 'https://www.pixiv.net/'
    }
});

router.use('/', proxyMiddleware);
module.exports = router;
