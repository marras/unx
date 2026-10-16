"use strict";

globalThis.redirectRules = (() => {
	const defaults = [
		{ from: "x.com", to: "nitter.cf" },
		{ from: "instagram.com", to: "kittygram.irelephant.net" },
	];

	function normalizeHost(value) {
		const host = value.trim().toLowerCase();
		if (!host || /[\s/:?#@\\%]/.test(host)) {
			throw new Error(
				"Enter a hostname only, such as example.com (no URL, port, or path).",
			);
		}
		let url;
		try {
			url = new URL(`https://${host}/`);
		} catch {
			throw new Error("Enter a valid hostname, such as example.com.");
		}
		const hostname = url.hostname.replace(/\.$/, "");
		if (
			hostname.length > 253 ||
			hostname
				.split(".")
				.some(
					(label) =>
						!label ||
						label.length > 63 ||
						!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(label),
				)
		) {
			throw new Error("Enter a valid hostname, such as example.com.");
		}
		return hostname;
	}

	function sourceKey(host) {
		return host.replace(/^www\./, "");
	}

	function normalizePairs(pairs) {
		const sources = new Set();
		return pairs.map((pair, index) => {
			try {
				const from = normalizeHost(pair.from);
				const to = normalizeHost(pair.to);
				const key = sourceKey(from);
				if (sources.has(key)) {
					throw new Error(`The source ${from} already has a redirect.`);
				}
				sources.add(key);
				return { from, to };
			} catch (error) {
				throw new Error(`Pair ${index + 1}: ${error.message}`);
			}
		});
	}

	return { defaults, normalizePairs, sourceKey };
})();
