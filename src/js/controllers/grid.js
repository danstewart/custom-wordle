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
    static errorContainer = html`<div id="grid-error" class="is-hidden"></div>`;

    init() {
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
        this.self.insertAdjacentHTML("afterbegin", GridView.errorContainer)
        this.rebind();
    }

    addLetter(letter) {
        const row = this.rows.slice(-1).pop();

        if (row.letters.length < this.length) {
            row.letters.push(letter);
            row.render();
        }
    }

    submitAnswer() {
        const row = this.rows.slice(-1).pop();

        if (row.letters.length < this.length) {
            this.showError("Not enough letters!");
            return;
        }

        if (row.letters.join("") === this.targetWord) {
            // TODO: Show success message
            row.state = Array.from({ length: this.length }, () => "green");
            row.render();
            return;
        }

        for (let i = 0; i < this.length; i++) {
            if (this.targetWord[i] === row.letters[i]) {
                row.state[i] = "green";
            } else if (this.targetWord.includes(row.letters[i])) {
                // TODO: This logic should check for duplicates and ignore already green letters
                row.state[i] = "orange";
            } else {
                row.state[i] = "gray";
            }
        }

        this.addRow();
    }

    removeLetter() {
        const row = this.rows.slice(-1).pop();

        if (row.letters.length > 0) {
            row.letters.pop();
            row.render();
        }
    }

    addRow() {
        this.rows.push(new GridRow({ length: this.length }));
        this.render();
    }

    showError(msg) {
        const errContainer = document.querySelector("#grid-error");
        errContainer.innerText = msg;
        errContainer.classList.remove("is-hidden");

        setTimeout(() => {
            errContainer.classList.add("is-hidden");
        }, 3000);
    }
}

export { GridRow, GridView };
