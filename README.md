# un-X: un-x.com my browser

A minimal Firefox extension that redirects links using configurable host pairs.
The default pairs are:

- `x.com` → `nitter.cf`
- `instagram.com` → `kittygram.irelephant.net`
- `medium.com` → `scribe.rawbit.ninja`
- `reddit.com` → `redlib.catsarch.com`
- `pinterest.com` → `binternet.privacyredirect.com`

Links, addresses typed or pasted into the address bar, bookmarks, and external-app
links redirect automatically, keeping their usual tab behavior. Redirects apply to top-level HTTP(S) GET
navigations; embedded frames and form submissions using POST are left alone.
URLs containing an embedded username or password are also left on the original host.

Paths, query strings, and fragments are preserved. After a redirect, an un-X
icon appears in the Firefox desktop address bar. Click it to open the original
URL in the same tab. That tab can then browse and reload the original host
(including its `www.` version) until it leaves that host or closes. Other tabs
continue redirecting. The icon stays on reload of the redirected page and
clears when you navigate to another page. Returning through Back/Forward only
shows an icon if a new redirect occurs; old redirect records are not restored.

## Configure redirects

Open `about:addons`, select **un-X**, and open its **Preferences** / **Options**.
Use **Add pair** to add as many source and destination hosts as you need, then
click **Save changes**. Use **Remove** to delete a pair. Saving an empty list
disables all redirects.

Enter hostnames only, without a scheme, port, or path. For example,
`x.com` → `nitter.cf` sends `https://x.com/user?q=hello#post` to
`https://nitter.cf/user?q=hello#post`. Destination links always use HTTPS.
Source hosts match with or without `www.`; other subdomains require their own
pair. Each source can have only one destination. Each navigation request applies one pair,
so pairs can point to other source hosts without chaining or looping.

Settings are saved locally in your browser profile and apply immediately to
open tabs. The default pairs are used until you save your own list.

### Permissions

If clicking a configured link still takes you to the original site, open
`about:addons`, select un-X, and check its **Permissions** tab: access to all
websites must be enabled. The extension also uses `webRequest` and
`webRequestBlocking` to redirect navigations before loading the source site,
`webNavigation` to track the page shown in each tab, and `storage` to save host
pairs and keep temporary redirect and exception records in memory, following Mozilla's
[options page guidance](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/options_ui).

## Development

### How to test the add-on locally in Firefox

`git clone https://github.com/marras/unx`

1. Open `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on…**.
3. Select this project's `manifest.json`.

The temporary extension stays installed until Firefox restarts.

### Permanent installation

The extension uses the permanent Firefox ID `unx@marek` and requires Firefox
142 or newer, which provides built-in consent for data transmission on both
desktop and Android. The manifest
declares `browsingActivity` because redirects send the requested URL's path and
query to the configured destination website. Settings stay in local storage;
the extension has no analytics or developer-operated collection endpoint.

Run `npx web-ext lint`, then `npx web-ext sign --channel=unlisted` with
`WEB_EXT_API_KEY` (Mozilla's JWT issuer) and `WEB_EXT_API_SECRET` (JWT secret)
set in your shell environment. A `.env` file is not loaded automatically.
The web-ext configuration excludes `.env` files and development files from
packages. Install the signed `.xpi` through `about:addons` → the gear menu →
**Install Add-on From File…**. Keep the ID unchanged for future updates and
increment the manifest version before signing each new version.

## Files

- `manifest.json`: extension name, version, website access, and address-bar icon registration.
- `rules.js`: default pairs and shared hostname validation.
- `background.js`: redirects top-level navigations, tracks the address-bar icon, and handles tab-scoped original-site exceptions.
- `options.html`, `options.css`, `options.js`: options screen for editing and saving pairs.

No dependencies or build step are required.
Run the automated checks with `node --test` (Node.js 18 or newer).

## Privacy

Settings stay locally in your browser profile. Original URLs and per-tab exceptions
stay in memory for the browser session and are removed when no longer needed.
Redirects send the preserved URL
path and query to the configured destination website. See the
[privacy policy](PRIVACY.md) for details and controls.

## License

un-X is licensed under the GNU General Public License version 3.0 only
(`GPL-3.0-only`). See [LICENSE](LICENSE) for the full terms.

## Reference

- [Temporary installation in Firefox](https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/)
