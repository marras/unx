"use strict";

(() => {
	let destinations = new Map();
	let storageChanged = false;

	function loadPairs(pairs = redirectRules.defaults) {
		try {
			destinations = new Map(redirectRules.normalizePairs(pairs).map(({ from, to }) =>
				[redirectRules.sourceKey(from), to]));
		} catch (error) {
			console.error("un-X: Could not load redirect pairs.", error);
			destinations = new Map();
		}
	}

	browser.storage.onChanged.addListener((changes, area) => {
		if (area === "local" && Object.hasOwn(changes, "redirects")) {
			storageChanged = true;
			loadPairs(changes.redirects.newValue);
		}
	});
	browser.storage.local.get("redirects").then((settings) => {
		if (!storageChanged) loadPairs(settings.redirects);
	}).catch((error) => console.error("un-X: Could not read settings.", error));

	function redirectLinkClick(event) {
		if (!event.isTrusted || event.defaultPrevented) {
			return;
		}
		if (event.type === "auxclick" && event.button !== 1) {
			return;
		}

		const link = event
			.composedPath()
			.find(
				(node) =>
					node instanceof Element && node.matches("a[href], area[href]"),
			);
		if (!link) {
			return;
		}

		const originalHref = link.getAttribute("href");
		let url;
		try {
			url = new URL(originalHref, link.baseURI);
		} catch {
			return;
		}
		if (!/^https?:$/.test(url.protocol)) {
			return;
		}
		const destination = destinations.get(redirectRules.sourceKey(url.hostname));
		if (!destination) return;

		url.protocol = "https:";
		url.host = destination;
		url.port = "";
		// Let the browser follow the new URL normally, preserving modifier keys,
		// middle clicks, and target="_blank".
		link.setAttribute("href", url.href);
		setTimeout(() => {
			if (link.getAttribute("href") === url.href) {
				link.setAttribute("href", originalHref);
			}
		}, 0);
	}

	document.addEventListener("click", redirectLinkClick, true);
	document.addEventListener("auxclick", redirectLinkClick, true);
})();
