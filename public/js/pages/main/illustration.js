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
    illustDisplay: document.querySelector('img#illustDisplay')
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
                showImage('1','1')
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
    let y = date.getFullYear();
    let m = date.getMonth() + 1;
    m = m < 10 ? '0' + m : m;
    let d = date.getDate();
    d = d < 10 ? ('0' + d) : d;
    return y + '-' + m + '-' + d;
}

function removeAllOfChildren(parent) {
    //deep clone
    let node = Object.assign({},parent.children);
    for (let nodeKey in node) {
        parent.removeChild(node[nodeKey]);
    }
}

function reInitIllustrationData(){
    removeAllOfChildren(IllustInfoDic.tagDisplay);
    IllustInfoDic.illustDisplay.src = defaultImagesPath.empty
    IllustInfoDic.pageSelect.parentElement.classList.add('disabled')
    removeAllOfChildren(IllustInfoDic.pageSelect.parentElement)
    let opt = document.createElement('option');
    opt.textContent = 'No pages';
    IllustInfoDic.pageSelect.appendChild(opt);
}

function showImage(url,r18Type) {
    //coming soooooon
}