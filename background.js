"use strict";

// Register synchronously so Firefox can wake this background script for navigation.
browser.webNavigation.onCommitted.addListener(async (details) => {
	if (details.frameId !== 0 || details.transitionType !== "typed" ||
		details.transitionQualifiers.includes("forward_back")) return;

	try {
		const settings = await browser.storage.local.get(["redirects", "redirectAddressBar"]);
		if (settings.redirectAddressBar !== true) return;

		const url = new URL(details.url);
		if (!/^https?:$/.test(url.protocol)) return;
		const pairs = redirectRules.normalizePairs(settings.redirects ?? redirectRules.defaults);
		const pair = pairs.find(({ from }) =>
			redirectRules.sourceKey(from) === redirectRules.sourceKey(url.hostname));
		if (!pair) return;

		url.protocol = "https:";
		url.host = pair.to;
		url.port = "";
		if (url.href === details.url) return;

		// Settings are asynchronous: don't replace a newer navigation in this tab.
		const frame = await browser.webNavigation.getFrame({ tabId: details.tabId, frameId: 0 });
		if (frame?.url !== details.url) return;
		await browser.tabs.update(details.tabId, { url: url.href });
	} catch (error) {
		console.error("unxcom: Could not redirect address-bar navigation.", error);
	}
});
