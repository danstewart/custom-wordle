import { Controller, html, css, registerController } from '../binder.js';

class GridRow extends Controller {
    init() {
        this.letters = [];
        this.root.innerHTML = this.content();
    }

    content() {
        let squares = [];

        for (let i = 0; i < this.length; i++) {
            let letter = this.letters.length > i ? this.letters[i] : "";

            squares.push(html`
                <div class="grid-item">
                    <div class="grid-item-letter">${letter}</div>
                </div>
            `);
        }

        return html`
            <div class="grid-row">
                ${squares.join("")}
            </div>
        `;

    }
}

class GridView extends Controller {
    init() {
        this.rows = [
            html`<grid-row length=${this.length}></grid-row>`,
        ];

        this.setStyle(css`
            display: block;
            margin-bottom: 25px;
        `);
    }

    self() {
        return this.rows.join("");
    }

    addRow() {
        this.rows.push(html`<grid-row length=${this.length}></grid-row>`);
        this.render();
    }
}

export { GridRow, GridView };
