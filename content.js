"use strict";

(() => {
	const sourceHost = /^(?:www\.)?x\.com$/i;
	const destination = new URL("https://nitter.cf/");

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
		if (!/^https?:$/.test(url.protocol) || !sourceHost.test(url.hostname)) {
			return;
		}

		url.protocol = destination.protocol;
		url.host = destination.host;
		// Let the browser follow the new URL normally, preserving modifier keys,
		// middle clicks, and target="_blank".
		link.setAttribute("href", url.href);
		setTimeout(() => {
			if (link.getAttribute("href") === url.href) {
				link.setAttribute("href", originalHref);
			}
		}, 0);
		console.log("*unXcom: x.com/ link detected, redirecting to nitter.cf/...");
	}

	document.addEventListener("click", redirectLinkClick, true);
	document.addEventListener("auxclick", redirectLinkClick, true);
})();
