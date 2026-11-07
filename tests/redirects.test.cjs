const { test } = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");

const source = (name) => readFileSync(path.join(__dirname, "..", name), "utf8");

async function setup() {
 const context = vm.createContext({ URL });
 vm.runInContext(source("rules.js"), context);
 return { rules: context.redirectRules };
}

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
