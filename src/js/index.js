let baseUrl = window.location.origin;

const invalidWord = msg => {
	const word = document.querySelector("#word");

	// Add red border and show error
	word.style.border = "2px solid red";

	const error = document.querySelector(".error");
	error.innerText = msg;
	error.style.visibility = "visible";

	const reset = () => {
		word.style.border = "none";
		error.style.visibility = "hidden";
	};

	// Reset error border when interacting
	word.addEventListener("focus", reset);
	word.addEventListener("change", reset);
};

/**
 * Generate a game link based on the form input
 */
const generateLink = () => {
	let settings = {
		word: document.querySelector("#word").value.normalize("NFKC"),
		maxTries: document.querySelector("#max-tries").value,
		hint: document.querySelector("#hint").value.normalize("NFKC"),
		showAnswer: !!document.querySelector("#show-answer").checked,
	};

	if (!settings.word) {
		return;
	}

	if (!settings.word.match(/^[a-zA-Z]+$/)) {
		invalidWord("The word can only contain letters");
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
		title: "Custom Wordle",
		text: "Try my custom wordle puzzle!\n\n",
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
		console.error("Cannot access navigator.share or navigator.clipboard");
	}
};

window.addEventListener("DOMContentLoaded", e => {
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
