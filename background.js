"use strict";

const redirectedRequests = new Set();
const tabTasks = new Map();
const navigationFilter = { urls: ["http://*/*", "https://*/*"], types: ["main_frame"] };
const stateKey = (tabId) => `navigation:${tabId}`;

// Serialize state changes within each tab, without blocking other tabs.
function inTab(tabId, task) {
	const next = (tabTasks.get(tabId) ?? Promise.resolve()).then(task).catch((error) => {
		console.error("un-X: Could not update navigation.", error);
	});
	tabTasks.set(tabId, next);
	next.finally(() => {
		if (tabTasks.get(tabId) === next) tabTasks.delete(tabId);
	});
	return next;
}

async function readState(tabId) {
	return (await browser.storage.session.get(stateKey(tabId)))[stateKey(tabId)];
}

async function clearState(tabId) {
	await browser.storage.session.remove(stateKey(tabId));
	await browser.pageAction.hide(tabId);
}

function hostKey(url) {
	try {
		const parsed = new URL(url);
		return /^https?:$/.test(parsed.protocol) ? redirectRules.sourceKey(parsed.hostname) : null;
	} catch {
		return null;
	}
}

function withoutHash(url) {
	const parsed = new URL(url);
	parsed.hash = "";
	return parsed.href;
}

// Register synchronously so Firefox can wake the background for every navigation.
browser.webRequest.onBeforeRequest.addListener((details) => {
	if (details.type !== "main_frame" || details.tabId < 0) return;
	return inTab(details.tabId, async () => {
		// The same request may visit several hosts. Apply only one configured pair.
		if (redirectedRequests.has(details.requestId)) return;
		const state = await readState(details.tabId);
		if (state?.bypassHost && hostKey(details.url) === state.bypassHost) return;
		// Never forward form bodies or other non-GET requests to another host.
		if (details.method !== "GET") return;
		const url = new URL(details.url);
		if (!/^https?:$/.test(url.protocol)) return;
		// Keep embedded credentials on the original host.
		if (url.username || url.password) return;
		const settings = await browser.storage.local.get("redirects");
		const pairs = redirectRules.normalizePairs(settings.redirects ?? redirectRules.defaults);
		const pair = pairs.find(({ from }) =>
			redirectRules.sourceKey(from) === redirectRules.sourceKey(url.hostname));
		if (!pair) return;
		url.protocol = "https:";
		url.host = pair.to;
		url.port = "";
		if (url.href === details.url) return;
		await browser.storage.session.set({ [stateKey(details.tabId)]: {
			originalUrl: details.url, destinationUrl: url.href,
			requestId: details.requestId, pending: true,
		} });
		await browser.pageAction.hide(details.tabId);
		redirectedRequests.add(details.requestId);
		return { redirectUrl: url.href };
	});
}, navigationFilter, ["blocking"]);

async function updatePage(details) {
	const state = await readState(details.tabId);
	if (!state) return;
	// External-app opens can commit an intermediate blank document after the
	// redirect request has started. Keep its record until the destination commits
	// or the request fails. Once loaded, leaving for about:blank still clears it.
	if (state.pending && details.url === "about:blank") return;
	if (state.bypassHost) {
		if (hostKey(details.url) !== state.bypassHost) await clearState(details.tabId);
		return;
	}
	// Accept destination-side canonical redirects during the initial navigation.
	const matches = state.pending
		? hostKey(details.url) === hostKey(state.destinationUrl)
		: hostKey(details.url) !== null && withoutHash(details.url) === withoutHash(state.destinationUrl);
	if (!matches) {
		await clearState(details.tabId);
		return;
	}
	state.pending = false;
	state.destinationUrl = details.url;
	await browser.storage.session.set({ [stateKey(details.tabId)]: state });
	await browser.pageAction.setTitle({ tabId: details.tabId,
		title: `Redirected by un-X — click to open ${new URL(state.originalUrl).hostname}` });
	await browser.pageAction.show(details.tabId);
}

for (const event of ["onCommitted", "onHistoryStateUpdated", "onReferenceFragmentUpdated"]) {
	browser.webNavigation[event].addListener((details) => {
		if (details.frameId === 0) return inTab(details.tabId, () => updatePage(details));
	});
}

browser.pageAction.onClicked.addListener((tab) => inTab(tab.id, async () => {
	const state = await readState(tab.id);
	if (!state?.originalUrl || state.pending || state.bypassHost) return;
	// Reject a click queued after the tab has already left the redirected page.
	const current = await browser.tabs.get(tab.id);
	if (hostKey(current.url) === null || withoutHash(current.url) !== withoutHash(state.destinationUrl)) return;
	await browser.storage.session.set({ [stateKey(tab.id)]: {
		bypassHost: hostKey(state.originalUrl),
	} });
	try {
		await browser.tabs.update(tab.id, { url: state.originalUrl });
	} catch (error) {
		await browser.storage.session.set({ [stateKey(tab.id)]: state });
		throw error;
	}
	await browser.pageAction.hide(tab.id);
}));

function forgetRequest(details) {
	redirectedRequests.delete(details.requestId);
}
browser.webRequest.onCompleted.addListener(forgetRequest, navigationFilter);
browser.webRequest.onErrorOccurred.addListener((details) => {
	forgetRequest(details);
	if (details.tabId < 0) return;
	return inTab(details.tabId, async () => {
		const state = await readState(details.tabId);
		if (state?.pending && state.requestId === details.requestId) await clearState(details.tabId);
	});
}, navigationFilter);
browser.tabs.onRemoved.addListener((tabId) => inTab(tabId, () =>
	browser.storage.session.remove(stateKey(tabId))));
