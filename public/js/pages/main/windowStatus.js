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