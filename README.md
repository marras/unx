# unxcom

A minimal Firefox extension skeleton to redirect `x.com/*` links to another site, like https://nitter.cf/

## Load in Firefox

1. Open `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on…**.
3. Select this project's `manifest.json`.

The temporary extension stays installed until Firefox restarts. After editing
the files, click **Reload** beside unxcom on the same page. Click **Inspect** to
view its background console.

## Files

- `manifest.json`: extension name, version, and background script registration.
- `background.js`: placeholder for future redirect logic.

No dependencies or build step are required.

## Next steps

Choose the destination site, define how paths and query strings should map to
it, then add redirect logic and the necessary permissions. Keep website access
limited to the hosts needed for that feature.

## Reference

- [Firefox background scripts](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/background)
- [Temporary installation in Firefox](https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/)
