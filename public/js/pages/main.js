let statusDataDiv = document.querySelector("#windowsStatusData")
statusDataDiv.style.justifyContent = 'center';
statusDataDiv.style.display='flex'
statusDataDiv.style.flexDirection = 'column'
for (let element of document.getElementsByClassName('window')) {
    if(element.id !== null) {
        let disabled = element.querySelector("div.title-bar > div.title-bar-controls > button").disabled
        let hidden = element.hidden
        let newBtn = document.createElement("button")
        newBtn.disabled = disabled
        newBtn.textContent = 'Windows-' + element.id
        if (!hidden) newBtn.classList.add('active')
        newBtn.classList.add('field-row')
        newBtn.classList.add('statusBtn')
        statusDataDiv.appendChild(newBtn)
        btnSwitch(newBtn, element)
    }
}
function btnSwitch(btn,currentWindow) {
    btn.addEventListener('click', btnClick);
    new MutationObserver((list, observer) => {
        for (let mutationRecord of list) {
            if(mutationRecord.type === 'attributes' && mutationRecord.attributeName === 'hidden') {
                if(currentWindow.hidden === true){
                    btn.classList.remove('active')
                } else {
                    btn.classList.add('active')
                }
            }
        }
    }).observe(currentWindow,{attributes:true})
    function btnClick(e) {
        if(currentWindow.querySelector("div.title-bar > div.title-bar-controls > button").disabled !== true) {
            let cur = !currentWindow.hidden
            if(cur === true){
                btn.classList.remove('active')
            } else {
                btn.classList.add('active')
            }
            currentWindow.hidden = cur
        }
    }
}
settingSave()

function settingSave() {
    const settingElementMap = new Map()
    for (let el of document.querySelector('#settingTab').querySelectorAll('input,select')) {
        settingElementMap.set(el.id,el)
    }
    const settingDefaultData = {
        r18: false,
        r18G: false,
        blurR18: true,
        blurR18Range: 10,
        blurR18G: true,
        blurR18GRange: 10,
        tagTranslate: true,
        languageSelect: 'en-US'
    }
    const settingLinkedFunction = {
        r18: (e) => {
            settingElementMap.get('blurR18').parentElement.disabled = !e.srcElement.checked
            localStorage.setItem('r18',e.srcElement.checked)
        },
        r18G: (e) => {
            settingElementMap.get('blurR18G').parentElement.disabled = !e.srcElement.checked
            localStorage.setItem('r18G',e.srcElement.checked)
        },
        blurR18: (e) => {
            settingElementMap.get('blurR18Range').parentElement.parentElement.disabled = !e.srcElement.checked
            localStorage.setItem('blurR18',e.srcElement.checked)
        },
        blurR18Range: (e) => {
            localStorage.setItem('blurR18Range',e.srcElement.value)
        },
        blurR18G: (e) => {
            settingElementMap.get('blurR18GRange').parentElement.parentElement.disabled = !e.srcElement.checked
            localStorage.setItem('blurR18G',e.srcElement.checked)
        },
        blurR18GRange: (e) => {
            localStorage.setItem('blurR18GRange',e.srcElement.value)
        },
        tagTranslate: (e) => {
            settingElementMap.get('languageSelect').disabled = !e.srcElement.checked
            localStorage.setItem('tagTranslate',e.srcElement.checked)
        },
        languageSelect: (e) => {
            localStorage.setItem('languageSelect',e.srcElement.value)
        }
    }
    const settingInitScript = {
        r18: (element) => {
            settingElementMap.get('blurR18').parentElement.disabled = !element.checked
        },
        r18G: (element) => {
            settingElementMap.get('blurR18G').parentElement.disabled = !element.checked
        },
        blurR18: (element) => {
            settingElementMap.get('blurR18Range').parentElement.parentElement.disabled = !element.checked
        },
        blurR18Range: (element) => {},
        blurR18G: (element) => {
            settingElementMap.get('blurR18GRange').parentElement.parentElement.disabled = !element.checked
        },
        blurR18GRange: (element) => {},
        tagTranslate: (element) => {
            settingElementMap.get('languageSelect').disabled = !element.checked
        },
        languageSelect: (element) => {}
    }
    settingElementMap.forEach( v=> {
        if(v.id === null) return
        if(settingDefaultData.hasOwnProperty(v.id)) {
            let data = localStorage.getItem(v.id)
            if (data === null) {
                data = settingDefaultData[v.id]
            }
            if (v instanceof HTMLInputElement) {
                if (v.type === 'checkbox') {
                    v.checked = data === 'true'
                } else if (v.type === 'range') {
                    v.value = data
                }
            } else if (v instanceof HTMLSelectElement) {
                v.value = data
            }
            if(v.id === 'blurR18Range' || v.id === 'blurR18GRange')
                blurPreview(v.parentElement.parentElement.querySelector('div.preview'),data)
            settingInitScript[v.id](v)
        }
        if(settingLinkedFunction.hasOwnProperty(v.id)) {
            v.addEventListener('input',settingLinkedFunction[v.id])
        }
    })

    function blurPreview(parentDiv, defaultValue) {
        let fieldDiv = parentDiv.parentElement;
        let btnDiv = parentDiv.querySelector('div.btn')
        let imgDiv = parentDiv.querySelector('div.img')
        if(btnDiv === null || imgDiv === null || fieldDiv === null) return
        let btn = btnDiv.querySelector('button')
        let img = imgDiv.querySelector('img')
        if(btn === null || img === null) return
        btn.addEventListener('click',toggleVisible);
        img.addEventListener('click',toggleVisible);
        new MutationObserver((list) => {
            console.log('a')
            for (let mutationRecord of list) {
                if (mutationRecord.type === 'attributes' && mutationRecord.attributeName === 'disabled') {
                    if(mutationRecord.target.disabled && !img.hidden) {
                        btnDiv.removeAttribute('hidden')
                        imgDiv.hidden = true
                    }
                }
            }
        }).observe(fieldDiv.parentElement, {attributes: true,subtree:true})
        let toggle = parentDiv.parentElement.querySelector('input.blurToggle')
        img.style.filter = `blur(${defaultValue*(25/toggle.max)}px)`
        toggle.addEventListener('input',toggleChange)
        function toggleChange() {
            img.style.filter = `blur(${toggle.value*(25/toggle.max)}px)`
        }
        function toggleVisible() {
            if(btnDiv.hidden === true) {
                btnDiv.removeAttribute('hidden')
                imgDiv.hidden = true
            } else {
                imgDiv.removeAttribute('hidden')
                btnDiv.hidden = true
            }
        }
    }
}