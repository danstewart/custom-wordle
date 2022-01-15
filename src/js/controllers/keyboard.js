import { html, Controller } from "../binder.js";

class KeyboardView extends Controller {
    init() {
        this.keyboardRows = [
            [ "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P" ],
            [ "A", "S", "D", "F", "G", "H", "J", "K", "L" ],
            [ "Z", "X", "C", "V", "B", "N", "M" ],
        ];
    }

    clickLetter(e) {
        const letter = e.target.innerText;
        console.log(`Clicked ${letter}`);
    }

    self() {
        const rows = this.keyboardRows.map(row => html`
            <div class="keyboard-row">
                ${row.map(letter => html`
                    <button @click="this.clickLetter()" class="keyboard-key">${letter}</button>
                `).join("")}
            </div>
        `);

        return rows.join("");
    }
}

export { KeyboardView };
