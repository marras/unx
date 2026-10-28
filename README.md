# unx: un-x.com my browser

A minimal Firefox extension that redirects links using configurable host pairs.
The default pair is `x.com` → `nitter.cf`.

It runs on ordinary web pages, including localhost on any port.
Normal clicks, Ctrl/Cmd-clicks, and middle clicks keep their usual tab behavior.

Paths, query strings, and fragments are preserved. To also redirect addresses
typed or pasted into the address bar or opened from external apps, enable
**Redirect links typed or pasted into the address bar or opened from external apps**
in the options and save. This is off by default. Your existing checkbox preference
also controls external-app links. Direct opens are redirected before the original
site loads, so the original site does not need to be reachable. Other direct opens
without an originating web page, such as bookmarks, are covered too.

## Configure redirects

Open `about:addons`, select **unxcom**, and open its **Preferences** / **Options**.
Use **Add pair** to add as many source and destination hosts as you need, then
click **Save changes**. Use **Remove** to delete a pair. Saving an empty list
disables all redirects.

Enter hostnames only, without a scheme, port, or path. For example,
`x.com` → `nitter.cf` sends `https://x.com/user?q=hello#post` to
`https://nitter.cf/user?q=hello#post`. Destination links always use HTTPS.
Source hosts match with or without `www.`; other subdomains require their own
pair. Each source can have only one destination. Each click applies one pair,
so pairs can point to other source hosts without chaining or looping. Address-bar
redirects also apply only once per request.

Settings are saved locally in your browser profile and apply immediately to
open tabs. The default pair is used until you save your own list.

## Load in Firefox

`git clone https://github.com/marras/unx`

1. Open `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on…**.
3. Select this project's `manifest.json`.

The temporary extension stays installed until Firefox restarts.

### Permissions

If clicking a configured link still takes you to the original site, open
`about:addons`, select unxcom, and check its **Permissions** tab: access to all
websites must be enabled. The extension also uses `webRequest` and
`webRequestBlocking` to redirect direct opens before loading the source site,
and `storage` to save your host pairs and
checkbox preference, following Mozilla's
[options page guidance](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/options_ui).

## Files

- `manifest.json`: extension name, version, website access, and content script registration.
- `rules.js`: default pair and shared hostname validation.
- `content.js`: loads saved pairs and changes a link's destination during a user click, then restores it.
- `background.js`: redirects direct opens from the address bar and external apps when the checkbox is enabled.
- `options.html`, `options.css`, `options.js`: options screen for editing and saving pairs.

No dependencies or build step are required.
Run the automated checks with `node --test` (Node.js 18 or newer).

## Reference

- [Temporary installation in Firefox](https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/)
