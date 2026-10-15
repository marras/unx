"use strict";

const sourceHost = /^(?:www\.)?x\.com$/i;
const destination = new URL("https://nitter.cf/");

browser.webRequest.onBeforeRequest.addListener(
	(details) => {
		const url = new URL(details.url);

		if (!sourceHost.test(url.hostname)) {
			return {};
		}

		console.log("*unXcom: x.com/ link detected, redirecting to nitter.cf/...");

		url.protocol = destination.protocol;
		url.host = destination.host;

		return { redirectUrl: url.href };
	},
	{
		urls: ["<all_urls>"],
		types: ["main_frame"],
	},
	["blocking"],
);

console.info("unXcom navigation listener registered.");

browser.permissions.contains({ origins: ["<all_urls>"] }).then((granted) => {
	if (!granted) {
		console.warn(
			"unXcom needs website access: open about:addons, select unXcom, " +
				"and enable access to all websites under Permissions.",
		);
	}
});
