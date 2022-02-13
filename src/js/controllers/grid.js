import { Controller, html, css } from '../binder.js';

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
                    <div class="grid-item-letter ${state}">${letter}</div>
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
    init({ length = 6 } = {}) {
        this.length = length;

        this.rows = [
            new GridRow({ length: this.length }),
        ];

        this.activeRow = this.rows[0];

        this.style.cssText = css`
            display: block;
            margin-bottom: 25px;
        `;
    }

    render() {
        this.self.replaceChildren(...this.rows);
        super.render();
        this.rebind();
    }

    addRow() {
        this.rows.push(
            new GridRow({ length: this.length })
        );

        this.activeRow = this.rows[this.rows.length - 1];
        this.render();
    }
}

export { GridRow, GridView };
