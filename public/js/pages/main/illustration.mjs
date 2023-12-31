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
    illustDisplay: document.querySelector('canvas#illustDisplay')
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

reInitIllustrationData()

IllustInfoDic.pidForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let pid = IllustInfoDic.pidInput.value;
    axios.get(localStorage.getItem('tagTranslate') === 'true' ? `/api/getImageData/${pid}?lang=${localStorage.getItem('languageSelect')}` : `/api/getImageData/${pid}`)
        .then(resp => {
            let json = resp['data']
            let data = json['data']
            if(data) {
                let illust = data['illust']
                setNewInfo(
                    illust['info']['views'],
                    illust['info']['bookmarks'],
                    illust['info']['likes'],
                    formatDate(new Date(illust['image']['date']['create'].toString()))
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
                    let tagInstance = tagGenerate.normal('#'+name,sub);
                    if(name === 'R-18') {
                        tagInstance = tagGenerate.r18('#'+name,sub);
                        if(sessionStorage.getItem('r18Type') === '0')
                            sessionStorage.setItem('r18Type','1');
                    } else if (name === 'R-18G') {
                        tagInstance = tagGenerate.r18g('#'+name,sub);
                        sessionStorage.setItem('r18Type','2');
                    }
                    IllustInfoDic.tagDisplay.appendChild(tagInstance);
                }
                sessionStorage.setItem('urls',JSON.stringify(illust['image']['urls']))
                showImage(`/pixivImage/${urlParser(illust['image']['urls']['regular'])}`,sessionStorage.getItem('r18Type'));
            }
        }).catch(e => {
            console.log(e)
    })
})

IllustInfoDic.pageSelect.addEventListener('change', (e) => {
    try {
        let target = e.target;
        let p = target.options[target.selectedIndex].text;
        let urls = sessionStorage.getItem('urls');
        let json = JSON.parse(urls);
        showImage(`/pixivImage/${urlParser(json['regular'],"",p)}`,sessionStorage.getItem('r18Type'));
    } catch (ex) {
        console.log(ex);
    }
})

IllustInfoDic.pidInput.addEventListener('input',() => {
    reInitIllustrationData();
})

window.addEventListener('setItemEvent',(e) => {
    if(e.key === 'r18' || e.key === 'r18G') {
        let target = e.target;
        let p = IllustInfoDic.pageSelect.options[IllustInfoDic.pageSelect.selectedIndex].text;
        let urls = sessionStorage.getItem('urls');
        if(urls !== null && urls !== undefined) {
            let json = JSON.parse(urls);
            showImage(`/pixivImage/${urlParser(json['regular'], "", p)}`, sessionStorage.getItem('r18Type'));
        }
    }
})

function setNewInfo(view,bookmark,like,time) {
    IllustInfoDic.view.textContent = view;
    IllustInfoDic.bookmark.textContent = bookmark;
    IllustInfoDic.like.textContent=like;
    IllustInfoDic.time.textContent=time;
}

function formatDate (date) {
    let YY = date.getFullYear();
    let MM = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
    let DD = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
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
    sessionStorage.setItem('r18Type','0');
    showImage(defaultImagesPath.empty,'0');
    sessionStorage.removeItem('urls');
    setNewInfo(0, 0, 0, '2077-01-01 00:00:00');
    removeAllOfChildren(IllustInfoDic.tagDisplay);
    IllustInfoDic.tagDisplay.appendChild(tagGenerate.normal("#Empty"));
    IllustInfoDic.pageSelect.parentElement.classList.add('disabled')
    removeAllOfChildren(IllustInfoDic.pageSelect)
    let opt = document.createElement('option');
    opt.textContent = 'No pages';
    IllustInfoDic.pageSelect.appendChild(opt);
}

function showImage(url,r18Type) {
    if((localStorage.getItem("r18") === 'false' && r18Type === '1') || (localStorage.getItem("r18G") === 'false' && r18Type === '2')) {
        showImage(defaultImagesPath.filtered,'0');
        return;
    }
    if(IllustInfoDic.illustDisplay.getContext('2d')) {
        let ctx = IllustInfoDic.illustDisplay.getContext('2d')
        axios.get(url,{
            responseType: 'blob'
        }).then(resp => {
            let fr = new FileReader()
            fr.readAsDataURL(resp['data'])
            fr.addEventListener('load',ev => {
                let img = new Image();
                img.src = ev['target']['result'];
                addR18OrGClass(r18Type);
                img.addEventListener('load', ev => {
                    let w=ev.target.width,h=ev.target.height;
                    IllustInfoDic.illustDisplay.width = w;
                    IllustInfoDic.illustDisplay.height = h;
                    ctx.drawImage(ev.target,0,0,w,h);
                })
            })
        })
    }
}

function addR18OrGClass(r18Type){
    IllustInfoDic.illustDisplay.classList.remove('r18');
    IllustInfoDic.illustDisplay.classList.remove('r18g');
    let type = parseInt(r18Type);
    if(type === 1) {
        IllustInfoDic.illustDisplay.classList.add('r18')
    } else if (type === 2) {
        IllustInfoDic.illustDisplay.classList.add('r18g')
    }
}

function urlParser(url, ext='jpg', page=0) {
    let copy = url;
    copy = copy.replaceAll('{selectPage}',page.toString());
    copy = copy.replaceAll('{ext}',ext);
    return copy;
}