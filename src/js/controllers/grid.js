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
        this.targetWord = "GREETING";

        this.rows = [
            new GridRow({ length: this.length }),
        ];

        this.style.cssText = css`
            display: block;
            margin-bottom: 25px;
        `;
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
                expected[i] = null;
                submitted[i] = null;
            }
        }

        // Then find partial matches (right letter, wrong position)
        for (let i = 0; i < this.length; i++) {
            if (!states[i] && submitted[i] && expected[i] && expected.includes(submitted[i])) {
                states[i] = "orange";
                expected[i] = null;
                submitted[i] = null;
            }
        }

        // Then the wrong ones
        for (let i = 0; i < this.length; i++) {
            if (!states[i]) states[i] = "gray";
        }

        console.log(states)

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
