# unxcom

A minimal Firefox extension skeleton to redirect `x.com/*` links to another site, like https://nitter.cf/

## Load in Firefox

1. Open `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on…**.
3. Select this project's `manifest.json`.

The temporary extension stays installed until Firefox restarts. After editing
the files, click **Reload** beside unxcom on the same page. Click **Inspect** to
view its background console.

If navigation produces no messages, open `about:addons`, select unxcom, and
check its **Permissions** tab: access to all websites must be enabled. The
background script warns if that permission is missing. After changing the
manifest, reload the add-on in `about:debugging`; if Firefox does not pick up
the new permissions, remove the temporary add-on and load it again.

## Files

- `manifest.json`: extension name, version, and background script registration.
- `background.js`: logs navigation requests and redirects x.com requests to nitter.cf.

No dependencies or build step are required.

## Reference

- [Firefox background scripts](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/background)
- [Temporary installation in Firefox](https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/)
