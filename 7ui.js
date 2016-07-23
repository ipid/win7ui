(function () {
    "use strict";

    var _PN = { // Properties Name
        LEFTPART: "a",
        PRESTOP: 50,
        TRNORMAL: "table-row",
        ELEMENTNOTEXIST: "ElementNotExist"
    };

    /* COMBOBOX */
    // Initialise the drag-down button of combobox
    var listButton = document.getElementsByClassName("vii-combobox-button");
    for (var i = 0; i < listButton.length; i++) {
        listButton[i].addEventListener("mousedown", function () {
            var list = this.parentNode.getElementsByClassName("vii-combobox-list")[0];
            list.style.display = "block";
        });
    }

    // Options of combobox
    var listComboOption = document.getElementsByClassName("vii-combobox-option");
    for (var i = 0; i < listComboOption.length; i++) {
        listComboOption[i].addEventListener("mousedown", function () {
            this.parentNode.style.display = "none";
            var textBox = this.parentNode.parentNode.getElementsByTagName("input")[0];
            textBox.value = this.innerHTML;
        });
    }

    function climbDOMTree(elm, tgtName, prop) {
        var next = elm;
        do {
            if (typeof next === "undefined" || !next[prop]) {
                throw _PN.ELEMENTNOTEXIST;
                return undefined;
            }
            next = next[prop];
        } while (next.tagName != tgtName);
        return next;
    }

    function findFather(elm, fatherName) {
        return climbDOMTree(elm, fatherName, "parentNode");
    }

    function findYoungBro(elm, broName) {
        return climbDOMTree(elm, broName, "nextElementSibling");
    }

    /* TABLEBOX */ 
    // Select table-row by clicking
    var listTr = document.getElementsByTagName("tr");
    for (var i = 0; i < listTr.length; i++) {
        var listTd = listTr[i].getElementsByTagName("td");
        if (listTd.length === 0) continue;  // Exit when clicks the head of table

        listTr[i].addEventListener("mousedown", function () {
            if (this.classList.contains("vii-nested-table-tr"))
                return false;

            var tableDad = findFather(this, "TABLE");
            while (tableDad.parentNode.tagName == "TD")
                tableDad = findFather(tableDad, "TABLE");
            var selt = tableDad.selectedRow;

            if (typeof selt != 'undefined' && this.contains(selt))
                return false;
            if (typeof selt != 'undefined' && !this.contains(selt))
                selt.classList.remove("vii-table-selected");

            this.classList.add("vii-table-selected");
            tableDad.selectedRow = this;
            return false;  // don't make sense
        });
    }

    var listTableButn = document.getElementsByClassName("vii-table-show-button");
    for (var i = 0; i < listTableButn.length; i++) {
        listTableButn[i].addEventListener("mousedown", function () {
            try {
                var dad = findFather(this, "TR");
                var bro = findYoungBro(dad, "TR");
            }
            catch (e) { // TODO: Exception handling
                if (e === _PN.ELEMENTNOTEXIST)
                    return false;
                throw e;
            }
            if (!bro.classList.contains("vii-nested-table-tr"))
                return false;
            if (this.classList.contains("vii-button-active")) {
                this.classList.remove("vii-button-active");
                bro.style.display = "none";
            }
            else {
                this.classList.add("vii-button-active");
                bro.style.display = _PN.TRNORMAL;
            }
        });
    }

    /* SPLITTER */
    var listSplitter = document.getElementsByClassName("vii-splitview-splitter");

    function splitterMoving(e) {
        this._stateBar.style.left = (e.clientX - this._origLoc) + "px";
        debugtext.value = e.clientY - this._stateBar.offsetTop;
        if (e.clientX <= this._stateBar.offsetWidth + _PN.PRESTOP + this.offsetLeft) // TODO
        {
            resplit(this, this._stateBar.offsetWidth * 2 + _PN.PRESTOP + this.offsetLeft);
            return false;
        } else if (e.clientX >= this.offsetWidth - this._stateBar.offsetWidth - _PN.PRESTOP + this.offsetLeft) {
            resplit(this, this.offsetWidth - this._stateBar.offsetWidth * 2 - _PN.PRESTOP + this.offsetLeft);
            return false;
        }
    }

    function resplit(view, clientX) {
        view._leftPart.onmousemove = function () {
        };
        view._rightPart.onmousemove = function () {
        };

        view.removeEventListener("mousemove", splitterMoving);
        view.removeEventListener("mouseup", splitterEndMove);

        var lPWidth = Math.min(view.offsetWidth - _PN.PRESTOP - view._stateBar.offsetWidth,
            Math.max((view._leftPart.offsetWidth + clientX - view._origLoc), _PN.PRESTOP + view._stateBar.offsetWidth));
        var rPWidth = view.offsetWidth - lPWidth - view._stateBar.offsetWidth;
        view._leftPart.style.width = lPWidth + "px";
        view._rightPart.style.width = rPWidth + "px";
        view._stateBar.style.left = "0px";

        view._stateBar.classList.add("vii-hide");
    }

    function splitterEndMove(e) {
        resplit(this, e.clientX);
    }

    for (var i = 0; i < listSplitter.length; i++) {
        listSplitter[i].addEventListener("mousedown", function (e) {
            this.parentNode._leftPart = this.parentNode._leftPart || this.previousElementSibling;
            this.parentNode._rightPart = this.parentNode._rightPart || this.nextElementSibling;
            this._childBar = this._childBar || this.getElementsByTagName("div")[0];
            this.parentNode._stateBar = this.parentNode._stateBar || this._childBar;

            this.parentNode._leftPart.onmousemove = function () {
                return false;
            };
            this.parentNode._rightPart.onmousemove = function () {
                return false;
            };

            this.parentNode.addEventListener("mousemove", splitterMoving);
            this.parentNode.addEventListener("mouseup", splitterEndMove);

            this._childBar.classList.remove("vii-hide");

            this.parentNode._origLoc = e.clientX;
        });
    }

    /* TABVIEW */
    function getTabButtonPage(tbV) {
        var a = tbV.getElementsByClassName("vii-active");
        return { button: a[0], page: a[1] };
    }

    var listTabView = document.getElementsByClassName("vii-tabview");
    for (var i = 0; i < listTabView.length; i++) {
        var tabView = listTabView[i];
        tabView._active = getTabButtonPage(tabView);

        var listTabButton = tabView.getElementsByClassName("vii-tabview-tabbutton");
        for (var j = 0; j < listTabButton.length; j++) {
            listTabButton[j].addEventListener("mousedown", function () {
                function indexOfButton(list, button) {
                    for (var n = 0; n < list.length; n++) {
                        if (list[n] === button)
                            return n;
                    }
                }

                this._index = this._index ||
                    indexOfButton(this.parentNode.getElementsByClassName("vii-tabview-tabbutton"), this);
                this._parentTab = this._parentTab || this.parentNode.parentNode;

                this._parentTab._active.button.classList.remove("vii-active");
                this._parentTab._active.page.classList.remove("vii-active");

                this.classList.add("vii-active");
                var page = this._parentTab.getElementsByClassName("vii-tabview-tabpage")[this._index];
                page.classList.add("vii-active");

                this._parentTab._active = { button: this, page: page };
            });
        }
    }

    var listToolButton = document.getElementsByClassName("vii-toolbar-button");
    for (var i = 0; i < listToolButton.length; i++) {
        listToolButton[i].addEventListener("click", function () {
            this.parentNode.style.display = "none";
        });
    }
})();