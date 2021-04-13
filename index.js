var dataField = document.getElementById("data");
/**
 * @type {HTMLElement}
 */
var activePoint;

var points = dataField.childNodes;

const LINE_WIDTH = 16;
var LINE_COUNT = 13;

function createDataField() {
    for (i = 0; i < LINE_COUNT; i++) {
        for (j = 0; j < LINE_WIDTH; j++) {
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

function deactivateField() {
    if (activePoint != undefined) activePoint.classList.remove("active");
    activePoint = undefined;
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

function handleBackspace(offset) {
    // Если символ имел непустое значение, он будет стёрт, и будет совершён переход на следующий символ
    // Иначе будет совершён переход на следующий символ, и он будет стёрт
    // Переход состоится, если символ не является нулевым
    var completed = resetPoint(activePoint);
    if (offset != 0) {
        activatePoint(points[offset - 1]);
        if (!completed)
            resetPoint(points[offset - 1]);
    }
}

function handleAddition(key, offset) {
    activePoint.innerText = key;
    activePoint.classList.add("filled");
    if (offset != points.length - 1)
        activatePoint(points[offset + 1]);
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
    if (event.code == "Backspace") handleBackspace(offset);
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
    else handleAddition(event.key, offset);
    
} 

class MobileAdapter {

    static WILDCARD = '§';

    /**
     * Активирует клавиатуру при клике на символ для предложения ввода
     * @param {PointerEvent} event 
     */
    static startAwaitingInput(event) {
        // /**
        //  * @type {HTMLInputElement}
        //  */
        // var keygrabber = points[LINE_COUNT * LINE_WIDTH];
        // keygrabber.value = MobileAdapter.WILDCARD;
        // keygrabber.setSelectionRange(-1, -1);
        activatePoint(event.target);
        points[points.length - 1].focus();
    }

    /**
     * 
     * @param {CompositionEvent} event 
     */
    static disableComposition(event) {
        console.log(event.type + " called on " + event.target);
        event.preventDefault();
        //event.stopPropagation();
    }

    /**
     * 
     * @param {HTMLInputElement} keygrabber 
     */
    static resetKeygrabber(keygrabber) {
        keygrabber.value = MobileAdapter.WILDCARD;
        setTimeout(() => keygrabber.setSelectionRange(-1, -1),0);
    }

    /**
     * 
     * @param {InputEvent} event 
     */
    static handleVirtualKey(event) {
        /**
         * @type {HTMLInputElement}
         */
        if (event.isComposing) event.cac
        var keygrabber = points[LINE_COUNT * LINE_WIDTH];
        var offset = +activePoint.dataset.offset;
        if (event.inputType == "insertText") handleAddition(event.data, offset);
        else if (event.isComposing) {
            //console.log("Abort composition");
            MobileAdapter.resetKeygrabber(keygrabber);
            handleAddition(event.data, offset);
        }
        else {
            handleBackspace(offset);
            if (keygrabber.value.length == 0) {
                MobileAdapter.resetKeygrabber(keygrabber);
            } 
        } 
    }
    
}


createDataField();
if ('ontouchstart' in document.documentElement) {
    var keygrabber = document.createElement("input");
    keygrabber.classList.add("keygrabber");
    keygrabber.value = MobileAdapter.WILDCARD;
    if ('autocapitalize' in keygrabber) {
        keygrabber.autocapitalize = "off";
    }
    keygrabber.addEventListener("input", MobileAdapter.handleVirtualKey);
    dataField.appendChild(keygrabber);
    dataField.addEventListener("click", MobileAdapter.startAwaitingInput, false);
} else {
    dataField.addEventListener("click", event => activatePoint(event.target), false);
    dataField.addEventListener("keydown", handlePhysicalKey);
}
//dataField.addEventListener("blur", deactivateField);

