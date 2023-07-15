let container = document.querySelector('div#dynamicCSSContainer');

function addStyle(target,styleText) {
    let element = document.createElement('style');
    element.innerHTML = styleText;
    element.ariaLabel = target;
    container.appendChild(element);
}

function removeStyle(target) {
    let node = Object.assign({},container.children);
    for (let nodeKey in node) {
        if(node[nodeKey].ariaLabel === target) {
            container.removeChild(node[nodeKey]);
        }
    }
}

export {addStyle,removeStyle}