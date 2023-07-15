const defaultImagesPath = {
    empty: '/img/status/No Image.png',
    filtered: '/img/status/Filtered.png',
    error: '/img/status/Error.png'
}
const IllustInfoDic = {
    view: document.querySelector('label#illustView'),
    bookmark: document.querySelector('label#illustBookmark'),
    like: document.querySelector('label#illustLike'),
    time: document.querySelector('label#illustTime'),
    pageSelect: document.querySelector('select#pageSelect'),
    pidInput: document.querySelector('input#pidInput'),
    pidForm: document.querySelector('form.input#pidForm'),
    tagDisplay: document.querySelector('div.tags#tagsDisplayDiv'),
    illustDisplay: document.querySelector('img#illustDisplay'),
    imgDisplay: document.querySelector('canvas#illustDisplay')
}

const tagGenerate = {
    normal: (main,sub) => {
        let tag = document.createElement('div');
        tag.classList.add('tag');
        let mainLabel = document.createElement('label');
        mainLabel.classList.add('untranslated');
        mainLabel.textContent = main;
        tag.appendChild(mainLabel);
        if(sub) {
            let subLabel = document.createElement('label');
            subLabel.classList.add('translated');
            subLabel.textContent = sub;
            tag.appendChild(subLabel);
        }
        return tag
    },
    r18: (main,sub) => {
        let tag = tagGenerate.normal(main,sub);
        tag.classList.add('r18');
        return tag
    },
    r18g: (main,sub) => {
        let tag = tagGenerate.normal(main,sub);
        tag.classList.add('r18g');
        return tag
    },
}

IllustInfoDic.pidForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let pid = IllustInfoDic.pidInput.value;
    axios.get(`/api/getImageData/${pid}`)
        .then(resp => {
            console.log(resp)
            let json = resp['data']
            let data = json['data']
            if(data) {
                let illust = data['illust']
                setNewInfo(
                    illust['info']['views'],
                    illust['info']['bookmarks'],
                    illust['info']['likes'],
                    formatDate(new Date(data['illust']['image']['date']['create'].toString()))
                )
                removeAllOfChildren(IllustInfoDic.pageSelect);
                for(let i=0;i<parseInt(illust['info']["pages"]);i++){
                    let opt = document.createElement('option');
                    opt.textContent = i.toString();
                    IllustInfoDic.pageSelect.appendChild(opt);
                }
                IllustInfoDic.pageSelect.parentElement.classList.remove('disabled');
                removeAllOfChildren(IllustInfoDic.tagDisplay);
                sessionStorage.setItem('r18Type','0');
                for (let tag of illust['tags']) {
                    let name = tag['name'],sub = tag['translation'];
                    if(sub !== undefined) {
                        sub = sub['en'];
                    }
                    let tagInstance = tagGenerate.normal(name,sub);
                    if(name === 'R-18') {
                        tagInstance = tagGenerate.r18(name,sub);
                        if(sessionStorage.getItem('r18Type') === '0')
                            sessionStorage.setItem('r18Type','1');
                    } else if (name === 'R-18G') {
                        tagInstance = tagGenerate.r18g(name,sub);
                        sessionStorage.setItem('r18Type','2');
                    }
                    IllustInfoDic.tagDisplay.appendChild(tagInstance);
                    //DEBUG
                }
                //showImage('/img/status/Error.png','1')
                showImage('https://i.pixiv.re/img-master/img/2023/07/13/08/09/22/109868720_p0_master1200.jpg','1')
            }
        }).catch(e => {
            console.log(e)
    })
})

function setNewInfo(view,bookmark,like,time) {
    IllustInfoDic.view.textContent = view;
    IllustInfoDic.bookmark.textContent = bookmark;
    IllustInfoDic.like.textContent=like;
    IllustInfoDic.time.textContent=time;
}

function formatDate (date) {
    let YY = date.getFullYear();
    let MM = date.getMonth() + 1 < 10 ? '0' + date.getMonth() + 1 : date.getMonth() + 1;
    let DD = date.getDate() < 10 ? ('0' + date.getDate()) : date.getDate();
    let hh = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
    let mm = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
    let ss = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
    return `${YY}-${MM}-${DD} ${hh}:${mm}:${ss}`;
}

function removeAllOfChildren(parent) {
    //deep clone
    let node = Object.assign({},parent.children);
    for (let nodeKey in node) {
        parent.removeChild(node[nodeKey]);
    }
}

function reInitIllustrationData(){
    setNewInfo(0, 0, 0, '2077-01-01 00:00:00');
    removeAllOfChildren(IllustInfoDic.tagDisplay);
    IllustInfoDic.illustDisplay.src = defaultImagesPath.empty
    IllustInfoDic.pageSelect.parentElement.classList.add('disabled')
    removeAllOfChildren(IllustInfoDic.pageSelect.parentElement)
    let opt = document.createElement('option');
    opt.textContent = 'No pages';
    IllustInfoDic.pageSelect.appendChild(opt);
}

function showImage(url,r18Type) {
    if(IllustInfoDic.imgDisplay.getContext('2d')) {
        let ctx = IllustInfoDic.imgDisplay.getContext('2d')
        axios.get(window.URL.createObjectURL(url),{
            responseType: 'blob'
        }).then(resp => {
            let fr = new FileReader()
            fr.readAsDataURL(resp['data'])
            fr.addEventListener('load',ev => {
                let img = new Image();
                console.log(this)
                img.src = ev['target']['result'];
                img.addEventListener('load', ev => {
                    let w=ev.target.width,h=ev.target.height;
                    let width = getCanvasWidth(IllustInfoDic.imgDisplay.parentElement,100)
                    let scale = width/w;
                    IllustInfoDic.imgDisplay.width = width;
                    IllustInfoDic.imgDisplay.height = h*scale;
                    ctx.drawImage(ev.target,0,0,width,h*scale);
                })
            })
        })
    }
}

function getCanvasWidth(parent,percent) {
    return parent.clientWidth*percent/100;
}