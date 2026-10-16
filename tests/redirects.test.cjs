const { test } = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");

const source = (name) => readFileSync(path.join(__dirname, "..", name), "utf8");

async function setup(settings = {}) {
	const listeners = {};
	const timers = [];
	let onChanged;
	class Element {
		constructor(href) { this.href = href; this.baseURI = "https://example.org/"; }
		matches() { return true; }
		getAttribute() { return this.href; }
		setAttribute(name, value) { this.href = value; }
	}
	const context = vm.createContext({
		URL, Element, console,
		setTimeout: (callback) => timers.push(callback),
		document: { addEventListener: (name, listener) => { listeners[name] = listener; } },
		browser: { storage: {
			local: { get: async () => settings },
			onChanged: { addListener: (listener) => { onChanged = listener; } },
		} },
	});
	vm.runInContext(source("rules.js"), context);
	vm.runInContext(source("content.js"), context);
	await Promise.resolve();
	return {
		rules: context.redirectRules,
		change: (value, area = "local") => onChanged({ redirects: { newValue: value } }, area),
		click(href, overrides = {}) {
			const link = new Element(href);
			const event = { isTrusted: true, defaultPrevented: false, type: "click", button: 0,
				composedPath: () => [link], ...overrides };
			listeners[event.type](event);
			return link;
		},
		restore: () => timers.splice(0).forEach((callback) => callback()),
	};
}

test("default pair preserves path, query, fragment and supports www", async () => {
	const app = await setup();
	for (const host of ["x.com", "www.x.com", "X.COM"]) {
		assert.equal(app.click(`http://${host}:8080/user?q=hello#post`).href,
			"https://nitter.cf/user?q=hello#post");
	}
});

test("custom pairs replace defaults and apply once per click", async () => {
	const app = await setup({ redirects: [
		{ from: "example.com", to: "mirror.org" },
		{ from: "mirror.org", to: "example.com" },
	] });
	assert.equal(app.click("https://example.com/path").href, "https://mirror.org/path");
	assert.equal(app.click("https://mirror.org/path").href, "https://example.com/path");
	assert.equal(app.click("https://x.com/path").href, "https://x.com/path");
});

test("empty settings disable redirects, including after live updates", async () => {
	const app = await setup({ redirects: [] });
	assert.equal(app.click("https://x.com/").href, "https://x.com/");
	app.change([{ from: "x.com", to: "custom.example" }]);
	assert.equal(app.click("https://x.com/").href, "https://custom.example/");
	app.change([]);
	assert.equal(app.click("https://x.com/").href, "https://x.com/");
	app.change(undefined);
	assert.equal(app.click("https://x.com/").href, "https://nitter.cf/");
});

test("ignores unrelated hosts, subdomains and non-HTTP links", async () => {
	const app = await setup();
	for (const href of ["https://notx.com/", "https://sub.x.com/", "https://x.com.evil.org/", "mailto:user@x.com", "ftp://x.com/path"]) {
		assert.equal(app.click(href).href, href);
	}
});

test("preserves browser click behavior and restores the original href", async () => {
	const app = await setup();
	for (const overrides of [{}, { ctrlKey: true }, { metaKey: true }, { type: "auxclick", button: 1 }]) {
		const link = app.click("https://x.com/path", overrides);
		assert.equal(link.href, "https://nitter.cf/path");
		app.restore();
		assert.equal(link.href, "https://x.com/path");
	}
	for (const overrides of [{ isTrusted: false }, { defaultPrevented: true }, { type: "auxclick", button: 2 }]) {
		assert.equal(app.click("https://x.com/path", overrides).href, "https://x.com/path");
	}
});

test("normalizes hostnames and rejects duplicate sources and invalid entries", async () => {
	const { rules } = await setup();
	assert.equal(JSON.stringify(rules.normalizePairs([{ from: " X.COM ", to: "NITTER.CF." }])),
		JSON.stringify([{ from: "x.com", to: "nitter.cf" }]));
	for (const host of ["", "https://x.com", "x.com/path", "x.com:80", "user@x.com", "a b.com", "-bad.com", "x..com", "x.com?x", "x.com#x", "x%2ecom"]) {
		assert.throws(() => rules.normalizePairs([{ from: host, to: "example.org" }]));
		assert.throws(() => rules.normalizePairs([{ from: "example.org", to: host }]));
	}
	assert.throws(() => rules.normalizePairs([
		{ from: "x.com", to: "a.com" }, { from: "www.x.com", to: "b.com" },
	]), /already has a redirect/);
	assert.equal(rules.normalizePairs(Array.from({ length: 1000 }, (_, i) =>
		({ from: `host${i}.example`, to: "mirror.example" }))).length, 1000);
});
