let request = indexedDB.open('PageDB', 1);

request.onupgradeneeded = function(event) {
    let db = event.target.result;
    if (!db.objectStoreNames.contains('positions')) {
        db.createObjectStore('positions', { keyPath: 'id' });
    }
};

request.onsuccess = function(event) {
    let db = event.target.result;
    let isTouch = isTouchDevice();
    function savePosition(id, x, y, closed, zIndex) {
        let transaction = db.transaction('positions', 'readwrite');
        let store = transaction.objectStore('positions');

        let position = {
            id: id,
            x: x,
            y: y,
            closed: closed,
            zIndex: zIndex
        };

        let request = store.put(position);

        request.onsuccess = function(event) {
            console.log('Position saved successfully');
        };

        request.onerror = function(event) {
            console.error('Error saving position:', event.target.error);
        };
    }

    function getPosition(id, callback) {
        let transaction = db.transaction('positions', 'readonly');
        let store = transaction.objectStore('positions');

        let request = store.get(id);

        request.onsuccess = function(event) {
            let position = event.target.result;
            callback(position);
        };

        request.onerror = function(event) {
            console.error('Error retrieving position:', event.target.error);
            callback(null);
        };
    }

    let windows = document.getElementsByClassName('window');

    window.addEventListener('resize', () => {
        if (!this.bAntiShike) {
            this.bAntiShike = true;
            setTimeout(() => {
                for (let window of windows) {
                    windowMaxHeight(window);
                }
                this.bAntiShike = false;
            }, 100)
        }
    },false);

    for (let i = 0; i < windows.length; i++) {
        autoCalcMaxHeight(windows[i]);
        makeDraggable(windows[i]);
        restorePosition(windows[i],i);
    }

    function autoCalcMaxHeight(window) {
        new MutationObserver((list) => {
            for (let mutationRecord of list) {
                if(mutationRecord.type === 'attributes' && mutationRecord.attributeName === 'hidden') {
                    if(window.hidden !== true) {
                        windowMaxHeight(window)
                    }
                    getPosition(window.id, function(position) {
                        let x = parseFloat(window.style.left);
                        let y = parseFloat(window.style.top);
                        let closed = window.hidden ? 'true' : 'false';
                        let zIndex = window.style.zIndex || 0;

                        if (position) {
                            savePosition(position.id, x, y, closed, zIndex);
                        } else {
                            savePosition(window.id, x, y, closed, zIndex);
                        }
                    });
                }
            }
        }).observe(window,{attributes:true})
    }
    function setHighestZIndex(windowElement) {
        if (windowElement.style.zIndex === ''||parseInt(windowElement.style.zIndex) < windows.length) {
            for (let i = 0; i < windows.length; i++) {
                let index = parseInt(window.getComputedStyle(windows[i]).zIndex) - 1
                if (windows[i] === windowElement) {
                    windows[i].style.zIndex = windows.length.toString()
                    index = windows.length
                } else {
                    windows[i].style.zIndex = index.toString()
                }
                getPosition(windows[i].id, function (position) {
                    if (position) {
                        savePosition(position.id, position.x, position.y, position.closed, index);
                    } else {
                        savePosition(windows[i].id, parseFloat(windows[i].style.left), parseFloat(windows[i].style.top), windows[i].hidden ? 'true' : 'false', index);
                    }
                });
            }
        }
    }
    function makeDraggable(windowElement) {
        let startEvent, moveEvent, endEvent;

        if (isTouch) {
            startEvent = 'touchstart';
            moveEvent = 'touchmove';
            endEvent = 'touchend';
        } else {
            startEvent = 'mousedown';
            moveEvent = 'mousemove';
            endEvent = 'mouseup';
        }

        let touchStartX, touchStartY, elementStartX, elementStartY;

        windowElement.querySelector("div.title-bar").addEventListener(startEvent, handleDragStart, false);
        windowElement.addEventListener(endEvent, handleDragEnd, false);
        windowElement.addEventListener(startEvent,handleWindowClick,false);

        let closeBtn = windowElement.querySelector("div.title-bar").querySelector('div.title-bar-controls').querySelector('button[aria-label="Close"]');
        if(closeBtn.disabled !== true) {
            closeBtn.addEventListener('click',() => {
                windowElement.hidden = true
            });
            closeBtn.parentElement.addEventListener('mousedown', function (e) {
                handleWindowClick(e)
                e.stopPropagation();
            });
        }
        function handleWindowClick(e) {
            setHighestZIndex(windowElement)
            for (let window of windows) {
                if(window === windowElement) {
                    window.classList.add('active');
                    continue;
                }
                if(window.classList.contains('active'))
                    window.classList.remove('active');
            }
        }
        function handleDragStart(event) {
            if (isTouch) {
                let touch = event.touches[0];
                touchStartX = touch.clientX;
                touchStartY = touch.clientY;
            } else {
                touchStartX = event.clientX;
                touchStartY = event.clientY;
            }


            elementStartX = parseFloat(windowElement.style.left) || 0;
            elementStartY = parseFloat(windowElement.style.top) || 0;

            document.addEventListener(moveEvent, handleDragMove, false);
        }

        function handleDragMove(event) {
            event.preventDefault();

            let offsetX, offsetY;
            if (isTouch) {
                let touch = event.touches[0];
                offsetX = touch.clientX - touchStartX;
                offsetY = touch.clientY - touchStartY;
            } else {
                offsetX = event.clientX - touchStartX;
                offsetY = event.clientY - touchStartY;
            }

            let newPosX = elementStartX + offsetX;
            let newPosY = elementStartY + offsetY;

            windowElement.style.left = newPosX + 'px';
            windowElement.style.top = newPosY + 'px';
        }

        function handleDragEnd(event) {
            document.removeEventListener(moveEvent, handleDragMove, false);

            getPosition(windowElement.id, function(position) {
                let x = parseFloat(windowElement.style.left);
                let y = parseFloat(windowElement.style.top);
                let closed = windowElement.hidden ? 'true' : 'false';
                let zIndex = windowElement.style.zIndex || 0;

                if (position) {
                    savePosition(position.id, x, y, closed, zIndex);
                } else {
                    savePosition(windowElement.id, x, y, closed, zIndex);
                }
            });
        }
    }

    function restorePosition(windowElement,i) {
        getPosition(windowElement.id, function(position) {
            if (position) {
                windowElement.style.left = position.x + 'px';
                windowElement.style.top = position.y + 'px';
                windowElement.style.zIndex = position.zIndex;
                windowElement.hidden = position.closed === 'true';
            } else {
                windowElement.style.left = (50 + 25 * i) + 'px';
                windowElement.style.top = (30 + 27 * i)+ 'px';
                windowElement.hidden = false;
            }
        });
    }

    function windowMaxHeight(windowElement) {
        let body = windowElement.querySelector('div.window-body')
        let usedPX = getBorderSize(windowElement) + parseFloat(getComputedStyle(body).marginBottom);
        for (let child of windowElement.children) {
            if (child !== body) {
                usedPX += getBorderSize(child)
                usedPX += child.clientHeight
            }
        }
        body.style.maxHeight = calculateParentMaxHeight(windowElement) - usedPX + 'px'
        function calculateParentMaxHeight(parent) {
            let maxHeight = getComputedStyle(parent).maxHeight
            if(maxHeight != null) {
                let p = parseFloat(getComputedStyle(parent).maxHeight);
                if(maxHeight.includes('%')) {
                    return (p / 100) * window.innerHeight;
                } else {
                    return p
                }
            } else {
                return parent.clientHeight
            }
        }

        function getBorderSize(element) {
            let containerStyles = getComputedStyle(element);
            return parseFloat(containerStyles.borderTopWidth) + parseFloat(containerStyles.paddingTop) + parseFloat(containerStyles.paddingBottom) + parseFloat(containerStyles.borderBottomWidth);
        }
    }
};

request.onerror = function(event) {
    console.error('Error opening database:', event.target.error);
};

function isTouchDevice() {
    return ('ontouchstart' in window || (navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0)) && !(navigator.userAgent.match(/Firefox/i));
}

