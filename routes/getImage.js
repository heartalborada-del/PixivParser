let express = require('express');
const axios = require("axios");
let router = express.Router();

/* GET pid Data */
router.get('/:pid/', function (req, res, next) {
    if (req.params.pid == null) {
        return res.json({
            code: -1,
            msg: "invalid PID"
        })
    }
    let lang = 'en-US'
    if(req.query.lang != null) {
        lang = req.query.lang
    }
    let isRaw = false
    if(req.query.raw) {
        isRaw = req.query.raw;
    }
    let axiosSetting = process.env.NODE_ENV === 'development' ? {
        proxy: {
            host: "127.0.0.1",
            port: 7890,
            protocol: "http"
        },
        headers: {
            "Accept-Language": `${lang}`,
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36 Edg/115.0.1901.165"
        },
    } : {
        headers: {
            "Accept-Language": `${lang}`,
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36 Edg/115.0.1901.165"
        },
        timeout:2000
    };
    axios.create(axiosSetting).get(`https://www.pixiv.net/ajax/illust/${req.params.pid}`).then(resp => {
        if (resp.data['error'] === true) {
            return res.json({
                code: -1,
                msg: resp.data['message']
            })
        }
        let bodyData = resp.data['body']
        if(isRaw) {
            return res.json({
                code: 0,
                msg: 'ok',
                raw: bodyData,
            });
        }
        let tags = [];
        let isR18 = false;
        bodyData['tags']['tags'].forEach(o => {
            if(o['tag']==="R-18" || o['tag'] ==="R-18G") isR18=true;
            tags.push({
                name: o['tag'],
                translation:o['translation']
            })
        })
        let image = {
            date: {
                create: "",
                update: ""
            },
            urls: {
                regular: "",
                original: "",
                zip: "",
            }
        }
        if (bodyData['userIllusts'][req.params.pid] == null) {
            return res.json({
                code: -1,
                msg: "Can't get current illustration image url"
            })
        }
        let illust = bodyData['userIllusts'][req.params.pid]
        image.date.create = illust['createDate'];
        image.date.update = illust['updateDate'];
        let date = getTimeByZone(9,new Date(illust['updateDate']))
        let dateStr =
            `${date.getFullYear()}/`+
            `${prefixZero(date.getMonth()+1,2)}/`+
            `${prefixZero(date.getDate(),2)}/`+
            `${prefixZero(date.getHours(),2)}/`+
            `${prefixZero(date.getMinutes(),2)}/`+
            `${prefixZero(date.getSeconds(),2)}`
        image.urls.regular= `{imageDomain}/img-master/img/${dateStr}/${req.params.pid}_p{selectPage}_master1200.jpg`
        //IllustType 0:illust 1:manga 2:ugoira
        switch (bodyData['illustType']) {
            case 0:
                image.urls.original= `{imageDomain}/img-original/img/${dateStr}/${req.params.pid}_p{selectPage}.{ext}`;
                break;
            case 1:
                image.urls.original= `{imageDomain}/img-original/img/${dateStr}/${req.params.pid}_p{selectPage}.{ext}`;
                break;
            case 2:
                image.urls.original= `{imageDomain}/img-original/img/${dateStr}/${req.params.pid}_ugoira{selectPage}.{ext}`;
                image.urls.zip= `{imageDomain}/img-zip-ugoira/img/${dateStr}/${req.params.pid}_ugoira600x600.zip`;
                break;
        }
        let data = {
            illust: {
                info: {
                    id: bodyData['id'],
                    title: bodyData['title'],
                    description: bodyData['description'],
                    pages: bodyData['pageCount'],
                    views: bodyData['viewCount'],
                    likes: bodyData['likeCount'],
                    bookmarks: bodyData['bookmarkCount'],
                    aiType: bodyData['aiType']
                },
                tags,
                image
            }
        }
        return res.json({
            code: 0,
            msg: 'ok',
            data,
        });
    }).catch(e => {
        if(e.response != null && e.response.data != null)
            return res.json({
                code: -1,
                msg: e.response.data['message']
            })
        return res.json({
            code: -1,
            msg: e.message
        })
    })
});
function prefixZero(num, cover) {
    return String("0".repeat(cover) + num).slice(-cover);
}
function getTimeByZone(timezone = 9, date) {
    let nowDate = !date ? new Date().getTime() : new Date(date).getTime()
    let offset_GMT = new Date().getTimezoneOffset()
    let GMT = nowDate + offset_GMT * 60 * 1000
    return new Date(GMT + timezone * 60 * 60 * 1000)
}

module.exports = router;
