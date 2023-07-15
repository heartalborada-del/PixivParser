import {addStyle, removeStyle} from "../../dynamicCSS.js";

const settingElementMap = new Map();
for (let el of document.querySelector('#settingTab').querySelectorAll('input,select')) {
    settingElementMap.set(el.id, el);
}
const settingDefaultData = {
    r18: 'false',
    r18G: 'false',
    blurR18: 'true',
    blurR18Range: '10',
    blurR18G: 'true',
    blurR18GRange: '10',
    tagTranslate: 'true',
    languageSelect: 'en-US'
};
const settingLinkedFunction = {
    r18: (e) => {
        localStorage.setItem('r18', e.srcElement.checked);
        settingElementMap.get('blurR18').parentElement.disabled = !e.srcElement.checked;
    },
    r18G: (e) => {
        localStorage.setItem('r18G', e.srcElement.checked);
        settingElementMap.get('blurR18G').parentElement.disabled = !e.srcElement.checked;
    },
    blurR18: (e) => {
        localStorage.setItem('blurR18', e.srcElement.checked);
        settingElementMap.get('blurR18Range').parentElement.parentElement.disabled = !e.srcElement.checked;
    },
    blurR18Range: (e) => {
        localStorage.setItem('blurR18Range', e.srcElement.value);
    },
    blurR18G: (e) => {
        localStorage.setItem('blurR18G', e.srcElement.checked);
        settingElementMap.get('blurR18GRange').parentElement.parentElement.disabled = !e.srcElement.checked;
    },
    blurR18GRange: (e) => {
        localStorage.setItem('blurR18GRange', e.srcElement.value);
    },
    tagTranslate: (e) => {
        localStorage.setItem('tagTranslate', e.srcElement.checked);
        if (e.srcElement.checked) {
            settingElementMap.get('languageSelect').parentElement.classList.remove('disabled');
        } else {
            settingElementMap.get('languageSelect').parentElement.classList.add('disabled');
        }
    },
    languageSelect: (e) => {
        localStorage.setItem('languageSelect', e.srcElement.value);
    }
};
const settingInitScript = {
    r18: (element) => {
        settingElementMap.get('blurR18').parentElement.disabled = !element.checked;
    },
    r18G: (element) => {
        settingElementMap.get('blurR18G').parentElement.disabled = !element.checked;
    },
    blurR18: (element) => {
        settingElementMap.get('blurR18Range').parentElement.parentElement.disabled = !element.checked;
    },
    blurR18Range: (element) => {
    },
    blurR18G: (element) => {
        settingElementMap.get('blurR18GRange').parentElement.parentElement.disabled = !element.checked;
    },
    blurR18GRange: (element) => {
    },
    tagTranslate: (element) => {
        if (element.checked) {
            settingElementMap.get('languageSelect').parentElement.classList.remove('disabled');
        } else {
            settingElementMap.get('languageSelect').parentElement.classList.add('disabled');
        }
    },
    languageSelect: (element) => {
    }
}

settingElementMap.forEach(v => {
    if (v.id == null || !v.id) return;
    if (settingLinkedFunction.hasOwnProperty(v.id)) {
        v.addEventListener('input', settingLinkedFunction[v.id], true);
    }
    if (settingDefaultData.hasOwnProperty(v.id)) {
        let data = localStorage.getItem(v.id);
        if (data == null || !data) {
            data = settingDefaultData[v.id];
            localStorage.setItem(v.id, data);
        }
        if (v instanceof HTMLInputElement) {
            if (v.type === 'checkbox') {
                v.checked = data === 'true';
            } else if (v.type === 'range') {
                v.value = data;
            }
        } else if (v instanceof HTMLSelectElement) {
            v.value = data;
        }
        if (v.id === 'blurR18Range' || v.id === 'blurR18GRange')
            blurPreview(v.parentElement.parentElement.querySelector('div.preview'), data, v.id === 'blurR18Range' ? 'r18' : 'r18G');
        settingInitScript[v.id](v);
    }
});

function blurPreview(parentDiv, defaultValue, target) {
    let fieldDiv = parentDiv.parentElement;
    let btnDiv = parentDiv.querySelector('div.btn');
    let imgDiv = parentDiv.querySelector('div.img');
    if (btnDiv === null || imgDiv === null || fieldDiv === null) return;
    let btn = btnDiv.querySelector('button');
    let img = imgDiv.querySelector('img');
    if (btn === null || img === null) return;
    btn.addEventListener('click', toggleVisible);
    img.addEventListener('click', toggleVisible);
    new MutationObserver((list) => {
        for (let mutationRecord of list) {
            if (mutationRecord.type === 'attributes' && mutationRecord.attributeName === 'disabled') {
                if (mutationRecord.target.disabled && !img.hidden) {
                    btnDiv.removeAttribute('hidden');
                    imgDiv.hidden = true;
                }
            }
        }
    }).observe(fieldDiv.parentElement, {attributes: true, subtree: true});
    let toggle = parentDiv.parentElement.querySelector('input.blurToggle');
    removeStyle(target);
    changeStyle(defaultValue);
    toggle.addEventListener('input', toggleChange, false);
    function toggleChange() {
        removeStyle(target);
        changeStyle(toggle.value);
    }

    function changeStyle(value) {
        if(localStorage.getItem(`blur${target.toUpperCase()}`) === 'true' && localStorage.getItem(target) === 'true') {
            addStyle(target, `img.${target},canvas.${target} {filter: blur(${value * (25 / toggle.max)}px)}`);
        } else {
            addStyle(target, `img.${target} {filter: blur(${value * (25 / toggle.max)}px)}`);
        }
    }

    window.addEventListener("setItemEvent", function (e) {
        if (e.key === target || e.key === `blur${target.toUpperCase()}`) {
            removeStyle(target);
            changeStyle(toggle.value);
        }
    },false);

    function toggleVisible() {
        if (btnDiv.hidden === true) {
            btnDiv.removeAttribute('hidden');
            imgDiv.hidden = true;
        } else {
            imgDiv.removeAttribute('hidden');
            btnDiv.hidden = true;
        }
    }
}