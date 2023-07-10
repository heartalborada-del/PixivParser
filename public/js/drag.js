let windows = document.getElementsByClassName("window")
for (let i = 0; i < windows.length; i++) {
    windows[i].style.top = (50+20*i)+"px"
    windows[i].style.left = (30+50*i)+"px"
    dragElement(windows[i]);
}

function setHighestZIndex(element) {
    for (let i = 0; i < windows.length; i++) {
        if(windows[i]===element) {
            windows[i].style.zIndex = windows.length
        } else {
            windows[i].style.zIndex = parseInt(window.getComputedStyle(windows[i]).zIndex)-1
        }
    }
}


// 拖动元素的函数
function dragElement(elmnt) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    let titleBar = elmnt.querySelector('.title-bar');
    titleBar.onmousedown = dragMouseDown;
    elmnt.ondragstart = function() {
        return false; // 禁止复制操作
    };
    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // 获取鼠标点击位置的初始坐标
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
        setHighestZIndex(elmnt);
    }
    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}
