let baseUrl = window.location.origin;


/**
 * Generate a game link based on the form input
 */
const generateLink = () => {
    let settings = {
        word: document.querySelector("#word").value,
        maxTries: document.querySelector("#max-tries").value,
        hint: document.querySelector("#hint").value,
        showAnswer: !!document.querySelector("#show-answer").checked,
    };

    if (!settings.word) {
        return;
    }

    settings = btoa(JSON.stringify(settings));

    document.querySelector("#result").classList.remove("is-hidden");
    document.querySelector("#link").href = `${baseUrl}/game.html?settings=${settings}`;
    document.querySelector("#link").innerHTML = `${baseUrl}/game.html?settings=${settings}`;
};

/**
 * Copy the generate link to the clipboard
 */
const copyLink = () => {
    const link = document.querySelector("#link");
    const copyBtn = document.querySelector("#copy-link");

    const shareData = {
        title: 'Custom Wordle',
        text: 'Try my custom wordle puzzle!\n\n',
        url: link.href,
    };

    if (navigator.share) {
        navigator.share(shareData);
    } else if (navigator.clipboard) {
        navigator.clipboard.writeText(shareData.text + shareData.url);

        copyBtn.innerText = "Copied!";

        setTimeout(() => {
            copyBtn.innerText = "Share";
        }, 3000);
    } else {
        copyBtn.innerText = "Sorry, share failed :-(";
        console.error("Cannot access navigator.share or navigator.clipboard")
    }
};

window.addEventListener('DOMContentLoaded', e => {
    const createBtn = document.querySelector("#create");
    createBtn.addEventListener("click", () => generateLink());

    // Handle pressing enter on the form fields
    const fields = document.querySelectorAll("#form > label > input");
    fields.forEach(field => {
        field.addEventListener("keyup", e => {
            if (e.keyCode == 13) {
                generateLink();
            }
        });
    });

    const copyBtn = document.querySelector("#copy-link");
    copyBtn.addEventListener("click", () => copyLink());
});
