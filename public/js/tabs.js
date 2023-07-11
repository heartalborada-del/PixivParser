let tabs = document.getElementsByClassName('tabs')
for (let i = 0; i < tabs.length; i++) {
    tabElement(tabs[i])
}
function tabElement(elnmt) {
    let menu = elnmt.querySelector('menu').children
    let article = elnmt.querySelectorAll('article')
    for (let menuElement of menu) {
        menuElement.onclick = menuClick
    }

    function menuClick(e) {
        let src =e.srcElement;
        if(src.getAttribute('aria-selected') !== true) {
            for (let element of menu) {
                if (element === src) {
                    element.ariaSelected = 'true'
                } else {
                    element.removeAttribute('aria-selected')
                }
            }
        } else {
            return
        }
        let control = src.getAttribute('aria-controls')
        for (let articleElement of article) {
            if(articleElement.getAttribute('id') === control) {
                articleElement.removeAttribute('hidden')
            } else {
                articleElement.hidden = true
            }
        }
    }
}