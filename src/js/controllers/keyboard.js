import { html, Controller } from "../binder.js";

class KeyboardView extends Controller {
    init() {
        this.keyboardRows = [
            [ "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P" ],
            [ "A", "S", "D", "F", "G", "H", "J", "K", "L" ],
            [ "↵", "Z", "X", "C", "V", "B", "N", "M", "←" ],
        ];
    }

    clickLetter(e) {
        const grid = document.querySelector("#grid");
        const letter = e.target.innerHTML;

        // Enter
        if (letter === "↵") {
            grid.submitAnswer();

        // Backspace
        } else if (letter === "←") {
            grid.removeLetter();

        // Letter
        } else {
            grid.addLetter(letter)
        }
    }

    renderSelf() {
        const rows = this.keyboardRows.map(row => html`
            <div class="keyboard-row">
                ${row.map(letter => html`
                    <button @click="this.clickLetter()" class="keyboard-key ${letter === '↵' || letter === '←' ? 'special-key' : ''}">${letter}</button>
                `).join("")}
            </div>
        `);

        this.self.innerHTML = rows.join("");
        this.rebind();
    }
}

export { KeyboardView };
