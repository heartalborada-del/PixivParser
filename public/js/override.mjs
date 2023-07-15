let originalSetItem = localStorage.setItem;
localStorage.setItem = function (key, newValue) {
    let event = new Event("setItemEvent");
    event.key = key;
    event.oldValue = localStorage[key];
    originalSetItem.apply(this, arguments);
    window.dispatchEvent(event);
};