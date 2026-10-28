"use strict";

(() => {
	const form = document.querySelector("#settings");
	const editor = document.querySelector("#editor");
	const pairs = document.querySelector("#pairs");
	const status = document.querySelector("#status");
	const template = document.querySelector("#pair-template");
	const addressBar = document.querySelector("#redirect-address-bar");

	function showStatus(message, error = false) {
		status.textContent = message;
		status.dataset.error = String(error);
	}

	function addPair(pair = { from: "", to: "" }) {
		const row = template.content.firstElementChild.cloneNode(true);
		row.querySelector(".from").value = pair.from;
		row.querySelector(".to").value = pair.to;
		row.querySelector(".remove").addEventListener("click", () => {
			row.remove();
			showStatus("Unsaved changes.");
			document.querySelector("#add").focus();
		});
		pairs.append(row);
		return row;
	}

	document.querySelector("#add").addEventListener("click", () => {
		addPair().querySelector(".from").focus();
		showStatus("Unsaved changes.");
	});
	form.addEventListener("input", () => showStatus("Unsaved changes."));
	form.addEventListener("submit", async (event) => {
		event.preventDefault();
		try {
			const redirects = redirectRules.normalizePairs(Array.from(pairs.children, (row) => ({
				from: row.querySelector(".from").value,
				to: row.querySelector(".to").value,
			})));
			editor.disabled = true;
			await browser.storage.local.set({ redirects, redirectAddressBar: addressBar.checked });
			pairs.replaceChildren();
			redirects.forEach(addPair);
			showStatus("Changes saved.");
		} catch (error) {
			showStatus(error.message, true);
		} finally {
			editor.disabled = false;
		}
	});

	browser.storage.local.get(["redirects", "redirectAddressBar"]).then((settings) => {
		redirectRules.normalizePairs(settings.redirects ?? redirectRules.defaults).forEach(addPair);
		addressBar.checked = settings.redirectAddressBar === true;
		editor.disabled = false;
		showStatus("");
	}).catch(() => {
		showStatus("Could not load settings. Reopen this page to try again.", true);
	});
})();
