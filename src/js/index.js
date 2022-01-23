let baseUrl = window.location.href.replace("/index.html", "");


/**
 * Generate a game link based on the form input
 */
const generateLink = () => {
    let settings = {
        word: document.querySelector("#word").value,
        maxTries: document.querySelector("#max-tries").value,
        hint: document.querySelector("#hint").value,
    };

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

    navigator.clipboard.writeText(link.href).then(function() {
        copyBtn.innerHTML = "Copied!";
        setTimeout(() => {
            copyBtn.innerHTML = "Copy Link";
        }, 3000);
    }, function() {
        // TODO: Handle error
    });
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
