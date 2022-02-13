import { html, Controller } from "../binder.js";

class KeyboardView extends Controller {
    init() {
        this.keyboardRows = [
            [ "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P" ],
            [ "A", "S", "D", "F", "G", "H", "J", "K", "L" ],
            [ "↵", "Z", "X", "C", "V", "B", "N", "M", "←" ],
        ];

        this.keyStates = {};  // Whether the key should be green, orange or gray
    }

    clickLetter(e) {
        const game = document.querySelector("#game");
        const letter = e.target.getAttribute("data-letter");

        // Enter
        if (letter === "↵") {
            game.submitAnswer();

        // Backspace
        } else if (letter === "←") {
            game.removeLetter();

        // Letter
        } else {
            game.addLetter(letter)
        }
    }

    render() {
        const rows = this.keyboardRows.map(row => html`
            <div class="keyboard-row">
                ${row.map(letter => html`
                    <button
                        @click="this.clickLetter()"
                        class="keyboard-key ${letter === '↵' || letter === '←' ? 'special-key' : ''} ${this.keyStates[letter] || ''}"
                        data-letter="${letter}"
                    >
                        ${letter}
                    </button>
                `).join("")}
            </div>
        `);

        this.self.innerHTML = rows.join("");
        super.render();
        this.rebind();
    }
}

export { KeyboardView };
