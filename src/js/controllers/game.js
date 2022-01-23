import { Controller, html, css, registerController } from '../binder.js';
import { GridView } from './grid.js';
import { KeyboardView } from './keyboard.js';

// TODO: Handle maxTries and hint
// TODO: Handle bad settings string
class GameView extends Controller {
    // TODO: Fix this to not jolt page on show/hide
    static flashContainer = html`<div id="flash" class="is-hidden"></div>`;

    init() {
        this.loadSettings();

        this.tries = 0;  // Keep count of each guess
        this.finished = false;  // Flag to indicate if the game is finished

        this.grid = new GridView({ length: this.length });
        this.keyboard = new KeyboardView();
    }

    /**
     * Load the game settings from the URL
     * Settings are base 64 encoded JSON
     */
    loadSettings() {
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
            this.maxTries = Number.parseInt(this.settings.maxTries);
            this.hint = this.settings.hint;
            this.length = this.targetWord.length;
        }
    }

    /**
     * Render the <self> element
     */
    renderSelf() {
        this.self.replaceChildren(
            this.grid,
            this.keyboard,
        );

        if (this.maxTries) {
            let triesLeft = this.maxTries - this.tries;
            this.self.insertAdjacentHTML("afterbegin", html`
                <p>You have ${triesLeft || "no"} attempts left</p>
            `);
        }

        if (this.hint) {
            this.self.insertAdjacentHTML("afterbegin", html`
                <p class="hint">Hint: <span class="is-italic">${this.hint}</span></p>
            `);
        }

        this.self.insertAdjacentHTML("afterbegin", GameView.flashContainer)
        this.rebind();
    }

    /**
     * Add a letter to the active row
     * @param {string} letter The letter to add
     */
    addLetter(letter) {
        if (this.finished) return;

        const row = this.grid.activeRow;

        if (row.letters.length < this.length) {
            row.letters.push(letter);
            row.render();
        }
    }

    /**
     * Remove the last letter from the active row
     */
    removeLetter() {
        if (this.finished) return;

        const row = this.grid.activeRow;

        if (row.letters.length > 0) {
            row.letters.pop();
            row.render();
        }
    }

    /**
     * Validate the active rows content
     */
    submitAnswer() {
        if (this.finished) return;

        const row = this.grid.activeRow;

        if (row.letters.length < this.length) {
            this.showFlash("Not enough letters!", "error");
            return;
        }

        let states = [];
        const submitted = Array.from(row.letters);
        const expected = this.targetWord.split("");

        // First find exact matches
        for (let i = 0; i < this.length; i++) {
            if (expected[i] === submitted[i]) {
                states[i] = "green";

                this.keyboard.keyStates[submitted[i]] = "green";

                expected[i] = null;
                submitted[i] = null;
            }
        }

        // Then find partial matches (right letter, wrong position)
        for (let i = 0; i < this.length; i++) {
            if (!states[i] && expected.includes(submitted[i])) {
                states[i] = "orange";

                if (this.keyboard.keyStates[submitted[i]] != "green") {
                    this.keyboard.keyStates[submitted[i]] = "orange";
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

                if (!this.keyboard.keyStates[submitted[i]]) {
                    this.keyboard.keyStates[submitted[i]] = "gray";
                }
            }
        }

        this.tries++;
        row.state = states;

        // Check for success
        if (row.letters.join("") === this.targetWord) {
            this.finished = true;
            row.render();
            this.showFlash("Good job!", "success", null);
            return;
        }

        if (this.maxTries && this.maxTries - this.tries < 1) {
            this.finished = true;
            this.render();
            this.showFlash("You lost! Better luck next time...", "warning", null);
            return;
        }

        this.activeRow++;
        this.grid.addRow();
        this.render();
    }

    /**
     * Show a flash message
     * @param {string} msg The message to show
     * @param {string} type The type of message (success, error or warning)
     * @param {number} timeout The duration in ms to show the message for (default=3000)
     */
    showFlash(msg, type, timeout=3000) {
        const flashContainer = document.querySelector("#flash");
        flashContainer.innerText = msg;
        flashContainer.classList.add(`flash-${type}`);
        flashContainer.classList.remove("is-hidden");

        if (timeout) {
            setTimeout(() => {
                flashContainer.classList.add("is-hidden");
                flashContainer.classList.remove(`flash-${type}`);
            }, timeout);
        }
    }
}

export { GameView };

