let baseUrl = window.location.href.replace("/index.html", "");

window.addEventListener('DOMContentLoaded', e => {
    const createBtn = document.querySelector("#create");
    createBtn.addEventListener("click", e => {
        let settings = {
            word: document.querySelector("#word").value,
            maxTries: document.querySelector("#max-tries").value,
            hint: document.querySelector("#hint").value,
        };

        settings = btoa(JSON.stringify(settings));

        document.querySelector("#result").classList.remove("is-hidden");
        document.querySelector("#link").href = `${baseUrl}/game.html?settings=${settings}`;
        document.querySelector("#link").innerHTML = `${baseUrl}/game.html?settings=${settings}`;
    });


    const copyBtn = document.querySelector("#copy-link");
    copyBtn.addEventListener("click", e => {
        const link = document.querySelector("#link");

        // TODO: Handle error
        navigator.clipboard.writeText(link.href).then(function() {
            copyBtn.innerHTML = "Copied!";
            setTimeout(() => {
                copyBtn.innerHTML = "Copy Link";
            }, 3000);
        }, function() {
            /* clipboard write failed */
        });
    });
});
