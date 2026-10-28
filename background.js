"use strict";

const redirectedRequests = new Set();
const navigationFilter = { urls: ["http://*/*", "https://*/*"], types: ["main_frame"] };

// Direct opens (address bar or external apps) have no originating web page.
// Page links are already handled by content.js; skip them to avoid applying two pairs.
// Register synchronously so Firefox can wake the background script for requests.
browser.webRequest.onBeforeRequest.addListener(async (details) => {
	if (details.type !== "main_frame" || details.tabId < 0 || details.originUrl ||
		details.method !== "GET" || redirectedRequests.has(details.requestId)) return;

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

		// A redirect keeps its request ID, so reciprocal pairs still apply only once.
		redirectedRequests.add(details.requestId);
		return { redirectUrl: url.href };
	} catch (error) {
		console.error("un-X: Could not redirect direct navigation.", error);
	}
}, navigationFilter, ["blocking"]);

function forgetRequest(details) {
	redirectedRequests.delete(details.requestId);
}

browser.webRequest.onCompleted.addListener(forgetRequest, navigationFilter);
browser.webRequest.onErrorOccurred.addListener(forgetRequest, navigationFilter);
