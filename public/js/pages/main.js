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
    btn.onclick = btnClick;
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

let settingData = document.querySelector('#settingTab').querySelectorAll('input,select')
let settingRSBtn = document.querySelector('#settingRS').querySelectorAll('button')
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

for (let element of settingRSBtn) {
    btnSaveSetting(element)
}
function btnSaveSetting(btn) {
    save()
    if(btn.classList.contains('save')){
        btn.onclick = save
    } else if(btn.classList.contains('reset')) {
        btn.onclick = reset
    }

    function save() {
        for (let el of settingData) {
            if(!settingDefaultData.hasOwnProperty(el.id)) continue
            let cur;
            if(el instanceof HTMLInputElement) {
                if (el.type === 'checkbox') {
                    cur = el.checked
                } else if (el.type === 'range') {
                    cur = el.value
                }
            } else if(el instanceof HTMLSelectElement) {
                cur = el.value
            }
            if(cur === null) {
                localStorage.setItem(el.id,settingDefaultData[el.id])
            } else {
                localStorage.setItem(el.id,cur)
            }
        }
        setNewInputValue()
    }

    function reset() {
        for (let el of settingData) {
            if(!settingDefaultData.hasOwnProperty(el.id)) continue
            localStorage.setItem(el.id,settingDefaultData[el.id])
        }
        setNewInputValue()
    }

    function setNewInputValue() {
        for (let el of settingData) {
            if(!settingDefaultData.hasOwnProperty(el.id)) continue
            let data = localStorage.getItem(el.id)
            if(data === null) {
                data = settingDefaultData[el.id]
            }
            if(el.id === 'r18') {
                document.querySelector('#blurR18Div').disabled = !(data === 'true')
            } else if (el.id==='r18G') {
                document.querySelector('#blurR18GDiv').disabled = !(data === 'true')
            } else if (el.id === 'tagTranslate') {
                document.querySelector('#languageSelect').disabled = !(data === 'true')
            }
            if(el instanceof HTMLInputElement) {
                if (el.type === 'checkbox') {
                    el.checked = data === 'true'
                } else if (el.type === 'range') {
                    el.value = data
                }
            } else if(el instanceof HTMLSelectElement) {
                el.value = data
            }
        }
    }
}

