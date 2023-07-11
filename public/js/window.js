// 打开或创建 WebSQL 数据库
var db = openDatabase('mydb', '1.0', 'My Database', 2 * 1024 * 1024);

// 创建表格
db.transaction(function(tx) {
    tx.executeSql('CREATE TABLE IF NOT EXISTS positions (id TEXT PRIMARY KEY, x REAL, y REAL, closed INTEGER, zIndex INTEGER)');
});

// 插入或更新数据
function savePosition(id, x, y, closed, zIndex) {
    db.transaction(function(tx) {
        tx.executeSql('INSERT OR REPLACE INTO positions (id, x, y, closed, zIndex) VALUES (?, ?, ?, ?, ?)', [id, x, y, closed, zIndex]);
    });
}

// 获取数据
function getPosition(id, callback) {
    db.transaction(function(tx) {
        tx.executeSql('SELECT * FROM positions WHERE id = ?', [id], function(tx, result) {
            if (result.rows.length > 0) {
                var row = result.rows.item(0);
                var position = {
                    id: row.id,
                    x: row.x,
                    y: row.y,
                    closed: row.closed,
                    zIndex: row.zIndex
                };
                callback(position);
            } else {
                callback(null);
            }
        });
    });
}

let windows = document.getElementsByClassName("window")
for (let i = 0,con = 0; i < windows.length; i++) {
    getPosition(windows[i].id, pos => {
        let x = (50 + 25 * i), y = (30 + 50 * i)
        let zi = 0
        console.log(x)
        if (pos !== null) {
            if (pos.x) x = pos.x
            if (pos.y) y = pos.y
            if (pos.zIndex) zi = pos.zIndex
            if (pos.closed) windows[i].hidden = true
        }
        windows[i].style.top = x+'px'
        windows[i].style.left = y+'px'
        windows[i].style.zIndex = zi
    })
    windowElement(windows[i]);
}

function windowElement(elmnt) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    let titleBar = elmnt.querySelector('.title-bar');
    let btnCollection = titleBar.querySelector('.title-bar-controls').children
    for (let btnCollectionElement of btnCollection) {
        let type = btnCollectionElement.getAttribute('aria-label').toLowerCase()
        if (type === 'close') {
            btnCollectionElement.onclick = closeWindow;
        }
    }
    titleBar.onmousedown = dragMouseDown;
    titleBar.onmouseup = dragMouseUp;
    elmnt.onmousedown = dragNewIndex;
    elmnt.ondragstart = function () {
        return false; // 禁止复制操作
    };

    function dragMouseUp(e) {
        getPosition(elmnt.id, pos =>{
            let xs = elmnt.style.top,ys = elmnt.style.left
            if (pos !== null) {
                savePosition(elmnt.id, xs.substring(0,xs.length -2), ys.substring(0,ys.length-2),pos.closed, pos.zIndex)
            } else {
                savePosition(elmnt.id, xs.substring(0,xs.length -2), ys.substring(0,ys.length-2), elmnt.hidden, elmnt.zIndex)
            }
        })
    }
    function closeWindow(e) {
        elmnt.hidden = true
        //visible elmnt.removeAttribute("hidden");
    }
    function dragNewIndex(e) {
        setActive()
        setHighestZIndex()
    }

    function setHighestZIndex() {
        if(parseInt(elmnt.style.zIndex)  === windows.length) {
            return
        }
        for (let i = 0; i < windows.length; i++) {
            let index = parseInt(window.getComputedStyle(windows[i]).zIndex) - 1
            if (windows[i] === elmnt) {
                windows[i].style.zIndex = windows.length
                index=windows.length
            } else {
                windows[i].style.zIndex = index
            }
            getPosition(windows[i].id, pos =>{
                if (pos !== null) {
                    savePosition(windows[i].id, pos.x,pos.y,pos.closed, index)
                } else {
                    let xs = elmnt.style.top,ys = elmnt.style.left
                    savePosition(windows[i].id, xs.substring(0,xs.length -2), ys.substring(0,ys.length-2), windows[i].hidden, index)
                }
            })
        }
    }

    function setActive() {
        for (let i = 0; i < windows.length; i++) {
            if (windows[i] === elmnt) {
                windows[i].classList.add('active')
            } else {
                if (windows[i].classList.contains('active'))
                    windows[i].classList.remove('active')
            }
        }
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // 获取鼠标点击位置的初始坐标
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
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
