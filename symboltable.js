const specialKeys = ["Shift", "Control", "Alt", "Unidentified", "CapsLock", "Escape", "ScrollLock", "Pause", "Insert", "NumLock"];
class SymbolTable {


    arrows = {
        "ArrowLeft": -1,
        "ArrowRight": 1,
        "ArrowUp": -this.LINE_WIDTH,
        "ArrowDown": this.LINE_WIDTH
    }

    /**
     * 
     * @param {HTMLElement} _container 
     * @param {number} line_count
     * @param {number} line_width 
     */
    constructor(_container, line_count, line_width) {
        this.currentOffset = -1;
        this.container = _container;
        this.LINE_COUNT = line_count;
        this.LINE_WIDTH = line_width;
        this.data = document.createElement("div");
        this.data.classList.add("tabledata");
        this.data.spellcheck = false;
        this.data.tabIndex = -1;
        this.container.appendChild(this.data);
        this.createDataField();
        if ('ontouchstart' in document.documentElement) {
            this.mobileAdapter = new MobileAdapter(this);
        } else {
            this.data.addEventListener("click", event => { if (event.target != this.data) this.activatePoint(+event.target.dataset.offset); }, false);
            this.data.addEventListener("keydown", this.handlePhysicalKey.bind(this));
            this.data.addEventListener("blur", this.deactivateField.bind(this));
        }
        this.arrows = {
            "ArrowLeft": -1,
            "ArrowRight": 1,
            "ArrowUp": -this.LINE_WIDTH,
            "ArrowDown": this.LINE_WIDTH
        }
    }

    createDataField() {
        for (let i = 0; i < this.LINE_COUNT; i++) {
            for (let j = 0; j < this.LINE_WIDTH; j++) {
                let point = document.createElement("span");
                point.dataset.offset = i * this.LINE_WIDTH + j;
                point.innerHTML = '.';
                this.data.appendChild(point);
            }
        }
    }

    /**
    * Обрабатывает нажатие клавиши на физической клавиатуре (десктопы)
    * @param {KeyboardEvent} event 
    */
    handlePhysicalKey(event) {
        // Отбрасываем часть специальных клавиш
        if (specialKeys.find((value) => event.code.startsWith(value)) != undefined) return;
        if (event.code.startsWith("F") && event.code.length > 1) return;
        let offset = this.currentOffset;
        if (offset == -1) return;
        let length = this.data.children.length;
        // Стёрка
        if (event.code == "Backspace") this.handleBackspace();
        // Переход по стрелкам
        else if (event.code.startsWith("Arrow")) {
            const shift = this.arrows[event.code];
            // Проверяем, можно ли сместиться, не выйдя за границы поля
            if ((shift > 0 && offset + shift < length) || (shift < 0 && offset + shift >= 0)) this.activatePoint(offset + shift);
        }
        // Удаление символа без смещения
        else if (event.code == "Delete") this.resetPoint(offset);
        // Переход в самый низ
        else if (event.code == "PageDown") this.activatePoint(length - this.LINE_WIDTH + offset % this.LINE_WIDTH);
        // Переход в самый верх
        else if (event.code == "PageUp") this.activatePoint(offset % this.LINE_WIDTH);
        // Переход на начало следующей строки
        else if (event.code.startsWith("Enter")) {
            if (offset + this.LINE_WIDTH < length) this.activatePoint(offset - offset % this.LINE_WIDTH + this.LINE_WIDTH);
        }
        // Добавление символа
        else this.handleAddition(event.key);

    }

    /**
     * 
     * @param {number} point 
     * @returns 
     */
    activatePoint(point) {
        //console.log(point);
        //if (point == undefined) return;
        if (this.currentOffset != -1) this.data.children[this.currentOffset].classList.remove("active");
        this.currentOffset = point;
        this.data.children[point].classList.add("active");
    }

    deactivateField() {
        if (this.currentOffset != -1) this.data.children[this.currentOffset].classList.remove("active");
        this.currentOffset = -1;
    }
    /**
     * 
     * @param {number} point 
     * @returns {boolean}
     */
    resetPoint(point) {
        let activePoint = this.data.children[point];
        if (activePoint.classList.contains("filled")) {
            activePoint.classList.remove("filled");
            activePoint.innerText = '.';
            return true;
        }
        return false;
    }

    handleAddition(key) {
        let activePoint = this.data.children[this.currentOffset];
        activePoint.innerText = key;
        activePoint.classList.add("filled");
        if (this.currentOffset != this.data.children.length - 1)
            this.activatePoint(this.currentOffset + 1);
    }

    handleBackspace() {
        // Если символ имел непустое значение, он будет стёрт, и будет совершён переход на следующий символ
        // Иначе будет совершён переход на следующий символ, и он будет стёрт
        // Переход состоится, если символ не является нулевым
        let offset = this.currentOffset;
        var completed = this.resetPoint(offset);
        if (offset != 0) {
            this.activatePoint(offset - 1);
            if (!completed)
                this.resetPoint(offset - 1);
        }
    }
}

class MobileAdapter {
    /**
     * 
     * @param {SymbolTable} _symboltable 
     */
    constructor(_symboltable) {
        this.symboltable = _symboltable;

        this.keygrabber = document.createElement("input");
        this.keygrabber.classList.add("keygrabber");
        this.keygrabber.value = MobileAdapter.WILDCARD;
        this.keygrabber.autocapitalize = "off";
        this.keygrabber.addEventListener("input", this.handleVirtualKey.bind(this));

        _symboltable.container.appendChild(this.keygrabber);
        let dataField = _symboltable.data;
        dataField.addEventListener("click", this.startAwaitingInput.bind(this), false);
        dataField.addEventListener("blur", (event) => {
            if (event.relatedTarget != this.keygrabber) _symboltable.deactivateField();
        });
    }

    static WILDCARD = '§';

    /**
     * Активирует клавиатуру при клике на символ для предложения ввода
     * @param {PointerEvent} event 
     */
    startAwaitingInput(event) {
        // /**
        //  * @type {HTMLInputElement}
        //  */
        // var keygrabber = points[LINE_COUNT * LINE_WIDTH];
        // keygrabber.value = MobileAdapter.WILDCARD;
        // keygrabber.setSelectionRange(-1, -1);
        this.symboltable.activatePoint(+event.target.dataset.offset);
        this.keygrabber.focus();
    }

    resetKeygrabber() {
        this.keygrabber.value = MobileAdapter.WILDCARD;
        setTimeout(() => this.keygrabber.setSelectionRange(-1, -1), 0);
    }

    /**
     * 
     * @param {InputEvent} event 
     */
    handleVirtualKey(event) {
        if (event.inputType == "insertText") this.symboltable.handleAddition(event.data);
        else if (event.isComposing) {
            //console.log("Abort composition");
            this.resetKeygrabber();
            this.symboltable.handleAddition(event.data);
        }
        else {
            this.symboltable.handleBackspace();
            if (this.keygrabber.value.length == 0) {
                this.resetKeygrabber();
            }
        }
    }
}