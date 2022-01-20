import { Controller, html, css, registerController } from '../binder.js';

class GridRow extends Controller {
    init({ length = 6 } = {}) {
        if (!this.length) this.length = length;

        this.letters = [];
        this.state = [];

        this.render();
    }

    render() {
        super.render();

        let squares = [];

        for (let i = 0; i < this.length; i++) {
            let letter = this.letters.length > i ? this.letters[i] : "";
            let state = this.state.length > i ? this.state[i] : "";

            squares.push(html`
                <div class="grid-item ${state}">
                    <div class="grid-item-letter">${letter}</div>
                </div>
            `);
        }

        this.innerHTML = html`
            <div class="grid-row">
                ${squares.join("")}
            </div>
        `;
    }
}

class GridView extends Controller {
    // TODO: Fix this to not jolt page on show/hide
    static flashContainer = html`<div id="grid-flash" class="is-hidden"></div>`;

    init() {
        this.activeRow = 0;
        this.targetWord = "";

        this.loadSettings();

        this.length = this.targetWord.length;

        this.rows = [
            new GridRow({ length: this.length }),
        ];

        this.style.cssText = css`
            display: block;
            margin-bottom: 25px;
        `;
    }

    loadSettings() {
        // TODO: Handle maxTries and hint
        // TODO: Handle bad settings string
        const queryString = window.location.search;

        // Convert query string to object
        const queryObject = {};
        queryString.slice(1).split("&").forEach(pair => {
            const [key, value] = pair.split("=");
            queryObject[key] = value;
        });

        if (queryObject.settings) {
            this.settings = JSON.parse(
                atob(
                    queryObject.settings
                )
            )

            this.targetWord = this.settings.word.toUpperCase();
            this.maxTries = this.settings.maxTries;
            this.hint = this.settings.hint;
        }
    }

    renderSelf() {
        this.self.replaceChildren(...this.rows);
        this.self.insertAdjacentHTML("afterbegin", GridView.flashContainer)
        this.rebind();
    }

    addLetter(letter) {
        const row = this.rows[this.activeRow];

        if (row.letters.length < this.length) {
            row.letters.push(letter);
            row.render();
        }
    }

    removeLetter() {
        const row = this.rows[this.activeRow];

        if (row.letters.length > 0) {
            row.letters.pop();
            row.render();
        }
    }


    submitAnswer() {
        const row = this.rows[this.activeRow];

        if (row.letters.length < this.length) {
            this.showFlash("Not enough letters!", "error");
            return;
        }

        if (row.letters.join("") === this.targetWord) {
            this.showFlash("Good job!", "success", null);
            row.state = Array.from({ length: this.length }, () => "green");
            row.render();
            return;
        }

        let states = [];
        const submitted = Array.from(row.letters);
        const expected = this.targetWord.split("");

        // First find exact matches
        for (let i = 0; i < this.length; i++) {
            if (expected[i] === submitted[i]) {
                states[i] = "green";
                
                const key = document.querySelector(`[data-letter=${submitted[i]}]`);
                if (key) {
                    key.classList.remove("orange");
                    key.classList.add("green");
                }

                expected[i] = null;
                submitted[i] = null;
            }
        }

        // Then find partial matches (right letter, wrong position)
        for (let i = 0; i < this.length; i++) {
            if (!states[i] && expected.includes(submitted[i])) {
                states[i] = "orange";

                const key = document.querySelector(`[data-letter=${submitted[i]}]`);
                if (key && !key.classList.contains("green")) {
                    key.classList.add("orange");
                }

                expected[expected.indexOf(submitted[i])] = null;
                submitted[i] = null;
            }
        }

        // Then the wrong ones
        for (let i = 0; i < this.length; i++) {
            if (!states[i]) {
                states[i] = "gray";

                const key = document.querySelector(`[data-letter=${submitted[i]}]`);
                if (key) {
                    key.classList.add("gray");
                }
            }
        }

        row.state = states;
        this.activeRow++;
        this.addRow();
    }

    addRow() {
        this.rows.push(
            new GridRow({ length: this.length })
        );
        this.render();
    }

    showFlash(msg, type, timeout=3000) {
        const errContainer = document.querySelector("#grid-flash");
        errContainer.innerText = msg;
        errContainer.classList.add(`flash-${type}`);
        errContainer.classList.remove("is-hidden");

        if (timeout) {
            setTimeout(() => {
                errContainer.classList.add("is-hidden");
                errContainer.classList.remove(`flash-${type}`);
            }, timeout);
        }
    }
}

export { GridRow, GridView };
