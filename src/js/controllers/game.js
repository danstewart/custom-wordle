import { Controller, html, css, registerController } from '../binder.js';
import { GridView } from './grid.js';
import { KeyboardView } from './keyboard.js';

class GameView extends Controller {
    // TODO: Fix this to not jolt page on show/hide
    static flashContainer = html`<div id="flash" class="is-hidden"></div>`;
    static shareLink = html`<br /><a id="share" href="#" style="color: #002479">Share?</a>`

    init() {
        this.loadSettings();

        this.tries = 0;  // Keep count of each guess
        this.finished = false;  // Flag to indicate if the game is finished

        this.grid = new GridView({ length: this.settings.length });
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

            this.settings.targetWord = this.settings.word.toUpperCase();
            this.settings.maxTries = Number.parseInt(this.settings.maxTries);
            this.settings.length = this.settings.targetWord.length;
        }
    }

    render() {
        this.self.replaceChildren(
            this.grid,
            this.keyboard,
        );

        if (this.settings.maxTries) {
            let triesLeft = this.settings.maxTries - this.tries;
            this.self.insertAdjacentHTML("afterbegin", html`
                <p>You have ${triesLeft || "no"} attempts left</p>
            `);
        }

        if (this.settings.hint) {
            this.self.insertAdjacentHTML("afterbegin", html`
                <p class="hint">Hint: <span class="is-italic">${this.settings.hint}</span></p>
            `);
        }

        this.self.insertAdjacentHTML("afterbegin", GameView.flashContainer)

        super.render();
        this.rebind();
    }

    /**
     * Add a letter to the active row
     * @param {string} letter The letter to add
     */
    addLetter(letter) {
        if (this.finished) return;

        const row = this.grid.activeRow;

        if (row.letters.length < this.settings.length) {
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

        if (row.letters.length < this.settings.length) {
            this.showFlash("Not enough letters!", "error");
            return;
        }

        let states = [];
        const submitted = Array.from(row.letters);
        const expected = this.settings.targetWord.split("");

        // First find exact matches
        for (let i = 0; i < this.settings.length; i++) {
            if (expected[i] === submitted[i]) {
                states[i] = "green";

                this.keyboard.keyStates[submitted[i]] = "green";

                expected[i] = null;
                submitted[i] = null;
            }
        }

        // Then find partial matches (right letter, wrong position)
        for (let i = 0; i < this.settings.length; i++) {
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
        for (let i = 0; i < this.settings.length; i++) {
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
        if (row.letters.join("") === this.settings.targetWord) {
            this.finished = true;
            row.render();

            // Show different messages depending on how many tries it took
            let message = "You win!";
            if (this.tries <= 2) {
                let messages = ["Too easy!", "Nailed it!", "You're on fire!"];
                message = messages[Math.floor(Math.random() * messages.length)];
            } else if (this.tries <= 4) {
                let messages = ["Nice one!", "Good job!", "Hooray!"];
                message = messages[Math.floor(Math.random() * messages.length)];
            } else {
                let messages = ["Tough one but you got it!", "Nice!", "Woo!"];
                message = messages[Math.floor(Math.random() * messages.length)];
            }

            message += GameView.shareLink;
            this.showFlash(message, "success", null);
            this.querySelector("#share").addEventListener("click", () => {
                this.share(`Check out this custom wordle!`)
            });

            return;
        }

        if (this.settings.maxTries && this.settings.maxTries - this.tries < 1) {
            this.finished = true;
            this.render();

            let message = "You lost! Better luck next time...";
            if (this.settings.showAnswer) {
                message = `You lose! The word was ${this.settings.targetWord}.`;
            }

            this.showFlash(message + GameView.shareLink, "warning", null);
            this.querySelector("#share").addEventListener("click", () => {
                this.share("Check out this custom wordle!\nI couldn't get it, can you?")
            });
            return;
        }

        this.activeRow++;
        this.grid.addRow();
        this.render();
    }

    /**
     * Share the result
     */
    share(message) {
        const shareLink = this.querySelector("#share");

        let score = "";

        for (let row of this.grid.rows) {
            for (let state of row.state) {
                score += state == "green" ? "🟩" : state == "orange" ? "🟨" : "⬜";
            }
            score += "\n";
        }

        const shareData = {
            title: 'Custom Wordle',
            text: message + "\n" + score + "\n\n",
            url: window.location.href,
        };

        if (navigator.share) {
            navigator.share(shareData);
        } else if (navigator.clipboard) {
            navigator.clipboard.writeText(shareData.text + shareData.url);

            shareLink.innerText = "Copied!";

            setTimeout(() => {
                shareLink.innerText = "Share?";
            }, 3000);
        } else {
            shareLink.innerText = "Sorry, share failed :-(";
            console.error("Cannot access navigator.share or navigator.clipboard")
        }
    }

    /**
     * Show a flash message
     * @param {string} msg The message to show
     * @param {string} type The type of message (success, error or warning)
     * @param {number} timeout The duration in ms to show the message for (default=3000)
     */
    showFlash(msg, type, timeout=3000) {
        const flashContainer = document.querySelector("#flash");
        flashContainer.innerHTML = msg;
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

