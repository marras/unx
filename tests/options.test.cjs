const { test } = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");

async function setup(settings) {
	const elements = new Map();
	for (const id of ["settings", "editor", "pairs", "status", "pair-template", "redirect-address-bar", "add"]) {
		elements.set(`#${id}`, { listeners: {}, dataset: {}, children: [], checked: false,
			addEventListener(name, listener) { this.listeners[name] = listener; },
			replaceChildren() { this.children = []; },
		});
	}
	const saved = [];
	const context = vm.createContext({
		URL,
		document: { querySelector: (selector) => elements.get(selector) },
		browser: { storage: { local: {
			get: async () => settings,
			set: async (value) => saved.push(JSON.parse(JSON.stringify(value))),
		} } },
	});
	for (const file of ["rules.js", "options.js"]) {
		vm.runInContext(readFileSync(path.join(__dirname, "..", file), "utf8"), context);
	}
	await Promise.resolve();
	return { elements, saved };
}

test("options load the saved checkbox and save both enabled and disabled values", async () => {
	for (const redirectAddressBar of [undefined, false, true]) {
		const { elements, saved } = await setup({ redirects: [], redirectAddressBar });
		const checkbox = elements.get("#redirect-address-bar");
		assert.equal(checkbox.checked, redirectAddressBar === true);
		assert.equal(elements.get("#editor").disabled, false);
		for (const enabled of [true, false]) {
			checkbox.checked = enabled;
			await elements.get("#settings").listeners.submit({ preventDefault() {} });
			assert.deepEqual(saved.at(-1), { redirects: [], redirectAddressBar: enabled });
			assert.equal(elements.get("#status").textContent, "Changes saved.");
		}
	}
});
