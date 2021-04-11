var dataField = document.getElementById("data");
/**
 * @type {HTMLElement}
 */
var activePoint;

var points = dataField.childNodes;

const LINE_WIDTH = 16;

function createDataField() {
    for (i = 0; i < 13; i++) {
        for (j = 0; j < 16; j++) {
            let point = document.createElement("span");
            point.dataset.offset = i * LINE_WIDTH + j;
            //points.push(point);
            point.innerHTML = '.';
            dataField.appendChild(point);
        }
    }
}

/**
 * 
 * @param {HTMLElement} point 
 */
function activatePoint(point) {
   // console.log(point);
    if (point == dataField) return;
    if (activePoint != undefined) activePoint.classList.remove("active");
    activePoint = point;
    activePoint.classList.add("active");
}

/**
 * 
 * @param {HTMLElement} point 
 * @returns {boolean}
 */
function resetPoint(point) {
    if (point.classList.contains("filled")) {
        point.classList.remove("filled");
        point.innerText = '.';
        return true;
    }
    return false;
}

const specialKeys = ["Shift", "Control", "Alt", "Unidentified", "Escape", "ScrollLock", "Pause", "Insert", "NumLock"];
const arrows = {
    "ArrowLeft" : -1,
    "ArrowRight" : 1,
    "ArrowUp" : -LINE_WIDTH,
    "ArrowDown" : LINE_WIDTH
}

/**
 * Обрабатывает нажатие клавиши на физической клавиатуре (десктопы)
 * @param {KeyboardEvent} event 
 */
function handlePhysicalKey(event) {
    // Отбрасываем часть специальных клавиш
    if (specialKeys.find((value) => event.code.startsWith(value)) != undefined) return;
    var offset = +activePoint.dataset.offset;
    if (activePoint == undefined) return;
    // Стёрка
    if (event.code == "Backspace")
    {
        // Если символ имел непустое значение, он будет стёрт, и будет совершён переход на следующий символ
        // Иначе будет совершён переход на следующий символ, и он будет стёрт
        // Переход состоится, если символ не является нулевым
        var completed = resetPoint(activePoint);
        if (offset != 0) {
            activatePoint(points[offset - 1]);
            if (!completed) resetPoint(points[offset - 1]);
        } 
    }
    // Переход по стрелкам
    else if (event.code.startsWith("Arrow")) {
        const shift = arrows[event.code];
        // Проверяем, можно ли сместиться, не выйдя за границы поля
        if ((shift > 0 && offset + shift < points.length) || (shift < 0 && offset + shift >= 0)) activatePoint(points[offset + shift]);
    }
    // Удаление символа без смещения
    else if (event.code == "Delete") resetPoint(activePoint);
    // Переход в самый низ
    else if (event.code == "PageDown") activatePoint(points[points.length - LINE_WIDTH + offset % LINE_WIDTH]);
    // Переход в самый верх
    else if (event.code == "PageUp") activatePoint(points[offset % LINE_WIDTH]);
    // Переход на начало следующей строки
    else if (event.code.startsWith("Enter")) {
        if (offset + LINE_WIDTH < points.length) activatePoint(points[offset - offset % LINE_WIDTH + LINE_WIDTH]);
    } 
    // Добавление символа
    else {
        activePoint.innerText = event.key;
        activePoint.classList.add("filled");
        if (offset != points.length - 1) activatePoint(points[offset + 1]);
    }
} 

class MobileAdapter {

    static mbdebug = document.getElementById("mbdebug");

    /**
     * 
     * @param {number} offset 
     */
    static setCaret(offset) {
        var range = document.createRange();
        var sel = window.getSelection();
        
        range.setStart(points[offset], 0);
        range.collapse(true);
        
        sel.removeAllRanges();
        sel.addRange(range);
    }

    static i = 0;

    /**
    * Обрабатывает нажатие клавиши на виртуальной клавиатуре (мобильные устройства)
    * 
    * Необходимо событие onkeypress
    * @param {KeyboardEvent} event
    */
    static handleVirtualKey(event) {
        //alert(event.);
        // TODO: forget about getting key, provide caret shifting
        // ++MobileAdapter.i;
        // console.log(MobileAdapter.i);
        // mbdebug.innerText = MobileAdapter.i;
        console.log(event);
       // event.preventDefault();
    }
}



dataField.addEventListener("click", event => activatePoint(event.target), false);

if ('ontouchstart' in document.documentElement) {
    dataField.contentEditable = true;
    dataField.addEventListener("input", MobileAdapter.handleVirtualKey);
} else dataField.addEventListener("keydown", handlePhysicalKey);

createDataField();